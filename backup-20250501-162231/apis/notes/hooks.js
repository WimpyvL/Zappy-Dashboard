import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Define query keys for notes
const queryKeys = {
  all: ['notes'],
  patientNotes: (patientId, params = {}) => [...queryKeys.all, 'patient', patientId, { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get notes for a specific patient using Supabase

// Get notes for a specific patient using Supabase
export const useNotes = (patientId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patientNotes(patientId, params),
    queryFn: async () => {
      if (!patientId) return []; // Return empty if no patientId

      // Modified query to avoid the relationship error
      let query = supabase
        .from('notes') 
        .select('*') // Only select note fields without the join
        .eq('patient_id', patientId) // Corrected FK name
        .order('created_at', { ascending: false }); 
      
      // Apply sessionId filter if provided to look in the JSON data field
      if (params.sessionId) {
        query = query.filter('note_type', 'eq', 'follow-up');
        // Use ilike for searching in JSON data
        // query = query.ilike('data', `%${params.sessionId}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching notes for patient ${patientId}:`, error);
        throw new Error(error.message);
      }

      // Map data to include author name (simplified approach)
      const mappedData = data?.map(note => ({
          ...note,
          authorName: note.createdBy || 'System', // Use createdBy field directly
      })) || [];

      return mappedData; 
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

      // Modified query to avoid the relationship error
      const { data, error } = await supabase
        .from('notes')
        .select('*') // Only select note fields without the join
        .eq('id', noteId)
        .single();

      if (error) {
        console.error(`Error fetching note ${noteId}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }

      // Map data to include author name (simplified approach)
      const mappedData = data ? {
          ...data,
          authorName: data.createdBy || 'System', // Use createdBy field directly
      } : null;

      return mappedData; // Return mapped data
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
        patient_id: patientId, // Corrected FK name
        user_id: noteData.user_id, // Ensure user_id is passed in noteData
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('notes') 
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
       delete dataToUpdate.patient_id; // Don't allow changing patient link
       delete dataToUpdate.user_id; // Don't allow changing author

      const { data, error } = await supabase
        .from('notes') 
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
        .from('notes') 
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
