import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { // Commented out as functions are unused due to mocking/apiService usage below
//   getPatients,
//   getPatientById,
//   createPatient,
//   updatePatient,
//   deletePatient
// } from './api';
// import apiService from '../../utils/apiService'; // Removed unused import
import auditLogService from '../../utils/auditLogService'; // Import the audit log service

// --- Mock Data ---
const samplePatientsData = [
  {
    id: 'p001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    status: 'Active',
    tags: ['vip'],
  },
  {
    id: 'p002',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    status: 'Active',
    tags: [],
  },
  {
    id: 'p003',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@example.com',
    status: 'Inactive',
    tags: ['follow-up'],
  },
];
// --- End Mock Data ---

// Get patients hook (Mocked)
export const usePatients = (currentPage, filters) => {
  // console.log('Using mock patients data in usePatients hook'); // Removed log
  return useQuery({
    queryKey: ['patients', currentPage, filters],
    // queryFn: () => getPatients(currentPage, filters), // Original API call
    // queryFn: () => apiService.patients.getAll({ page: currentPage, ...filters }), // Alternative using apiService
    queryFn: () =>
      Promise.resolve({
        data: samplePatientsData,
        meta: {
          total: samplePatientsData.length,
          per_page: 10,
          current_page: currentPage,
        },
      }), // Return mock data with pagination structure
    staleTime: Infinity,
  });
};

// Get patient by ID hook
// Get patient by ID hook (Mocked)
export const usePatientById = (id, options = {}) => {
  // console.log(`Using mock patient data for ID: ${id} in usePatientById hook`); // Removed log
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () =>
      Promise.resolve(
        samplePatientsData.find((p) => p.id === id) || samplePatientsData[0]
      ), // Find mock patient or return first as fallback
    enabled: !!id,
    staleTime: Infinity, // Keep mock data fresh
    ...options,
  });
};

// Create patient hook
export const useCreatePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (patientData) => apiService.patients.create(patientData), // Original API call
    mutationFn: async (patientData) => {
      // Simulate API call for creating patient
      // console.log('Mock Creating patient:', patientData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newPatient = {
        id: `p${Date.now()}`, // Generate a mock ID
        ...patientData,
        status: patientData.status || 'active', // Ensure status default
        tags: [], // Default tags
      };
      // Note: This doesn't actually add to the samplePatientsData array in this context
      // In a more complex mock, you might manage a mutable mock store
      return newPatient; // Return the mock created patient
    },
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
    // mutationFn: ({ id, patientData }) => apiService.patients.update(id, patientData), // Original API call
    mutationFn: async ({ id, patientData }) => {
      // Simulate API call for updating patient
      // console.log(`Mock Updating patient ${id}:`, patientData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Return the updated data structure expected by the component
      return { id, ...patientData };
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      // Invalidate the specific patient query as well
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      options.onSuccess && options.onSuccess(data, variables); // Pass data and variables
    },
  });
};

// Delete patient hook (Mocked)
export const useDeletePatient = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => apiService.patients.delete(id), // Original API call
    mutationFn: async (id) => {
      // Simulate API call for deleting patient
      // console.log(`Mock Deleting patient ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Return a success indicator or empty object
      return { success: true };
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete patient hook (Original removed, keeping mocked version above)
// export const useDeletePatient = (options = {}) => {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (id) => apiService.patients.delete(id), // Use apiService
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['patients'] });
//       options.onSuccess && options.onSuccess();
//     },
//   });
// };
