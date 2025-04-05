import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys for notes
const queryKeys = {
  all: ['notes'],
  patientNotes: (patientId, params = {}) => [...queryKeys.all, 'patient', patientId, { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get notes for a specific patient using Supabase
export const useNotes = (patientId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patientNotes(patientId, params),
    queryFn: async () => {
      if (!patientId) return []; // Return empty if no patientId

      let query = supabase
        .from('notes') // ASSUMING table name is 'notes'
        .select(`
          *,
          user ( id, first_name, last_name )
        `) // Example join to get author name
        .eq('client_record_id', patientId) // Filter by patient
        .order('created_at', { ascending: false }); // Order by creation date

      // Add other filters from params if needed
      // if (params.type) { query = query.eq('type', params.type); }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching notes for patient ${patientId}:`, error);
        throw new Error(error.message);
      }

      // Map data if needed (e.g., format author name)
      const mappedData = data?.map(note => ({
          ...note,
          authorName: note.user ? `${note.user.first_name || ''} ${note.user.last_name || ''}`.trim() : 'System',
      })) || [];

      return mappedData; // Return array of notes
    },
    enabled: !!patientId, // Only run query if patientId is truthy
    keepPreviousData: true,
    ...options,
  });
};

// Get a specific note by ID using Supabase
export const useNoteById = (noteId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(noteId),
    queryFn: async () => {
      if (!noteId) return null;

      const { data, error } = await supabase
        .from('notes') // ASSUMING table name is 'notes'
        .select(`
          *,
          user ( id, first_name, last_name )
        `) // Example join
        .eq('id', noteId)
        .single();

      if (error) {
        console.error(`Error fetching note ${noteId}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data ? {
           ...data,
           authorName: data.user ? `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() : 'System',
       } : null;

      return mappedData;
    },
    enabled: !!noteId,
    ...options,
  });
};

// Create a note for a patient using Supabase
// Renamed from useAddNote to useCreateNote for consistency
export const useCreateNote = (options = {}) => {
  const queryClient = useQueryClient();
  // Get current user ID for author field (assuming AuthContext provides it)
  // This might need adjustment based on how user ID is stored/accessed
  // const { currentUser } = useAuth(); // Example: If using useAuth hook

  return useMutation({
    mutationFn: async ({ patientId, ...noteData }) => {
      if (!patientId) throw new Error("Patient ID is required to create a note.");

      const dataToInsert = {
        ...noteData,
        client_record_id: patientId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // user_id: currentUser?.id, // Set author ID if available
      };

      const { data, error } = await supabase
        .from('notes') // ASSUMING table name is 'notes'
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
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

// Update a note using Supabase
export const useUpdateNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, patientId, ...noteData }) => {
      if (!noteId) throw new Error("Note ID is required for update.");

      const dataToUpdate = {
        ...noteData,
        updated_at: new Date().toISOString(),
      };
       // Remove fields that shouldn't be updated directly if necessary
       delete dataToUpdate.id;
       delete dataToUpdate.created_at;
       delete dataToUpdate.client_record_id; // Don't allow changing patient link
       delete dataToUpdate.user_id; // Don't allow changing author

      const { data, error } = await supabase
        .from('notes') // ASSUMING table name is 'notes'
        .update(dataToUpdate)
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating note ${noteId}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the patient and the specific note detail
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.patientNotes(variables.patientId) });
      } else {
         // If patientId wasn't passed, invalidate all notes lists (less efficient)
         queryClient.invalidateQueries({ queryKey: queryKeys.all });
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

// Delete a note using Supabase
export const useDeleteNote = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, patientId }) => { // Accept patientId for invalidation
      if (!noteId) throw new Error("Note ID is required for deletion.");

      const { error } = await supabase
        .from('notes') // ASSUMING table name is 'notes'
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error(`Error deleting note ${noteId}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id: noteId, patientId: patientId }; // Pass patientId back
    },
    onSuccess: (data, variables, context) => {
      // Invalidate notes for the patient
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.patientNotes(variables.patientId) });
      } else {
         queryClient.invalidateQueries({ queryKey: queryKeys.all });
      }
      queryClient.removeQueries({ queryKey: queryKeys.details(variables.noteId) });
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
