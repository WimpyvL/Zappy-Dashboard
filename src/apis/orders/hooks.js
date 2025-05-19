import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Mock data for orders
const mockOrders = [
  {
    id: 'ord1',
    patient_id: 'p1',
    status: 'pending_review',
    items: [
      {
        id: 'item1',
        product_id: 'semaglutide_product',
        product_name: 'Semaglutide (Wegovy)',
        quantity: 1,
        price: 299.99,
        dosage: '0.25mg',
        frequency: 'weekly'
      }
    ],
    total: 299.99,
    created_at: '2025-05-15T14:35:00Z',
    updated_at: '2025-05-15T14:35:00Z',
    form_submission_id: 'fs1',
    shipping_address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    },
    payment_method_id: 'pm_1',
    prescription: {
      status: 'pending',
      provider_id: null,
      approved_at: null,
      notes: null
    }
  },
  {
    id: 'ord2',
    patient_id: 'p2',
    status: 'approved',
    items: [
      {
        id: 'item2',
        product_id: 'sildenafil_product',
        product_name: 'Sildenafil (Viagra)',
        quantity: 1,
        price: 129.99,
        dosage: '50mg',
        frequency: 'as needed'
      }
    ],
    total: 129.99,
    created_at: '2025-05-16T10:20:00Z',
    updated_at: '2025-05-16T15:45:00Z',
    form_submission_id: 'fs2',
    shipping_address: {
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103'
    },
    payment_method_id: 'pm_2',
    prescription: {
      status: 'approved',
      provider_id: 'prov1',
      approved_at: '2025-05-16T15:45:00Z',
      notes: 'Approved for 3 month supply'
    }
  },
  {
    id: 'ord3',
    patient_id: 'p3',
    status: 'shipped',
    items: [
      {
        id: 'item3',
        product_id: 'finasteride_product',
        product_name: 'Finasteride',
        quantity: 1,
        price: 79.99,
        dosage: '1mg',
        frequency: 'daily'
      }
    ],
    total: 79.99,
    created_at: '2025-05-17T16:50:00Z',
    updated_at: '2025-05-18T09:30:00Z',
    form_submission_id: 'fs3',
    shipping_address: {
      street: '789 Howard St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107'
    },
    payment_method_id: 'pm_3',
    prescription: {
      status: 'approved',
      provider_id: 'prov2',
      approved_at: '2025-05-18T09:00:00Z',
      notes: 'Approved for 3 month supply'
    },
    shipping: {
      carrier: 'USPS',
      tracking_number: '9400123456789012345678',
      shipped_at: '2025-05-18T09:30:00Z',
      estimated_delivery: '2025-05-21'
    }
  }
];

// Fetch all orders (for admin)
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockOrders;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  });
};

// Fetch all orders for a patient
export const usePatientOrders = (patientId) => {
  return useQuery({
    queryKey: ['orders', patientId],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter orders for this patient
      return mockOrders.filter(order => 
        order.patient_id === patientId
      );
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load patient orders');
    }
  });
};

// Fetch a single order by ID
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const order = mockOrders.find(order => order.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    }
  });
};

// Alias for useOrder for backward compatibility
export const useOrderById = (orderId) => useOrder(orderId);

// Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a new order ID
      const newOrder = {
        id: `ord${Date.now()}`,
        patient_id: orderData.patientId,
        status: 'pending_review',
        items: orderData.items.map((item, index) => ({
          id: `item${Date.now()}_${index}`,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          dosage: item.dosage,
          frequency: item.frequency
        })),
        total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        form_submission_id: orderData.formSubmissionId,
        shipping_address: orderData.shippingAddress,
        payment_method_id: orderData.paymentMethodId,
        prescription: {
          status: 'pending',
          provider_id: null,
          approved_at: null,
          notes: null
        }
      };
      
      // In a real implementation, this would be saved to the database
      mockOrders.push(newOrder);
      
      return newOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders', data.patient_id]);
      toast.success('Order placed successfully');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
    }
  });
};

// Create a new order item
export const useCreateOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, itemData }) => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      // Generate a new item ID
      const newItem = {
        id: `item${Date.now()}`,
        product_id: itemData.productId,
        product_name: itemData.productName,
        quantity: itemData.quantity,
        price: itemData.price,
        dosage: itemData.dosage,
        frequency: itemData.frequency
      };
      
      // Update the order with the new item
      const updatedOrder = {
        ...mockOrders[orderIndex],
        items: [...mockOrders[orderIndex].items, newItem],
        total: mockOrders[orderIndex].total + (itemData.price * itemData.quantity),
        updated_at: new Date().toISOString()
      };
      
      // In a real implementation, this would update the database
      mockOrders[orderIndex] = updatedOrder;
      
      return { order: updatedOrder, item: newItem };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['order', data.order.id]);
      queryClient.invalidateQueries(['orders', data.order.patient_id]);
      toast.success('Item added to order');
    },
    onError: (error) => {
      console.error('Error adding item to order:', error);
      toast.error('Failed to add item to order');
    }
  });
};

// Update an order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, updates }) => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      // Update the order
      const updatedOrder = {
        ...mockOrders[orderIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // In a real implementation, this would update the database
      mockOrders[orderIndex] = updatedOrder;
      
      return updatedOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['order', data.id]);
      queryClient.invalidateQueries(['orders', data.patient_id]);
      toast.success('Order updated successfully');
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      // Update the order status
      const updatedOrder = {
        ...mockOrders[orderIndex],
        status,
        updated_at: new Date().toISOString()
      };
      
      // In a real implementation, this would update the database
      mockOrders[orderIndex] = updatedOrder;
      
      return updatedOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['order', data.id]);
      queryClient.invalidateQueries(['orders', data.patient_id]);
      toast.success(`Order status updated to ${data.status}`);
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  });
};

// Cancel an order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId) => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      // Update the order status
      const updatedOrder = {
        ...mockOrders[orderIndex],
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };
      
      // In a real implementation, this would update the database
      mockOrders[orderIndex] = updatedOrder;
      
      return updatedOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['order', data.id]);
      queryClient.invalidateQueries(['orders', data.patient_id]);
      toast.success('Order cancelled successfully');
    },
    onError: (error) => {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  });
};
