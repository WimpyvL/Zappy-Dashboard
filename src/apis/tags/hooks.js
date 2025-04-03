// hooks.js - React Query Hooks for Tags
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

// Hook to fetch all tags
export const useTags = (params = {}) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => apiService.tags.getAll(params), // Use apiService
  });
};

// Hook to fetch a specific tag by ID
export const useTagById = (id, options = {}) => {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: () => apiService.tags.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new tag
export const useCreateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagData) => apiService.tags.create(tagData), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: (error, variables, context) => { // Added params
      toast.error(error.message || 'An error occurred while creating the tag.');
      options.onError?.(error, variables, context); // Pass params
    },
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Hook to update an existing tag
export const useUpdateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tagData }) => apiService.tags.update(id, tagData), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', variables.id] });
      toast.success('Tag updated successfully');
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: (error, variables, context) => { // Added params
      toast.error(error.message || 'An error occurred while updating the tag.');
      options.onError?.(error, variables, context); // Pass params
    },
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Hook to delete a tag
export const useDeleteTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.tags.delete(id), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully');
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: (error, variables, context) => { // Added params
      toast.error(error.message || 'An error occurred while deleting the tag.');
      options.onError?.(error, variables, context); // Pass params
    },
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Hook to get tag usage information
export const useTagUsage = (id, options = {}) => {
  return useQuery({
    queryKey: ['tagUsage', id],
    queryFn: () => apiService.tags.getUsage(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};
