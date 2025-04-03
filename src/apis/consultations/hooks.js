import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

const queryKeys = {
  all: ['consultations'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get consultations hook
export const useConsultations = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: () => apiService.consultations.getAll(params), // Use apiService
    keepPreviousData: true,
  });
};

// Get consultation by ID hook
export const useConsultationById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: () => apiService.consultations.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Update consultation status hook
export const useUpdateConsultationStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Payload matches apiService: { id, status }
    mutationFn: ({ consultationId, status }) => apiService.consultations.updateStatus(consultationId, status), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate lists and the specific detail
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

// Add other mutation hooks as needed (create, update, delete)
// export const useCreateConsultation = (options = {}) => { ... };
// export const useUpdateConsultation = (options = {}) => { ... };
// export const useDeleteConsultation = (options = {}) => { ... };
