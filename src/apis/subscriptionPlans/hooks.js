import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['subscriptionPlans'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get subscription plans hook using Supabase
export const useSubscriptionPlans = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('subscription_plans') // ASSUMING table name is 'subscription_plans'
        .select('*')
        .order('name', { ascending: true }); // Example order

      // Apply filters if any
      if (params.active !== undefined) {
        query = query.eq('active', params.active);
      }
      // Add other filters as needed

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw new Error(error.message);
      }
      // Map data if needed (e.g., parse JSONB fields if stored as strings)
      const mappedData = data?.map(plan => ({
          ...plan,
          // Ensure allowedProductDoses is an array
          allowedProductDoses: Array.isArray(plan.allowed_product_doses) ? plan.allowed_product_doses : [],
      })) || [];
      return mappedData; // Return data array
    },
  });
};

// Get subscription plan by ID hook using Supabase
export const useSubscriptionPlanById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('subscription_plans') // ASSUMING table name is 'subscription_plans'
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching subscription plan ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data ? {
           ...data,
           allowedProductDoses: Array.isArray(data.allowed_product_doses) ? data.allowed_product_doses : [],
       } : null;
      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Create subscription plan hook using Supabase
// Renamed from useAddSubscriptionPlan to useCreateSubscriptionPlan
export const useCreateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planData) => {
      // Map frontend fields to DB columns if needed
      const dataToInsert = {
        ...planData,
        created_at: new Date().toISOString(), // Assuming timestamp columns
        updated_at: new Date().toISOString(),
        active: planData.active ?? true,
        allowed_product_doses: planData.allowedProductDoses || [], // Assuming JSONB column
        // Map other fields like billingFrequency -> billing_frequency if needed
        billing_frequency: planData.billingFrequency,
        delivery_frequency: planData.deliveryFrequency,
      };
      // Remove frontend-specific fields
      delete dataToInsert.billingFrequency;
      delete dataToInsert.deliveryFrequency;
      delete dataToInsert.allowedProductDoses;


      const { data, error } = await supabase
        .from('subscription_plans') // ASSUMING table name is 'subscription_plans'
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription plan:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Subscription plan created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating plan: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update subscription plan hook using Supabase
export const useUpdateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planData }) => {
      if (!id) throw new Error("Plan ID is required for update.");

      const dataToUpdate = {
        ...planData,
        updated_at: new Date().toISOString(),
        allowed_product_doses: planData.allowedProductDoses, // Assuming JSONB
        billing_frequency: planData.billingFrequency,
        delivery_frequency: planData.deliveryFrequency,
      };
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.billingFrequency;
      delete dataToUpdate.deliveryFrequency;
      delete dataToUpdate.allowedProductDoses;


      const { data, error } = await supabase
        .from('subscription_plans') // ASSUMING table name is 'subscription_plans'
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating subscription plan ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Subscription plan updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating plan: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete subscription plan hook using Supabase
export const useDeleteSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Plan ID is required for deletion.");

      const { error } = await supabase
        .from('subscription_plans') // ASSUMING table name is 'subscription_plans'
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting subscription plan ${id}:`, error);
         // Handle foreign key constraint errors if needed
         if (error.code === '23503') {
           throw new Error(`Cannot delete plan: It might be linked to other records.`);
         }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Subscription plan deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting plan: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
