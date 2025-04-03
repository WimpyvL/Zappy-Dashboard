import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService

// Get products hook
export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiService.products.getAll(filters), // Use apiService
  });
};

// Get product by ID hook
export const useProductById = (id, options = {}) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.products.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Create product hook
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => apiService.products.create(productData), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['products'] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
     onError: options.onError, // Pass through onError
     onSettled: options.onSettled, // Pass through onSettled
  });
};

// Update product hook
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }) => apiService.products.update(id, productData), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] }); // Use variables.id
      options.onSuccess?.(data, variables, context); // Pass params
    },
     onError: options.onError, // Pass through onError
     onSettled: options.onSettled, // Pass through onSettled
  });
};

// Delete product hook
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.products.delete(id), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Optionally remove detail query: queryClient.removeQueries({ queryKey: ['product', variables] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
     onError: options.onError, // Pass through onError
     onSettled: options.onSettled, // Pass through onSettled
  });
};
