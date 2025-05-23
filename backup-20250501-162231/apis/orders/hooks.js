import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { executeBatchedQueries } from '../../utils/supabase/batchedQueries';

// Get orders hook using Supabase
export const useOrders = (currentPage = 1, filters = {}, pageSize = 10) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['orders', currentPage, filters, pageSize],
    queryFn: async () => {
      // Create query for orders
      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          patients!inner(id, first_name, last_name),
          pharmacies:pharmacy_id(id, name)
        `, { count: 'exact' })
        .order('order_date', { ascending: false })
        .range(rangeFrom, rangeTo);

      // Apply filters
      if (filters.status) {
        ordersQuery = ordersQuery.eq('status', filters.status);
      }
      if (filters.patientId) {
        ordersQuery = ordersQuery.eq('patient_id', filters.patientId);
      }
      if (filters.search) {
        ordersQuery = ordersQuery.or(
          `patients.first_name.ilike.%${filters.search}%,patients.last_name.ilike.%${filters.search}%`
        );
      }

      // Get orders data
      const { data: ordersData, error: ordersError, count } = await ordersQuery;

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw new Error(ordersError.message);
      }

      // If we have orders, get their order items using batched queries
      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map(order => order.id);
        
        // Use batched queries to get order items in a single network request
        const { orderItems } = await executeBatchedQueries([
          {
            key: 'orderItems',
            query: () => supabase
              .from('order_items')
              .select(`
                *,
                products:product_id(id, name, description)
              `)
              .in('order_id', orderIds)
          }
        ]);

        if (orderItems.error) {
          console.error('Error fetching order items:', orderItems.error);
        } else {
          // Group order items by order_id
          const orderItemsByOrder = (orderItems.data || []).reduce((acc, item) => {
            acc[item.order_id] = acc[item.order_id] || [];
            acc[item.order_id].push(item);
            return acc;
          }, {});

          // Add order items to their respective orders
          ordersData.forEach(order => {
            const items = orderItemsByOrder[order.id] || [];
            order.orderItems = items;
            
            // Add medication information based on order items
            if (items.length > 0 && items[0].products) {
              order.medication = items[0].products.name;
            } else if (items.length > 0) {
              order.medication = items[0].description || 'Unknown Medication';
            }
            
            // Add pharmacy name from the joined pharmacy data
            if (order.pharmacies) {
              order.pharmacy = order.pharmacies.name;
            }
          });
        }
      }

      const mappedData = ordersData?.map((order) => ({
        ...order,
        patientName: order.patients 
          ? `${order.patients.first_name || ''} ${order.patients.last_name || ''}`.trim()
          : 'N/A',
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
  });
};

// Get order by ID hook using Supabase with enhanced batched queries
export const useOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;

      // Use batched queries to fetch order and order items in parallel
      const results = await executeBatchedQueries([
        {
          key: 'order',
          query: () => supabase
            .from('orders')
            .select(`
              *,
              patients!patient_id(id, first_name, last_name)
            `)
            .eq('id', id)
            .single()
        },
        {
          key: 'orderItems',
          query: () => supabase
            .from('order_items')
            .select(`
              *,
              products:product_id(id, name, description)
            `)
            .eq('order_id', id)
        }
      ]);

      // Handle errors
      if (results.order.error) {
        console.error(`Error fetching order ${id}:`, results.order.error);
        if (results.order.error.code === 'PGRST116') return null;
        throw new Error(results.order.error.message);
      }

      // Combine the results
      const order = results.order.data;
      const orderItems = results.orderItems.data || [];

      if (!order) return null;

      return {
        ...order,
        orderItems,
        patientName: order.patients 
          ? `${order.patients.first_name || ''} ${order.patients.last_name || ''}`.trim()
          : 'N/A'
      };
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to fetch orders for a specific patient
export const useMyOrders = (patientId, options = {}) => {
  return useQuery({
    queryKey: ['orders', 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('orders') 
        .select('*') 
        .eq('patient_id', patientId)
        .order('order_date', { ascending: false });

      if (error) {
        console.error(`Error fetching orders for patient ${patientId}:`, error);
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!patientId,
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
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Create order mutation error:', error);
      toast.error(`Error creating order: ${error.message}`);
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

      const { data, error } = await supabase
        .from('orders')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating order ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      toast.success('Order updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Update order ${variables.id} mutation error:`, error);
      toast.error(`Error updating order: ${error.message}`);
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

      const { data, error } = await supabase
        .from('orders')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating order status ${orderId}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Order status updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Update order status ${variables.orderId} mutation error:`, error);
      toast.error(`Error updating order status: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete order hook using Supabase (Hard Delete)
export const useDeleteOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Order ID is required for deletion.');

      // Changed from update to delete since is_deleted column doesn't exist
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting order ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['order', variables] });
      toast.success('Order deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Delete order ${variables} mutation error:`, error);
      toast.error(`Error deleting order: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Create order item hook using Supabase
export const useCreateOrderItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderItemData) => {
      // Remove created_at field since it doesn't exist in the schema
      const dataToInsert = {
        ...orderItemData
      };

      const { data, error } = await supabase
        .from('order_items')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating order item:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.order_id] });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Create order item mutation error:', error);
      toast.error(`Error creating order item: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
