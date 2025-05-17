import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import formsApi from './api';
import { supabase } from '../../lib/supabase';

// Define query keys
const queryKeys = {
  all: ['forms'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  patientForms: (patientId, params = {}) => [
    ...queryKeys.all,
    'patient',
    patientId,
    { params },
  ],
};

// Hook to fetch all forms (questionnaires)
export const useForms = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      const { data, error } = await formsApi.getForms(params);

      if (error) {
        console.error('Error fetching forms:', error);
        throw new Error(error.message);
      }

      // Map data to match expected format
      const mappedData =
        data?.map((q) => ({
          ...q,
          title: q.name,
          status: q.is_active ? 'active' : 'inactive',
          serviceId: q.service_id,
        })) || [];

      return { data: mappedData };
    },
  });
};

// Hook to fetch forms assigned to a patient
export const useGetPatientForms = (patientId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patientForms(patientId, params),
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await formsApi.getPatientForms(patientId, params);

      if (error) {
        console.error(`Error fetching forms for patient ${patientId}:`, error);
        throw new Error(error.message);
      }

      // Map data to include questionnaire name directly
      const mappedData =
        data?.map((req) => ({
          ...req,
          name: req.questionnaire?.name || 'Unknown Form',
          formType: req.questionnaire?.form_type,
          description: req.questionnaire?.description,
        })) || [];

      return mappedData;
    },
    enabled: !!patientId,
    keepPreviousData: true,
    ...options,
  });
};

// Hook to fetch a specific form by ID
export const useFormById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data: formData, error: formError } =
        await formsApi.getFormById(id);

      if (formError) {
        console.error(`Error fetching form ${id}:`, formError);
        if (formError.code === 'PGRST116') return null; // Not found
        throw new Error(formError.message);
      }

      // Map data to match expected format
      const mappedData = formData
        ? {
            ...formData,
            title: formData.name,
            status: formData.is_active ? 'active' : 'inactive',
            serviceId: formData.service_id,
          }
        : null;

      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new form
export const useCreateForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data, error } = await formsApi.createForm(formData);

      if (error) {
        console.error('Error creating form:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Form created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to update an existing form
export const useUpdateForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      if (!id) throw new Error('Form ID is required for update.');

      const { data, error } = await formsApi.updateForm(id, formData);

      if (error) {
        console.error(`Error updating form ${id}:`, error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
      toast.success('Form updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to delete a form
export const useDeleteForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Form ID is required for deletion.');

      const { error } = await formsApi.deleteForm(id);

      if (error) {
        console.error(`Error deleting form ${id}:`, error);
        if (error.code === '23503') {
          // Foreign key violation
          throw new Error(
            `Cannot delete form: It is still linked to other records (e.g., form requests).`
          );
        }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Form deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to send a form to a patient
export const useSendFormToPatient = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, formId, deadlineDays = 7 }) => {
      if (!patientId || !formId) {
        throw new Error(
          'Patient ID and Form ID are required to send the form.'
        );
      }

      // Get current user ID if available
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const createdBy = user?.id;

      const { data, error } = await formsApi.sendFormToPatient(
        patientId,
        formId,
        {
          deadlineDays,
          createdBy,
        }
      );

      if (error) {
        console.error('Error sending form to patient:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate patient forms queries to refresh the list
      if (variables.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.patientForms(variables.patientId),
        });
      }
      toast.success('Form sent to patient successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error sending form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to update a form request status
export const useUpdateFormRequestStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, status, responseData, patientId }) => {
      if (!requestId)
        throw new Error('Request ID is required to update status.');

      const { data, error } = await formsApi.updateFormRequestStatus(
        requestId,
        status,
        responseData
      );

      if (error) {
        console.error(`Error updating form request status:`, error);
        throw new Error(error.message);
      }

      return { data, patientId };
    },
    onSuccess: (result, variables, context) => {
      // Invalidate patient forms queries if patientId is provided
      if (result.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.patientForms(result.patientId),
        });
      }
      toast.success(`Form status updated to ${variables.status}.`);
      options.onSuccess?.(result.data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error updating form status: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to send a reminder for a form
export const useSendFormReminder = (options = {}) => {
  return useMutation({
    mutationFn: async ({ patientId, formId }) => {
      if (!patientId || !formId) {
        throw new Error(
          'Patient ID and Form ID are required to send a reminder.'
        );
      }

      // In a real implementation, this would call an API endpoint or Supabase Edge Function
      // For now, we'll simulate success
      return { success: true, message: 'Reminder sent successfully' };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Form reminder sent successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error sending reminder: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to resend a form
export const useResendForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, formId }) => {
      if (!patientId || !formId) {
        throw new Error(
          'Patient ID and Form ID are required to resend the form.'
        );
      }

      // Get current user ID if available
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const createdBy = user?.id;

      // Create a new form request
      const { data, error } = await formsApi.sendFormToPatient(
        patientId,
        formId,
        {
          createdBy,
        }
      );

      if (error) {
        console.error('Error resending form:', error);
        throw new Error(error.message);
      }

      return { data, patientId };
    },
    onSuccess: (result, variables, context) => {
      // Invalidate patient forms queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.patientForms(variables.patientId),
      });
      toast.success('Form resent successfully.');
      options.onSuccess?.(result.data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error resending form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
