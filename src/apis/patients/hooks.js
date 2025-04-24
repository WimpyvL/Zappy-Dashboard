import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import auditLogService from '../../utils/auditLogService';

export const usePatients = (currentPage, filters) => {
  return useQuery({
    queryKey: ['patients', currentPage, filters],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      const pageSize = 10;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;
      return {
        data,
        meta: {
          total: count,
          per_page: pageSize,
          current_page: currentPage,
        },
      };
    },
    keepPreviousData: true,
  });
};

export const usePatientById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
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

export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      
      // Log the audit event
      const patientId = data?.id;
      const patientName = `${variables.first_name} ${variables.last_name}`;
      auditLogService.log('Patient Created', {
        patientId,
        name: patientName,
      });

      options.onSuccess?.(data, variables);
    },
  });
};

export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientData }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      options.onSuccess?.(data, variables);
    },
  });
};

export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      options.onSuccess?.();
    },
  });
};
