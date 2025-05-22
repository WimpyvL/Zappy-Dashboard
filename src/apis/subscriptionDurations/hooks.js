import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../apis/apiClient';

// Query keys
const DURATIONS_KEY = 'subscription-durations';

/**
 * Fetch all subscription durations
 * @returns {Object} Query result
 */
export const useSubscriptionDurations = (options = {}) => {
  return useQuery({
    queryKey: DURATIONS_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/subscription-durations');
      return response.data;
    },
    ...options
  });
};

/**
 * Fetch a single subscription duration by ID
 * @param {string|number} id - Duration ID
 * @returns {Object} Query result
 */
export const useSubscriptionDuration = (id, options = {}) => {
  return useQuery({
    queryKey: [DURATIONS_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/subscription-durations/${id}`);
      return response.data;
    },
    enabled: !!id,
    ...options
  });
};

/**
 * Create a new subscription duration
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useCreateSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (durationData) => {
      const response = await apiClient.post('/subscription-durations', durationData);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: DURATIONS_KEY });
      options.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

/**
 * Update an existing subscription duration
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useUpdateSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, durationData }) => {
      const response = await apiClient.put(`/subscription-durations/${id}`, durationData);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: DURATIONS_KEY });
      options.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

/**
 * Delete a subscription duration
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useDeleteSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/subscription-durations/${id}`);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: DURATIONS_KEY });
      options.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
