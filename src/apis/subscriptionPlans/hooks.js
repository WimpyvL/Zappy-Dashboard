import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import apiService from '../../utils/apiService'; // Removed unused import
import { toast } from 'react-toastify';

// --- Mock Data (Using sample from AppContext for consistency) ---
const sampleSubscriptionPlansData = [
  {
    id: 1,
    name: 'Monthly Plan',
    description: 'Pay month-to-month with no commitment',
    billingFrequency: 'monthly',
    deliveryFrequency: 'monthly',
    price: 199.0,
    active: true,
    discount: 0,
    allowedProductDoses: [
      { productId: 1, doseId: 102 },
      { productId: 2, doseId: 201 },
    ],
    category: 'weight-management', // Added example field
    popularity: 'medium', // Added example field
    requiresConsultation: true, // Added example field
    additionalBenefits: [], // Added example field
  },
  {
    id: 2,
    name: '3-Month Plan',
    description: 'Quarterly billing with monthly delivery',
    billingFrequency: 'quarterly',
    deliveryFrequency: 'monthly',
    price: 179.0,
    active: true,
    discount: 10,
    allowedProductDoses: [
      { productId: 1, doseId: 102 },
      { productId: 2, doseId: 201 },
    ],
    category: 'weight-management',
    popularity: 'high',
    requiresConsultation: true,
    additionalBenefits: ['Free shipping'],
  },
  {
    id: 3,
    name: '6-Month Plan',
    description:
      'Semi-annual billing with monthly delivery and maximum savings',
    billingFrequency: 'biannually',
    deliveryFrequency: 'monthly',
    price: 159.0,
    active: true,
    discount: 20,
    allowedProductDoses: [
      { productId: 1, doseId: 103 },
      { productId: 2, doseId: 202 },
    ],
    category: 'weight-management',
    popularity: 'medium',
    requiresConsultation: true,
    additionalBenefits: ['Free shipping', 'Priority support'],
  },
];
// --- End Mock Data ---

const queryKeys = {
  all: ['subscriptionPlans'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get subscription plans hook (Mocked)
export const useSubscriptionPlans = (params = {}) => {
  console.log('Using mock subscription plans data in useSubscriptionPlans hook');
  return useQuery({
    queryKey: queryKeys.lists(params),
    // queryFn: () => apiService.subscriptionPlans.getAll(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleSubscriptionPlansData, // Return mock data
        // Add meta if needed
      }),
    keepPreviousData: true,
    staleTime: Infinity,
  });
};

// Get subscription plan by ID hook (Mocked)
export const useSubscriptionPlanById = (id, options = {}) => {
  console.log(
    `Using mock subscription plan data for ID: ${id} in useSubscriptionPlanById hook`
  );
  return useQuery({
    queryKey: queryKeys.details(id),
    // queryFn: () => apiService.subscriptionPlans.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleSubscriptionPlansData.find((p) => p.id === id) ||
          sampleSubscriptionPlansData[0]
      ), // Find mock plan or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create subscription plan hook (Mocked)
export const useAddSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (planData) => apiService.subscriptionPlans.create(planData), // Original API call
    mutationFn: async (planData) => {
      console.log('Mock Creating subscription plan:', planData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newPlan = {
        id: Date.now(), // Generate mock ID
        ...planData,
        active: planData.active !== undefined ? planData.active : true,
      };
      // Note: Doesn't actually add to sampleSubscriptionPlansData
      return { data: newPlan }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Subscription plan created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating plan: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update subscription plan hook (Mocked)
export const useUpdateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ id, ...planData }) => apiService.subscriptionPlans.update(id, planData), // Original API call
    mutationFn: async ({ id, ...planData }) => {
      console.log(`Mock Updating subscription plan ${id}:`, planData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...planData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
      toast.success('Subscription plan updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating plan: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete subscription plan hook (Mocked)
export const useDeleteSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (id) => apiService.subscriptionPlans.delete(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Deleting subscription plan ${id}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Also invalidate specific plan if cached
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Subscription plan deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting plan: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
