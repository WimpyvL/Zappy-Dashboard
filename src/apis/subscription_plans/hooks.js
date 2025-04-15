// src/apis/subscription_plans/hooks.js - React Query hooks for subscription plans
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from './api';
import { toast } from 'react-toastify';

// Hook to fetch subscription plans with pagination and filtering
export const useSubscriptionPlans = (currentPage = 1, filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['subscriptionPlans', currentPage, filters],
    queryFn: () => getSubscriptionPlans(currentPage, filters),
    keepPreviousData: true,
    ...options,
  });
};

// Hook to fetch a specific subscription plan by ID
export const useSubscriptionPlanById = (id, options = {}) => {
  return useQuery({
    queryKey: ['subscriptionPlan', id],
    queryFn: () => getSubscriptionPlanById(id),
    enabled: !!id, // Only run if id is provided
    ...options,
  });
};

// Hook to create a new subscription plan
export const useCreateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planData) => createSubscriptionPlan(planData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Subscription plan created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error creating subscription plan: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};

// Hook to update an existing subscription plan
export const useUpdateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, planData }) => updateSubscriptionPlan(id, planData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlan', variables.id] });
      toast.success('Subscription plan updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error updating subscription plan: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};

// Hook to delete a subscription plan
export const useDeleteSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSubscriptionPlan(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      queryClient.removeQueries({ queryKey: ['subscriptionPlan', variables] });
      toast.success('Subscription plan deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error deleting subscription plan: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};
