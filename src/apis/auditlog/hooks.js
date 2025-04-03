import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuditLogs, createAuditLog } from './api';
import { toast } from 'react-toastify';

/**
 * Hook to fetch audit logs with pagination and filtering.
 * @param {object} params - Query parameters (e.g., { page: 1, limit: 20, userId: '...', action: '...' })
 * @param {object} options - React Query options
 * @returns {QueryResult} Result object from useQuery
 */
export const useAuditLogs = (params = { page: 1, limit: 20 }, options = {}) => {
  return useQuery({
    // Query key includes parameters to ensure refetching when params change
    queryKey: ['auditLogs', params],
    queryFn: () => getAuditLogs(params),
    // Keep previous data while fetching new page/filters for smoother UX
    keepPreviousData: true,
    onError: (error) => {
      // TODO: Use error handling utility
      toast.error(
        `Error fetching audit logs: ${error.message || 'Unknown error'}`
      );
    },
    ...options, // Allow overriding query options
  });
};

/**
 * Hook to create a new audit log entry.
 * NOTE: This might not be used if logging is purely backend-driven.
 * @param {object} options - React Query mutation options
 * @returns {MutationResult} Result object from useMutation
 */
export const useCreateAuditLog = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logData) => createAuditLog(logData),
    onSuccess: (data, variables, context) => {
      // Invalidate the audit logs query to refetch after creating a new one
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast.success('Audit log entry created (simulated).');
      // Allow chaining custom onSuccess logic
      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      // TODO: Use error handling utility
      toast.error(
        `Error creating audit log: ${error.message || 'Unknown error'}`
      );
      // Allow chaining custom onError logic
      options.onError && options.onError(error, variables, context);
    },
    ...options, // Allow overriding mutation options
  });
};
