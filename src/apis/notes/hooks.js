import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

// Query keys might need patientId if notes are always fetched per patient
const queryKeys = {
  all: ['notes'],
  patientNotes: (patientId, params) => [...queryKeys.all, 'patient', patientId, params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get notes for a specific patient
export const useNotes = (patientId, params = {}, options = {}) => {
  return useQuery({
    // Include patientId in the query key
    queryKey: queryKeys.patientNotes(patientId, params),
    queryFn: () => apiService.notes.getPatientNotes(patientId, params), // Use apiService
    enabled: !!patientId, // Only run if patientId is provided
    keepPreviousData: true,
    ...options,
  });
};

// Get a specific note by ID
export const useNoteById = (noteId, patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(noteId),
    queryFn: () => apiService.notes.getNoteById(noteId, patientId), // Use apiService
    enabled: !!noteId,
    ...options,
  });
};

// Create a note for a patient
export const useAddNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Expects { patientId, noteData }
    mutationFn: ({ patientId, ...noteData }) => apiService.notes.createPatientNote(patientId, noteData), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the specific patient
      queryClient.invalidateQueries({ queryKey: queryKeys.patientNotes(variables.patientId) });
      toast.success('Note added successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
       toast.error(`Error adding note: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update a note
export const useUpdateNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Expects { noteId, noteData, patientId (optional but good for invalidation) }
    mutationFn: ({ noteId, patientId, ...noteData }) => apiService.notes.updatePatientNote(noteId, noteData, patientId), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the patient and the specific note detail
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.patientNotes(variables.patientId) });
      } else {
         queryClient.invalidateQueries({ queryKey: queryKeys.all }); // Invalidate all if no patientId
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.noteId) });
      toast.success('Note updated successfully');
      options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
        toast.error(`Error updating note: ${error.message || 'Unknown error'}`);
        options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};

// Delete a note
export const useDeleteNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
     // Expects { noteId, patientId (optional but good for invalidation) }
    mutationFn: ({ noteId, patientId }) => apiService.notes.deletePatientNote(noteId, patientId), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the patient
       if (variables.patientId) {
         queryClient.invalidateQueries({ queryKey: queryKeys.patientNotes(variables.patientId) });
       } else {
          queryClient.invalidateQueries({ queryKey: queryKeys.all }); // Invalidate all if no patientId
       }
      // Optionally remove detail query: queryClient.removeQueries({ queryKey: queryKeys.details(variables.noteId) });
      toast.success('Note deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
        toast.error(`Error deleting note: ${error.message || 'Unknown error'}`);
        options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};
