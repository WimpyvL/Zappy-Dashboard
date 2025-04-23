import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import auditLogService from '../../utils/auditLogService';

// Mock Data
const mockPatients = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-0101',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '90210',
    date_of_birth: '1985-05-15',
    insurance_provider: 'Blue Cross',
    insurance_id: 'BC123456',
    created_at: '2025-01-10T08:30:00Z',
    updated_at: '2025-01-10T08:30:00Z'
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '555-0102',
    address: '456 Oak Ave',
    city: 'Somewhere',
    state: 'NY',
    zip: '10001',
    date_of_birth: '1990-11-22',
    insurance_provider: 'Aetna',
    insurance_id: 'AE789012',
    created_at: '2025-01-15T09:45:00Z',
    updated_at: '2025-01-15T09:45:00Z'
  },
  {
    id: '3',
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'robert.j@example.com',
    phone: '555-0103',
    address: '789 Pine Rd',
    city: 'Nowhere',
    state: 'TX',
    zip: '75001',
    date_of_birth: '1978-03-30',
    insurance_provider: 'Medicare',
    insurance_id: 'MC456789',
    created_at: '2025-02-01T10:15:00Z',
    updated_at: '2025-02-01T10:15:00Z'
  }
];

// Removed Mock Data

// Get patients hook using Supabase
export const usePatients = (currentPage = 1, filters = {}, pageSize = 10) => {
  // Calculate range for Supabase pagination
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['patients', currentPage, filters, pageSize],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        // Return mock data in development
        const filteredPatients = mockPatients.filter(patient => {
          if (!filters.search) return true;
          const searchLower = filters.search.toLowerCase();
          return (
            patient.first_name.toLowerCase().includes(searchLower) ||
            patient.last_name.toLowerCase().includes(searchLower) ||
            patient.email.toLowerCase().includes(searchLower)
          );
        });
        
        const paginatedPatients = filteredPatients.slice(rangeFrom, rangeTo + 1);
        
        return {
          data: paginatedPatients,
          meta: {
            total: filteredPatients.length,
            per_page: pageSize,
            current_page: currentPage,
            last_page: Math.ceil(filteredPatients.length / pageSize),
          },
        };
      }

      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo);

      // Apply filters (example: filter by status)
      // Note: patients doesn't have a 'status' column by default in the provided schema
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
        console.error('Error fetching patientss (patients):', error);
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
      if (!id) return null;

      if (process.env.NODE_ENV === 'development') {
        // Return mock patient in development
        return mockPatients.find(patient => patient.id === id) || null;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching patients (patient) ${id}:`, error);
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
      // Debug: Directly query information_schema to verify table structure
      const { data: columns, error: descError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'patients')
        .eq('table_schema', 'public');
      
      if (descError) {
        console.error('Error describing patients table:', descError);
      } else {
        console.log('Actual patients table columns:', columns);
      }

      // Map frontend data to patients schema columns
      const dataToInsert = {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.address,
        city: patientData.city,
        state: patientData.state,
        zip: patientData.zip,
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

      console.log('[useCreatePatient] Inserting into patients:', JSON.stringify(dataToInsert, null, 2));

      const { data, error } = await supabase
        .from('patients') // Corrected table name
        .insert(dataToInsert)
        .select() // Select the newly created record
        .single(); // Expecting a single record back

      if (error) {
        console.error('Error creating patients (patient):', error);
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
      auditLogService.log('Patient Creation Failed', { 
        error: error.message,
        patientData: variables 
      });
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

      // Map frontend data to patients schema columns
      const dataToUpdate = {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.address,
        city: patientData.city,
        state: patientData.state,
        zip: patientData.zip,
        date_of_birth: patientData.date_of_birth,
        insurance_provider: patientData.insurance_provider, // Add if available
        insurance_id: patientData.insurance_id,       // Add if available
        // Note: 'status', 'related_tags', 'subscription_plan_id', 'assigned_doctor_id', 'preferred_pharmacy'
        // are not part of the patients schema provided. These might belong in the 'profiles' table or another related table.
        updated_at: new Date().toISOString(), // Set updated_at timestamp
      };

      // Remove undefined fields so they don't overwrite existing data with null
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined) {
          delete dataToUpdate[key];
        }
      });

      console.log(`[useUpdatePatient] Updating patients ${id}:`, JSON.stringify(dataToUpdate, null, 2));

      const { data, error } = await supabase
        .from('patients') // Corrected table name
        .update(dataToUpdate)
        .eq('id', id)
        .select() // Select the updated record
        .single(); // Expecting a single record back

      if (error) {
        console.error(`Error updating patients (patient) ${id}:`, error);
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
      auditLogService.log('Patient Update Failed', {
        patientId: variables.id,
        error: error.message,
        patientData: variables.patientData
      });
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
        .from('patients') // Corrected table name
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting patients (patient) ${id}:`, error);
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
      auditLogService.log('Patient Deletion Failed', {
        patientId: variables,
        error: error.message
      });
      options.onError && options.onError(error, variables, context);
    },
  });
};
