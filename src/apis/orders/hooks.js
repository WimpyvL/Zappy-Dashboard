import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService

// Get orders hook
export const useOrders = (currentPage, filters) => {
  const params = { page: currentPage, ...filters };
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => apiService.orders.getAll(params), // Use apiService
  });
};

// Get order by ID hook
export const useOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiService.orders.getById(id), // Use apiService
    enabled: !!id,
    ...options,
  });
};

// Create order hook
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => apiService.orders.create(orderData), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Update order hook
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderData }) => apiService.orders.update(id, orderData), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
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
    // Ensure payload matches apiService: { id, status }
    mutationFn: ({ orderId, status }) => apiService.orders.updateStatus(orderId, status), // Use apiService and correct param name
    onSuccess: (data, variables, context) => { // Added params
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] }); // Use variables.orderId
      options.onSuccess?.(data, variables, context); // Pass params
    },
    onError: options.onError, // Pass through onError
    onSettled: options.onSettled, // Pass through onSettled
  });
};

// Delete order hook
export const useDeleteOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.orders.delete(id), // Use apiService
    onSuccess: (data, variables, context) => { // Added params
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
        // mutationFn: ({ entityId, tagId }) => apiService.orders.addTag(entityId, tagId), // Replace with actual API call
        mutationFn: async ({ entityId, tagId }) => {
            // Placeholder: Replace with actual API call from apiService if it exists
            console.warn("API call for adding order tag not implemented yet.");
            // Example structure: await apiService.orders.addTag(entityId, tagId);
            return { success: true }; // Simulate success
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['order', variables.entityId] });
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
        // mutationFn: ({ entityId, tagId }) => apiService.orders.removeTag(entityId, tagId), // Replace with actual API call
         mutationFn: async ({ entityId, tagId }) => {
             // Placeholder: Replace with actual API call from apiService if it exists
             console.warn("API call for removing order tag not implemented yet.");
             // Example structure: await apiService.orders.removeTag(entityId, tagId);
             return { success: true }; // Simulate success
         },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['order', variables.entityId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            options.onSuccess?.(data, variables, context);
        },
        onError: options.onError,
    });
};
