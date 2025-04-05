import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// Hook to fetch all tags using Supabase
export const useTags = (params = {}) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: async () => {
      let query = supabase
        .from('tag') // Assuming table name is 'tag'
        .select('*')
        .order('name', { ascending: true }); // Example order

      // Add any filters based on params if needed
      // if (params.someFilter) { query = query.eq('column', params.someFilter); }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tags:', error);
        throw new Error(error.message);
      }
      // Return just the data array, as components might expect that directly
      return data || [];
    },
    // staleTime: 5 * 60 * 1000, // Example stale time
  });
};

// Hook to fetch a specific tag by ID using Supabase
export const useTagById = (id, options = {}) => {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('tag')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching tag ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new tag using Supabase
export const useCreateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData) => {
      // Assuming schema has 'name', 'created_at', 'updated_at' and maybe 'color'
      // The ID might be auto-generated if it's UUID, or needs to be provided if VARCHAR
      const dataToInsert = {
        ...tagData,
        // Generate ID client-side if it's VARCHAR and required, otherwise let DB handle UUID
        id: tagData.id || tagData.name?.toLowerCase().replace(/\s+/g, '-') || `tag-${Date.now()}`, // Example ID generation if needed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tag')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating tag:', error);
        if (error.code === '23505') { // Unique violation code in Postgres
           throw new Error(`Tag with this name or ID already exists.`);
        }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      toast.error(error.message || 'An error occurred while creating the tag.');
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to update an existing tag using Supabase
export const useUpdateTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tagData }) => {
      if (!id) throw new Error("Tag ID is required for update.");
      const dataToUpdate = {
        ...tagData,
        updated_at: new Date().toISOString(),
      };
      // Ensure ID is not part of the update payload itself
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;


      const { data, error } = await supabase
        .from('tag')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating tag ${id}:`, error);
         if (error.code === '23505') { // Unique violation
           throw new Error(`Tag with this name or code already exists.`);
         }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', variables.id] });
      toast.success('Tag updated successfully');
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      toast.error(error.message || 'An error occurred while updating the tag.');
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to delete a tag using Supabase
export const useDeleteTag = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Tag ID is required for deletion.");

      const { error } = await supabase
        .from('tag')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting tag ${id}:`, error);
        // Handle foreign key constraint errors if tags are linked elsewhere
        if (error.code === '23503') { // Foreign key violation
           throw new Error(`Cannot delete tag: It is still linked to other records.`);
        }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.removeQueries({ queryKey: ['tag', variables] }); // Remove detail query
      toast.success('Tag deleted successfully');
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      toast.error(error.message || 'An error occurred while deleting the tag.');
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Removed useTagUsage hook
