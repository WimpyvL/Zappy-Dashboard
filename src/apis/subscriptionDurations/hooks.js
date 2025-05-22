import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../apis/apiClient';

// Query keys
const DURATIONS_KEY = 'subscription-durations';

/**
 * Fetch all subscription durations
 * @returns {Object} Query result
 */
export const useSubscriptionDurations = () => {
  return useQuery(DURATIONS_KEY, async () => {
    const response = await apiClient.get('/subscription-durations');
    return response.data;
  });
};

/**
 * Fetch a single subscription duration by ID
 * @param {string|number} id - Duration ID
 * @returns {Object} Query result
 */
export const useSubscriptionDuration = (id) => {
  return useQuery([DURATIONS_KEY, id], async () => {
    const response = await apiClient.get(`/subscription-durations/${id}`);
    return response.data;
  }, {
    enabled: !!id
  });
};

/**
 * Create a new subscription duration
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useCreateSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (durationData) => {
      const response = await apiClient.post('/subscription-durations', durationData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DURATIONS_KEY);
      },
      ...options
    }
  );
};

/**
 * Update an existing subscription duration
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useUpdateSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ id, durationData }) => {
      const response = await apiClient.put(`/subscription-durations/${id}`, durationData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DURATIONS_KEY);
      },
      ...options
    }
  );
};

/**
 * Delete a subscription duration
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useDeleteSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (id) => {
      const response = await apiClient.delete(`/subscription-durations/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DURATIONS_KEY);
      },
      ...options
    }
  );
};
