import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['noteTemplates'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Hook to fetch all note templates
export const useNoteTemplates = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('note_templates') // Assuming table name is 'note_templates'
        .select('*')
        .order('name', { ascending: true });

      // Add filters if needed
      // if (params.someFilter) query = query.eq('column', params.someFilter);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching note templates:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
  });
};

// Hook to create a new note template
export const useCreateNoteTemplate = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateData) => {
      const dataToInsert = {
        name: templateData.name,
        content: templateData.content,
        // Let DB handle id, created_at, updated_at
      };
      const { data, error } = await supabase
        .from('note_templates')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating note template:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Note template created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating template: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook to update an existing note template
export const useUpdateNoteTemplate = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, templateData }) => {
      if (!id) throw new Error("Template ID is required for update.");
      const dataToUpdate = {
        name: templateData.name,
        content: templateData.content,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('note_templates')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating note template ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) }); // Also invalidate detail
      toast.success('Note template updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating template: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook to delete a note template
export const useDeleteNoteTemplate = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Template ID is required for deletion.");
      const { error } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting note template ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) }); // Remove detail query
      toast.success('Note template deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting template: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
