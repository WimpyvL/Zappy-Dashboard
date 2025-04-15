// src/apis/notes/hooks.js - React Query hooks for notes
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from './api';
import { toast } from 'react-toastify';

// Hook to fetch notes with pagination and filtering
export const useNotes = (currentPage = 1, filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['notes', currentPage, filters],
    queryFn: () => getNotes(currentPage, filters),
    keepPreviousData: true,
    ...options,
  });
};

// Hook to fetch a specific note by ID
export const useNoteById = (id, options = {}) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id),
    enabled: !!id, // Only run if id is provided
    ...options,
  });
};

// Hook to create a new note
export const useCreateNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteData) => createNote(noteData),
    onSuccess: (data, variables) => {
      // Invalidate notes list, potentially filtered by patientId or sessionId
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (variables?.patient_id) {
          queryClient.invalidateQueries({ queryKey: ['notes', 1, { patientId: variables.patient_id }] });
      }
       if (variables?.session_id) {
          queryClient.invalidateQueries({ queryKey: ['notes', 1, { sessionId: variables.session_id }] });
      }
      toast.success('Note created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error creating note: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};

// Hook to update an existing note
export const useUpdateNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noteData }) => updateNote(id, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
       // Optionally invalidate notes for a specific patient/session if IDs are available
      if (variables?.noteData?.patient_id) {
          queryClient.invalidateQueries({ queryKey: ['notes', 1, { patientId: variables.noteData.patient_id }] });
      }
       if (variables?.noteData?.session_id) {
          queryClient.invalidateQueries({ queryKey: ['notes', 1, { sessionId: variables.noteData.session_id }] });
      }
      toast.success('Note updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error updating note: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};

// Hook to delete a note
export const useDeleteNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteNote(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.removeQueries({ queryKey: ['note', variables] });
      // Optionally invalidate notes for a specific patient/session if IDs were known
      toast.success('Note deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error deleting note: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};
