import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from './api';

// Get products hook
export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters)
  });
};

// Get product by ID hook
export const useProductById = (id, options = {}) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    ...options
  });
};

// Create product hook
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Update product hook
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }) => updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Delete product hook
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      options.onSuccess && options.onSuccess();
    }
  });
};