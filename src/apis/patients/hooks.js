import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from './api';
import auditLogService from '../../utils/auditLogService'; // Import the audit log service

// --- Mock Data ---
const samplePatientsData = [
  { id: 'p001', firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', status: 'Active', tags: ['vip'] },
  { id: 'p002', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', status: 'Active', tags: [] },
  { id: 'p003', firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@example.com', status: 'Inactive', tags: ['follow-up'] },
];
// --- End Mock Data ---

// Get patients hook (Mocked)
export const usePatients = (currentPage, filters) => {
  console.log("Using mock patients data in usePatients hook");
  return useQuery({
    queryKey: ['patients', currentPage, filters],
    // queryFn: () => getPatients(currentPage, filters), // Original API call
    queryFn: () => Promise.resolve({ data: samplePatientsData, meta: { total: samplePatientsData.length, per_page: 10, current_page: currentPage } }), // Return mock data with pagination structure
    staleTime: Infinity,
  });
};

// Get patient by ID hook
export const usePatientById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id),
    enabled: !!id,
    ...options
  });
};

// Create patient hook
export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientData) => createPatient(patientData),
    onSuccess: (data, variables, context) => { // Ensure parameters are available if needed
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      // Log the audit event
      // Assuming 'data' contains the created patient details, including an ID
      const patientId = data?.id || variables?.id || 'unknown'; // Get ID from response or input variables
      const patientName = variables?.firstName ? `${variables.firstName} ${variables.lastName}` : 'Unknown Name'; // Get name from input variables
      auditLogService.log('Patient Created', { patientId: patientId, name: patientName });

      // Call original onSuccess if provided
      options.onSuccess && options.onSuccess(data, variables, context);
    }
  });
};

// Update patient hook
export const useUpdatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patientData }) => updatePatient(id, patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Delete patient hook
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      options.onSuccess && options.onSuccess();
    }
  });
};
