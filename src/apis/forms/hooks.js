import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { toast } from 'react-toastify';
import { createForm, getFormById, getForms, updateForm, deleteForm } from './api';

export const useForms = (params = {}) => {
  return useQuery({
    queryKey: ['forms', params],
    queryFn: () => getForms(params),
    select: (data) => data // Optional transformation if needed
  });
};

export const useFormById = (id, options = {}) => {
  return useQuery({
    queryKey: ['form', id],
    queryFn: () => getFormById(id),
    enabled: !!id,
    ...options
  });
};

export const useCreateForm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createForm(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form created successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while creating the form.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to update an existing form
export const useUpdateForm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => updateForm(id, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', variables.id] });
      toast.success('Form updated successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while updating the form.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to delete a form
export const useDeleteForm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    }
  });
};