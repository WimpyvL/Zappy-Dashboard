import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['forms'], // Key for questionnaire templates
  lists: (params = {}) => [...queryKeys.all, 'list', { params }], // Key for list of templates
  details: (id) => [...queryKeys.all, 'detail', id], // Key for template detail
  patientForms: (patientId, params = {}) => [...queryKeys.all, 'patient', patientId, { params }], // Key for patient's form requests/submissions
};

// Hook to fetch all forms (questionnaires) using Supabase
export const useForms = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase
        .from('questionnaire') // Target the questionnaire table
        .select('*')
        .order('name', { ascending: true });

      // Add filters if needed
      // if (params.status !== undefined) { query = query.eq('status', params.status); }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching forms (questionnaires):', error);
        throw new Error(error.message);
      }
      // Map data if frontend expects a different structure (e.g., 'title' instead of 'name')
      const mappedData = data?.map(q => ({ ...q, title: q.name })) || [];
      return { data: mappedData }; // Return data wrapped in object if needed
    },
  });
};

// TODO: This hook relies on a 'form_requests' table which is not defined in the current schema (final_optimized_schema.sql).
// Commenting out until the table and its relation to 'patients' (FK likely 'patient_id') are defined.
/*
export const useGetPatientForms = (patientId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patientForms(patientId, params),
    queryFn: async () => {
      if (!patientId) return []; // Return empty if no patientId

      let query = supabase
        .from('form_requests') // ASSUMING table name is 'form_requests'
        .select(`
          *, 
          questionnaire ( id, name ) 
        `) // Join with questionnaire to get form name
        .eq('patients_id', patientId) // Filter by patient
        .order('created_at', { ascending: false }); // Order by creation date

      // Add other filters from params if needed
      if (params.status) { 
        query = query.eq('status', params.status); 
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching forms for patient ${patientId}:`, error);
        throw new Error(error.message);
      }

      // Map data to include questionnaire name directly
      const mappedData = data?.map(req => ({
          ...req,
          name: req.questionnaire?.name || 'Unknown Form', // Use questionnaire name
      })) || [];

      return mappedData; // Return array of form requests/submissions
    },
    enabled: !!patientId, // Only run query if patientId is truthy
    keepPreviousData: true,
    ...options,
  });
};
*/


// Hook to fetch a specific form (questionnaire) by ID using Supabase
// This might need to fetch related questions as well depending on requirements
export const useFormById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      // Fetch questionnaire details
      const { data: formData, error: formError } = await supabase
        .from('questionnaire')
        .select('*') // Select all columns, assuming 'structure' JSONB exists
        .eq('id', id)
        .single();

      if (formError) {
        console.error(`Error fetching form ${id}:`, formError);
        if (formError.code === 'PGRST116') return null; // Not found
        throw new Error(formError.message);
      }

      // Optionally fetch related questions (if needed immediately)
      // const { data: questionsData, error: questionsError } = await supabase
      //   .from('questionnaire_question')
      //   .select('*')
      //   .eq('questionnaire_id', id);
      // if (questionsError) { /* Handle error */ }

      // Combine data (adjust structure as needed by frontend)
      // Assuming structure is stored in a JSONB column named 'structure'
      // If structure is derived from questions, mapping logic is needed here.
      const mappedData = formData ? {
          ...formData,
          title: formData.name,
          // structure: formData.structure || { pages: [], conditionals: [] } // Parse if stored as JSON string
          // questions: questionsData || [] // Add questions if fetched
      } : null;


      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new form (questionnaire) using Supabase
