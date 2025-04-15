// services/taskService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Pagination

export const getTasks = async (
  currentPage = 1,
  filters = {},
  sortingDetails = { sortBy: 'created_at', ascending: false } // Default sort
) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:auth_users(id, email),
      created_by_user:auth_users(id, email),
      patient:patients(id, first_name, last_name)
    `, { count: 'exact' }) // Corrected join syntax
    .range(start, end);

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters.assignedToUserId) {
    query = query.eq('assigned_to_user_id', filters.assignedToUserId);
  }
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.title) {
    query = query.ilike('title', `%${filters.title}%`);
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }
  // Add date range filters for due_date if needed

  // Apply sorting
  if (sortingDetails.sortBy) {
    query = query.order(sortingDetails.sortBy, { ascending: sortingDetails.ascending });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
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

export const getTaskById = async (id) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:auth.users(id, email),
      created_by_user:auth.users(id, email),
      patient:patients(id, first_name, last_name)
    `) // Join related data
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching task with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const createTask = async (taskData) => {
  // Ensure created_by_user_id is set, potentially from context
  // const { data: { user } } = await supabase.auth.getUser();
  // const dataToInsert = { ...taskData, created_by_user_id: user.id };
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData) // Use dataToInsert if needed
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  return data;
};

export const updateTask = async (id, taskData) => {
  const { id: _, ...updateData } = taskData;
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating task with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const deleteTask = async (id) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};

export const markTaskCompleted = async (id) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) {
    console.error(`Error marking task ${id} as completed:`, error);
    throw error;
  }
  return data;
};

// --- Session/Status Update Functions (Commented out - require specific logic) ---
/*
export const handleSessionCreation = async (id) => {
  // TODO: Implement logic using Supabase (e.g., update task status, create session record?)
  console.warn("handleSessionCreation needs Supabase implementation.");
  return { success: false, message: "Not implemented" };
};

export const handleUpdateStatus = async (ids) => {
  // TODO: Implement logic using Supabase (e.g., bulk update task statuses?)
  console.warn("handleUpdateStatus needs Supabase implementation.");
   // Example: Update status for multiple tasks
   // const { data, error } = await supabase
   //  .from('tasks')
   //  .update({ status: 'some_new_status' }) // Determine the target status
   //  .in('id', ids)
   //  .select();
   // if (error) throw error;
   // return data;
  return { success: false, message: "Not implemented" };
};

export const handleBulkSessionCreation = async (selectedTaskIds) => {
  // TODO: Implement logic using Supabase
  console.warn("handleBulkSessionCreation needs Supabase implementation.");
  return { success: false, message: "Not implemented" };
};
*/

// --- Helper Functions ---

// Get potential assignees (users)
export const getAssignees = async () => {
  // Fetching directly from auth.users might expose emails.
  // A 'profiles' table linked to auth.users is often preferred for storing display names, roles etc.
  // For now, fetching limited user info. Adjust RLS on auth.users if needed, or create profiles table.
  const { data, error } = await supabase
    .from('auth_users') // Corrected table name to auth_users
    .select('id, email'); // Adjust columns as needed (e.g., 'id, raw_user_meta_data->>firstName' if stored in metadata)

  if (error) {
    console.error('Error fetching assignees (users):', error);
    throw error;
  }
  return data; // Returns array of { id, email }
};

// Get patients (for assigning tasks to)
export const getTaskablePatients = async () => {
  // Fetch basic patient info for selection
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name'); // Select only needed fields

  if (error) {
    console.error('Error fetching taskable patients:', error);
    throw error;
  }
  return data; // Returns array of { id, first_name, last_name }
};
