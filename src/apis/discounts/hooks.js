import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['discounts'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Hook to fetch all discounts using Supabase
export const useDiscounts = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      try {
        // First try to fetch with the relationship
        let query = supabase
          .from('discounts')
          .select(`
            *,
            discount_subscription_plans:discount_subscription_plans(
              subscription_plan_id
            )
          `)
          .order('name', { ascending: true });

        // Apply filters if any
        if (params.status !== undefined) {
          query = query.eq('status', params.status);
        }
        if (params.code) {
           query = query.ilike('code', `%${params.code}%`);
        }

        const { data, error } = await query;

        if (error) {
          // If there's an error related to the relationship, fall back to basic query
          if (error.message.includes('relationship') || error.message.includes('schema cache')) {
            console.warn('Falling back to basic query without relationships:', error.message);
            
            // Try again with a simpler query
            const basicQuery = supabase
              .from('discounts')
              .select('*')
              .order('name', { ascending: true });
              
            // Apply the same filters
            if (params.status !== undefined) {
              basicQuery.eq('status', params.status);
            }
            if (params.code) {
              basicQuery.ilike('code', `%${params.code}%`);
            }
            
            const basicResult = await basicQuery;
            
            if (basicResult.error) {
              console.error('Error in fallback query:', basicResult.error);
              throw new Error(basicResult.error.message);
            }
            
            // Map data without the relationship
            const mappedData = basicResult.data?.map(d => ({
                ...d,
                status: d.status ? 'Active' : 'Inactive',
                subscription_plan_ids: []
            })) || [];
            
            return { data: mappedData };
          }
          
          // For other errors, throw normally
          console.error('Error fetching discounts:', error);
          throw new Error(error.message);
        }
        
        // Map data to include subscription_plan_ids array
        const mappedData = data?.map(d => ({
            ...d,
            status: d.status ? 'Active' : 'Inactive',
            subscription_plan_ids: d.discount_subscription_plans?.map(dsp => dsp.subscription_plan_id) || []
        })) || [];
        
        return { data: mappedData };
      } catch (error) {
        console.error('Unexpected error in useDiscounts:', error);
        // Return empty data rather than throwing to prevent UI from breaking
        return { data: [] };
      }
    },
  });
};

