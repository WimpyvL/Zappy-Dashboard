import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// --- Mock Data Removed ---

const queryKeys = {
  all: ['subscriptionPlans'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get subscription plans hook (Using Supabase)
export const useSubscriptionPlans = (params = {}) => {
  // console.log('Using Supabase subscription plans data in useSubscriptionPlans hook');
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase.from('subscription_plans').select('*'); // Assuming table name is 'subscription_plans'
      // Add filtering based on params if needed
      // Example: if (params.active) query = query.eq('active', params.active);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // keepPreviousData: true, // Consider if needed
    staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
  });
};

// Get subscription plan by ID hook (Using Supabase)
export const useSubscriptionPlanById = (id, options = {}) => {
  // console.log(`Using Supabase subscription plan data for ID: ${id} in useSubscriptionPlanById hook`);
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans') // Assuming table name is 'subscription_plans'
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create subscription plan hook (Using Supabase)
export const useAddSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planData) => {
      // console.log('Supabase Creating subscription plan:', planData);
      const { data, error } = await supabase
        .from('subscription_plans') // Assuming table name is 'subscription_plans'
        .insert([planData])
        .select();
      if (error) throw error;
      return data?.[0];
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

// Update subscription plan hook (Using Supabase)
export const useUpdateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...planData }) => {
      // console.log(`Supabase Updating subscription plan ${id}:`, planData);
      const { data, error } = await supabase
        .from('subscription_plans') // Assuming table name is 'subscription_plans'
        .update(planData)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
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

// Delete subscription plan hook (Using Supabase)
export const useDeleteSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // console.log(`Supabase Deleting subscription plan ${id}`);
      const { error } = await supabase
        .from('subscription_plans') // Assuming table name is 'subscription_plans'
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (data, variables, context) => {
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
