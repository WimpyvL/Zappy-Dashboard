import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import apiService from '../../utils/apiService'; // Removed unused import
// import { toast } from 'react-toastify'; // Removed unused import

// --- Mock Data ---
const sampleOrdersData = [
  {
    id: 'o001',
    patientId: 'p001',
    patientName: 'John Smith',
    orderDate: new Date().toISOString(),
    status: 'pending',
    medication: 'Ozempic',
    tags: [],
    linkedSessionId: 's001',
    pharmacy: 'Compounding Pharmacy A',
    holdReason: null,
  },
  {
    id: 'o002',
    patientId: 'p002',
    patientName: 'Emily Davis',
    orderDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'shipped',
    medication: 'Wegovy',
    tags: [],
    linkedSessionId: 's002',
    pharmacy: 'Retail Pharmacy B',
    trackingNumber: 'TRK123456',
    estimatedDelivery: '2025-04-05',
    holdReason: null,
  },
  {
    id: 'o003',
    patientId: 'p001',
    patientName: 'John Smith',
    orderDate: new Date(Date.now() - 172800000).toISOString(),
    status: 'delivered', // Assuming delivered is a status
    medication: 'Ozempic',
    tags: [],
    linkedSessionId: null,
    pharmacy: 'Compounding Pharmacy A',
    holdReason: null,
  },
  {
    id: 'o004',
    patientId: 'p003',
    patientName: 'Robert Wilson',
    orderDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'pending',
    medication: 'Mounjaro',
    tags: [],
    linkedSessionId: 's003',
    pharmacy: 'Compounding Pharmacy C',
    holdReason: 'Awaiting follow-up appointment',
  },
];
// --- End Mock Data ---

// Get orders hook (Mocked)
export const useOrders = (currentPage, filters) => {
  console.log('Using mock orders data in useOrders hook');
  const params = { page: currentPage, ...filters };
  return useQuery({
    queryKey: ['orders', params],
    // queryFn: () => apiService.orders.getAll(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleOrdersData, // Return mock data
        meta: {
          total_count: sampleOrdersData.length,
          // Add other meta fields if needed
        },
      }),
    staleTime: Infinity,
  });
};

// Get order by ID hook (Mocked)
export const useOrderById = (id, options = {}) => {
  console.log(`Using mock order data for ID: ${id} in useOrderById hook`);
  return useQuery({
    queryKey: ['order', id],
    // queryFn: () => apiService.orders.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleOrdersData.find((o) => o.id === id) || sampleOrdersData[0]
      ), // Find mock order or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create order hook (Mocked)
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (orderData) => apiService.orders.create(orderData), // Original API call
    mutationFn: async (orderData) => {
      console.log('Mock Creating order:', orderData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newOrder = {
        id: `o${Date.now()}`, // Generate mock ID
        ...orderData,
        status: 'pending', // Default status
        orderDate: new Date().toISOString(),
      };
      // Note: Doesn't actually add to sampleOrdersData
      return { data: newOrder }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Update order hook (Mocked)
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, orderData }) => apiService.orders.update(id, orderData), // Original API call
    mutationFn: async ({ id, orderData }) => {
      console.log(`Mock Updating order ${id}:`, orderData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...orderData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] }); // Use variables.id
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Update order status hook
export const useUpdateOrderStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ orderId, status }) => apiService.orders.updateStatus(orderId, status), // Original API call
    mutationFn: async ({ orderId, status }) => {
      console.log(`Mock Updating order ${orderId} status to: ${status}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id: orderId, status: status }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] }); // Use variables.orderId
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Delete order hook (Mocked)
export const useDeleteOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => apiService.orders.delete(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Deleting order ${id}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Added params
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Optionally remove detail query: queryClient.removeQueries({ queryKey: ['order', variables] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Hook for adding a tag to an order (Example - adjust based on actual API)
export const useAddOrderTag = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ entityId, tagId }) => apiService.orders.addTag(entityId, tagId), // Original API call
    mutationFn: async ({ entityId, tagId }) => {
      console.log(`Mock Adding tag ${tagId} to order ${entityId}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate success
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['order', variables.entityId],
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
};

// Hook for removing a tag from an order (Example - adjust based on actual API)
export const useRemoveOrderTag = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ entityId, tagId }) => apiService.orders.removeTag(entityId, tagId), // Original API call
    mutationFn: async ({ entityId, tagId }) => {
      console.log(`Mock Removing tag ${tagId} from order ${entityId}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate success
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['order', variables.entityId],
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
};
