import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['consultations'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get consultations hook using Supabase
export const useConsultations = (params = {}, pageSize = 10) => {
  // Extract searchTerm and other filters from params
  const { page, status, patientId, searchTerm } = params; // Removed unused _otherFilters
  const currentPage = page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('consultations')
        .select(
          `
          *,
          client_record ( id, first_name, last_name, date_of_birth )
        `, // Join with 'client_record' table
          { count: 'exact' }
        )
        .order('datesubmitted', { ascending: false }) // Revert to lowercase based on DB hint
        .range(rangeFrom, rangeTo);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (patientId) {
        query = query.eq('client_id', patientId); // Corrected FK column name
      }
      // Add server-side search filter
      if (searchTerm) {
        // Search on joined client_record fields and potentially consultation notes
        // Removed invalid 'provider' column search. Corrected 'email' to reference joined table.
        query = query.or(
          `client_record.first_name.ilike.%${searchTerm}%,client_record.last_name.ilike.%${searchTerm}%,client_record.email.ilike.%${searchTerm}%,provider_notes.ilike.%${searchTerm}%,client_notes.ilike.%${searchTerm}%`
        );
      }
      // Add other filters as needed based on otherFilters

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching consultations:', error);
        throw new Error(error.message);
      }

      // Map data if needed
      const mappedData =
        data?.map((consult) => ({
          ...consult,
          // Use the correct joined table name 'client_record'
          patientName: consult.client_record 
            ? `${consult.client_record.first_name || ''} ${consult.client_record.last_name || ''}`.trim()
            : 'N/A',
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
        .from('consultations')
        .select(
          `
          *,
          client_record ( id, first_name, last_name )
        ` // Join with 'client_record' table
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching consultation ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data
         ? {
            ...data,
            // Use the correct joined table name 'client_record'
            patientName: data.client_record 
              ? `${data.client_record.first_name || ''} ${data.client_record.last_name || ''}`.trim()
              : 'N/A',
          }
        : null;

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
      if (!consultationId)
        throw new Error('Consultation ID is required for status update.');

      const { data, error } = await supabase
        .from('consultations') // ASSUMING table name is 'consultations'
        .update({ status: status, updated_at: new Date().toISOString() }) // Assuming updated_at column
        .eq('id', consultationId)
        .select()
        .single();

      if (error) {
        console.error(
          `Error updating consultation status ${consultationId}:`,
          error
        );
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.consultationId),
      });
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

// Create Consultation Hook
export const useCreateConsultation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (consultationData) => {
      const dataToInsert = {
        ...consultationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('consultations')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating consultation:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('Consultation created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error creating consultation: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update Consultation Hook
export const useUpdateConsultation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, consultationData }) => {
      if (!id) throw new Error('Consultation ID is required for update.');

      const dataToUpdate = {
        ...consultationData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('consultations')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating consultation ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('Consultation updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error updating consultation: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete Consultation Hook
export const useDeleteConsultation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Consultation ID is required for deletion.');

      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting consultation ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      toast.success('Consultation deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error deleting consultation: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
