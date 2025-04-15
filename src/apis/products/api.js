// services/productService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Pagination

export const getProducts = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(start, end);

  // Apply filters
  if (filters.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }
  if (filters.sku) {
    query = query.eq('sku', filters.sku);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.tags && filters.tags.length > 0) {
    // Use contains operator for array field
    query = query.contains('tags', filters.tags);
  }
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  // Add price range filters etc. if needed

  query = query.order('name', { ascending: true }); // Sort by name

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return {
    data,
    pagination: {
      currentPage: currentPage,
      totalPages: Math.ceil(count / ITEMS_PER_PAGE),
      totalCount: count,
      itemsPerPage: ITEMS_PER_PAGE
    },
  };
};

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  return data;
};

export const updateProduct = async (id, productData) => {
  const { id: _, ...updateData } = productData;
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};
