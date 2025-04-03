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
} from './api';

// Get insurance records hook
export const useInsuranceRecords = (filters) => {
  return useQuery({
    queryKey: ['insuranceRecords', filters],
    queryFn: () => getInsuranceRecords(filters)
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