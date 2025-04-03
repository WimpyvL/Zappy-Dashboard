import { request } from '../../utils2/api';

// Get all invoices
export const getInvoices = async (params) => {
  const data = await request({
    url: '/api/v1/admin/invoices',
    method: 'GET',
    params
  });
  return data;
};

// Get a specific invoice by ID
export const getInvoiceById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/invoices/${id}`,
    method: 'GET'
  });
  return data;
};

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  const data = await request({
    url: '/api/v1/admin/invoices',
    method: 'POST',
    data: { invoice: invoiceData }
  });
  return data;
};

// Update an existing invoice
export const updateInvoice = async (id, invoiceData) => {
  const data = await request({
    url: `/api/v1/admin/invoices/${id}`,
    method: 'PUT',
    data: { invoice: invoiceData }
  });
  return data;
};

// Delete an invoice
export const deleteInvoice = async (id) => {
  const data = await request({
    url: `/api/v1/admin/invoices/${id}`,
    method: 'DELETE'
  });
  return data;
};

// Mark invoice as paid
export const markInvoiceAsPaid = async (id) => {
  const data = await request({
    url: `/api/v1/admin/invoices/${id}/mark_as_paid`,
    method: 'PUT'
  });
  return data;
};

// Send invoice to customer
export const sendInvoice = async (id) => {
  const data = await request({
    url: `/api/v1/admin/invoices/${id}/send`,
    method: 'POST'
  });
  return data;
};