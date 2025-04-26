import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// Fetch all providers
export const useProviders = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      // Normalize authorizedStates to always be an array
      return (data || []).map(provider => ({
        ...provider,
        authorizedStates: Array.isArray(provider.authorizedStates)
          ? provider.authorizedStates
          : (typeof provider.authorizedStates === 'string' && provider.authorizedStates.length > 0
              ? provider.authorizedStates.split(',').map(s => s.trim()).filter(Boolean)
              : [])
      }));
    }
  });
};

// Add a provider
export const useAddProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider) => {
      const { data, error } = await supabase
        .from('providers')
        .insert([provider])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] })
  });
};

// Update a provider
export const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] })
  });
};

// Delete a provider
export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] })
  });
};
