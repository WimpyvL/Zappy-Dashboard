import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-toastify';

const queryKeys = {
  all: ['sessions'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

export const useSessions = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select('*');

      // Apply filters if provided
      if (params?.status) {
        query = query.eq('status', params.status);
      }
      if (params?.patientId) {
        query = query.eq('patient_id', params.patientId);
      }
      if (params?.search) {
        query = query.or(
          `patient_name.ilike.%${params.search}%,doctor.ilike.%${params.search}%,type.ilike.%${params.search}%`
        );
      }

      // Apply date range if provided
      if (params?.dateRange) {
        const { startDate, endDate } = params.dateRange;
        if (startDate) {
          query = query.gte('scheduled_date', startDate);
        }
        if (endDate) {
          query = query.lte('scheduled_date', endDate);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data };
    },
    keepPreviousData: true,
  });
};

export const useSessionById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionData) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select();

      if (error) throw error;
      return { data: data[0] };
    },
    onSuccess: (data) => {
      toast.success('Session created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create session');
      options.onError?.(error);
    },
  });
};

export const useUpdateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionData }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(sessionData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data[0] };
    },
    onSuccess: (data, variables) => {
      toast.success('Session updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update session');
      options.onError?.(error);
    },
  });
};

export const useUpdateSessionStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, status }) => {
      const { error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;
      return { success: true, id: sessionId, status };
    },
    onSuccess: (data, variables) => {
      toast.success('Session status updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.sessionId) });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update session status');
      options.onError?.(error);
    },
  });
};

export const useDeleteSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast.success('Session deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete session');
      options.onError?.(error);
    },
  });
};

export const useAddSessionTag = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, tagId }) => {
      const { error } = await supabase.rpc('add_session_tag', {
        session_id: entityId,
        tag_id: tagId,
      });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.entityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add tag to session');
      options.onError?.(error);
    },
  });
};

export const useRemoveSessionTag = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, tagId }) => {
      const { error } = await supabase.rpc('remove_session_tag', {
        session_id: entityId,
        tag_id: tagId,
      });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.entityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove tag from session');
      options.onError?.(error);
    },
  });
};
