// src/apis/sessions/api.js - API methods for sessions
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Pagination

// Get sessions (e.g., filtered by patient_id)
export const getSessions = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('sessions')
    .select(`
      *,
      practitioner:auth.users(id, email),
      patient:patients(id, first_name, last_name)
    `, { count: 'exact' }) // Join related data
    .range(start, end);

  // Apply filters
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.userId) { // Filter by practitioner
    query = query.eq('user_id', filters.userId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  // Add date range filters for session_date if needed

  query = query.order('session_date', { ascending: false }); // Sort by session date

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching sessions:', error);
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

// Get a specific session by ID
export const getSessionById = async (id) => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      practitioner:auth.users(id, email),
      patient:patients(id, first_name, last_name)
    `) // Join related data
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching session with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new session
export const createSession = async (sessionData) => {
  // Ensure patient_id, user_id (practitioner), session_date are present
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  return data;
};

// Update an existing session
export const updateSession = async (id, sessionData) => {
  const { id: _, ...updateData } = sessionData;
  const { data, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating session with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a session
export const deleteSession = async (id) => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting session with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};
