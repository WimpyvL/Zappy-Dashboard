import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getAuditLogs, createAuditLog } from './api'; // Commented out API functions
import { toast } from 'react-toastify';

// --- Mock Data ---
const sampleAuditLogsData = [
  {
    id: 1,
    timestamp: '2025-04-01T18:30:00Z',
    user: 'admin@example.com',
    action: 'Patient Created',
    details: 'Patient ID: p001, Name: John Smith',
  },
  {
    id: 2,
    timestamp: '2025-04-01T18:35:10Z',
    user: 'admin@example.com',
    action: 'Order Status Updated',
    details: 'Order ID: o002, Status: shipped',
  },
  {
    id: 3,
    timestamp: '2025-04-01T18:40:25Z',
    user: 'support@example.com',
    action: 'User Logged In',
    details: 'User ID: user_admin',
  },
  {
    id: 4,
    timestamp: '2025-04-02T09:00:00Z',
    user: 'admin@example.com',
    action: 'Discount Created',
    details: 'Discount Code: SPRING10',
  },
  {
    id: 5,
    timestamp: '2025-04-03T14:15:00Z',
    user: 'admin@example.com',
    action: 'Task Assigned',
    details: 'Task ID: t001, Assignee: Dr. Sarah Johnson',
  },
];
// --- End Mock Data ---

/**
 * Hook to fetch audit logs with pagination and filtering.
 * @param {object} params - Query parameters (e.g., { page: 1, limit: 20, userId: '...', action: '...' })
 * @param {object} options - React Query options
 * @returns {QueryResult} Result object from useQuery
 */
// Hook to fetch audit logs with pagination and filtering (Mocked)
export const useAuditLogs = (params = { page: 1, limit: 20 }, options = {}) => {
  console.log('Using mock audit logs data');
  return useQuery({
    queryKey: ['auditLogs', params],
    // queryFn: () => getAuditLogs(params), // Original API call
    queryFn: () => {
      // Basic filtering simulation (can be expanded)
      const filteredLogs = sampleAuditLogsData.filter((log) => {
        let match = true;
        if (params.userId && log.user !== params.userId) match = false;
        if (params.action && !log.action.includes(params.action)) match = false;
        // Add more filters as needed
        return match;
      });
      // Basic pagination simulation
      const page = params.page || 1;
      const limit = params.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedLogs = filteredLogs.slice(start, end);

      return Promise.resolve({
        logs: paginatedLogs,
        total: filteredLogs.length,
        page: page,
        limit: limit,
      });
    },
    keepPreviousData: true,
    staleTime: Infinity, // Keep mock data fresh
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
    // mutationFn: (logData) => createAuditLog(logData), // Original API call
    mutationFn: async (logData) => {
      console.log('Mock Creating audit log:', logData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newLog = {
        id: Date.now(), // Generate mock ID
        timestamp: new Date().toISOString(),
        user: 'current_user@example.com', // Placeholder user
        ...logData,
      };
      // Note: Doesn't actually add to sampleAuditLogsData
      return { success: true, log: newLog }; // Simulate API response
    },
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
