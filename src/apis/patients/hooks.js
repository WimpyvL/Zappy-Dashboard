import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import auditLogService from '../../utils/auditLogService'; // Import the audit log service

// Get patients hook
export const usePatients = (currentPage, filters) => {
  // Combine params for the API call and query key
  const params = { page: currentPage, ...filters };
  return useQuery({
    queryKey: ['patients', params], // Use combined params in query key
    queryFn: () => apiService.patients.getAll(params), // Use apiService
  });
};

// Get patient by ID hook
export const usePatientById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => apiService.patients.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Create patient hook
export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientData) => apiService.patients.create(patientData), // Use apiService
    onSuccess: (data, variables, context) => {
      // Ensure parameters are available if needed
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      // Log the audit event
      // Assuming 'data' contains the created patient details, including an ID
      const patientId = data?.id || variables?.id || 'unknown'; // Get ID from response or input variables
      const patientName = variables?.firstName
        ? `${variables.firstName} ${variables.lastName}`
        : 'Unknown Name'; // Get name from input variables
      auditLogService.log('Patient Created', {
        patientId: patientId,
        name: patientName,
      });

      // Call original onSuccess if provided
      options.onSuccess && options.onSuccess(data, variables, context);
    },
  });
};

// Update patient hook
export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patientData }) => apiService.patients.update(id, patientData), // Use apiService
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete patient hook
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.patients.delete(id), // Use apiService
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      options.onSuccess && options.onSuccess();
    },
  });
};
