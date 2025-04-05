import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['auditLogs'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
};

/**
 * Hook to fetch audit logs with pagination and filtering using Supabase.
 * @param {object} params - Query parameters (e.g., { page: 1, limit: 20, userId: '...', action: '...' })
 * @param {object} options - React Query options
 * @returns {QueryResult} Result object from useQuery
 */
export const useAuditLogs = (params = { page: 1, limit: 20 }, options = {}) => {
  const currentPage = params.page || 1;
  const pageSize = params.limit || 20;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('api_logs') // Target the api_logs table
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false }) // Order by creation time
        .range(rangeFrom, rangeTo);

      // Apply filters (adjust column names and logic as needed)
      if (params.userId) {
        // Note: api_logs doesn't have a direct user ID. Filtering might need joins or backend logic.
        // This is a placeholder filter based on potential request_data content.
        // query = query.contains('request_data', { userId: params.userId }); // Example filter
        console.warn("Filtering audit logs by userId might require backend changes or different table structure.");
      }
      if (params.action) { // Assuming 'action' might map to 'path' or 'method' or be in request_data
         query = query.or(`path.ilike.%${params.action}%,method.ilike.%${params.action}%`);
         console.warn("Filtering audit logs by action might require backend changes or different table structure.");
      }
      // Add date range filters if needed
      // if (params.startDate) { query = query.gte('created_at', params.startDate); }
      // if (params.endDate) { query = query.lte('created_at', params.endDate); }


      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw new Error(error.message);
      }

      // Map data if needed (e.g., extract user info if stored in request_data)
      const mappedData = data?.map(log => ({
          ...log,
          // Example: Extract user email if available in request_data
          // user: log.request_data?.user?.email || 'N/A',
          timestamp: log.created_at, // Map created_at to timestamp if needed
          action: `${log.method} ${log.path}`, // Combine method and path for action
          details: JSON.stringify(log.request_data || log.response_data || {}), // Show JSON data as details
      })) || [];

      return {
        // Adjust the returned structure based on how AuditLogPage expects it
        logs: mappedData,
        total: count || 0,
        page: currentPage,
        limit: pageSize,
        // Add meta structure if needed by the component
        // meta: {
        //   total: count || 0,
        //   per_page: pageSize,
        //   current_page: currentPage,
        //   last_page: Math.ceil((count || 0) / pageSize),
        // },
      };
    },
    keepPreviousData: true,
    // staleTime: 60 * 1000, // Example: 1 minute stale time
    onError: (error) => {
      toast.error(`Error fetching audit logs: ${error.message || 'Unknown error'}`);
    },
    ...options,
  });
};

// Removed useCreateAuditLog hook - Logging should likely be handled by auditLogService or backend directly.
