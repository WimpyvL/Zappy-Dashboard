import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
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
  const { page, status, patientId, searchTerm, ...otherFilters } = params;
  const currentPage = page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('sessions') // Assuming table name is 'sessions'
        // Join with patients table to get name
        .select(`
          *,
          patients ( id, first_name, last_name )
        `, { count: 'exact' })
        .order('created_at', { ascending: false }) // Example order
        .range(rangeFrom, rangeTo);

      // Apply filters
      if (patientId) {
        // Assuming the FK column is patient_id based on other hooks
        query = query.eq('patient_id', patientId);
      }
      if (status) {
        query = query.eq('status', status); // Assuming 'status' column exists
      }
      // Add server-side search filter
      if (searchTerm) {
        // Adjust columns to search as needed (e.g., provider name if joined, notes)
        query = query.or(
          `patients.first_name.ilike.%${searchTerm}%,patients.last_name.ilike.%${searchTerm}%` // Search joined patient name
          // Add other searchable fields like session_notes if they exist
          // `,session_notes.ilike.%${searchTerm}%`
        );
      }
      // Add other filters as needed based on otherFilters

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        throw new Error(error.message);
      }

      // Map data to include patientName from joined table
      const mappedData =
        data?.map((session) => ({
          ...session,
          // Construct patientName from the joined 'patients' data
          patientName: session.patients
            ? `${session.patients.first_name || ''} ${session.patients.last_name || ''}`.trim()
            : 'N/A',
          // Ensure patientId is correctly mapped if the foreign key is different
          patientId: session.client_record_id || session.patient_id || session.patients?.id // Adjust based on actual FK column name
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

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

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

      const { data, error } = await supabase
        .from('sessions')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw new Error(error.message);
      }
      return data;
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

      const { data, error } = await supabase
        .from('sessions')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating session ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
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
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating session status ${sessionId}:`, error);
        throw new Error(error.message);
      }
      return data;
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

      const { error } = await supabase.from('sessions').delete().eq('id', id);

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
