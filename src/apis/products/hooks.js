import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import apiService from '../../utils/apiService'; // Removed unused import
import { toast } from 'react-toastify'; // Added for mock feedback

// --- Mock Data (Using sample from AppContext for consistency) ---
const sampleProductsData = [
  {
    id: 1,
    name: 'Ozempic Pens',
    description: 'Injectable medication',
    category: 'Weight Loss',
    active: true,
    type: 'medication', // Added type
    fulfillmentSource: 'compounding_pharmacy', // Added source
    doses: [
      { id: 101, value: '0.25mg', allowOneTimePurchase: false },
      { id: 102, value: '0.5mg', allowOneTimePurchase: true },
      { id: 103, value: '1.0mg', allowOneTimePurchase: true },
    ],
    oneTimePurchasePrice: 249.99, // Added example price
    requiresPrescription: true,
    associatedServiceIds: [1, 2], // Example service IDs
    stockStatus: 'in-stock',
    interactionWarnings: ['Thyroid C-cell tumors'],
  },
  {
    id: 2,
    name: 'Wegovy Pens',
    description: 'Injectable medication',
    category: 'Weight Loss',
    active: true,
    type: 'medication',
    fulfillmentSource: 'retail_pharmacy',
    doses: [
      { id: 201, value: '1.7mg', allowOneTimePurchase: true },
      { id: 202, value: '2.4mg', allowOneTimePurchase: true },
    ],
    oneTimePurchasePrice: 299.99,
    requiresPrescription: true,
    associatedServiceIds: [1, 2],
    stockStatus: 'in-stock',
    interactionWarnings: ['Thyroid C-cell tumors', 'Pancreatitis'],
  },
  {
    id: 3,
    name: 'Vitamin D3 Supplement',
    description: 'High-potency Vitamin D3',
    category: 'Supplements',
    active: true,
    type: 'supplement',
    fulfillmentSource: 'internal_supplement',
    price: 19.99, // Price for non-medication
    requiresPrescription: false,
    associatedServiceIds: [],
    stockStatus: 'in-stock',
    interactionWarnings: [],
    allowOneTimePurchase: true,
  },
];
// --- End Mock Data ---

// Get products hook (Mocked)
export const useProducts = (filters) => {
  // console.log('Using mock products data in useProducts hook'); // Removed log
  return useQuery({
    queryKey: ['products', filters],
    // queryFn: () => apiService.products.getAll(filters), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleProductsData, // Return mock data
        // Add meta if needed
      }),
    staleTime: Infinity,
  });
};

// Get product by ID hook (Mocked)
export const useProductById = (id, options = {}) => {
  // console.log(`Using mock product data for ID: ${id} in useProductById hook`); // Removed log
  return useQuery({
    queryKey: ['product', id],
    // queryFn: () => apiService.products.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleProductsData.find((p) => p.id === id) || sampleProductsData[0]
      ), // Find mock product or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create product hook (Mocked)
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (productData) => apiService.products.create(productData), // Original API call
    mutationFn: async (productData) => {
      // console.log('Mock Creating product:', productData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newProduct = {
        id: Date.now(), // Generate mock ID
        ...productData,
        active: productData.active !== undefined ? productData.active : true,
      };
      // Note: Doesn't actually add to sampleProductsData
      return { data: newProduct }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Update product hook (Mocked)
export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, productData }) => apiService.products.update(id, productData), // Original API call
    mutationFn: async ({ id, productData }) => {
      // console.log(`Mock Updating product ${id}:`, productData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...productData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] }); // Use variables.id
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Delete product hook (Mocked)
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => apiService.products.delete(id), // Original API call
    mutationFn: async (id) => {
      // console.log(`Mock Deleting product ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Optionally remove detail query: queryClient.removeQueries({ queryKey: ['product', variables] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};
