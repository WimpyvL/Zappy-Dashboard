import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseHelper } from '../../lib/supabase'; // Use the correct Supabase client
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
      const select = `
        *,
        patients ( id, first_name, last_name, date_of_birth )
      `; // Join with 'patients' table

      const filters = [];
      if (status) {
        filters.push({ column: 'status', operator: 'eq', value: status });
      }
      if (patientId) {
        filters.push({ column: 'patient_id', operator: 'eq', value: patientId }); // Corrected FK column name
      }
      if (searchTerm) {
         // Note: supabaseHelper.fetch does not directly support .or() with joined tables.
         // For complex queries like this, you might need to use the direct supabase client
         // or handle filtering client-side after fetching.
         // For now, we'll omit the searchTerm filter when using the helper.
         console.warn("searchTerm filter is not supported by supabaseHelper.fetch for this query structure.");
      }

      const { data, error, count } = await supabaseHelper.fetch('consultations', {
        select,
        filters,
        order: { column: 'scheduled_at', ascending: false },
        limit: pageSize,
        range: { from: rangeFrom, to: rangeTo }, // supabaseHelper.fetch needs range
        count: 'exact' // supabaseHelper.fetch needs count option
      });


      if (error) {
        console.error('Error fetching consultations:', error);
        throw new Error(error.message);
      }

      // Map data if needed
      const mappedData =
        data?.map((consult) => ({
          ...consult,
          // Use the correct joined table name 'client_record'
          patientName: consult.patients
            ? `${consult.patients.first_name || ''} ${consult.patients.last_name || ''}`.trim()
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

      const select = `
        *,
        patients ( id, first_name, last_name )
      `; // Join with 'patients' table

      const filters = [{ column: 'id', operator: 'eq', value: id }];

      const { data, error } = await supabaseHelper.fetch('consultations', {
        select,
        filters,
        single: true,
      });

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
          patientName: data.patients
              ? `${data.patients.first_name || ''} ${data.patients.last_name || ''}`.trim()
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

      const dataToUpdate = { status: status, updated_at: new Date().toISOString() }; // Assuming updated_at column

      const { data, error } = await supabaseHelper.update('consultations', consultationId, dataToUpdate);

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

      const { data, error } = await supabaseHelper.insert('consultations', dataToInsert, { returning: 'single' });

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

      const { data, error } = await supabaseHelper.update('consultations', id, dataToUpdate);

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

      const { data, error } = await supabaseHelper.delete('consultations', id);

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
