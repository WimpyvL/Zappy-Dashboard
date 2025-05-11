import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import auditLogService from '../../utils/auditLogService';

// Get patients hook using Supabase
export const usePatients = (currentPage = 1, filters = {}, pageSize = 10) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['patients', currentPage, filters, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo);

      if (filters.search) {
        // Split search term into words to search for partial matches
        const searchTerms = filters.search.trim().split(/\s+/);
        
        if (searchTerms.length === 1) {
          // Single word search - search in first name, last name, or email
          query = query.or(
            `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
          );
        } else {
          // Multi-word search - try to match first name and last name combinations
          const firstTerm = searchTerms[0];
          const remainingTerms = searchTerms.slice(1).join(' ');
          
          // Try different combinations of the search terms
          query = query.or(
            `first_name.ilike.%${firstTerm}%,last_name.ilike.%${remainingTerms}%`,
            `first_name.ilike.%${remainingTerms}%,last_name.ilike.%${firstTerm}%`,
            `first_name.ilike.%${filters.search}%`,
            `last_name.ilike.%${filters.search}%`,
            `email.ilike.%${filters.search}%`
          );
        }
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching patients:', error);
        throw new Error(error.message);
      }

      return {
        data: data || [],
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    }
  });
};

// Get patient by ID hook using Supabase
export const usePatientById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching patient ${id}:`, error);
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create patient hook using Supabase
export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData) => {
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
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      auditLogService.log('Patient Created', {
        patientId: data?.id,
        name: `${data?.first_name} ${data?.last_name}`
      });
    },
    onError: (error) => {
      console.error('Create patient error:', error);
      auditLogService.log('Patient Creation Failed', { 
        error: error.message
      });
    },
  });
};

// Update patient hook using Supabase
export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientData }) => {
      if (!id) throw new Error('Patient ID is required');

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
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('patients')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating patient ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      auditLogService.log('Patient Updated', {
        patientId: variables.id,
        name: `${data?.first_name} ${data?.last_name}`
      });
    },
    onError: (error, variables) => {
      console.error(`Update patient ${variables.id} error:`, error);
      auditLogService.log('Patient Update Failed', {
        patientId: variables.id,
        error: error.message
      });
    },
  });
};

// Delete patient hook using Supabase
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Patient ID is required');

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting patient ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.removeQueries({ queryKey: ['patient', variables] });
      auditLogService.log('Patient Deleted', { patientId: variables });
    },
    onError: (error, variables) => {
      console.error(`Delete patient ${variables} error:`, error);
      auditLogService.log('Patient Deletion Failed', {
        patientId: variables,
        error: error.message
      });
    },
  });
};
