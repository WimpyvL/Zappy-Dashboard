// services/discountService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Define items per page for pagination, adjust if needed

// Get all discounts with pagination and filtering
export const getDiscounts = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('discounts')
    .select('*', { count: 'exact' })
    .range(start, end);

  // Apply filters (example: filter by code or active status)
  if (filters.code) {
    query = query.ilike('code', `%${filters.code}%`);
  }
  if (filters.is_active !== undefined) { // Check for boolean explicitly
    query = query.eq('is_active', filters.is_active);
  }
  // Add more filters as needed

  // Apply sorting (example: sort by code ascending)
  query = query.order('code', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }

  // Return data and pagination info
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

// Get a specific discount by ID
export const getDiscountById = async (id) => {
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      console.warn(`Discount with id ${id} not found.`);
      return null;
    }
    console.error(`Error fetching discount with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new discount
export const createDiscount = async (discountData) => {
  const { data, error } = await supabase
    .from('discounts')
    .insert(discountData)
    .select()
    .single();

  if (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
  return data;
};

// Update an existing discount
export const updateDiscount = async (id, discountData) => {
  const { id: _, ...updateData } = discountData; // Exclude id
  const { data, error } = await supabase
    .from('discounts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating discount with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a discount
export const deleteDiscount = async (id) => {
  const { error } = await supabase
    .from('discounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting discount with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};

// Toggle discount active status
export const toggleDiscountActive = async (id, active) => {
  const { data, error } = await supabase
    .from('discounts')
    .update({ is_active: active })
    .eq('id', id)
    .select('id, is_active') // Return only relevant fields
    .single();

  if (error) {
    console.error(`Error toggling active status for discount ${id}:`, error);
    throw error;
  }
  return data;
};
