import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import apiService from '../../utils/apiService'; // Removed unused import
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications

// --- Mock Data (Using sample from AppContext for consistency) ---
const sampleServicesData = [
  {
    id: 'svc001',
    name: 'Initial Consultation',
    description: 'First meeting with provider',
    price: 150,
    active: true,
    requiresConsultation: false, // Example field
    associatedProducts: [1, 2], // Example product IDs
    availablePlans: [
      { planId: 1, duration: '1 month', requiresSubscription: true },
      { planId: 2, duration: '3 months', requiresSubscription: true },
    ], // Example plan configs
  },
  {
    id: 'svc002',
    name: 'Follow-up Session',
    description: 'Regular check-in',
    price: 75,
    active: true,
    requiresConsultation: false,
    associatedProducts: [1, 2],
    availablePlans: [
      { planId: 1, duration: '1 month', requiresSubscription: true },
    ],
  },
  {
    id: 'svc003',
    name: 'Insurance Verification Only',
    description: 'Verify insurance coverage',
    price: 0,
    active: true,
    requiresConsultation: false,
    associatedProducts: [],
    availablePlans: [],
  },
];
// --- End Mock Data ---

const queryKeys = {
  all: ['services'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get services hook (Mocked)
export const useServices = (params = {}) => {
  // console.log('Using mock services data in useServices hook'); // Removed log
  return useQuery({
    queryKey: queryKeys.lists(params),
    // queryFn: () => apiService.services.getAll(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleServicesData, // Return mock data
        // Add meta if needed
      }),
    keepPreviousData: true,
    staleTime: Infinity,
  });
};

// Get service by ID hook (Mocked)
export const useServiceById = (id, options = {}) => {
  // console.log(`Using mock service data for ID: ${id} in useServiceById hook`); // Removed log
  return useQuery({
    queryKey: queryKeys.details(id),
    // queryFn: () => apiService.services.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleServicesData.find((s) => s.id === id) || sampleServicesData[0]
      ), // Find mock service or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create service hook (Mocked)
export const useAddService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (serviceData) => apiService.services.create(serviceData), // Original API call
    mutationFn: async (serviceData) => {
      // console.log('Mock Creating service:', serviceData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newService = {
        id: `svc${Date.now()}`, // Generate mock ID
        ...serviceData,
        active: serviceData.active !== undefined ? serviceData.active : true,
      };
      // Note: Doesn't actually add to sampleServicesData
      return { data: newService }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Service created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error creating service: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update service hook (Mocked)
export const useUpdateService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ id, ...serviceData }) => apiService.services.update(id, serviceData), // Original API call
    mutationFn: async ({ id, ...serviceData }) => {
      // console.log(`Mock Updating service ${id}:`, serviceData); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...serviceData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
      toast.success('Service updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error updating service: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete service hook (Mocked)
export const useDeleteService = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (id) => apiService.services.delete(id), // Original API call
    mutationFn: async (id) => {
      // console.log(`Mock Deleting service ${id}`); // Removed log
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Also invalidate specific service if cached
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables) });
      // Consider removing detail query if needed: queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Service deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error deleting service: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
