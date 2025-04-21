import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

// --- Mock Data ---
const sampleNotesData = {
  p001: [
    {
      id: 'n001',
      patientId: 'p001',
      createdAt: '2025-04-01T10:00:00Z',
      updatedAt: '2025-04-01T10:00:00Z',
      author: 'Dr. Johnson',
      type: 'Consultation',
      content: 'Initial consultation notes for John Smith.',
    },
    {
      id: 'n003',
      patientId: 'p001',
      createdAt: '2025-04-03T11:00:00Z',
      updatedAt: '2025-04-03T11:00:00Z',
      author: 'Dr. Johnson',
      type: 'Follow-up',
      content: 'Follow-up regarding medication adjustment.',
    },
  ],
  p002: [
    {
      id: 'n002',
      patientId: 'p002',
      createdAt: '2025-04-02T09:30:00Z',
      updatedAt: '2025-04-02T09:30:00Z',
      author: 'Dr. Chen',
      type: 'Consultation',
      content: 'Initial consultation notes for Emily Davis.',
    },
  ],
  p003: [], // Robert Wilson has no notes yet
};
// --- End Mock Data ---

// Query keys might need patientId if notes are always fetched per patient
const queryKeys = {
  all: ['notes'],
  patientNotes: (patientId, params) => [
    ...queryKeys.all,
    'patient',
    patientId,
    params,
  ],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get notes for a specific patient
// Get notes for a specific patient (Mocked)
export const useNotes = (patientId, params = {}, options = {}) => {
  // console.log(`Using mock notes data for patient ID: ${patientId}`); // Removed log
  return useQuery({
    queryKey: queryKeys.patientNotes(patientId, params),
    // queryFn: () => apiService.notes.getPatientNotes(patientId, params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleNotesData[patientId] || [], // Return mock notes for the patient
        // Add meta if your API returns pagination info
      }),
    enabled: !!patientId,
    keepPreviousData: true,
    staleTime: Infinity,
    ...options,
  });
};

// Get a specific note by ID (Mocked)
export const useNoteById = (noteId, patientId, options = {}) => {
  // console.log(`Using mock note data for note ID: ${noteId}`); // Removed log
  return useQuery({
    queryKey: queryKeys.details(noteId),
    // queryFn: () => apiService.notes.getNoteById(noteId, patientId), // Original API call
    queryFn: () => {
      const patientNotes = sampleNotesData[patientId] || [];
      const note = patientNotes.find((n) => n.id === noteId);
      return Promise.resolve(note || null); // Find mock note
    },
    enabled: !!noteId,
    staleTime: Infinity,
    ...options,
  });
};

// Create a note for a patient
export const useAddNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ patientId, ...noteData }) => apiService.notes.createPatientNote(patientId, noteData), // Original API call
    mutationFn: async ({ patientId, ...noteData }) => {
      // console.log(`Mock Adding note for patient ${patientId}:`, noteData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newNote = {
        id: `n${Date.now()}`, // Generate mock ID
        patientId: patientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Current User', // Placeholder
        ...noteData,
      };
      // Note: Doesn't actually add to sampleNotesData
      return { data: newNote }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the specific patient
      queryClient.invalidateQueries({
        queryKey: queryKeys.patientNotes(variables.patientId),
      });
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
    // mutationFn: ({ noteId, patientId, ...noteData }) => apiService.notes.updatePatientNote(noteId, noteData, patientId), // Original API call
    mutationFn: async ({ noteId, patientId, ...noteData }) => {
      // console.log(`Mock Updating note ${noteId}:`, noteData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id: noteId, patientId, ...noteData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the patient and the specific note detail
      if (variables.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.patientNotes(variables.patientId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.all }); // Invalidate all if no patientId
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.noteId),
      });
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
    // mutationFn: ({ noteId, patientId }) => apiService.notes.deletePatientNote(noteId, patientId), // Original API call
    mutationFn: async ({ noteId, patientId }) => {
      // console.log(`Mock Deleting note ${noteId} for patient ${patientId}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the patient
      if (variables.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.patientNotes(variables.patientId),
        });
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
