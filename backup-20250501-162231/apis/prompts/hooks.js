import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { message } from 'antd';

// --- Fetch All Prompts ---
export const usePrompts = (options = {}) => {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompts') // Assuming table name is 'ai_prompts'
        .select('*')
        .order('task_key', { ascending: true }); // Order for consistency

      if (error) {
        console.error('Error fetching prompts:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    ...options,
  });
};

// --- Update Prompt ---
export const useUpdatePrompt = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, prompt_text }) => {
      if (!id) throw new Error('Prompt ID is required for update.');

      const { data, error } = await supabase
        .from('ai_prompts')
        .update({ prompt_text: prompt_text, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(); // Assuming update returns the updated row

      if (error) {
        console.error(`Error updating prompt ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the prompts query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      message.success('Prompt updated successfully!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Update prompt ${variables.id} mutation error:`, error);
      message.error(`Failed to update prompt: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// --- Optional: Create Prompt (If needed) ---
// export const useCreatePrompt = (options = {}) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (promptData) => { // { task_key: '...', prompt_text: '...' }
//       const { data, error } = await supabase
//         .from('ai_prompts')
//         .insert({ ...promptData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
//         .select()
//         .single();
//       if (error) throw error;
//       return data;
//     },
//     onSuccess: (data, variables, context) => {
//       queryClient.invalidateQueries({ queryKey: ['prompts'] });
//       message.success('Prompt created successfully!');
//       options.onSuccess?.(data, variables, context);
//     },
//     onError: (error, variables, context) => {
//       message.error(`Failed to create prompt: ${error.message}`);
//       options.onError?.(error, variables, context);
//     },
//     onSettled: options.onSettled,
//   });
// };

// --- Optional: Delete Prompt (If needed) ---
// export const useDeletePrompt = (options = {}) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       const { error } = await supabase
//         .from('ai_prompts')
//         .delete()
//         .eq('id', id);
//       if (error) throw error;
//       return { id };
//     },
//     onSuccess: (data, variables, context) => {
//       queryClient.invalidateQueries({ queryKey: ['prompts'] });
//       message.success('Prompt deleted successfully!');
//       options.onSuccess?.(data, variables, context);
//     },
//     onError: (error, variables, context) => {
//       message.error(`Failed to delete prompt: ${error.message}`);
//       options.onError?.(error, variables, context);
//     },
//     onSettled: options.onSettled,
//   });
// };
