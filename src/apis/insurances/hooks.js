import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { // Commented out unused API functions
//   // getInsuranceRecords,
//   getInsuranceRecordById,
//   createInsuranceRecord,
//   updateInsuranceRecord,
//   uploadInsuranceDocument,
//   deleteInsuranceDocument,
// } from './api';
// import { toast } from 'react-toastify'; // Removed unused import

// --- Mock Data ---
const sampleInsuranceRecords = [
  {
    id: 'ir001',
    patientId: 'p001',
    patientName: 'John Smith',
    insuranceProvider: 'Blue Cross',
    policyNumber: 'BC12345',
    status: 'Verified',
    documents: [],
  },
  {
    id: 'ir002',
    patientId: 'p002',
    patientName: 'Emily Davis',
    insuranceProvider: 'Aetna',
    policyNumber: 'AE67890',
    status: 'Pending',
    documents: [],
  },
];
// --- End Mock Data ---

// Get insurance records hook (Mocked)
export const useInsuranceRecords = (filters) => {
  // console.log('Using mock insurance records data'); // Removed log
  return useQuery({
    queryKey: ['insuranceRecords', filters],
    // queryFn: () => getInsuranceRecords(filters), // Original API call
    queryFn: () => Promise.resolve({ data: sampleInsuranceRecords }), // Return mock data
    staleTime: Infinity, // Prevent refetching for mock data
  });
};

// Get insurance record by ID hook (Mocked)
// Get insurance record by ID hook (Mocked)
export const useInsuranceRecordById = (id, options = {}) => {
  // console.log(
  //   `Using mock insurance record data for ID: ${id} in useInsuranceRecordById hook`
  // ); // Removed log
  return useQuery({
    queryKey: ['insuranceRecord', id],
    // queryFn: () => getInsuranceRecordById(id), // Original API call - Function definition removed
    queryFn: () =>
      Promise.resolve(
        sampleInsuranceRecords.find((r) => r.id === id) ||
          sampleInsuranceRecords[0]
      ), // Find mock record or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create insurance record hook
export const useCreateInsuranceRecord = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (recordData) => createInsuranceRecord(recordData), // Original API call - Function definition removed
    mutationFn: async (recordData) => {
      // console.log('Mock Creating insurance record:', recordData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newRecord = {
        id: `ir${Date.now()}`, // Generate mock ID
        ...recordData,
        status: 'Pending', // Default status
        documents: [],
      };
      // Note: Doesn't actually add to sampleInsuranceRecords
      return { data: newRecord }; // Simulate API response
    },
    onSuccess: (data) => { // Adjust to potentially use data from mock response
      queryClient.invalidateQueries({ queryKey: ['insuranceRecords'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Update insurance record hook
export const useUpdateInsuranceRecord = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, recordData }) => updateInsuranceRecord(id, recordData), // Original API call - Function definition removed
    mutationFn: async ({ id, recordData }) => {
      // console.log(`Mock Updating insurance record ${id}:`, recordData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...recordData } }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['insuranceRecords'] });
      queryClient.invalidateQueries({
        queryKey: ['insuranceRecord', variables.id],
      });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Upload insurance document hook
export const useUploadInsuranceDocument = (id, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (formData) => uploadInsuranceDocument(id, formData), // Original API call - Function definition removed
    mutationFn: async (formData) => {
      // Simulate file upload
      const fileName = formData.get('file')?.name || 'mock_document.pdf';
      // console.log(`Mock Uploading document for record ${id}: ${fileName}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate upload delay
      // Return a mock document object
      return {
        data: {
          id: `doc_${Date.now()}`,
          filename: fileName,
          url: `/mock/documents/${fileName}`,
          uploaded_at: new Date().toISOString(),
        },
      };
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['insuranceRecord', id] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete insurance document hook
export const useDeleteInsuranceDocument = (id, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (documentId) => deleteInsuranceDocument(id, documentId), // Original API call - Function definition removed
    mutationFn: async (documentId) => {
      // console.log(`Mock Deleting document ${documentId} for record ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['insuranceRecord', id] });
      options.onSuccess && options.onSuccess();
    },
  });
};
