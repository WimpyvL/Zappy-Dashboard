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
  deleteTag,
  getTagUsage // Removed duplicate
} from './api'; // Keep imports for other hooks
import { toast } from 'react-toastify';

// --- Mock Data ---
const sampleTagsData = [
  { id: 'vip', name: 'VIP', color: 'gold' },
  { id: 'follow-up', name: 'Needs Follow Up', color: 'blue' },
  { id: 'high-risk', name: 'High Risk', color: 'red' },
  { id: 'new-patient', name: 'New Patient', color: 'green' },
];
// --- End Mock Data ---

// Hook to fetch all tags (Mocked)
export const useTags = (params = {}) => {
  console.log("Using mock tags data in useTags hook");
  return useQuery({
    queryKey: ['tags', params],
    // queryFn: () => getTags(params), // Original API call
    queryFn: () => Promise.resolve({ data: sampleTagsData }), // Return mock data
    staleTime: Infinity, // Prevent refetching for mock data
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
      options.onSuccess && options.onSuccess();
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
      options.onSuccess && options.onSuccess();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while deleting the tag.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to get tag usage information
export const useTagUsage = (id, options = {}) => {
  return useQuery({
    queryKey: ['tagUsage', id],
    queryFn: () => getTagUsage(id),
    enabled: !!id,
    ...options
  });
};
