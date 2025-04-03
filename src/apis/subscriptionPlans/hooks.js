import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

const queryKeys = {
  all: ['subscriptionPlans'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get subscription plans hook
export const useSubscriptionPlans = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: () => apiService.subscriptionPlans.getAll(params), // Use apiService
    keepPreviousData: true,
  });
};

// Get subscription plan by ID hook
export const useSubscriptionPlanById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: () => apiService.subscriptionPlans.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Create subscription plan hook
export const useAddSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planData) => apiService.subscriptionPlans.create(planData), // Use apiService
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

// Update subscription plan hook
export const useUpdateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...planData }) => apiService.subscriptionPlans.update(id, planData), // Use apiService
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

// Delete subscription plan hook
export const useDeleteSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiService.subscriptionPlans.delete(id), // Use apiService
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
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
