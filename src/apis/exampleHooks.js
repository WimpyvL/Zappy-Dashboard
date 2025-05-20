/**
 * Example hooks demonstrating the use of the error handling system with React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from './apiClient';
import useErrorHandler from '../hooks/useErrorHandler';
import { ERROR_TYPES } from '../utils/errorHandlingSystem';

/**
 * Example hook for fetching patient data with enhanced error handling
 * @param {string} patientId - ID of the patient to fetch
 * @param {Object} options - Additional options
 * @returns {Object} Query result with error handling
 */
export const usePatientData = (patientId, options = {}) => {
  const { 
    handleError, 
    createRetryFunction 
  } = useErrorHandler({ context: 'Patient Data' });
  
  // Create a retry function for the API call
  const fetchPatientWithRetry = createRetryFunction(
    async (id) => {
      return apiClient.get(`/patients/${id}`, {}, { handleError: false });
    },
    { maxRetries: 2 }
  );
  
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      try {
        return await fetchPatientWithRetry(patientId);
      } catch (error) {
        // Handle specific error types differently
        if (error.type === ERROR_TYPES.NOT_FOUND) {
          // Handle not found specifically
          toast.error(`Patient with ID ${patientId} not found`);
        } else {
          // Use our error handler for other errors
          handleError(error, 'Fetch Patient');
        }
        throw error;
      }
    },
    enabled: !!patientId,
    ...options
  });
};

/**
 * Example hook for updating patient data with enhanced error handling
 * @returns {Object} Mutation result with error handling
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { 
    handleError, 
    handleFormError,
    withErrorHandling 
  } = useErrorHandler({ context: 'Update Patient' });
  
  return useMutation({
    mutationFn: withErrorHandling(async ({ patientId, data }) => {
      // Validate the data before sending
      const validationErrors = validatePatientData(data);
      if (validationErrors) {
        handleFormError(validationErrors);
        throw new Error('Validation failed');
      }
      
      return apiClient.put(`/patients/${patientId}`, data, {}, { handleError: false });
    }, { operationContext: 'Update Patient Data' }),
    
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['patient', variables.patientId]);
      queryClient.invalidateQueries(['patients']);
      
      // Show success message
      toast.success('Patient information updated successfully');
    }
  });
};

/**
 * Example hook for creating a new patient with enhanced error handling
 * @returns {Object} Mutation result with error handling
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { 
    handleError, 
    handleFormError,
    isLoading,
    error,
    resetError
  } = useErrorHandler({ context: 'Create Patient' });
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        // Validate the data before sending
        const validationErrors = validatePatientData(data);
        if (validationErrors) {
          handleFormError(validationErrors);
          throw new Error('Validation failed');
        }
        
        return await apiClient.post('/patients', data, {}, { handleError: false });
      } catch (error) {
        // Handle duplicate record errors specifically
        if (error.code === '23505') {
          toast.error('A patient with this information already exists');
        } else {
          handleError(error, 'Create Patient');
        }
        throw error;
      }
    },
    
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['patients']);
      
      // Show success message
      toast.success('Patient created successfully');
      
      // Reset error state
      resetError();
    }
  });
  
  return {
    ...mutation,
    isLoading,
    error
  };
};

/**
 * Example hook for fetching patient list with pagination and error handling
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional options
 * @returns {Object} Query result with error handling
 */
export const usePatientList = (params = {}, options = {}) => {
  const { 
    handleError 
  } = useErrorHandler({ context: 'Patient List' });
  
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'created_at', 
    sortOrder = 'desc',
    filters = {}
  } = params;
  
  return useQuery({
    queryKey: ['patients', page, limit, sortBy, sortOrder, filters],
    queryFn: async () => {
      try {
        // Build query parameters
        const queryParams = {
          page,
          limit,
          sort_by: sortBy,
          sort_order: sortOrder,
          ...filters
        };
        
        return await apiClient.get('/patients', { params: queryParams }, { handleError: false });
      } catch (error) {
        handleError(error, 'Fetch Patient List');
        throw error;
      }
    },
    keepPreviousData: true,
    ...options
  });
};

/**
 * Example hook for deleting a patient with confirmation and error handling
 * @returns {Object} Mutation result with error handling
 */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { 
    withErrorHandling 
  } = useErrorHandler({ 
    context: 'Delete Patient',
    defaultMessage: 'Failed to delete patient'
  });
  
  return useMutation({
    mutationFn: withErrorHandling(async (patientId) => {
      return apiClient.delete(`/patients/${patientId}`, {}, { handleError: false });
    }),
    
    onSuccess: (_, patientId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['patients']);
      queryClient.removeQueries(['patient', patientId]);
      
      // Show success message
      toast.success('Patient deleted successfully');
    }
  });
};

/**
 * Validate patient data
 * @param {Object} data - Patient data to validate
 * @returns {Object|null} Validation errors or null if valid
 */
const validatePatientData = (data) => {
  const errors = {};
  
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  }
  
  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export default {
  usePatientData,
  useUpdatePatient,
  useCreatePatient,
  usePatientList,
  useDeletePatient
};