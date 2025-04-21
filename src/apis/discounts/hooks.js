import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { // Commented out API functions
//   getDiscounts,
//   getDiscountById,
//   createDiscount,
//   updateDiscount,
//   deleteDiscount,
//   toggleDiscountActive,
// } from './api';
import { toast } from 'react-toastify';

// --- Mock Data ---
const sampleDiscountsData = [
  {
    id: 1,
    name: 'Spring Sale 10%',
    code: 'SPRING10',
    discount_type: 'percentage',
    value: '10.0',
    description: '10% off all products for spring',
    valid_from: '2025-03-01T00:00:00Z',
    valid_until: '2025-05-31T23:59:59Z',
    requirement: 'None',
    min_purchase: '0.0',
    status: 'Active',
    usage_limit: null,
    usage_limit_per_user: 1,
    usage_count: 5,
  },
  {
    id: 2,
    name: '$25 Off First Order',
    code: 'WELCOME25',
    discount_type: 'fixed',
    value: '25.0',
    description: '$25 off for new customers',
    valid_from: '2025-01-01T00:00:00Z',
    valid_until: null,
    requirement: 'New patients only',
    min_purchase: '50.0',
    status: 'Active',
    usage_limit: null,
    usage_limit_per_user: 1,
    usage_count: 12,
  },
  {
    id: 3,
    name: 'Expired Discount',
    code: 'EXPIRED5',
    discount_type: 'percentage',
    value: '5.0',
    description: 'An old expired discount',
    valid_from: '2024-01-01T00:00:00Z',
    valid_until: '2024-12-31T23:59:59Z',
    requirement: 'None',
    min_purchase: '0.0',
    status: 'Active', // Status might be active, but validity dates make it expired
    usage_limit: 100,
    usage_limit_per_user: null,
    usage_count: 95,
  },
  {
    id: 4,
    name: 'Inactive Discount',
    code: 'INACTIVE15',
    discount_type: 'fixed',
    value: '15.0',
    description: 'Currently inactive discount',
    valid_from: '2025-01-01T00:00:00Z',
    valid_until: null,
    requirement: 'None',
    min_purchase: '0.0',
    status: 'Inactive',
    usage_limit: null,
    usage_limit_per_user: null,
    usage_count: 0,
  },
];
// --- End Mock Data ---

// Hook to fetch all discounts (Mocked)
export const useDiscounts = (params = {}) => {
  // console.log('Using mock discounts data in useDiscounts hook'); // Removed log
  return useQuery({
    queryKey: ['discounts', params],
    // queryFn: () => getDiscounts(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleDiscountsData, // Return mock data
        // Add meta if your API returns pagination info
      }),
    staleTime: Infinity,
  });
};

// Hook to fetch a specific discount by ID (Mocked)
export const useDiscountById = (id, options = {}) => {
  // console.log(`Using mock discount data for ID: ${id} in useDiscountById hook`); // Removed log
  return useQuery({
    queryKey: ['discount', id],
    // queryFn: () => getDiscountById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleDiscountsData.find((d) => d.id === id) || sampleDiscountsData[0]
      ), // Find mock discount or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Hook to create a new discount (Mocked)
export const useCreateDiscount = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (discountData) => createDiscount(discountData), // Original API call
    mutationFn: async (discountData) => {
      // console.log('Mock Creating discount:', discountData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newDiscount = {
        id: Date.now(), // Generate mock ID
        ...discountData,
        usage_count: 0, // Default usage count
      };
      // Note: Doesn't actually add to sampleDiscountsData
      return { data: newDiscount }; // Simulate API response structure if needed
    },
    onSuccess: (data) => { // Adjust to potentially use data from mock response
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount created successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message || 'An error occurred while creating the discount.'
      );
      options.onError && options.onError(error);
    },
  });
};

// Hook to update an existing discount (Mocked)
export const useUpdateDiscount = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, discountData }) => updateDiscount(id, discountData), // Original API call
    mutationFn: async ({ id, discountData }) => {
      // console.log(`Mock Updating discount ${id}:`, discountData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...discountData } }; // Simulate API response
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
      toast.success('Discount updated successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message || 'An error occurred while updating the discount.'
      );
      options.onError && options.onError(error);
    },
  });
};

// Hook to delete a discount (Mocked)
export const useDeleteDiscount = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => deleteDiscount(id), // Original API call
    mutationFn: async (id) => {
      // console.log(`Mock Deleting discount ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id if needed
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      // Also invalidate specific discount if cached
      queryClient.invalidateQueries({ queryKey: ['discount', variables] });
      toast.success('Discount deleted successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message || 'An error occurred while deleting the discount.'
      );
      options.onError && options.onError(error);
    },
  });
};

// Hook to toggle discount active status (Mocked)
export const useToggleDiscountActive = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, active }) => toggleDiscountActive(id, active), // Original API call
    mutationFn: async ({ id, active }) => {
      // console.log(`Mock Toggling discount ${id} active status to: ${active}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id, active }; // Simulate API response
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
      toast.success(
        `Discount ${variables.active ? 'activated' : 'deactivated'} successfully`
      );
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message || 'An error occurred while updating the discount status.'
      );
      options.onError && options.onError(error);
    },
  });
};