// Hook to fetch a specific discount by ID using Supabase
export const useDiscountById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      try {
        // First try with the relationship
        const { data, error } = await supabase
          .from('discounts')
          .select(`
            *,
            discount_subscription_plans:discount_subscription_plans(
              subscription_plan_id
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          // If there's an error related to the relationship, fall back to basic query
          if (error.message.includes('relationship') || error.message.includes('schema cache')) {
            console.warn('Falling back to basic query without relationships:', error.message);
            
            // Try again with a simpler query
            const basicResult = await supabase
              .from('discounts')
              .select('*')
              .eq('id', id)
              .single();
              
            if (basicResult.error) {
              console.error(`Error fetching discount ${id}:`, basicResult.error);
              if (basicResult.error.code === 'PGRST116') return null; // Not found
              throw new Error(basicResult.error.message);
            }
            
            // Map data without the relationship
            const mappedData = basicResult.data ? {
                ...basicResult.data,
                status: basicResult.data.status ? 'Active' : 'Inactive',
                subscription_plan_ids: []
            } : null;
            
            return mappedData;
          }
          
          // For other errors, handle normally
          console.error(`Error fetching discount ${id}:`, error);
          if (error.code === 'PGRST116') return null; // Not found
          throw new Error(error.message);
        }
        
        // Map data to include subscription_plan_ids array
        const mappedData = data ? {
            ...data,
            status: data.status ? 'Active' : 'Inactive',
            subscription_plan_ids: data.discount_subscription_plans?.map(dsp => dsp.subscription_plan_id) || []
        } : null;
        
        return mappedData;
      } catch (error) {
        console.error(`Unexpected error in useDiscountById:`, error);
        return null;
      }
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new discount using Supabase
export const useCreateDiscount = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (discountData) => {
      // Extract subscription plan IDs
      const subscriptionPlanIds = discountData.subscription_plan_ids || [];
      
      // Map frontend fields to DB columns
      const dataToInsert = {
        ...discountData,
        value: parseFloat(discountData.value) || 0,
        discount_type: discountData.discount_type || 'percentage',
        status: discountData.status || 'Active',
        valid_from: discountData.valid_from ? discountData.valid_from : null,
        valid_until: discountData.valid_until ? discountData.valid_until : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Remove fields that don't belong in the discounts table
      delete dataToInsert.amount;
      delete dataToInsert.percentage;
      delete dataToInsert.subscription_plan_ids;
      delete dataToInsert.subscription_plan_id; // Remove old single plan ID field
      delete dataToInsert.requirements; // Remove requirements array that doesn't exist in DB

      // Start a transaction
      const { data, error } = await supabase
        .from('discounts')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating discount:', error);
        if (error.code === '23505') {
          throw new Error(`Discount code '${dataToInsert.code}' already exists.`);
        }
        throw new Error(error.message);
      }

      // If subscription plans were selected, try to create junction table entries
      if (subscriptionPlanIds.length > 0) {
        try {
          const junctionEntries = subscriptionPlanIds.map(planId => ({
            discount_id: data.id,
            subscription_plan_id: planId,
            created_at: new Date().toISOString()
          }));

          const { error: junctionError } = await supabase
            .from('discount_subscription_plans')
            .insert(junctionEntries);

          if (junctionError) {
            console.error('Error linking discount to subscription plans:', junctionError);
            // Don't throw here, just log the error and continue
          }
        } catch (err) {
          console.error('Error handling subscription plan links:', err);
          // Don't throw here, just log the error and continue
        }
      }

      return { ...data, subscription_plan_ids: subscriptionPlanIds };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Discount created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating discount: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to update an existing discount using Supabase
export const useUpdateDiscount = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, discountData }) => {
      if (!id) throw new Error("Discount ID is required for update.");

      // Extract subscription plan IDs
      const subscriptionPlanIds = discountData.subscription_plan_ids || [];
      
      const dataToUpdate = {
        ...discountData,
        value: parseFloat(discountData.value) || 0,
        discount_type: discountData.discount_type || 'percentage',
        status: discountData.status || 'Active',
        valid_from: discountData.valid_from ? discountData.valid_from : null,
        valid_until: discountData.valid_until ? discountData.valid_until : null,
        updated_at: new Date().toISOString(),
      };
      
      // Remove fields that don't belong in the discounts table
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.amount;
      delete dataToUpdate.percentage;
      delete dataToUpdate.usage_count;
      delete dataToUpdate.subscription_plan_ids;
      delete dataToUpdate.subscription_plan_id; // Remove old single plan ID field
      delete dataToUpdate.discount_subscription_plans; // Remove joined data
      delete dataToUpdate.requirements; // Remove requirements array that doesn't exist in DB

      // Start a transaction
      const { data, error } = await supabase
        .from('discounts')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating discount ${id}:`, error);
        if (error.code === '23505') {
          throw new Error(`Discount code '${dataToUpdate.code}' already exists.`);
        }
        throw new Error(error.message);
      }

      // Try to handle subscription plan links, but don't fail if the table doesn't exist
      try {
        // Try to delete existing junction table entries
        const { error: deleteError } = await supabase
          .from('discount_subscription_plans')
          .delete()
          .eq('discount_id', id);

        if (deleteError && !deleteError.message.includes('relation') && !deleteError.message.includes('schema cache')) {
          console.error(`Error removing existing subscription plan links:`, deleteError);
          // Don't throw here, just log the error and continue
        }

        // If subscription plans were selected, create new junction table entries
        if (subscriptionPlanIds.length > 0) {
          const junctionEntries = subscriptionPlanIds.map(planId => ({
            discount_id: id,
            subscription_plan_id: planId,
            created_at: new Date().toISOString()
          }));

          const { error: junctionError } = await supabase
            .from('discount_subscription_plans')
            .insert(junctionEntries);

          if (junctionError && !junctionError.message.includes('relation') && !junctionError.message.includes('schema cache')) {
            console.error('Error linking discount to subscription plans:', junctionError);
            // Don't throw here, just log the error and continue
          }
        }
      } catch (err) {
        console.error('Error handling subscription plan links:', err);
        // Don't throw here, just log the error and continue
      }

      return { ...data, subscription_plan_ids: subscriptionPlanIds };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Discount updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating discount: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to delete a discount using Supabase
export const useDeleteDiscount = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Discount ID is required for deletion.");

      // Try to delete from the discount_subscription_plans table first, but don't fail if it doesn't exist
      try {
        await supabase
          .from('discount_subscription_plans')
          .delete()
          .eq('discount_id', id);
      } catch (err) {
        console.warn('Error deleting from discount_subscription_plans (may not exist yet):', err);
        // Continue with the main deletion even if this fails
      }

      // Now delete the discount
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting discount ${id}:`, error);
         // Handle foreign key constraint errors if discounts are linked elsewhere
         if (error.code === '23503') {
           throw new Error(`Cannot delete discount: It might be linked to orders or other records.`);
         }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Discount deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting discount: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to toggle discount active status using Supabase
export const useToggleDiscountActive = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }) => {
       if (!id) throw new Error("Discount ID is required.");
       
       // Use 'Active' or 'Inactive' as text values instead of boolean
       const status = active ? 'Active' : 'Inactive';

       const { data, error } = await supabase
         .from('discounts')
         .update({ status: status, updated_at: new Date().toISOString() })
         .eq('id', id)
         .select()
         .single();

       if (error) {
         console.error(`Error toggling discount ${id} status:`, error);
         throw new Error(error.message);
       }
       return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success(`Discount ${variables.active ? 'activated' : 'deactivated'} successfully`);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating discount status: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
