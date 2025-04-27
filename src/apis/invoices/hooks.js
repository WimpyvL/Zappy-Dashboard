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
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      try {
        const data = await fetchInvoices();
        return { data };
      } catch (error) {
        throw new Error(error.message);
      }
    }
  });
};

export const useInvoiceById = (id) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      try {
        return await fetchInvoiceById(id);
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
