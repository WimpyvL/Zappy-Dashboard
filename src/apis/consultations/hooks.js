import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['consultations'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get consultations hook using Supabase
export const useConsultations = (params = {}, pageSize = 10) => {
  const currentPage = params.page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('consultations') // ASSUMING table name is 'consultations'
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `, { count: 'exact' }) // Example join
        .order('dateSubmitted', { ascending: false }) // Adjust column name if needed
        .range(rangeFrom, rangeTo);

      // Apply filters
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.patientId) {
         query = query.eq('patientId', params.patientId); // Adjust column name if needed
      }
      // Add other filters as needed

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching consultations:', error);
        throw new Error(error.message);
      }

      // Map data if needed
      const mappedData = data?.map(consult => ({
          ...consult,
          patientName: consult.client_record ? `${consult.client_record.first_name || ''} ${consult.client_record.last_name || ''}`.trim() : 'N/A',
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

// Get consultation by ID hook using Supabase
export const useConsultationById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('consultations') // ASSUMING table name is 'consultations'
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `) // Example join
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching consultation ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
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

// Update consultation status hook using Supabase
export const useUpdateConsultationStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ consultationId, status }) => {
      if (!consultationId) throw new Error("Consultation ID is required for status update.");

      const { data, error } = await supabase
        .from('consultations') // ASSUMING table name is 'consultations'
        .update({ status: status, updated_at: new Date().toISOString() }) // Assuming updated_at column
        .eq('id', consultationId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating consultation status ${consultationId}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.consultationId) });
      toast.success('Consultation status updated');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating status: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Placeholder for Create Consultation Hook
export const useCreateConsultation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (consultationData) => {
      console.warn("useCreateConsultation hook not fully implemented. Needs Supabase insert logic.");
      // Placeholder: Replace with actual Supabase insert
      // const { data, error } = await supabase.from('consultations').insert({...}).select().single();
      // if (error) throw error;
      // return data;
      await new Promise(res => setTimeout(res, 100)); // Simulate async
      return { ...consultationData, id: `temp_${Date.now()}`}; // Return dummy data
    },
     onSuccess: (data, variables, context) => {
      toast.success('Consultation created (placeholder)');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
       toast.error(`Error creating consultation: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
    },
     onSettled: options.onSettled,
  });
};

// Placeholder for Update Consultation Hook
export const useUpdateConsultation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, consultationData }) => {
       console.warn(`useUpdateConsultation hook not fully implemented for ID: ${id}. Needs Supabase update logic.`);
       // Placeholder: Replace with actual Supabase update
       // const { data, error } = await supabase.from('consultations').update({...}).eq('id', id).select().single();
       // if (error) throw error;
       // return data;
       await new Promise(res => setTimeout(res, 100)); // Simulate async
       return { ...consultationData, id: id }; // Return dummy data
    },
     onSuccess: (data, variables, context) => {
       toast.success('Consultation updated (placeholder)');
       queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
       queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
       options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
       toast.error(`Error updating consultation: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
    },
     onSettled: options.onSettled,
  });
};

// Placeholder for Delete Consultation Hook
export const useDeleteConsultation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
     mutationFn: async (id) => {
       console.warn(`useDeleteConsultation hook not fully implemented for ID: ${id}. Needs Supabase delete logic.`);
       // Placeholder: Replace with actual Supabase delete
       // const { error } = await supabase.from('consultations').delete().eq('id', id);
       // if (error) throw error;
       // return { success: true, id };
       await new Promise(res => setTimeout(res, 100)); // Simulate async
       return { success: true, id };
     },
     onSuccess: (data, variables, context) => { // variables is the id
       toast.success('Consultation deleted (placeholder)');
       queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
       queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
       options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
       toast.error(`Error deleting consultation: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
    },
     onSettled: options.onSettled,
  });
};