export const useCreateForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      // Prepare data for questionnaire table
      const questionnaireData = {
        name: formData.title, // Map title to name
        // structure: JSON.stringify(formData.structure || { pages: [], conditionals: [] }), // Stringify structure if storing as JSON string
        structure: formData.structure || { pages: [], conditionals: [] }, // Assuming JSONB column
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add other fields like description, status, form_type if they exist in your table
        description: formData.description,
        is_active: formData.status ?? true, // Updated from status to is_active to match database schema
        form_type: formData.form_type,
        slug: formData.slug || formData.title?.toLowerCase().replace(/\s+/g, '-'),
      };

      // Insert into questionnaire table
      const { data: newQuestionnaire, error: insertError } = await supabase
        .from('questionnaire')
        .insert(questionnaireData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating form (questionnaire):', insertError);
        throw new Error(insertError.message);
      }

      // TODO: Optionally handle creation of related questionnaire_question rows
      // if formData.structure contains elements/questions that need separate rows.
      // This would likely involve iterating through formData.structure.pages/elements
      // and inserting into questionnaire_question table with newQuestionnaire.id

      return newQuestionnaire;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Form created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to trigger sending a reminder for a specific form request
export const useSendFormReminder = (options = {}) => {
  // No query invalidation needed typically, as this is just an action
  return useMutation({
    mutationFn: async ({ patientId, formId }) => { // Assuming formId refers to the form request/assignment ID
      if (!patientId || !formId) {
        throw new Error("Patient ID and Form ID are required to send a reminder.");
      }
      // Invoke the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-form-reminder', {
        body: { patientId, formId }, 
      });

      if (error) {
        console.error('Error invoking send-form-reminder function:', error);
        throw new Error(error.message || 'Failed to send reminder via Edge Function.');
      }
      return data; // Return any response from the function
    },
    onSuccess: (data, variables, context) => {
      toast.success('Form reminder sent successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error sending reminder: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to trigger resending a specific form request
export const useResendForm = (options = {}) => {
  // No query invalidation needed typically
  return useMutation({
    mutationFn: async ({ patientId, formId }) => { // Assuming formId refers to the form request/assignment ID
       if (!patientId || !formId) {
         throw new Error("Patient ID and Form ID are required to resend the form.");
       }
       // Invoke the Supabase Edge Function
       const { data, error } = await supabase.functions.invoke('resend-form', {
         body: { patientId, formId },
       });

       if (error) {
         console.error('Error invoking resend-form function:', error);
         throw new Error(error.message || 'Failed to resend form via Edge Function.');
       }
       return data; // Return any response from the function
    },
     onSuccess: (data, variables, context) => {
       toast.success('Form resent successfully.');
       options.onSuccess?.(data, variables, context);
     },
     onError: (error, variables, context) => {
       toast.error(`Error resending form: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};

// Hook to update an existing form (questionnaire) using Supabase
export const useUpdateForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      if (!id) throw new Error("Form ID is required for update.");

      const dataToUpdate = {
        name: formData.title,
        structure: formData.structure, // Assuming JSONB
        updated_at: new Date().toISOString(),
        description: formData.description,
        status: formData.status,
        form_type: formData.form_type,
        slug: formData.slug,
        // Add other updatable fields
      };
       // Remove fields that shouldn't be updated directly if necessary
       delete dataToUpdate.id;
       delete dataToUpdate.created_at;

      const { data, error } = await supabase
        .from('questionnaire')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating form ${id}:`, error);
        throw new Error(error.message);
      }

      // TODO: Optionally handle updates to related questionnaire_question rows
      // This might involve deleting existing questions and re-inserting based on formData.structure

      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Form updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to delete a form (questionnaire) using Supabase
export const useDeleteForm = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Form ID is required for deletion.");

      // TODO: Optionally delete related questionnaire_questions first
      // const { error: questionError } = await supabase.from('questionnaire_question').delete().eq('questionnaire_id', id);
      // if (questionError) { /* Handle error */ }

      const { error } = await supabase
        .from('questionnaire')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting form ${id}:`, error);
         if (error.code === '23503') { // Foreign key violation
           throw new Error(`Cannot delete form: It is still linked to other records (e.g., form requests).`);
         }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Form deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting form: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
