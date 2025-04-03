import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  sendInvoice,
} from './api';

// Hook to fetch all invoices
export const useInvoices = (params = {}) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => getInvoices(params),
  });
};

// Hook to fetch a specific invoice by ID
export const useInvoiceById = (id, options = {}) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new invoice
export const useCreateInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceData) => createInvoice(invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to update an existing invoice
export const useUpdateInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceData }) => updateInvoice(id, invoiceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to delete an invoice
export const useDeleteInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to mark invoice as paid
export const useMarkInvoiceAsPaid = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markInvoiceAsPaid(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};

// Hook to send invoice to customer
export const useSendInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => sendInvoice(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables] });
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      options.onError && options.onError(error);
    },
  });
};
