import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications

const queryKeys = {
  all: ['services'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get services hook
export const useServices = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: () => apiService.services.getAll(params), // Use apiService
    keepPreviousData: true,
  });
};

// Get service by ID hook
export const useServiceById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: () => apiService.services.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Create service hook
export const useAddService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceData) => apiService.services.create(serviceData), // Use apiService
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Service created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
       toast.error(`Error creating service: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update service hook
export const useUpdateService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Ensure payload matches apiService: { id, serviceData }
    mutationFn: ({ id, ...serviceData }) => apiService.services.update(id, serviceData), // Use apiService
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Service updated successfully');
      options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
        toast.error(`Error updating service: ${error.message || 'Unknown error'}`);
        options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};

// Delete service hook
export const useDeleteService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiService.services.delete(id), // Use apiService
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Consider removing detail query if needed: queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Service deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
        toast.error(`Error deleting service: ${error.message || 'Unknown error'}`);
        options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};
