import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// Mock Data
const mockOrders = [
  {
    id: 'order-001',
    patient_id: '1',
    status: 'completed',
    medication: 'Amoxicillin 500mg',
    pharmacy: 'CVS Pharmacy',
    order_date: '2025-04-10T09:30:00Z',
    created_at: '2025-04-10T09:30:00Z',
    updated_at: '2025-04-10T09:30:00Z',
    patients: {
      id: '1',
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: 'order-002',
    patient_id: '2',
    status: 'pending',
    medication: 'Lisinopril 10mg',
    pharmacy: 'Walgreens',
    order_date: '2025-04-15T14:00:00Z',
    created_at: '2025-04-15T14:00:00Z',
    updated_at: '2025-04-15T14:00:00Z',
    patients: {
      id: '2',
      first_name: 'Jane',
      last_name: 'Smith'
    }
  },
  {
    id: 'order-003',
    patient_id: '3',
    status: 'cancelled',
    medication: 'Metformin 1000mg',
    pharmacy: 'Rite Aid',
    order_date: '2025-04-05T11:15:00Z',
    created_at: '2025-04-05T11:15:00Z',
    updated_at: '2025-04-05T11:15:00Z',
    patients: {
      id: '3',
      first_name: 'Robert',
      last_name: 'Johnson'
    }
  }
];

// Get orders hook using Supabase
export const useOrders = (currentPage = 1, filters = {}, pageSize = 10) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: ['orders', currentPage, filters, pageSize],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        // Return mock data in development
        let filteredOrders = [...mockOrders];
        
        if (filters.status) {
          filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }
        if (filters.patientId) {
          filteredOrders = filteredOrders.filter(order => order.patient_id === filters.patientId);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredOrders = filteredOrders.filter(order => 
            order.medication?.toLowerCase().includes(searchLower) ||
            order.pharmacy?.toLowerCase().includes(searchLower) ||
            order.patients?.first_name?.toLowerCase().includes(searchLower) ||
            order.patients?.last_name?.toLowerCase().includes(searchLower)
          );
        }

        const paginatedOrders = filteredOrders.slice(rangeFrom, rangeTo + 1);
        
        return {
          data: paginatedOrders.map(order => ({
            ...order,
            patientName: order.patients ? `${order.patients.first_name || ''} ${order.patients.last_name || ''}`.trim() : 'N/A'
          })),
          meta: {
            total: filteredOrders.length,
            per_page: pageSize,
            current_page: currentPage,
            last_page: Math.ceil(filteredOrders.length / pageSize),
          },
        };
      }

      let query = supabase
        .from('orders') // Use quoted table name if needed, or adjust if different
        // Join with patients table (assuming FK is patient_id)
        .select(`
          *,
          patients!inner(id, first_name, last_name)
        `, { count: 'exact' })
        .order('order_date', { ascending: false })
        .range(rangeFrom, rangeTo);

      // Apply filters (adjust column names based on schema.sql)
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId); // Corrected FK name
      }
      // Add search filter if needed (adjust based on actual schema and join)
      if (filters.search) {
        // Use the joined table alias 'patients' for patient name fields
        query = query.or(
          `medication.ilike.%${filters.search}%,pharmacy.ilike.%${filters.search}%,patients.first_name.ilike.%${filters.search}%,patients.last_name.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

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

// Get order by ID hook using Supabase
export const useOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;

      if (process.env.NODE_ENV === 'development') {
        // Return mock order in development
        const order = mockOrders.find(o => o.id === id);
        if (!order) return null;
        
        return {
          ...order,
          patientName: order.patients ? `${order.patients.first_name || ''} ${order.patients.last_name || ''}`.trim() : 'N/A'
        };
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*') // Select without join
        .eq('id', id)
        .single();

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
      if (!patientId) return [];

      if (process.env.NODE_ENV === 'development') {
        // Return mock orders in development
        return mockOrders
          .filter(order => order.patient_id === patientId)
          .map(order => ({
            ...order,
            patientName: order.patients ? `${order.patients.first_name || ''} ${order.patients.last_name || ''}`.trim() : 'N/A'
          }));
      }

      const { data, error } = await supabase
        .from('orders') 
        .select('*') 
        .eq('patient_id', patientId) // Corrected FK name
        .order('order_date', { ascending: false }); 

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
