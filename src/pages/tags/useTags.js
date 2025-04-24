import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';

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
      const { data, error } = await supabase
        .from('tags')
        .select('*');
      
      if (error) throw error;
      return data || [];
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
        const { data, error } = await supabase
          .from('tag_usage')
          .select('*')
          .eq('tag_id', tagId);
        
        if (error) throw error;
        return data;
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
    mutationFn: async (tagData) => {
      const { data, error } = await supabase
        .from('tags')
        .insert([tagData])
        .select();
      
      if (error) throw error;
      return data[0];
    },
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
    mutationFn: async ({ id, data }) => {
      const { data: updatedData, error } = await supabase
        .from('tags')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return updatedData[0];
    },
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
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
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
