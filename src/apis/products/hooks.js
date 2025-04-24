import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// --- Mock Data Removed ---

const queryKeys = {
  all: ['products'],
  lists: (filters) => [...queryKeys.all, 'list', filters],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get products hook (Using Supabase)
export const useProducts = (filters = {}) => {
  // console.log('Using Supabase data in useProducts hook'); // Keep console log for debugging if needed
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      // Basic filtering example - adapt as needed for your filters object
      let query = supabase.from('products').select('*');
      // Example: if (filters.category) query = query.eq('category', filters.category);
      // Example: if (filters.active) query = query.eq('active', filters.active);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // keepPreviousData: true, // Consider if needed
    staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
  });
};

// Get product by ID hook (Using Supabase)
export const useProductById = (id, options = {}) => {
  // console.log(`Using Supabase data for ID: ${id} in useProductById hook`);
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single(); // Use .single() if you expect exactly one result
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: Infinity, // Keep fetched product data fresh indefinitely unless invalidated
    ...options,
  });
};

// Create product hook (Using Supabase)
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      // console.log('Supabase Creating product:', productData);
      const { data, error } = await supabase
        .from('products')
        .insert([productData]) // Supabase expects an array for insert
        .select(); // Optionally select the inserted data

      if (error) throw error;
      return data?.[0]; // Return the newly created product object if select() was used
    },
    onSuccess: (data, variables, context) => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating product: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update product hook (Using Supabase)
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productData }) => {
      // console.log(`Supabase Updating product ${id}:`, productData);
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(); // Optionally select the updated data

      if (error) throw error;
      return data?.[0]; // Return the updated product object if select() was used
    },
    onSuccess: (data, variables, context) => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating product: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete product hook (Using Supabase)
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      // console.log(`Supabase Deleting product ${id}`);
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      return { success: true }; // Indicate success
    },
    onSuccess: (data, variables, context) => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Optionally remove detail query if it exists
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting product: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
