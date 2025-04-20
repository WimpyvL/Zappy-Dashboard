import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import patientsApi from './api';
import { logError } from '../../utils/errorHandling';
import auditLogService from '../../utils/auditLogService';
import { supabaseHelper } from '../../lib/supabase';

// Removed Mock Data

// Get patients hook using standardized API
export const usePatients = (currentPage = 1, filters = {}, pageSize = 10) => {
  const queryClient = useQueryClient();
  usePatientsSubscription(queryClient); // Integrate the real-time subscription

  return useQuery({
    queryKey: ['patients', currentPage, filters, pageSize],
    queryFn: async () => {
      const result = await patientsApi.getAll({
        page: currentPage,
        pageSize,
        filters: filters.search ? [
          {
            column: 'first_name',
            operator: 'ilike',
            value: `%${filters.search}%`
          },
          {
            column: 'last_name',
            operator: 'ilike',
            value: `%${filters.search}%`
          },
          {
            column: 'email',
            operator: 'ilike',
            value: `%${filters.search}%`
          }
        ] : []
      });

      if (result.error) {
        logError(result.error, 'usePatients');
        throw new Error(result.error);
      }

      return {
        data: result.data || [],
        meta: {
          total: result.count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((result.count || 0) / pageSize),
        }
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2 // Retry failed queries twice
  });
};

// Real-time subscription for patients
const usePatientsSubscription = (queryClient) => {
  useEffect(() => {
    const subscription = supabaseHelper.subscribe('patients', (payload) => {
      console.log('Realtime update received:', payload);
      // Invalidate the cache for the patients query to refetch data
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [queryClient]);
};


// Get patient by ID hook using standardized API
export const usePatientById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) return null;
      
      const result = await patientsApi.getById(id);
      
      if (result.error) {
        logError(result.error, 'usePatientById');
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    retry: false, // Don't retry 404 errors
    ...options
  });
};

// Create patient hook using standardized API
export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData) => {
      const result = await patientsApi.create({
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.address,
        city: patientData.city,
        state: patientData.state,
        zip: patientData.zip,
        date_of_birth: patientData.date_of_birth,
        insurance_provider: patientData.insurance_provider,
        insurance_id: patientData.insurance_id,
        status: patientData.status || 'active',
        preferred_pharmacy: patientData.preferred_pharmacy,
        tags: patientData.tags || []
      });

      if (result.error) {
        logError(result.error, 'useCreatePatient');
        throw new Error(result.error);
      }

      return result.data;
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

// Update patient hook using standardized API
export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientData }) => {
      if (!id) throw new Error('Patient ID is required for update.');

      const result = await patientsApi.update(id, {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.address,
        city: patientData.city,
        state: patientData.state,
        zip: patientData.zip,
        date_of_birth: patientData.date_of_birth,
        insurance_provider: patientData.insurance_provider,
        insurance_id: patientData.insurance_id,
        status: patientData.status,
        preferred_pharmacy: patientData.preferred_pharmacy,
        tags: patientData.tags,
        updated_at: new Date().toISOString()
      });

      if (result.error) {
        logError(result.error, 'useUpdatePatient');
        throw new Error(result.error);
      }

      return result.data;
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

// Delete patient hook using standardized API
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Patient ID is required for deletion.');

      const result = await patientsApi.delete(id);
      
      if (result.error) {
        logError(result.error, 'useDeletePatient');
        throw new Error(result.error);
      }

      return { success: true, id };
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
