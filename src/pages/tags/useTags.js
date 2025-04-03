import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiService from '../../utils/apiService';

// Query keys
const TAGS_KEYS = {
  all: ['tags'],
  details: (id) => [...TAGS_KEYS.all, id],
  usage: (id) => [...TAGS_KEYS.details(id), 'usage'],
};

export const useTags = () => {
  const queryClient = useQueryClient();

  // Fetch all tags
  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: TAGS_KEYS.all,
    queryFn: async () => {
      const response = await apiService.tags.getAll();
      return response.data || [];
    },
    onError: (err) => {
      console.error('Error fetching tags:', err);
    },
  });

  // Fetch tag usage data
  const useTagUsage = (tagId) => {
    return useQuery({
      queryKey: TAGS_KEYS.usage(tagId),
      queryFn: async () => {
        const response = await apiService.tags.getUsage(tagId);
        return response;
      },
      enabled: !!tagId, // Only run query if tagId is provided
      onError: (err) => {
        console.error('Error fetching tag usage:', err);
        toast.error('Error fetching tag usage data');
      },
    });
  };

  // Create tag mutation
  const createTag = useMutation({
    mutationFn: (tagData) => apiService.tags.create(tagData),
    onSuccess: (response) => {
      // Invalidate tags query to refetch the list
      queryClient.invalidateQueries({ queryKey: TAGS_KEYS.all });
      toast.success('Tag created successfully');
    },
    onError: (err) => {
      console.error('Error creating tag:', err);
      toast.error('Failed to create tag');
    },
  });

  // Update tag mutation
  const updateTag = useMutation({
    mutationFn: ({ id, data }) => apiService.tags.update(id, data),
    onSuccess: (response) => {
      // Invalidate specific tag query and the tags list
      queryClient.invalidateQueries({ queryKey: TAGS_KEYS.all });
      toast.success('Tag updated successfully');
    },
    onError: (err) => {
      console.error('Error updating tag:', err);
      toast.error('Failed to update tag');
    },
  });

  // Delete tag mutation
  const deleteTag = useMutation({
    mutationFn: (id) => apiService.tags.delete(id),
    onSuccess: () => {
      // Invalidate tags query to refetch the list
      queryClient.invalidateQueries({ queryKey: TAGS_KEYS.all });
      toast.success('Tag deleted successfully');
    },
    onError: (err) => {
      console.error('Error deleting tag:', err);
      toast.error('Failed to delete tag');
    },
  });

  return {
    tags,
    isLoading,
    error,
    useTagUsage,
    createTag,
    updateTag,
    deleteTag,
  };
};