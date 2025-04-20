import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, supabaseHelper } from '../../lib/supabase'; // Use the correct Supabase client
// Removed unused auditLogService import

// Get orders hook using Supabase
export const useOrders = (currentPage = 1, filters = {}, pageSize = 10) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['orders', currentPage, filters, pageSize],
    queryFn: async () => {
      const select = `
        *,
        patients!inner(id, first_name, last_name)
      `; // Join with patients table (assuming FK is patient_id)

      const queryFilters = [];
      // Apply filters (adjust column names based on schema.sql)
      if (filters.status) {
        queryFilters.push({ column: 'status', operator: 'eq', value: filters.status });
      }
      if (filters.patientId) {
        queryFilters.push({ column: 'patient_id', operator: 'eq', value: filters.patientId }); // Corrected FK name
      }
      // Add search filter if needed (adjust based on actual schema and join)
      if (filters.search) {
        // Note: supabaseHelper.fetch does not directly support .or() with joined tables.
        // For complex queries like this, you might need to use the direct supabase client
        // or handle filtering client-side after fetching.
        // For now, we'll omit the search filter when using the helper.
        console.warn("Search filter is not supported by supabaseHelper.fetch for this query structure.");
      }

      const { data, error, count } = await supabaseHelper.fetch('orders', {
        select,
        filters: queryFilters,
        order: { column: 'order_date', ascending: false },
        limit: pageSize,
        range: { from: rangeFrom, to: rangeTo },
        count: 'exact'
      });

      if (error) {
        console.error('Error fetching orders:', error);
        throw new Error(error.message);
      }

      // Map data to include patientName from joined table
      const mappedData =
        data?.map((order) => ({
          ...order,
          // Construct patientName from the joined 'patients' data
          patientName: order.patients
            ? `${order.patients.first_name || ''} ${order.patients.last_name || ''}`.trim()
            : 'N/A',
          // Ensure patientId is correctly mapped (assuming FK is patient_id)
          patientId: order.patient_id
        })) || [];

      return {
        data: mappedData,
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    // staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
  });
};

// Add real-time subscriptions for orders
export const useOrdersSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabaseHelper.subscribe('orders', (payload) => {
      console.log('Order change received:', payload);
      // Invalidate the orders query to refetch data when changes occur
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    // Cleanup the subscription on component unmount
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [queryClient]); // Re-run effect if queryClient changes (rare)
};

// Get order by ID hook using Supabase
export const useOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;

      const filters = [{ column: 'id', operator: 'eq', value: id }];

      const { data, error } = await supabaseHelper.fetch('orders', {
        select: '*', // Select without join
        filters,
        single: true,
      });

      if (error) {
        console.error(`Error fetching order ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      // Map data without relying on the join
      const mappedData = data
        ? {
            ...data,
            patientName: 'N/A', // We'll need to fetch patient name separately
          }
        : null;

      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to fetch orders for a specific patient
export const useMyOrders = (patientId, options = {}) => {
  return useQuery({
    queryKey: ['orders', 'patient', patientId], // Specific query key for patient orders
    queryFn: async () => {
      if (!patientId) return []; // Return empty if no patientId

      const filters = [{ column: 'patient_id', operator: 'eq', value: patientId }]; // Corrected FK name

      const { data, error } = await supabaseHelper.fetch('orders', {
        select: '*',
        filters,
        order: { column: 'order_date', ascending: false },
      });

      if (error) {
        console.error(`Error fetching orders for patient ${patientId}:`, error);
        throw new Error(error.message);
      }
      // No complex mapping needed here for now, just return the data
      return data || [];
    },
    enabled: !!patientId, // Only run query if patientId is truthy
    ...options,
  });
};


// Create order hook using Supabase
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const dataToInsert = {
        ...orderData,
        order_date: orderData.order_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
      };

      const { data, error } = await supabaseHelper.insert('orders', dataToInsert, { returning: 'single' });

      if (error) {
        console.error('Error creating order:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      console.error('Create order mutation error:', error);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update order hook using Supabase
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, orderData }) => {
      if (!id) throw new Error('Order ID is required for update.');

      const dataToUpdate = {
        ...orderData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseHelper.update('orders', id, dataToUpdate);

      if (error) {
        console.error(`Error updating order ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      console.error(`Update order ${variables.id} mutation error:`, error);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update order status hook using Supabase
export const useUpdateOrderStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      if (!orderId) throw new Error('Order ID is required for status update.');

      const dataToUpdate = { status: status, updated_at: new Date().toISOString() };

      const { data, error } = await supabaseHelper.update('orders', orderId, dataToUpdate);

      if (error) {
        console.error(`Error updating order status ${orderId}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      console.error(
        `Update order status ${variables.orderId} mutation error:`,
        error
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete order hook using Supabase (Soft Delete)
export const useDeleteOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Order ID is required for deletion.');

      const dataToUpdate = { is_deleted: true, deleted_at: new Date().toISOString() };

      const { data, error } = await supabaseHelper.update('orders', id, dataToUpdate);

      if (error) {
        console.error(`Error 'deleting' order ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['order', variables] });
      options.onSuccess?.(data, variables, context);
    }, // Comma added
    onError: (error, variables, context) => {
      console.error(`Delete order ${variables} mutation error:`, error);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// --- Tag Hooks Removed ---
