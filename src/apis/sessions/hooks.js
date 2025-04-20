import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseHelper } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify'; // Keep for feedback
// Removed auditLogService import as it wasn't used here previously

// Define query keys for sessions
const queryKeys = {
  all: ['sessions'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get sessions hook using Supabase
export const useSessions = (params = {}, pageSize = 10) => {
  // Extract searchTerm and other filters from params
  const { page, status, patientId, searchTerm } = params; // Removed unused _otherFilters
  const currentPage = page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      const fetchOptions = {
        // Join with client_record table to get name
        select: `
          *,
          patients ( id, first_name, last_name )
        `,
        order: { column: 'created_at', ascending: false },
        range: { from: rangeFrom, to: rangeTo },
        filters: [],
        count: 'exact',
      };

      // Apply filters
      if (patientId) {
        // Assuming the FK column is patient_id (as defined in other migrations)
        fetchOptions.filters.push({ column: 'patient_id', operator: 'eq', value: patientId });
      }
      if (status) {
        fetchOptions.filters.push({ column: 'status', operator: 'eq', value: status });
      }
      // Add server-side search filter
      if (searchTerm) {
        // supabaseHelper.fetch doesn't directly support .or() with joined tables in filters
        // This filter might need adjustment or backend handling.
        // For now, adding a basic filter example that might not work as intended.
        // fetchOptions.filters.push({ column: 'patients.first_name', operator: 'ilike', value: `%${searchTerm}%` });
        console.warn("Filtering sessions by search might require backend changes or different table structure.");
      }
      // Add other filters as needed based on otherFilters

      const { data, error, count } = await supabaseHelper.fetch('sessions', fetchOptions);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw new Error(error.message);
      }

      // Map data to include patientName from joined table
      const mappedData =
        data?.map((session) => ({
          ...session,
          // Construct patientName from the joined 'client_record' data
          patientName: session.patients 
            ? `${session.patients.first_name || ''} ${session.patients.last_name || ''}`.trim()
            : 'N/A',
          // Ensure patientId is correctly mapped (assuming FK is patient_id)
          patientId: session.patient_id 
        })) || [];

      return {
        data: mappedData,
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    keepPreviousData: true,
  });
};

// Get session by ID hook using Supabase
export const useSessionById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const fetchOptions = {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: id }],
        single: true,
      };
      const { data, error } = await supabaseHelper.fetch('sessions', fetchOptions);

      if (error) {
        console.error(`Error fetching session ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }

      const mappedData = data
        ? {
            ...data,
            patientName: 'N/A', // We'll need to fetch patient name separately
          }
        : null;

      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Create session hook using Supabase
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionData) => {
      const dataToInsert = {
        ...sessionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseHelper.insert('sessions', dataToInsert, { returning: 'representation' });

      if (error) {
        console.error('Error creating session:', error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.insert returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      toast.success('Session created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    }, // Ensure comma is present
    onError: (error, variables, context) => {
      console.error('Create session mutation error:', error);
      toast.error(`Error creating session: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update session hook using Supabase
export const useUpdateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionData }) => {
      if (!id) throw new Error('Session ID is required for update.');
      const dataToUpdate = {
        ...sessionData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseHelper.update('sessions', id, dataToUpdate);

      if (error) {
        console.error(`Error updating session ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.update returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      toast.success('Session updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
      options.onSuccess?.(data, variables, context);
    }, // Ensure comma is present
    onError: (error, variables, context) => {
      console.error(`Update session ${variables.id} mutation error:`, error);
      toast.error(`Error updating session: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update session status hook using Supabase
export const useUpdateSessionStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, status }) => {
      if (!sessionId)
        throw new Error('Session ID is required for status update.');

      // Assuming 'status' is a column in the 'sessions' table
      const { data, error } = await supabaseHelper.update('sessions', sessionId, { status: status, updated_at: new Date().toISOString() });

      if (error) {
        console.error(`Error updating session status ${sessionId}:`, error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.update returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      toast.success('Session status updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.sessionId),
      });
      options.onSuccess?.(data, variables, context);
    }, // Ensure comma is present
    onError: (error, variables, context) => {
      console.error(
        `Update session status ${variables.sessionId} mutation error:`,
        error
      );
      toast.error(`Error updating session status: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete session hook using Supabase
export const useDeleteSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Session ID is required for deletion.');

      const { data, error } = await supabaseHelper.delete('sessions', id);

      if (error) {
        console.error(`Error deleting session ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      toast.success('Session deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    }, // Ensure comma is present
    onError: (error, variables, context) => {
      console.error(`Delete session ${variables} mutation error:`, error);
      toast.error(`Error deleting session: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// --- Tag Hooks Removed ---
// Tagging sessions likely requires a join table (e.g., session_tags)
// which is not present in the provided schema.sql.
// Implementing this would require schema changes and new hook logic.
// export const useAddSessionTag = ...
// export const useRemoveSessionTag = ...
