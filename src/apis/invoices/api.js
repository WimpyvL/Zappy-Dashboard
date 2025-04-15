// services/invoiceService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 10; // Pagination

// Get all invoices
export const getInvoices = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('invoices')
    .select(`
      *,
      patient:patients(id, first_name, last_name)
    `, { count: 'exact' }) // Join patient name
    .range(start, end);

  // Apply filters
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.invoiceNumber) {
    query = query.ilike('invoice_number', `%${filters.invoiceNumber}%`);
  }
  // Add date range filters if needed (e.g., issue_date)

  query = query.order('issue_date', { ascending: false }); // Sort by issue date

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }

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

// Get a specific invoice by ID
export const getInvoiceById = async (id) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      patient:patients(id, first_name, last_name, email),
      order:orders(id, order_number)
    `) // Join patient and order details
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching invoice with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  // Ensure patient_id is present, generate invoice_number if needed
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
  return data;
};

// Update an existing invoice
export const updateInvoice = async (id, invoiceData) => {
  const { id: _, ...updateData } = invoiceData;
  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating invoice with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete an invoice
export const deleteInvoice = async (id) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting invoice with id ${id}:`, error);
    throw error;
  }
  return { success: true, id: id };
};

// Mark invoice as paid (updates status and amount_paid)
export const markInvoiceAsPaid = async (id, amountPaid = null) => {
    // Fetch the invoice first to get the total amount if amountPaid is not provided
    let totalAmount = amountPaid;
    if (totalAmount === null) {
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('total_amount')
            .eq('id', id)
            .single();
        if (fetchError || !invoice) {
            console.error(`Error fetching invoice ${id} to mark as paid:`, fetchError);
            throw fetchError || new Error('Invoice not found');
        }
        totalAmount = invoice.total_amount;
    }

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'paid', amount_paid: totalAmount })
    .eq('id', id)
    .select('id, status, amount_paid')
    .single();

  if (error) {
    console.error(`Error marking invoice ${id} as paid:`, error);
    throw error;
  }
  return data;
};

// Send invoice (updates status, actual sending needs external implementation)
export const sendInvoice = async (id) => {
  // 1. Update invoice status to 'sent'
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'sent' })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) {
    console.error(`Error updating invoice ${id} status to sent:`, error);
    throw error;
  }

  // 2. TODO: Implement actual sending logic (e.g., trigger email via Supabase Edge Function)
  console.warn(`Invoice ${id} marked as sent. Implement actual sending logic (e.g., Edge Function).`);

  return data; // Return updated status info
};
