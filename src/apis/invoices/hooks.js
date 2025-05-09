import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchInvoices, 
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from './api';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['invoices'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

export const useInvoices = (params = {}) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      try {
        const data = await fetchInvoices();
        
        // Process the data to ensure patient names are properly displayed
        const processedData = data.map(invoice => {
          // Add a patientName field for easier access in the UI
          // Set default values for amount and amount_paid to prevent NaN
          const amount = typeof invoice.invoice_amount === 'number' ? invoice.invoice_amount : 0;
          const amountPaid = typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0;
          
          return {
            ...invoice,
            patientName: invoice.pb_invoice_metadata?.patient_name || 'Unknown',
            amount: amount,
            amount_paid: amountPaid
          };
        });
        
        return { data: processedData };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 10000 // Consider data stale after 10 seconds
  });
};

export const useInvoiceById = (id) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      try {
        const invoice = await fetchInvoiceById(id);
        
        // Process the data to ensure patient names are properly displayed
        if (invoice) {
          // Add a patientName field for easier access in the UI
          // Set default values for amount and amount_paid to prevent NaN
          const amount = typeof invoice.invoice_amount === 'number' ? invoice.invoice_amount : 0;
          const amountPaid = typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0;
          
          return {
            data: {
              ...invoice,
              patientName: invoice.pb_invoice_metadata?.patient_name || 'Unknown',
              amount: amount,
              amount_paid: amountPaid
            }
          };
        }
        return { data: null };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceData) => {
      try {
        return await createInvoice(invoiceData);
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch the invoice list
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Invoice created successfully!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Failed to create invoice: ${error.message}`);
      options.onError?.(error, variables, context);
    }
  });
};

export const useUpdateInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      try {
        return await updateInvoice(id, updates);
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Invoice updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Failed to update invoice: ${error.message}`);
      options.onError?.(error, variables, context);
    }
  });
};

export const useDeleteInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        await deleteInvoice(id);
        return { id };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Invoice deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
      options.onError?.(error, variables, context);
    }
  });
};
