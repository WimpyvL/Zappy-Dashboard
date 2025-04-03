import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  getInsuranceRecords,
  getInsuranceRecordById,
  createInsuranceRecord,
  updateInsuranceRecord,
  uploadInsuranceDocument,
  deleteInsuranceDocument
} from './api'; // Keep imports for other hooks

// --- Mock Data ---
const sampleInsuranceRecords = [
  { id: 'ir001', patientId: 'p001', patientName: 'John Smith', insuranceProvider: 'Blue Cross', policyNumber: 'BC12345', status: 'Verified', documents: [] },
  { id: 'ir002', patientId: 'p002', patientName: 'Emily Davis', insuranceProvider: 'Aetna', policyNumber: 'AE67890', status: 'Pending', documents: [] },
];
// --- End Mock Data ---


// Get insurance records hook (Mocked)
export const useInsuranceRecords = (filters) => {
  console.log("Using mock insurance records data");
  return useQuery({
    queryKey: ['insuranceRecords', filters],
    // queryFn: () => getInsuranceRecords(filters), // Original API call
    queryFn: () => Promise.resolve({ data: sampleInsuranceRecords }), // Return mock data
    staleTime: Infinity, // Prevent refetching for mock data
  });
};

// Get insurance record by ID hook
export const useInsuranceRecordById = (id, options = {}) => {
  return useQuery({
    queryKey: ['insuranceRecord', id],
    queryFn: () => getInsuranceRecordById(id),
    enabled: !!id,
    ...options
  });
};

// Create insurance record hook
export const useCreateInsuranceRecord = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordData) => createInsuranceRecord(recordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceRecords'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Update insurance record hook
export const useUpdateInsuranceRecord = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recordData }) => updateInsuranceRecord(id, recordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceRecord'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Upload insurance document hook
export const useUploadInsuranceDocument = (id, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadInsuranceDocument(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceRecord', id] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Delete insurance document hook
export const useDeleteInsuranceDocument = (id, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId) => deleteInsuranceDocument(id, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceRecord', id] });
      options.onSuccess && options.onSuccess();
    }
  });
};
