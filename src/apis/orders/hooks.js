import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify'; // Keep toast for feedback

// --- Mock Data Removed ---

const queryKeys = {
  all: ['orders'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get orders hook (Using Supabase)
export const useOrders = (params = {}) => {
  // console.log('Using Supabase orders data in useOrders hook');
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      let query = supabase.from('orders').select('*'); // Assuming table name is 'orders'
      // Add filtering/pagination based on params if needed
      // Example: if (params.status) query = query.eq('status', params.status);
      // Example: if (params.page && params.limit) {
      //   const offset = (params.page - 1) * params.limit;
      //   query = query.range(offset, offset + params.limit - 1);
      // }
      const { data, error, count } = await query.order('orderDate', { ascending: false }); // Example ordering

      if (error) throw error;
      // Returning data and count for potential pagination
      return { data, meta: { total_count: count } };
    },
    // keepPreviousData: true, // Consider if needed for pagination
    staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
  });
};

// Get order by ID hook (Using Supabase)
export const useOrderById = (id, options = {}) => {
  // console.log(`Using Supabase order data for ID: ${id} in useOrderById hook`);
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders') // Assuming table name is 'orders'
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create order hook (Using Supabase)
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      // console.log('Supabase Creating order:', orderData);
      // Ensure required fields like patientId, etc., are present in orderData
      const { data, error } = await supabase
        .from('orders') // Assuming table name is 'orders'
        .insert([{ ...orderData, status: 'pending', orderDate: new Date().toISOString() }]) // Set defaults
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Order created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating order: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update order hook (Using Supabase)
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...orderData }) => {
      // console.log(`Supabase Updating order ${id}:`, orderData);
      const { data, error } = await supabase
        .from('orders') // Assuming table name is 'orders'
        .update(orderData)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Order updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating order: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update order status hook (Using Supabase - simplified, might need dedicated function/policy)
export const useUpdateOrderStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      // console.log(`Supabase Updating order ${orderId} status to: ${status}`);
      // This uses a standard update. Consider if a specific function or RLS policy is better.
      const { data, error } = await supabase
        .from('orders') // Assuming table name is 'orders'
        .update({ status: status })
        .eq('id', orderId)
        .select(); // Select to confirm update
      if (error) throw error;
      return data?.[0]; // Return updated order
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.orderId) });
      toast.success(`Order status updated to ${variables.status}`);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating order status: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete order hook (Using Supabase)
export const useDeleteOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      // console.log(`Supabase Deleting order ${id}`);
      const { error } = await supabase
        .from('orders') // Assuming table name is 'orders'
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Order deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting order: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook for adding/removing tags might require specific Supabase functions or complex updates
// depending on how tags are stored (e.g., JSONB array, separate join table).
// The mock implementation is removed as it's highly dependent on the DB schema.

// export const useAddOrderTag = ... (Removed - Implement based on DB schema)
// export const useRemoveOrderTag = ... (Removed - Implement based on DB schema)
