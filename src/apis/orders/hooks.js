import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
// Removed unused auditLogService import

// Get orders hook using Supabase
export const useOrders = (currentPage = 1, filters = {}, pageSize = 10) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['orders', currentPage, filters, pageSize],
    queryFn: async () => {
      console.warn("Temporarily skipping orders fetch due to 'relation public.orders does not exist' error."); // Added warning
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
      let query = supabase
        .from('orders') // Use quoted table name if needed, or adjust if different
        // REMOVED join with patients table due to relationship errors
        .select(`*, client_record_id`, { count: 'exact' }) // Select all columns + FK explicitly
        .order('order_date', { ascending: false })
        .range(rangeFrom, rangeTo);

      // Apply filters (adjust column names based on schema.sql)
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.patientId) {
        query = query.eq('client_record_id', filters.patientId);
      }
      // Add search filter if needed (adjust based on actual schema and join)
      if (filters.search) {
        // Use the joined table alias 'patients' for patient name fields
        query = query.or(
          `medication.ilike.%${filters.search}%,pharmacy.ilike.%${filters.search}%,patients.first_name.ilike.%${filters.search}%,patients.last_name.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;
      console.log('Raw orders data:', data, 'Count:', count); // DEBUG LOG

      if (error) {
        console.error('Error fetching orders:', error);
        throw new Error(error.message);
      }

      // Map data (patientName will need separate fetching in UI)
      const mappedData =
        data?.map((order) => ({
          ...order,
          patientName: 'N/A', // Remove reliance on join
          // Ensure patientId is correctly mapped if the foreign key is different
          patientId: order.client_record_id || order.patient_id // Adjust based on actual FK column name
        })) || [];
      */

      // Return empty data structure to avoid breaking components
      return {
        data: [],
        meta: {
          total: 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: 1,
        },
      };
    },
    // staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
  });
};

// Get order by ID hook using Supabase
export const useOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      console.warn(`Temporarily skipping order fetch for ID ${id} due to 'relation public.orders does not exist' error.`); // Added warning
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
      const { data, error } = await supabase
        .from('orders')
        .select('*') // Select without join
        .eq('id', id)
        .single();
      console.log('Raw order by ID data:', data); // DEBUG LOG

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
      */
      return null; // Return null to indicate data couldn't be fetched
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
      console.warn(`Temporarily skipping orders fetch for patient ${patientId} due to 'relation public.orders does not exist' error.`); // Added warning
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
      const { data, error } = await supabase
        .from('orders') // Use the correct table name 'orders'
        .select('*') // Select all columns for now
        .eq('client_record_id', patientId) // Filter by patient ID (assuming column name)
        .order('order_date', { ascending: false }); // Order by date
      console.log('Raw my orders data:', data); // DEBUG LOG

      if (error) {
        console.error(`Error fetching orders for patient ${patientId}:`, error);
        throw new Error(error.message);
      }
      // No complex mapping needed here for now, just return the data
      return data || [];
      */
      return []; // Return empty array
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
      console.warn("Temporarily disabling order creation due to 'relation public.orders does not exist' error."); // Added warning
      throw new Error("Order creation is temporarily disabled due to a database schema issue."); // Prevent execution
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
      const dataToInsert = {
        ...orderData,
        order_date: orderData.order_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
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
      */
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
      console.warn(`Temporarily disabling order update for ID ${id} due to 'relation public.orders does not exist' error.`); // Added warning
      throw new Error("Order update is temporarily disabled due to a database schema issue."); // Prevent execution
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
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
      */
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
      console.warn(`Temporarily disabling order status update for ID ${orderId} due to 'relation public.orders does not exist' error.`); // Added warning
      throw new Error("Order status update is temporarily disabled due to a database schema issue."); // Prevent execution
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
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
      */
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
      console.warn(`Temporarily disabling order deletion for ID ${id} due to 'relation public.orders does not exist' error.`); // Added warning
      throw new Error("Order deletion is temporarily disabled due to a database schema issue."); // Prevent execution
      /*
      // Temporarily commented out due to "relation public.orders does not exist" error
      // Removed unused 'data' from destructuring
      const { error } = await supabase
        .from('orders')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error 'deleting' order ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
      */
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
