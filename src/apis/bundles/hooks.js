import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['bundles'],
  lists: () => [...queryKeys.all, 'list'],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Fetch all bundles
export const useBundles = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products:bundle_products(
            id,
            product_id,
            quantity,
            products:product_id(
              id,
              name,
              price
            )
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching bundles:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    ...options,
  });
};

// Fetch a single bundle by ID
export const useBundleById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products:bundle_products(
            id,
            product_id,
            quantity,
            products:product_id(
              id,
              name,
              price
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching bundle ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create a new bundle
export const useCreateBundle = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bundleData) => {
      // Extract products from bundle data
      const { includedProducts, ...bundleDetails } = bundleData;
      
      // Start a transaction
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert(bundleDetails)
        .select()
        .single();

      if (bundleError) {
        console.error('Error creating bundle:', bundleError);
        throw new Error(bundleError.message);
      }
      
      // If we have included products, add them to the bundle_products table
      if (includedProducts && includedProducts.length > 0) {
        const bundleProducts = includedProducts.map(item => ({
          bundle_id: bundle.id,
          product_id: item.productId,
          quantity: item.quantity || 1
        }));
        
        const { error: productsError } = await supabase
          .from('bundle_products')
          .insert(bundleProducts);
          
        if (productsError) {
          console.error('Error adding products to bundle:', productsError);
          // Attempt to clean up the bundle we just created
          await supabase.from('bundles').delete().eq('id', bundle.id);
          throw new Error(productsError.message);
        }
      }
      
      return bundle;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Bundle created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating bundle: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update a bundle
export const useUpdateBundle = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, bundleData }) => {
      // Extract products from bundle data
      const { includedProducts, ...bundleDetails } = bundleData;
      
      // Update the bundle details
      const { error: bundleError } = await supabase
        .from('bundles')
        .update(bundleDetails)
        .eq('id', id);

      if (bundleError) {
        console.error(`Error updating bundle ${id}:`, bundleError);
        throw new Error(bundleError.message);
      }
      
      // If we have included products, update the bundle_products table
      if (includedProducts) {
        // First, delete all existing bundle_products for this bundle
        const { error: deleteError } = await supabase
          .from('bundle_products')
          .delete()
          .eq('bundle_id', id);
          
        if (deleteError) {
          console.error(`Error deleting existing products for bundle ${id}:`, deleteError);
          throw new Error(deleteError.message);
        }
        
        // Then, add the new bundle_products
        if (includedProducts.length > 0) {
          const bundleProducts = includedProducts.map(item => ({
            bundle_id: id,
            product_id: item.productId,
            quantity: item.quantity || 1
          }));
          
          const { error: productsError } = await supabase
            .from('bundle_products')
            .insert(bundleProducts);
            
          if (productsError) {
            console.error(`Error adding products to bundle ${id}:`, productsError);
            throw new Error(productsError.message);
          }
        }
      }
      
      // Fetch the updated bundle to return
      const { data: updatedBundle, error: fetchError } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products:bundle_products(
            id,
            product_id,
            quantity,
            products:product_id(
              id,
              name,
              price
            )
          )
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error(`Error fetching updated bundle ${id}:`, fetchError);
        throw new Error(fetchError.message);
      }
      
      return updatedBundle;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Bundle updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating bundle: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Delete a bundle
export const useDeleteBundle = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      // Delete the bundle (cascade will handle bundle_products)
      const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting bundle ${id}:`, error);
        throw new Error(error.message);
      }
      
      return { id };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Bundle deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting bundle: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
