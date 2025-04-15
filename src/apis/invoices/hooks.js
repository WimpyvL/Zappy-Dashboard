import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  sendInvoice
} from './api';
import { toast } from 'react-toastify'; // Assuming toast notifications

// Hook to fetch all invoices
export const useInvoices = (currentPage = 1, filters = {}) => {
  return useQuery({
    queryKey: ['invoices', currentPage, filters],
    queryFn: () => getInvoices(currentPage, filters),
    keepPreviousData: true,
  });
};

// Hook to fetch a specific invoice by ID
export const useInvoiceById = (id, options = {}) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
    ...options
  });
};

// Hook to create a new invoice
export const useCreateInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceData) => createInvoice(invoiceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error creating invoice: ${error.message}`);
      options.onError && options.onError(error);
    }
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
      toast.success('Invoice updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error updating invoice: ${error.message}`);
      options.onError && options.onError(error);
    }
  });
};

// Hook to delete an invoice
export const useDeleteInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteInvoice(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.removeQueries({ queryKey: ['invoice', variables] }); // Remove specific invoice query
      toast.success('Invoice deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error deleting invoice: ${error.message}`);
      options.onError && options.onError(error);
    }
  });
};

// Hook to mark invoice as paid
export const useMarkInvoiceAsPaid = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Allow passing optional amountPaid
    mutationFn: ({ id, amountPaid }) => markInvoiceAsPaid(id, amountPaid),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] }); // Use variables.id
      toast.success('Invoice marked as paid.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error marking invoice as paid: ${error.message}`);
      options.onError && options.onError(error);
    }
  });
};

// Hook to send invoice (marks as sent)
export const useSendInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => sendInvoice(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables] }); // variables is the id here
      toast.info('Invoice marked as sent. Actual sending requires backend implementation.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error marking invoice as sent: ${error.message}`);
      options.onError && options.onError(error);
    }
  });
};
