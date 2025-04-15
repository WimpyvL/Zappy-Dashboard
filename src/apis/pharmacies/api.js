// services/pharmacyService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Pagination

export const getPharmacies = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('pharmacies')
    .select('*', { count: 'exact' })
    .range(start, end);

  // Apply filters
  if (filters.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  // Add more filters as needed (e.g., location based on address jsonb)

  query = query.order('name', { ascending: true }); // Sort by name

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching pharmacies:', error);
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

export const getPharmacyById = async (id) => {
  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching pharmacy with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const createPharmacy = async (pharmacyData) => {
  const { data, error } = await supabase
    .from('pharmacies')
    .insert(pharmacyData)
    .select()
    .single();

  if (error) {
    console.error('Error creating pharmacy:', error);
    throw error;
  }
  return data;
};

export const updatePharmacy = async (id, pharmacyData) => {
  const { id: _, ...updateData } = pharmacyData;
  const { data, error } = await supabase
    .from('pharmacies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating pharmacy with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const deletePharmacy = async (id) => {
  const { error } = await supabase
    .from('pharmacies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting pharmacy with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};

export const togglePharmacyActive = async (id, active) => {
  const { data, error } = await supabase
    .from('pharmacies')
    .update({ is_active: active })
    .eq('id', id)
    .select('id, is_active')
    .single();

  if (error) {
    console.error(`Error toggling active status for pharmacy ${id}:`, error);
    throw error;
  }
  return data;
};
