import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseHelper } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['invoices'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Hook to fetch all invoices using Supabase
export const useInvoices = (params = {}, pageSize = 10) => {
  const currentPage = params.page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: async () => {
      const select = `
        *,
        patients ( id, first_name, last_name )
      `;

      const filters = [];
      // Apply filters
      if (params.status) {
        filters.push({ column: 'status', operator: 'eq', value: params.status });
      }
      if (params.patientId) {
         filters.push({ column: 'patient_id', operator: 'eq', value: params.patientId }); // Corrected FK name
      }
      // Add date range filters if needed
      // if (params.startDate) { filters.push({ column: 'date_created', operator: 'gte', value: params.startDate }); }
      // if (params.endDate) { filters.push({ column: 'date_created', operator: 'lte', value: params.endDate }); }

      const { data, error, count } = await supabaseHelper.fetch('pb_invoices', {
        select,
        filters,
        order: { column: 'created_at', ascending: false },
        limit: pageSize,
        range: { from: rangeFrom, to: rangeTo },
        count: 'exact'
      });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw new Error(error.message);
      }

      // Map data if needed
      const mappedData = data?.map(inv => ({
          ...inv,
          patientName: inv.patients ? `${inv.patients.first_name || ''} ${inv.patients.last_name || ''}`.trim() : 'N/A',
          amount: inv.pb_invoice_metadata?.total || 0,
          items: inv.pb_invoice_metadata?.items || [],
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
    keepPreviousData: true,
  });
};

// Hook to fetch a specific invoice by ID using Supabase
export const useInvoiceById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const select = `
        *,
        patients ( id, first_name, last_name )
      `;

      const filters = [{ column: 'id', operator: 'eq', value: id }];

      const { data, error } = await supabaseHelper.fetch('pb_invoices', {
        select,
        filters,
        single: true,
      });

      if (error) {
        console.error(`Error fetching invoice ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data ? {
           ...data,
           patientName: data.patients ? `${data.patients.first_name || ''} ${data.patients.last_name || ''}`.trim() : 'N/A',
           amount: data.pb_invoice_metadata?.total || 0,
           items: data.pb_invoice_metadata?.items || [],
       } : null;

      return mappedData; // Return mapped data
    },
    enabled: !!id,
    ...options,
  });
};

// Hook to create a new invoice using Supabase
export const useCreateInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceData) => {
      // Map frontend fields to DB columns
      const dataToInsert = {
        patient_id: invoiceData.patientId, // Corrected FK name
        status: invoiceData.status || 'pending',
        pb_invoice_metadata: {
            items: invoiceData.items || [],
            total: invoiceData.amount || 0,
            // Add other relevant metadata
        },
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        refunded: false,
        refunded_amount: 0,
        // Add other required fields from schema
      };

      const { data, error } = await supabaseHelper.insert('pb_invoices', dataToInsert, { returning: 'single' });

      if (error) {
        console.error('Error creating invoice:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Invoice created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating invoice: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to update an existing invoice using Supabase
export const useUpdateInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, invoiceData }) => {
      if (!id) throw new Error("Invoice ID is required for update.");

      const dataToUpdate = {
         patient_id: invoiceData.patientId, // Corrected FK name (Allow changing patient? Maybe not.)
         status: invoiceData.status,
         pb_invoice_metadata: {
             items: invoiceData.items,
             total: invoiceData.amount,
             // Add other relevant metadata
         },
         date_modified: new Date().toISOString(),
         updated_at: new Date().toISOString(),
         // Add other updatable fields from schema
      };
       // Remove fields that shouldn't be updated directly
       delete dataToUpdate.id;
       delete dataToUpdate.created_at;
       delete dataToUpdate.date_created;
       delete dataToUpdate.pb_invoice_id; // Assuming this is external ID

      const { data, error } = await supabaseHelper.update('pb_invoices', id, dataToUpdate);

      if (error) {
        console.error(`Error updating invoice ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Invoice updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating invoice: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to delete an invoice using Supabase
export const useDeleteInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Invoice ID is required for deletion.");

      const { data, error } = await supabaseHelper.delete('pb_invoices', id);

      if (error) {
        console.error(`Error deleting invoice ${id}:`, error);
        // Check for foreign key constraints if needed
        // if (error.code === '23503') { ... }
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Invoice deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting invoice: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to mark invoice as paid using Supabase
export const useMarkInvoiceAsPaid = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
       if (!id) throw new Error("Invoice ID is required.");

       const dataToUpdate = { status: 'paid', updated_at: new Date().toISOString(), date_modified: new Date().toISOString() }; // Assuming 'paid' is a valid status

       const { data, error } = await supabaseHelper.update('pb_invoices', id, dataToUpdate);

       if (error) {
         console.error(`Error marking invoice ${id} as paid:`, error);
         throw new Error(error.message);
       }
       return data;
    },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Invoice marked as paid');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
       toast.error(`Error marking invoice as paid: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Removed useSendInvoice hook - Requires backend logic (email, PDF generation etc.)

// Hook to fetch detailed invoice data or a viewable link/PDF via an Edge Function
export const useViewInvoice = (options = {}) => {
  return useMutation({
    mutationFn: async (invoiceId) => {
      if (!invoiceId) throw new Error("Invoice ID is required.");

      // Invoke the Supabase Edge Function
      // This function should fetch full details and potentially generate a PDF/link
      const { data, error } = await supabase.functions.invoke('get-invoice-details', {
        body: { invoiceId },
      });

      if (error) {
        console.error(`Error invoking get-invoice-details function for invoice ${invoiceId}:`, error);
        throw new Error(error.message || 'Failed to fetch invoice details.');
      }

      // Expecting the function to return data needed for display or a URL to a PDF
      if (!data) {
          throw new Error('No details returned for the invoice.');
      }

      return data;
    },
    onSuccess: (data, variables, context) => {
      // Handle the response - e.g., open a PDF URL in a new tab
      if (data.pdfUrl) {
          window.open(data.pdfUrl, '_blank');
          toast.success('Invoice opened in new tab.');
      } else {
          // Handle cases where raw data might be returned for display in a modal
          console.log("Invoice details fetched:", data);
          toast.info('Invoice details loaded (display logic needed).');
          // TODO: Implement logic to display invoice details, perhaps in a modal
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error viewing invoice: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
