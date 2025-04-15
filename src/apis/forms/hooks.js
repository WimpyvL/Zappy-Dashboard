import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  // Form Definition APIs
  getForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  // Form Submission APIs
  getFormSubmissions,
  getFormSubmissionById,
  createFormSubmission
} from './api';


// --- Form Definition Hooks ---

export const useForms = (currentPage = 1, filters = {}) => {
  return useQuery({
    queryKey: ['forms', currentPage, filters],
    // The queryFn now returns an object: { data: formArray, pagination: {...} }
    queryFn: () => getForms(currentPage, filters),
    // Keep previous data while fetching new page for smoother UX
    keepPreviousData: true,
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
      toast.success('Form deleted successfully'); // Add toast for consistency
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while deleting the form.'); // Add toast
      options.onError && options.onError(error);
    }
  });
};


// --- Form Submission Hooks ---

// Hook to fetch submissions for a specific form
export const useFormSubmissions = (formId, currentPage = 1, filters = {}) => {
  return useQuery({
    queryKey: ['formSubmissions', formId, currentPage, filters],
    queryFn: () => getFormSubmissions(formId, currentPage, filters),
    enabled: !!formId, // Only run if formId is provided
    keepPreviousData: true,
  });
};

// Hook to fetch a specific form submission by ID
export const useFormSubmissionById = (submissionId, options = {}) => {
  return useQuery({
    queryKey: ['formSubmission', submissionId],
    queryFn: () => getFormSubmissionById(submissionId),
    enabled: !!submissionId,
    ...options
  });
};

// Hook to create a new form submission
export const useCreateFormSubmission = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionData) => createFormSubmission(submissionData),
    onSuccess: (data, variables) => {
      // Invalidate submissions for the specific form
      queryClient.invalidateQueries({ queryKey: ['formSubmissions', variables.form_id] });
      toast.success('Form submitted successfully');
      options.onSuccess && options.onSuccess(data, variables); // Pass data/variables back
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while submitting the form.');
      options.onError && options.onError(error);
    }
  });
};

// Note: Hooks for updating/deleting submissions are omitted as per api.js comment,
// but can be added here if needed, following the pattern above.
