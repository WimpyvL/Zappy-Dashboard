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
import { toast } from 'react-toastify'; // Assuming toast notifications

// Get products hook
export const useProducts = (currentPage = 1, filters = {}) => {
  return useQuery({
    queryKey: ['products', currentPage, filters],
    queryFn: () => getProducts(currentPage, filters),
    keepPreviousData: true,
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
        toast.error(`Error creating product: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Update product hook
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }) => updateProduct(id, productData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Product updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error updating product: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Delete product hook
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product', variables] });
      toast.success('Product deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error deleting product: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};
