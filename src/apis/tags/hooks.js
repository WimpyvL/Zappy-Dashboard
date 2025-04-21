// hooks.js - React Query Hooks for Tags
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Commented out direct API imports as we use apiService or mock data
// import {
//   getTags,
//   getTagById,
//   createTag,
//   updateTag,
//   deleteTag,
//   getTagUsage
// } from './api';
// import apiService from '../../utils/apiService'; // Removed unused import
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
  // console.log('Using mock tags data in useTags hook'); // Removed log
  return useQuery({
    queryKey: ['tags', params],
    // queryFn: () => getTags(params), // Original direct API call
    // queryFn: () => apiService.tags.getAll(params), // Original apiService call
    queryFn: () => Promise.resolve({ data: sampleTagsData }), // Return mock data
    staleTime: Infinity, // Prevent refetching for mock data
  });
};

// Hook to fetch a specific tag by ID (Mocked)
export const useTagById = (id, options = {}) => {
  // console.log(`Using mock tag data for ID: ${id} in useTagById hook`); // Removed log
  return useQuery({
    queryKey: ['tag', id],
    // queryFn: () => apiService.tags.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleTagsData.find((t) => t.id === id) || sampleTagsData[0]
      ), // Find mock tag or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Hook to create a new tag
export const useCreateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (tagData) => apiService.tags.create(tagData), // Original API call
    mutationFn: async (tagData) => {
      // console.log('Mock Creating tag:', tagData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newTag = {
        id: tagData.name.toLowerCase().replace(/\s+/g, '-'), // Generate mock ID from name
        ...tagData,
      };
      // Note: Doesn't actually add to sampleTagsData
      return { data: newTag }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: (error, variables, context) => {
      // Added params
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
    // mutationFn: ({ id, tagData }) => apiService.tags.update(id, tagData), // Original API call
    mutationFn: async ({ id, tagData }) => {
      // console.log(`Mock Updating tag ${id}:`, tagData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...tagData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', variables.id] });
      toast.success('Tag updated successfully');
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: (error, variables, context) => {
      // Added params
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
    // mutationFn: (id) => apiService.tags.delete(id), // Original API call
    mutationFn: async (id) => {
      // console.log(`Mock Deleting tag ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      // Also invalidate specific tag if cached
      queryClient.invalidateQueries({ queryKey: ['tag', variables] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully');
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: (error, variables, context) => {
      // Added params
      toast.error(error.message || 'An error occurred while deleting the tag.');
      options.onError?.(error, variables, context); // Pass params
    },
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Hook to get tag usage information (Mocked)
export const useTagUsage = (id, options = {}) => {
  // console.log(`Using mock tag usage data for ID: ${id}`); // Removed log
  return useQuery({
    queryKey: ['tagUsage', id],
    // queryFn: () => apiService.tags.getUsage(id), // Original API call
    queryFn: () => {
      // Simulate usage based on sample data (very basic example)
      const usage = {
        patients: sampleTagsData.find((t) => t.id === id) ? 1 : 0, // Example: Check if tag exists
        orders: id === 'vip' ? 1 : 0, // Example: VIP tag used in 1 order
        sessions: id === 'follow-up' ? 1 : 0, // Example: follow-up used in 1 session
      };
      return Promise.resolve({ usage });
    },
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};
