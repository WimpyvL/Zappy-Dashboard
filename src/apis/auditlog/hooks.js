import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// --- Mock Data Removed ---

const queryKeys = {
  all: ['auditLogs'],
  lists: (params) => [...queryKeys.all, 'list', params],
};

/**
 * Hook to fetch audit logs with pagination and filtering.
 * @param {object} params - Query parameters (e.g., { page: 1, limit: 20, userId: '...', action: '...' })
 * @param {object} options - React Query options
 * @returns {QueryResult} Result object from useQuery
 */
// Hook to fetch audit logs with pagination and filtering (Using Supabase)
export const useAuditLogs = (params = { page: 1, limit: 20 }, options = {}) => {
  // console.log('Using Supabase audit logs data');
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('audit_logs') // Assuming table name is 'audit_logs'
        .select('*', { count: 'exact' }) // Request count for pagination
        .order('timestamp', { ascending: false }) // Order by timestamp descending
        .range(offset, offset + limit - 1);

      // Apply filters
      if (params.userId) {
        query = query.eq('user_id', params.userId); // Assuming user column is 'user_id'
      }
      if (params.action) {
        query = query.ilike('action', `%${params.action}%`); // Case-insensitive search for action
      }
      // Add more filters as needed based on your schema

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data,
        total: count,
        page: page,
        limit: limit,
      };
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
    onError: (error) => {
      toast.error(
        `Error fetching audit logs: ${error.message || 'Unknown error'}`
      );
    },
    ...options,
  });
};

/**
 * Hook to create a new audit log entry.
 * NOTE: This might not be used if logging is purely backend-driven.
 * Consider using Supabase Functions or database triggers for automatic logging.
 * @param {object} options - React Query mutation options
 * @returns {MutationResult} Result object from useMutation
 */
export const useCreateAuditLog = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData) => {
      // console.log('Supabase Creating audit log:', logData);
      // Ensure logData contains necessary fields like user_id, action, details
      const { data, error } = await supabase
        .from('audit_logs') // Assuming table name is 'audit_logs'
        .insert([{ ...logData }]) // timestamp might be auto-set by DB
        .select();

      if (error) throw error;
      return { success: true, log: data?.[0] };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Audit log entry created.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error creating audit log: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
