// services/orderService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Define items per page for pagination

export const getOrders = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0; // Supabase range is 0-indexed
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  // Start building the query, selecting all columns and requesting count
  // Consider joining related data like patient name if needed:
  // .select('*, patients(id, first_name, last_name)', { count: 'exact' })
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .range(start, end);

  // Apply filters (expand based on actual needs)
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.orderNumber) {
    query = query.ilike('order_number', `%${filters.orderNumber}%`);
  }
  // Add more filters as needed

  // Apply sorting (example: sort by created_at descending)
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  // Return data and pagination info
  return {
    data,
    pagination: {
      currentPage: currentPage,
      totalPages: Math.ceil(count / ITEMS_PER_PAGE),
      totalCount: count,
      itemsPerPage: ITEMS_PER_PAGE
    },
  };
};

export const getOrderById = async (id) => {
  // Consider joining related data if needed on the detail view
  // .select('*, patients(*), order_items(*)')
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      console.warn(`Order with id ${id} not found.`);
      return null;
    }
    console.error(`Error fetching order with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const createOrder = async (orderData) => {
  // Ensure user_id and patient_id are included if required by RLS/schema
  // Add logic to generate order_number if not provided
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  return data;
};

export const updateOrder = async (id, orderData) => {
  const { id: _, ...updateData } = orderData; // Exclude id from update payload
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating order with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Specific function to update only the status
export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select('id, status') // Select only relevant fields
    .single();

  if (error) {
    console.error(`Error updating status for order with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const deleteOrder = async (id) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting order with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};
