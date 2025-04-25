import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys for products
const queryKeys = {
  all: ['products'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get products hook with pagination using Supabase
export const useProducts = (filters = {}, pageSize = 10) => {
  const { page, search, category, active } = filters;
  const currentPage = page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(rangeFrom, rangeTo);

      if (category) {
        query = query.eq('category', category);
      }
      if (active !== undefined) {
        query = query.eq('is_active', active);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(error.message);
      }

      return {
        data: data || [],
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    keepPreviousData: true,
  });
};

// Get product by ID hook using Supabase
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
        if (error.code === 'PGRST116') return null;
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
        image_url: productData.imageUrl,
        is_active: productData.active ?? true,
        stripe_price_id: productData.stripePriceId,
        stripe_one_time_price_id: productData.stripeOneTimePriceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
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
      console.error('Create product mutation error:', error);
      toast.error(`Error creating product: ${error.message}`);
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
      if (!id) throw new Error('Product ID is required for update.');

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
        is_active: productData.active,
        stripe_price_id: productData.stripePriceId,
        stripe_one_time_price_id: productData.stripeOneTimePriceId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
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
      console.error(`Update product ${variables.id} mutation error:`, error);
      toast.error(`Error updating product: ${error.message}`);
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
      if (!id) throw new Error('Product ID is required for deletion.');

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting product ${id}:`, error);
        if (error.code === '23503') {
          throw new Error('Cannot delete product: It is still linked to other records');
        }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Delete product ${variables} mutation error:`, error);
      toast.error(`Error deleting product: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
