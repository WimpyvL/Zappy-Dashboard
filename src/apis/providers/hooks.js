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

// Fetch a single provider by ID
export const useProvider = (id) => {
  return useQuery({
    queryKey: ['providers', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      // Normalize authorizedStates
      return {
        ...data,
        authorizedStates: Array.isArray(data.authorizedStates)
          ? data.authorizedStates
          : (typeof data.authorizedStates === 'string' && data.authorizedStates.length > 0
              ? data.authorizedStates.split(',').map(s => s.trim()).filter(Boolean)
              : [])
      };
    },
    enabled: !!id
  });
};

// Fetch providers by role
export const useProvidersByRole = (role = 'provider') => {
  return useQuery({
    queryKey: ['providers', 'role', role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('role', role)
        .order('name', { ascending: true });
      if (error) throw error;
      // Normalize authorizedStates
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['providers', data.id] });
    }
  });
};

// Update provider availability
export const useUpdateProviderAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, availabilityStatus, availabilityStart, availabilityEnd }) => {
      const { data, error } = await supabase
        .from('providers')
        .update({ availabilityStatus, availabilityStart, availabilityEnd })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['providers', data.id] });
    }
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
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['providers', id] });
    }
  });
};
