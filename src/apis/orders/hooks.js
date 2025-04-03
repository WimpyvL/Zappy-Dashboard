import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
} from './api';

// Get orders hook
export const useOrders = (currentPage, filters) => {
  return useQuery({
    queryKey: ['orders', currentPage, filters],
    queryFn: () => getOrders(currentPage, filters)
  });
};

// Get order by ID hook
export const useOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    ...options
  });
};

// Create order hook
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Update order hook
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderData }) => updateOrder(id, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Update order status hook
export const useUpdateOrderStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      options.onSuccess && options.onSuccess();
    }
  });
};

// Delete order hook
export const useDeleteOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess && options.onSuccess();
    }
  });
};