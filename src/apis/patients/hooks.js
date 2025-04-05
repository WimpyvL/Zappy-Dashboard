import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
// Removed unused imports like apiService and commented out local api functions
// import {
//   getPatients,
//   getPatientById,
//   createPatient,
//   updatePatient,
//   deletePatient
import auditLogService from '../../utils/auditLogService';

// Removed Mock Data

// Get patients hook using Supabase
export const usePatients = (currentPage = 1, filters = {}, pageSize = 10) => {
  // Calculate range for Supabase pagination
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['patients', currentPage, filters, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('client_record') // Assuming table name is 'client_record'
        .select('*', { count: 'exact' }) // Select all columns and request total count
        .order('created_at', { ascending: false }) // Example order
        .range(rangeFrom, rangeTo); // Apply pagination

      // Apply filters (example: filter by status)
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      // Add more filters as needed based on the 'filters' object structure
      if (filters.search) {
         // Example: Search across multiple fields (adjust fields as needed)
         // This requires careful consideration of indexing in Postgres
         query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }


      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching patients:', error);
        throw new Error(error.message);
      }

      // Return data in a structure compatible with pagination components
      return {
        data: data || [],
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    // staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
  });
};

// Get patient by ID hook using Supabase
export const usePatientById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) return null; // Don't fetch if no ID is provided

      const { data, error } = await supabase
        .from('client_record')
        .select('*')
        .eq('id', id)
        .single(); // Use .single() if expecting one record or null

      if (error) {
        console.error(`Error fetching patient ${id}:`, error);
        // Handle specific errors like 'PGRST116' (resource not found) if needed
        if (error.code === 'PGRST116') return null; // Return null if not found
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id, // Only run query if id is truthy
    // staleTime: 5 * 60 * 1000, // Example stale time
    ...options,
  });
};

// Create patient hook using Supabase
export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData) => {
      // Ensure required fields like date_created are set if not provided
      const dataToInsert = {
        ...patientData,
        date_created: patientData.date_created || new Date().toISOString(),
        // Set defaults for boolean fields if necessary
        is_child_record: patientData.is_child_record ?? false,
        is_active: patientData.is_active ?? true,
        invitation_sent: patientData.invitation_sent ?? false,
      };

      const { data, error } = await supabase
        .from('client_record')
        .insert(dataToInsert)
        .select() // Select the newly created record
        .single(); // Expecting a single record back

      if (error) {
        console.error('Error creating patient:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate the list

      // Log the audit event
      const patientId = data?.id || 'unknown';
      const patientName = data?.firstName ? `${data.firstName} ${data.lastName}` : 'Unknown Name';
       auditLogService.log('Patient Created', { patientId: patientId, name: patientName });

       options.onSuccess && options.onSuccess(data, variables, context); // Call original onSuccess
    }, // Added comma here
     onError: (error, variables, context) => {
        console.error("Create patient mutation error:", error);
        options.onError && options.onError(error, variables, context);
    }
  });
};

// Update patient hook using Supabase
export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientData }) => {
      if (!id) throw new Error("Patient ID is required for update.");

      const { data, error } = await supabase
        .from('client_record')
        .update(patientData)
        .eq('id', id)
        .select() // Select the updated record
        .single(); // Expecting a single record back

      if (error) {
        console.error(`Error updating patient ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate the list
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] }); // Invalidate the specific patient

      // Log audit event (optional)
      const patientId = variables.id;
      const patientName = data?.firstName ? `${data.firstName} ${data.lastName}` : 'Unknown Name';
       auditLogService.log('Patient Updated', { patientId: patientId, name: patientName, changes: variables.patientData });


       options.onSuccess && options.onSuccess(data, variables, context); // Call original onSuccess
    }, // Added comma here
     onError: (error, variables, context) => {
        console.error(`Update patient ${variables.id} mutation error:`, error);
        options.onError && options.onError(error, variables, context);
    }
  });
};

// Delete patient hook using Supabase
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
       if (!id) throw new Error("Patient ID is required for deletion.");

      const { error } = await supabase
        .from('client_record')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting patient ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id }; // Return success and id
    },
    onSuccess: (data, variables, context) => { // variables here is the id
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate the list
      queryClient.removeQueries({ queryKey: ['patient', variables] }); // Remove the specific patient query

      // Log audit event (optional)
      auditLogService.log('Patient Deleted', { patientId: variables });

      options.onSuccess && options.onSuccess(data, variables, context); // Call original onSuccess
    },
     onError: (error, variables, context) => {
       console.error(`Delete patient ${variables} mutation error:`, error);
       options.onError && options.onError(error, variables, context);
    }
  });
};
