import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['products'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
};


// Get products hook using Supabase
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      let query = supabase
        .from('products') // ASSUMING table name is 'products'
        .select('*')
        .order('name', { ascending: true }); // Example order

      // Apply filters if any
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      // Corrected column name for active filter
      if (filters.active !== undefined) {
        query = query.eq('is_active', filters.active);
      }
      // Add search filter if needed
      if (filters.search) {
         query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(error.message);
      }
      // Return data directly, or wrap if pagination/meta is needed later
      return data || [];
    },
  });
};

// Get product by ID hook using Supabase
export const useProductById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('products') // ASSUMING table name is 'products'
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching product ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create product hook using Supabase
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      // Add timestamps, default values etc. based on your actual 'products' table schema
      // Map frontend fields to DB columns, ensuring correct names
      const dataToInsert = {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        category: productData.category,
        type: productData.type,
        price: productData.price,
        one_time_purchase_price: productData.oneTimePurchasePrice,
        fulfillment_source: productData.fulfillmentSource,
        requires_prescription: productData.requiresPrescription,
        interaction_warnings: productData.interactionWarnings,
        stock_status: productData.stockStatus,
        image_url: productData.imageUrl, // Assuming imageUrl maps to image_url
        is_active: productData.active ?? true, // Corrected column name
        stripe_price_id: productData.stripePriceId,
        stripe_one_time_price_id: productData.stripeOneTimePriceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // NOTE: 'doses' and 'associatedServiceIds' are likely handled via separate tables/logic, not direct insert here.
      };

      const { data, error } = await supabase
        .from('products') // ASSUMING table name is 'products'
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'An error occurred while creating the product.');
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update product hook using Supabase
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }) => {
      if (!id) throw new Error("Product ID is required for update.");
      // Map frontend fields to DB columns for update
      const dataToUpdate = {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        category: productData.category,
        type: productData.type,
        price: productData.price,
        one_time_purchase_price: productData.oneTimePurchasePrice,
        fulfillment_source: productData.fulfillmentSource,
        requires_prescription: productData.requiresPrescription,
        interaction_warnings: productData.interactionWarnings,
        stock_status: productData.stockStatus,
        image_url: productData.imageUrl,
        is_active: productData.active, // Corrected column name
        stripe_price_id: productData.stripePriceId,
        stripe_one_time_price_id: productData.stripeOneTimePriceId,
        updated_at: new Date().toISOString(),
        // NOTE: 'doses' and 'associatedServiceIds' updates likely need separate logic.
      };
      // Remove fields that shouldn't be updated directly
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;

      const { data, error } = await supabase
        .from('products') // ASSUMING table name is 'products'
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating product ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'An error occurred while updating the product.');
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete product hook using Supabase
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Product ID is required for deletion.");

      const { error } = await supabase
        .from('products') // ASSUMING table name is 'products'
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting product ${id}:`, error);
         // Handle foreign key constraint errors if products are linked elsewhere
         if (error.code === '23503') { // Foreign key violation
           throw new Error(`Cannot delete product: It is still linked to other records (e.g., orders, packages).`);
         }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'An error occurred while deleting the product.');
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
