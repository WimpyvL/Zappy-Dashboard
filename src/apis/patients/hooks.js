import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
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
    queryKey: ['patients', currentPage, filters, pageSize], // Use 'patients' for query key consistency
    queryFn: async () => {
      let query = supabase
        .from('client_record') // Corrected table name
        .select('*', { count: 'exact' }) // Select all columns and request total count
        .order('created_at', { ascending: false }) // Use created_at
        .range(rangeFrom, rangeTo); // Apply pagination

      // Apply filters (example: filter by status)
      // Note: client_record doesn't have a 'status' column by default in the provided schema
      // if (filters.status) {
      //   query = query.eq('status', filters.status);
      // }
      // Add more filters as needed based on the 'filters' object structure
      if (filters.search) {
        // Example: Search across multiple fields (adjust fields as needed)
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching client_records (patients):', error);
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
    queryKey: ['patient', id], // Use 'patient' for query key consistency
    queryFn: async () => {
      if (!id) return null; // Don't fetch if no ID is provided

      const { data, error } = await supabase
        .from('client_record') // Corrected table name
        .select('*')
        .eq('id', id)
        .single(); // Use .single() if expecting one record or null

      if (error) {
        console.error(`Error fetching client_record (patient) ${id}:`, error);
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
      // Map frontend data to client_record schema columns
      const dataToInsert = {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.street_address, // Map from form field
        city: patientData.city_name,       // Map from form field
        state: patientData.state,
        zip: patientData.zip_code,         // Map from form field
        date_of_birth: patientData.date_of_birth,
        insurance_provider: patientData.insurance_provider, // Add if available
        insurance_id: patientData.insurance_id,       // Add if available
        // created_at and updated_at are handled by DB defaults
      };

      // Remove undefined fields to avoid inserting nulls unintentionally
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key] === undefined) {
          delete dataToInsert[key];
        }
      });

      console.log('[useCreatePatient] Inserting into client_record:', JSON.stringify(dataToInsert, null, 2));

      const { data, error } = await supabase
        .from('client_record') // Corrected table name
        .insert(dataToInsert)
        .select() // Select the newly created record
        .single(); // Expecting a single record back

      if (error) {
        console.error('Error creating client_record (patient):', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate the list

      // Log the audit event
      const patientId = data?.id || 'unknown';
      const patientName = data?.first_name
        ? `${data.first_name} ${data.last_name}` // Use correct field names
        : 'Unknown Name';
      auditLogService.log('Patient Created', {
        patientId: patientId,
        name: patientName,
      });

      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Create patient mutation error:', error);
      options.onError && options.onError(error, variables, context);
    },
  });
};

// Update patient hook using Supabase
export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientData }) => {
      if (!id) throw new Error('Patient ID is required for update.');

      // Map frontend data to client_record schema columns
      const dataToUpdate = {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.street_address, // Map from form field
        city: patientData.city_name,       // Map from form field
        state: patientData.state,
        zip: patientData.zip_code,         // Map from form field
        date_of_birth: patientData.date_of_birth,
        insurance_provider: patientData.insurance_provider, // Add if available
        insurance_id: patientData.insurance_id,       // Add if available
        // Note: 'status', 'related_tags', 'subscription_plan_id', 'assigned_doctor_id', 'preferred_pharmacy'
        // are not part of the client_record schema provided. These might belong in the 'profiles' table or another related table.
        updated_at: new Date().toISOString(), // Set updated_at timestamp
      };

      // Remove undefined fields so they don't overwrite existing data with null
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined) {
          delete dataToUpdate[key];
        }
      });

      console.log(`[useUpdatePatient] Updating client_record ${id}:`, JSON.stringify(dataToUpdate, null, 2));

      const { data, error } = await supabase
        .from('client_record') // Corrected table name
        .update(dataToUpdate)
        .eq('id', id)
        .select() // Select the updated record
        .single(); // Expecting a single record back

      if (error) {
        console.error(`Error updating client_record (patient) ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate the list
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] }); // Invalidate the specific patient

      // Log audit event (optional)
      const patientId = variables.id;
      const patientName = data?.first_name
        ? `${data.first_name} ${data.last_name}` // Use correct field names
        : 'Unknown Name';
      auditLogService.log('Patient Updated', {
        patientId: patientId,
        name: patientName,
        changes: variables.patientData, // Note: patientData contains form fields, not necessarily DB fields
      });

      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Update patient ${variables.id} mutation error:`, error);
      options.onError && options.onError(error, variables, context);
    },
  });
};

// Delete patient hook using Supabase
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Patient ID is required for deletion.');

      const { error } = await supabase
        .from('client_record') // Corrected table name
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting client_record (patient) ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id }; // Return success and id
    },
    onSuccess: (data, variables, context) => {
      // variables here is the id
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate the list
      queryClient.removeQueries({ queryKey: ['patient', variables] }); // Remove the specific patient query

      // Log audit event (optional)
      auditLogService.log('Patient Deleted', { patientId: variables });

      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Delete patient ${variables} mutation error:`, error);
      options.onError && options.onError(error, variables, context);
    },
  });
};
