// hooks/patientInsuranceHooks.js - Refactored for Supabase
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { toast } from 'react-toastify'; // Assuming toast notifications are used
import {
  getPatientInsurances,
  getPatientInsuranceById,
  createPatientInsurance,
  updatePatientInsurance,
  deletePatientInsurance,
  uploadInsuranceDocument,
  deleteInsuranceDocument
} from './api';

// Get patient insurance records hook
export const usePatientInsurances = (currentPage = 1, filters = {}) => {
  return useQuery({
    queryKey: ['patientInsurances', currentPage, filters],
    queryFn: () => getPatientInsurances(currentPage, filters),
    keepPreviousData: true,
  });
};

// Get patient insurance record by ID hook
export const usePatientInsuranceById = (id, options = {}) => {
  return useQuery({
    queryKey: ['patientInsurance', id],
    queryFn: () => getPatientInsuranceById(id),
    enabled: !!id,
    ...options
  });
};

// Create patient insurance record hook
export const useCreatePatientInsurance = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordData) => createPatientInsurance(recordData),
    onSuccess: (data, variables) => {
      // Invalidate based on patientId if available in filters/variables
      queryClient.invalidateQueries({ queryKey: ['patientInsurances'] });
      toast.success('Insurance record created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
        toast.error(`Error creating insurance record: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Update patient insurance record hook
export const useUpdatePatientInsurance = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recordData }) => updatePatientInsurance(id, recordData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patientInsurances'] });
      queryClient.invalidateQueries({ queryKey: ['patientInsurance', variables.id] });
      toast.success('Insurance record updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error updating insurance record: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Delete patient insurance record hook
export const useDeletePatientInsurance = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deletePatientInsurance(id),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['patientInsurances'] });
            // Optionally remove the specific record query if cached
            queryClient.removeQueries({ queryKey: ['patientInsurance', variables.id] });
            toast.success('Insurance record deleted successfully.');
            options.onSuccess && options.onSuccess(data, variables);
        },
        onError: (error) => {
            toast.error(`Error deleting insurance record: ${error.message}`);
            options.onError && options.onError(error);
        }
    });
};


// --- Document Hooks ---

// Upload insurance document hook
export const useUploadInsuranceDocument = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Expect { patientInsuranceId, file } as variables
    mutationFn: ({ patientInsuranceId, file }) => uploadInsuranceDocument(patientInsuranceId, file),
    onSuccess: (data, variables) => {
      // Invalidate the specific patient insurance record to refetch updated documents array
      queryClient.invalidateQueries({ queryKey: ['patientInsurance', variables.patientInsuranceId] });
      toast.success('Document uploaded successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
        toast.error(`Error uploading document: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Delete insurance document hook
export const useDeleteInsuranceDocument = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
     // Expect { patientInsuranceId, storagePath } as variables
    mutationFn: ({ patientInsuranceId, storagePath }) => deleteInsuranceDocument(patientInsuranceId, storagePath),
    onSuccess: (data, variables) => {
      // Invalidate the specific patient insurance record to refetch updated documents array
      queryClient.invalidateQueries({ queryKey: ['patientInsurance', variables.patientInsuranceId] });
       toast.success('Document deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error deleting document: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};
