// hooks.js - React Query Hooks for Tags
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
  // getTagUsage // Omitted from API
} from './api';
import { toast } from 'react-toastify';

// Hook to fetch all tags
export const useTags = (filters = {}) => {
  return useQuery({
    queryKey: ['tags', filters],
    // API function now returns the array directly, no pagination object
    queryFn: () => getTags(filters)
  });
};

// Hook to fetch a specific tag by ID
export const useTagById = (id, options = {}) => {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: () => getTagById(id),
    enabled: !!id,
    ...options
  });
};

// Hook to create a new tag
export const useCreateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagData) => createTag(tagData),
    onSuccess: (data, variables) => { // Pass data/variables
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while creating the tag.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to update an existing tag
export const useUpdateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tagData }) => updateTag(id, tagData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', variables.id] });
      toast.success('Tag updated successfully');
      options.onSuccess && options.onSuccess(data, variables); // Pass data/variables
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while updating the tag.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to delete a tag
export const useDeleteTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTag(id),
    onSuccess: (data, variables) => { // Pass data/variables
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.removeQueries({ queryKey: ['tag', variables] }); // Remove specific tag query
      toast.success('Tag deleted successfully');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while deleting the tag.');
      options.onError && options.onError(error);
    }
  });
};

// Hook for getTagUsage is removed as the API function was omitted.
