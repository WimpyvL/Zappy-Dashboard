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
        .order('date_created', { ascending: false }) // Use date_created instead of created_at
        .range(rangeFrom, rangeTo); // Apply pagination

      // Apply filters (example: filter by status)
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      // Add more filters as needed based on the 'filters' object structure
      if (filters.search) {
        // Example: Search across multiple fields (adjust fields as needed)
        // This requires careful consideration of indexing in Postgres
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
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
      // Separate profile data from top-level fields using the names revealed in the log
      const {
        street_address, // Use the name from the log
        city_name,      // Use the name from the log
        state,
        zip_code,       // Use the name from the log
        date_of_birth,  // Use the name from the log
        preferredPharmacy,
        assignedDoctor,
        medicalNotes,
        // Include any other fields intended for the profile JSONB
        ...topLevelData // Rest of the data (id, name, email, phone, status etc.)
      } = patientData;

      // Construct the profile object using expected DB keys, only including fields that have values
      const profileData = {};
      if (street_address) profileData.address = street_address; // Map street_address to profile.address
      if (city_name) profileData.city = city_name;             // Map city_name to profile.city
      if (state) profileData.state = state;
      if (zip_code) profileData.zip = zip_code;                // Map zip_code to profile.zip
      if (date_of_birth) profileData.dob = date_of_birth;      // Map date_of_birth to profile.dob
      if (preferredPharmacy) profileData.preferred_pharmacy = preferredPharmacy;
      if (assignedDoctor) profileData.assigned_doctor = assignedDoctor;
      if (medicalNotes) profileData.medical_notes = medicalNotes;
      // Add other profile fields as needed

      // Construct the final object for insertion, explicitly picking valid top-level fields
      const dataToInsert = {
        // Valid top-level fields from client_record schema
        id: topLevelData.id, // Assuming ID might be provided client-side sometimes
        first_name: topLevelData.first_name,
        last_name: topLevelData.last_name,
        email: topLevelData.email,
        mobile_phone: topLevelData.phone, // Map form 'phone' to 'mobile_phone'
        status: topLevelData.status,
        related_tags: topLevelData.related_tags || [], // Add related_tags
        // subscription_plan_id: topLevelData.subscription_plan_id || null, // REMOVED - Column does not exist
        // assigned_doctor_id: topLevelData.assigned_doctor_id || null, // REMOVED - Column does not exist
        // Add other known valid top-level fields from patientData if necessary
        // e.g., user_id: topLevelData.user_id,

        profile: profileData, // Add the structured profile data
        date_created: topLevelData.date_created || new Date().toISOString(),
        // Set defaults for boolean fields if necessary
        is_child_record: topLevelData.is_child_record ?? false,
        is_active: topLevelData.is_active ?? true,
        invitation_sent: topLevelData.invitation_sent ?? false,
      };

      // Remove the original (incorrect) top-level fields that are now in profile
      // No need to delete fields if we explicitly constructed dataToInsert

      console.log('[useCreatePatient] Inserting patient data:', dataToInsert); // Log the final object

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
      const patientName = data?.firstName
        ? `${data.firstName} ${data.lastName}`
        : 'Unknown Name';
      auditLogService.log('Patient Created', {
        patientId: patientId,
        name: patientName,
      });

      options.onSuccess && options.onSuccess(data, variables, context); // Call original onSuccess
    }, // Added comma here
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

      // Separate profile data from top-level fields for update using the names revealed in the log
      const {
        street_address,
        city_name,
        state,
        zip_code,
        date_of_birth,
        preferredPharmacy,
        assignedDoctor,
        medicalNotes,
        // Include any other fields intended for the profile JSONB
        ...topLevelUpdates // Rest of the data (name, email, phone, status etc.)
      } = patientData;

      // Construct the profile object for update using expected DB keys, only including fields provided
      const profileUpdates = {};
      if (street_address !== undefined) profileUpdates.address = street_address;
      if (city_name !== undefined) profileUpdates.city = city_name;
      if (state !== undefined) profileUpdates.state = state;
      if (zip_code !== undefined) profileUpdates.zip = zip_code;
      if (date_of_birth !== undefined) profileUpdates.dob = date_of_birth;
      if (preferredPharmacy !== undefined) profileUpdates.preferred_pharmacy = preferredPharmacy;
      if (assignedDoctor !== undefined) profileUpdates.assigned_doctor = assignedDoctor;
      if (medicalNotes !== undefined) profileUpdates.medical_notes = medicalNotes;
      // Add other profile fields as needed

      // Construct the final object for update, explicitly picking valid top-level fields
      const dataToUpdate = {
        // Valid top-level fields that can be updated
        first_name: topLevelUpdates.first_name,
        last_name: topLevelUpdates.last_name,
        email: topLevelUpdates.email,
        mobile_phone: topLevelUpdates.phone, // Map form 'phone' to 'mobile_phone'
        status: topLevelUpdates.status,
        related_tags: topLevelUpdates.related_tags, // Add related_tags
        // subscription_plan_id: topLevelUpdates.subscription_plan_id, // REMOVED - Column does not exist
        // assigned_doctor_id: topLevelUpdates.assigned_doctor_id, // REMOVED - Column does not exist
        // Add other known valid top-level fields being updated if necessary

        // Only include profile if there are updates for it
        ...(Object.keys(profileUpdates).length > 0 && { profile: profileUpdates }),
        record_modified: new Date().toISOString(), // Add timestamp for modification
      };

      // Remove the original (incorrect) top-level fields that are now in profile
      delete dataToUpdate.id; // Don't update the ID
      delete dataToUpdate.date_created; // Don't update creation date
      // No need to delete fields if we explicitly constructed dataToUpdate

      console.log(`[useUpdatePatient] Updating patient ${id} with data:`, dataToUpdate); // Log the final object

      const { data, error } = await supabase
        .from('client_record')
        .update(dataToUpdate)
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
      const patientName = data?.firstName
        ? `${data.firstName} ${data.lastName}`
        : 'Unknown Name';
      auditLogService.log('Patient Updated', {
        patientId: patientId,
        name: patientName,
        changes: variables.patientData,
      });

      options.onSuccess && options.onSuccess(data, variables, context); // Call original onSuccess
    }, // Added comma here
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
        .from('client_record')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting patient ${id}:`, error);
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

      options.onSuccess && options.onSuccess(data, variables, context); // Call original onSuccess
    },
    onError: (error, variables, context) => {
      console.error(`Delete patient ${variables} mutation error:`, error);
      options.onError && options.onError(error, variables, context);
    },
  });
};
