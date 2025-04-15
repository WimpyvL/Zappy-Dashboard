import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  getPharmacies,
  getPharmacyById,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  togglePharmacyActive
} from './api';
import { toast } from 'react-toastify'; // Assuming toast notifications

// Get pharmacies hook
export const usePharmacies = (currentPage = 1, filters = {}) => {
  return useQuery({
    queryKey: ['pharmacies', currentPage, filters],
    queryFn: () => getPharmacies(currentPage, filters),
    keepPreviousData: true,
  });
};

// Get pharmacy by ID hook
export const usePharmacyById = (id, options = {}) => {
  return useQuery({
    queryKey: ['pharmacy', id],
    queryFn: () => getPharmacyById(id),
    enabled: !!id,
    ...options
  });
};

// Create pharmacy hook
export const useCreatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pharmacyData) => createPharmacy(pharmacyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      toast.success('Pharmacy created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
        toast.error(`Error creating pharmacy: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Update pharmacy hook
export const useUpdatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pharmacyData }) => updatePharmacy(id, pharmacyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy', variables.id] });
      toast.success('Pharmacy updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error updating pharmacy: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Delete pharmacy hook
export const useDeletePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePharmacy(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.removeQueries({ queryKey: ['pharmacy', variables] });
      toast.success('Pharmacy deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error deleting pharmacy: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Toggle pharmacy active hook
export const useTogglePharmacyActive = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => togglePharmacyActive(id, active),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy', variables.id] });
      toast.success(`Pharmacy ${variables.active ? 'activated' : 'deactivated'} successfully.`);
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error toggling pharmacy status: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};
