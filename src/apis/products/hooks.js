/**
 * @deprecated This API is not deprecated itself, but should be accessed through the unified Products & Subscriptions management system.
 * See DEPRECATED.md for more information.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Removed console warning as it's now documented in the hook comments
// and was causing unnecessary console noise for legitimate uses of the API

// Define query keys
const queryKeys = {
  all: ['products'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Hook for fetching all products
export const useProducts = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error(`Error fetching products: ${error.message}`);
        throw new Error(error.message);
      }
      
      return { data: data || [], count };
    },
    ...options,
  });
};

// Hook for fetching a single product by ID
export const useProductById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching product ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        toast.error(`Error fetching product details: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Hook for creating a product
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData) => {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        toast.error(`Error creating product: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Product created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating product: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook for updating a product
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, productData }) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating product ${id}:`, error);
        toast.error(`Error updating product: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Product updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating product: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook for deleting a product
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting product ${id}:`, error);
        toast.error(`Error deleting product: ${error.message}`);
        throw new Error(error.message);
      }
      
      return { id };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Product deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting product: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
