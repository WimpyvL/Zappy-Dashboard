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
      let query = supabase
        .from('discounts')
        .select('*')
        .order('name', { ascending: true }); // Example order

      // Apply filters if any
      if (params.status !== undefined) {
        query = query.eq('status', params.status);
      }
      if (params.code) {
         query = query.ilike('code', `%${params.code}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching discounts:', error);
        throw new Error(error.message);
      }
      // Map data if needed (e.g., convert status boolean to string)
      const mappedData = data?.map(d => ({
          ...d,
          status: d.status ? 'Active' : 'Inactive' // Example mapping
      })) || [];
      return { data: mappedData }; // Return data wrapped in object if needed
    },
  });
};

// Hook to fetch a specific discount by ID using Supabase
export const useDiscountById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching discount ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data ? {
           ...data,
           status: data.status ? 'Active' : 'Inactive' // Example mapping
       } : null;
      return mappedData;
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
      // Map frontend fields to DB columns, explicitly setting null for unused type
      const dataToInsert = {
        ...discountData, // Include name, code, description, etc.
        value: parseFloat(discountData.value) || 0, // Use the unified value field from schema
        discount_type: discountData.discount_type || 'percentage', // Use the discount_type field from schema
        status: discountData.status || 'Active', // Keep as text: 'Active', 'Inactive', 'Scheduled', 'Expired'
        // Handle date fields properly
        valid_from: discountData.valid_from ? discountData.valid_from : null,
        valid_until: discountData.valid_until ? discountData.valid_until : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Remove redundant fields if any
      delete dataToInsert.amount; 
      delete dataToInsert.percentage;

      const { data, error } = await supabase
        .from('discounts')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating discount:', error);
         if (error.code === '23505') { // Unique violation (likely on 'code')
           throw new Error(`Discount code '${dataToInsert.code}' already exists.`);
         }
        throw new Error(error.message);
      }
      return data;
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

      const dataToUpdate = {
        ...discountData,
        value: parseFloat(discountData.value) || 0, // Use the unified value field
        discount_type: discountData.discount_type || 'percentage', // Use the discount_type field directly
        status: discountData.status || 'Active', // Keep status as text: 'Active', 'Inactive', etc.
        // Handle date fields properly
        valid_from: discountData.valid_from ? discountData.valid_from : null,
        valid_until: discountData.valid_until ? discountData.valid_until : null,
        updated_at: new Date().toISOString(),
      };
      
      // Remove redundant fields
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.amount;
      delete dataToUpdate.percentage;
      delete dataToUpdate.usage_count; // Assuming usage_count is managed by backend triggers/logic

      const { data, error } = await supabase
        .from('discounts')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating discount ${id}:`, error);
         if (error.code === '23505') { // Unique violation (likely on 'code')
           throw new Error(`Discount code '${dataToUpdate.code}' already exists.`);
         }
        throw new Error(error.message);
      }
      return data;
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
