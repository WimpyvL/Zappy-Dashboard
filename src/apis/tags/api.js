// services/tagService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

// Get all tags (no pagination assumed for tags, adjust if needed)
export const getTags = async (filters = {}) => {
  let query = supabase
    .from('tags')
    .select('*');

  // Apply filters (example: filter by name)
  if (filters.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }
  // Add more filters as needed

  query = query.order('name', { ascending: true }); // Sort by name

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }

  // Return just the data array, assuming no pagination for tags
  return data;
};

// Get a specific tag by ID
export const getTagById = async (id) => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching tag with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new tag
export const createTag = async (tagData) => {
  const { data, error } = await supabase
    .from('tags')
    .insert(tagData)
    .select()
    .single();

  if (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
  return data;
};

// Update an existing tag
export const updateTag = async (id, tagData) => {
  // Tags might be immutable in some systems, but allowing update here
  const { id: _, ...updateData } = tagData;
  const { data, error } = await supabase
    .from('tags')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating tag with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a tag
export const deleteTag = async (id) => {
  // Consider implications: deleting a tag might require removing it from associated records (e.g., products.tags)
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting tag with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};

// Get tag usage information - Omitted for now
// Implementation would require querying related tables (products, patients, etc.)
// based on how tags are associated (e.g., text array contains, junction table).
// export const getTagUsage = async (id) => { ... }
