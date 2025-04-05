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
  const currentPage = params.page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('session') // Assuming table name is 'session'
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `, { count: 'exact' })
        .order('created_at', { ascending: false }) // Example order
        .range(rangeFrom, rangeTo);

      // Apply filters
      if (params.patientId) {
        query = query.eq('client_record_id', params.patientId);
      }
      if (params.status) {
        query = query.eq('status', params.status); // Assuming 'status' column exists
      }
      // Add other filters as needed

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        throw new Error(error.message);
      }

      const mappedData = data?.map(session => ({
          ...session,
          patientName: session.client_record ? `${session.client_record.first_name || ''} ${session.client_record.last_name || ''}`.trim() : 'N/A',
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
        .from('session')
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching session ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }

      const mappedData = data ? {
          ...data,
          patientName: data.client_record ? `${data.client_record.first_name || ''} ${data.client_record.last_name || ''}`.trim() : 'N/A',
      } : null;

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
        .from('session')
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
       console.error("Create session mutation error:", error);
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
      if (!id) throw new Error("Session ID is required for update.");
      const dataToUpdate = {
        ...sessionData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('session')
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
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
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
       if (!sessionId) throw new Error("Session ID is required for status update.");

       // Assuming 'status' is a column in the 'session' table
       const { data, error } = await supabase
         .from('session')
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
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.sessionId) });
      options.onSuccess?.(data, variables, context);
    }, // Ensure comma is present
    onError: (error, variables, context) => {
       console.error(`Update session status ${variables.sessionId} mutation error:`, error);
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
       if (!id) throw new Error("Session ID is required for deletion.");

       const { error } = await supabase
         .from('session')
         .delete()
         .eq('id', id);

       if (error) {
         console.error(`Error deleting session ${id}:`, error);
         throw new Error(error.message);
       }
       return { success: true, id };
     },
    onSuccess: (data, variables, context) => { // variables is the id
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
