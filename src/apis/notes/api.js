// Assuming apiClient is in src/utils/apiClient.js
import { request } from '../../utils/apiClient';

// Base URL might be nested under patients, e.g., /api/v1/admin/patients/{patientId}/notes
// Adjust BASE_URL logic as needed based on your API structure.

// Example: Get notes for a specific patient
export const getPatientNotes = async (patientId, params) => {
  if (!patientId) throw new Error('Patient ID is required to fetch notes.');
  const data = await request({
    url: `/api/v1/admin/patients/${patientId}/notes`, // Example endpoint
    method: 'GET',
    params: params, // e.g., { category: 'follow-up' }
  });
  return data;
};

// Example: Get a specific note by its ID (might need patientId too)
export const getNoteById = async (noteId, patientId) => {
  if (!noteId) throw new Error('Note ID is required.');
  // Adjust URL if patientId is needed
  const url = patientId
    ? `/api/v1/admin/patients/${patientId}/notes/${noteId}`
    : `/api/v1/admin/notes/${noteId}`; // Fallback if notes have a global endpoint
  const data = await request({
    url: url,
    method: 'GET',
  });
  return data;
};

// Example: Create a note for a specific patient
export const createPatientNote = async (patientId, noteData) => {
   if (!patientId) throw new Error('Patient ID is required to create a note.');
   const data = await request({
     url: `/api/v1/admin/patients/${patientId}/notes`, // Example endpoint
     method: 'POST',
     data: noteData, // Should include title, content, category, createdBy, data, etc.
   });
   return data;
};

// Example: Update a specific note
export const updatePatientNote = async (noteId, noteData, patientId) => {
  if (!noteId) throw new Error('Note ID is required for update.');
   // Adjust URL if patientId is needed
   const url = patientId
     ? `/api/v1/admin/patients/${patientId}/notes/${noteId}`
     : `/api/v1/admin/notes/${noteId}`;
   const data = await request({
     url: url,
     method: 'PUT', // Or PATCH
     data: noteData,
   });
   return data;
};

// Example: Delete a specific note
export const deletePatientNote = async (noteId, patientId) => {
   if (!noteId) throw new Error('Note ID is required for deletion.');
    // Adjust URL if patientId is needed
    const url = patientId
      ? `/api/v1/admin/patients/${patientId}/notes/${noteId}`
      : `/api/v1/admin/notes/${noteId}`;
   const data = await request({
     url: url,
     method: 'DELETE',
   });
   return data;
};
