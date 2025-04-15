// services/patientService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Define items per page for pagination

export const getPatients = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0; // Supabase range is 0-indexed
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' }) // Request count for pagination
    .range(start, end); // Apply pagination

  // Apply filters (example: filter by name if provided in filters object)
  // You'll need to expand this based on actual filter requirements
  if (filters.name) {
    // Use ilike for case-insensitive partial matching on first_name or last_name
    query = query.or(`first_name.ilike.%${filters.name}%,last_name.ilike.%${filters.name}%`);
  }
  // Add more filters here based on the 'filters' object keys/values
  // e.g., if (filters.email) query = query.eq('email', filters.email);

  // Apply sorting (example: sort by created_at descending)
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }

  // Return data and pagination info in a structure the hook might expect
  return {
    data, // The array of patient records
    pagination: {
      currentPage: currentPage,
      totalPages: Math.ceil(count / ITEMS_PER_PAGE),
      totalCount: count,
      itemsPerPage: ITEMS_PER_PAGE
    },
  };
};

export const getPatientById = async (id) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single(); // Expecting a single result or null

  if (error) {
    // Don't throw an error if the record simply wasn't found (PGRST116)
    if (error.code === 'PGRST116') {
      console.warn(`Patient with id ${id} not found.`);
      return null;
    }
    // Log and throw other errors
    console.error(`Error fetching patient with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const createPatient = async (patientData) => {
  // Note: Ensure user_id is added here if required by RLS policies
  // Get current user ID to associate with the new patient
  let userId = null;
  try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found.');
      userId = user.id;
      console.log('User ID found for patient creation:', userId);
  } catch (error) {
      console.error('Error getting user for patient creation:', error);
      // Decide if this should be a fatal error or if patient can be created without user_id (if schema allows)
      // For now, let's throw to indicate failure. Adjust if needed.
      throw new Error(`Could not identify user to create patient: ${error.message}`);
  }

  // Add user_id to the patient data
  const dataToInsert = { ...patientData, user_id: userId };

  console.log('Attempting to insert patient data:', JSON.stringify(dataToInsert, null, 2)); // Log the data being inserted

  const { data, error } = await supabase
    .from('patients')
    .insert(dataToInsert) // Insert data including user_id
    .select() // Return the created record(s)
    .single(); // Assuming we insert one at a time

  if (error) {
    // Log the full error object for detailed debugging
    console.error('Error creating patient (Supabase):', JSON.stringify(error, null, 2));
    throw error;
  }
  return data; // Return the newly created patient record
};

export const updatePatient = async (id, patientData) => {
  // Remove id from patientData if it exists, as it's used in eq()
  const { id: _, ...updateData } = patientData;

  const { data, error } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', id)
    .select() // Return the updated record(s)
    .single(); // Assuming we update one at a time

  if (error) {
    console.error(`Error updating patient with id ${id}:`, error);
    throw error;
  }
  return data; // Return the updated patient record
};

export const deletePatient = async (id) => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting patient with id ${id}:`, error);
    throw error;
  }
  // Delete doesn't return the record, indicate success
  return { success: true, id: id };
};
