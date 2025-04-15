// src/apis/notes/api.js - API methods for notes
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 15; // Pagination for notes

// Get notes (e.g., filtered by patient_id)
export const getNotes = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('notes')
    .select(`
      *,
      author:auth.users(id, email)
    `, { count: 'exact' }) // Join author email
    .range(start, end);

  // Apply filters
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.sessionId) {
    query = query.eq('session_id', filters.sessionId);
  }
   if (filters.userId) { // Filter by author
    query = query.eq('user_id', filters.userId);
  }
   if (filters.noteType) {
    query = query.eq('note_type', filters.noteType);
  }
  // Add date range filters for created_at if needed

  // RLS policy should handle visibility (e.g., is_private)
  // If additional client-side filtering for private notes is needed (not recommended), add it here.

  query = query.order('created_at', { ascending: false }); // Sort by creation date

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching notes:', error);
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

// Get a specific note by ID
export const getNoteById = async (id) => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      author:auth.users(id, email)
    `) // Join author email
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching note with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new note
export const createNote = async (noteData) => {
  // Ensure patient_id and content are present
  // Add user_id automatically
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to create a note.");

  const dataToInsert = { ...noteData, user_id: user.id };

  const { data, error } = await supabase
    .from('notes')
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }
  return data;
};

// Update an existing note
export const updateNote = async (id, noteData) => {
  const { id: _, patient_id, user_id, session_id, created_at, ...updateData } = noteData; // Exclude immutable/managed fields
  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', id)
    // Add RLS check if needed, e.g., .eq('user_id', auth.uid()) if only authors can update
    .select()
    .single();

  if (error) {
    console.error(`Error updating note with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a note
export const deleteNote = async (id) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
    // Add RLS check if needed, e.g., .eq('user_id', auth.uid())

  if (error) {
    console.error(`Error deleting note with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};
