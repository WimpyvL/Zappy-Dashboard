import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';

export const useTags = (params = {}) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*');
      
      if (error) throw error;
      return { data };
    }
  });
};

export const useTagById = (id, options = {}) => {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData) => {
      const { data, error } = await supabase
        .from('tags')
        .insert([tagData])
        .select();
      
      if (error) throw error;
      return { data: data[0] };
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
    onSettled: options.onSettled // Pass through onSettled
  });
};

export const useUpdateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tagData }) => {
      const { data, error } = await supabase
        .from('tags')
        .update(tagData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { data: data[0] };
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
    onSettled: options.onSettled // Pass through onSettled
  });
};

export const useDeleteTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
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
    onSettled: options.onSettled // Pass through onSettled
  });
};

export const useTagUsage = (id, options = {}) => {
  return useQuery({
    queryKey: ['tagUsage', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tag_usage')
        .select('*')
        .eq('tag_id', id);
      
      if (error) throw error;
      return { usage: data };
    },
    enabled: !!id,
    ...options,
  });
};
