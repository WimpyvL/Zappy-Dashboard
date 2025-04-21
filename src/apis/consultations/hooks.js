import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import apiService from '../../utils/apiService'; // Removed unused import
import { toast } from 'react-toastify';

// --- Mock Data ---
const sampleConsultationsData = [
  {
    id: 'c001',
    patientId: 'p001',
    patientName: 'John Smith',
    email: 'john.smith@example.com',
    dateSubmitted: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    service: 'Weight Management',
    preferredMedication: 'Ozempic',
    preferredPlan: 'Monthly',
    draftDate: null,
    provider: 'Dr. Sarah Johnson',
    status: 'pending',
    formCompleted: true,
    consultationData: {
      /* Add mock notes/order data if needed for detail view */
    },
  },
  {
    id: 'c002',
    patientId: 'p002',
    patientName: 'Emily Davis',
    email: 'emily.davis@example.com',
    dateSubmitted: new Date(Date.now() - 1 * 86400000).toISOString(), // Yesterday
    service: 'Initial Consultation',
    preferredMedication: 'Wegovy',
    preferredPlan: '3-Month',
    draftDate: null,
    provider: 'Dr. Michael Chen',
    status: 'reviewed',
    formCompleted: true,
    consultationData: {
      /* ... */
    },
  },
  {
    id: 'c003',
    patientId: 'p003',
    patientName: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    dateSubmitted: new Date().toISOString(), // Today
    service: 'Weight Management',
    preferredMedication: 'Ozempic',
    preferredPlan: 'Monthly',
    draftDate: null,
    provider: 'Dr. Sarah Johnson',
    status: 'pending',
    formCompleted: false,
    consultationData: {
      /* ... */
    },
  },
];
// --- End Mock Data ---

const queryKeys = {
  all: ['consultations'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get consultations hook (Mocked)
export const useConsultations = (params = {}) => {
  // console.log('Using mock consultations data in useConsultations hook'); // Removed log
  return useQuery({
    queryKey: queryKeys.lists(params),
    // queryFn: () => apiService.consultations.getAll(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleConsultationsData, // Return mock data
        meta: {
          total: sampleConsultationsData.length,
          per_page: 10,
          current_page: params?.page || 1,
        },
      }),
    keepPreviousData: true,
    staleTime: Infinity, // Keep mock data fresh
  });
};

// Get consultation by ID hook (Mocked)
export const useConsultationById = (id, options = {}) => {
  // console.log(
  //   `Using mock consultation data for ID: ${id} in useConsultationById hook`
  // ); // Removed log
  return useQuery({
    queryKey: queryKeys.details(id),
    // queryFn: () => apiService.consultations.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleConsultationsData.find((c) => c.id === id) ||
          sampleConsultationsData[0]
      ), // Find mock consultation or return first
    enabled: !!id,
    staleTime: Infinity, // Keep mock data fresh
    ...options,
  });
};

// Update consultation status hook
export const useUpdateConsultationStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ consultationId, status }) => apiService.consultations.updateStatus(consultationId, status), // Original API call
    mutationFn: async ({ consultationId, status }) => {
      // Simulate API call for updating status
      // console.log(
      //   `Mock Updating consultation ${consultationId} status to: ${status}`
      // ); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Return a success indicator or the updated status
      return { success: true, id: consultationId, status: status };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate lists and the specific detail
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.consultationId),
      });
      toast.success('Consultation status updated');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating status: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Add other mutation hooks as needed (create, update, delete)
// export const useCreateConsultation = (options = {}) => { ... };
// export const useUpdateConsultation = (options = {}) => { ... };
// export const useDeleteConsultation = (options = {}) => { ... };
