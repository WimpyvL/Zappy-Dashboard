// services/formService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Define items per page for pagination

// --- Form Definitions ---

// Get all forms (definitions)
export const getForms = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('forms')
    .select('*', { count: 'exact' })
    .range(start, end);

  // Apply filters (example: filter by title or active status)
  if (filters.title) {
    query = query.ilike('title', `%${filters.title}%`);
  }
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  // Add filter by user_id if needed based on RLS/UI requirements
  // if (filters.userId) {
  //   query = query.eq('user_id', filters.userId);
  // }

  // Apply sorting (example: sort by title ascending)
  query = query.order('title', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching forms:', error);
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

// Get a specific form definition by ID
export const getFormById = async (id) => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      console.warn(`Form with id ${id} not found.`);
      return null;
    }
    console.error(`Error fetching form with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new form definition
export const createForm = async (formData) => {
  // Ensure user_id is added if required by RLS
  // const { data: { user } } = await supabase.auth.getUser();
  // const dataToInsert = { ...formData, user_id: user.id };
  const { data, error } = await supabase
    .from('forms')
    .insert(formData) // Use dataToInsert if needed
    .select()
    .single();

  if (error) {
    console.error('Error creating form:', error);
    throw error;
  }
  return data;
};

// Update an existing form definition
export const updateForm = async (id, formData) => {
  const { id: _, ...updateData } = formData; // Exclude id
  const { data, error } = await supabase
    .from('forms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating form with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a form definition (and its submissions due to CASCADE)
export const deleteForm = async (id) => {
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting form with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};


// --- Form Submissions ---

// Get submissions for a specific form
export const getFormSubmissions = async (formId, currentPage = 1, filters = {}) => {
  if (!formId) throw new Error("formId is required to fetch submissions.");

  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' }) // Consider joining user/patient data: '*, user:users(id, email), patient:patients(id, first_name)'
    .eq('form_id', formId)
    .range(start, end);

  // Apply filters (example: filter by submitter user_id or patient_id)
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }

  // Apply sorting (example: sort by submission date descending)
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error(`Error fetching submissions for form ${formId}:`, error);
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

// Get a specific form submission by ID
export const getFormSubmissionById = async (submissionId) => {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*') // Consider joining related data
    .eq('id', submissionId)
    .single();

   if (error) {
    if (error.code === 'PGRST116') { // Not found
      console.warn(`Form submission with id ${submissionId} not found.`);
      return null;
    }
    console.error(`Error fetching form submission with id ${submissionId}:`, error);
    throw error;
  }
  return data;
};


// Create a new form submission
export const createFormSubmission = async (submissionData) => {
  // Ensure form_id and submission_data are present
  // Add user_id automatically if user is logged in
  // const { data: { user } } = await supabase.auth.getUser();
  // const dataToInsert = { ...submissionData, user_id: user?.id };

  const { data, error } = await supabase
    .from('form_submissions')
    .insert(submissionData) // Use dataToInsert if needed
    .select()
    .single();

  if (error) {
    console.error('Error creating form submission:', error);
    throw error;
  }
  return data;
};

// Note: Updating/Deleting individual submissions might not be standard practice.
// Usually, forms are submitted once. Add update/delete functions if required.
