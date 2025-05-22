import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productsApi from './api';

/**
 * Hook to fetch all products
 * @returns {Object} Query result with products data
 */
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const products = await productsApi.getAllProducts();
      return products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch products by category
 * @param {string} categoryId - Category ID
 * @returns {Object} Query result with products in the category
 */
export const useProductsByCategory = (categoryId) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      const products = await productsApi.getProductsByCategory(categoryId);
      return products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!categoryId, // Only run the query if categoryId is provided
  });
};

/**
 * Hook to fetch all product categories
 * @returns {Object} Query result with categories data
 */
export const useProductCategories = () => {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const categories = await productsApi.getAllCategories();
      return categories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to create a new product
 * @returns {Object} Mutation result
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData) => {
      return await productsApi.createProduct(productData);
    },
    onSuccess: () => {
      // Invalidate products query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Hook to update an existing product
 * @returns {Object} Mutation result
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData) => {
      return await productsApi.updateProduct(productData);
    },
    onSuccess: () => {
      // Invalidate products query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Hook to delete a product
 * @returns {Object} Mutation result
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId) => {
      await productsApi.deleteProduct(productId);
      return productId;
    },
    onSuccess: () => {
      // Invalidate products query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
