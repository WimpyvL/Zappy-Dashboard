import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPharmacies,
  getPharmacyById,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  togglePharmacyActive,
} from './api';

// Get pharmacies hook
export const usePharmacies = (filters) => {
  return useQuery({
    queryKey: ['pharmacies', filters],
    queryFn: () => getPharmacies(filters),
  });
};

// Get pharmacy by ID hook
export const usePharmacyById = (id, options = {}) => {
  return useQuery({
    queryKey: ['pharmacy', id],
    queryFn: () => getPharmacyById(id),
    enabled: !!id,
    ...options,
  });
};

// Create pharmacy hook
export const useCreatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pharmacyData) => createPharmacy(pharmacyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Update pharmacy hook
export const useUpdatePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pharmacyData }) => updatePharmacy(id, pharmacyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete pharmacy hook
export const useDeletePharmacy = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePharmacy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Toggle pharmacy active hook
export const useTogglePharmacyActive = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => togglePharmacyActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      options.onSuccess && options.onSuccess();
    },
  });
};
