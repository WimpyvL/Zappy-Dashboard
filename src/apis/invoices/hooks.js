import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
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
      let query = supabase
        .from('pb_invoices') // Target the pb_invoices table
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `, { count: 'exact' }) // Example join
        .order('created_at', { ascending: false }) // Order by creation date
        .range(rangeFrom, rangeTo);

      // Apply filters
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.patientId) {
         query = query.eq('client_record_id', params.patientId);
      }
      // Add date range filters if needed
      // if (params.startDate) { query = query.gte('date_created', params.startDate); }
      // if (params.endDate) { query = query.lte('date_created', params.endDate); }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching invoices:', error);
        throw new Error(error.message);
      }

      // Map data if needed
      const mappedData = data?.map(inv => ({
          ...inv,
          // Map DB fields to frontend fields if necessary
          // e.g., issueDate: inv.date_created, dueDate: inv.due_date_column_if_exists
          patientName: inv.client_record ? `${inv.client_record.first_name || ''} ${inv.client_record.last_name || ''}`.trim() : 'N/A',
          // Assuming amount needs calculation or is stored in metadata
          amount: inv.pb_invoice_metadata?.total || 0, // Example: get amount from metadata
          items: inv.pb_invoice_metadata?.items || [], // Example: get items from metadata
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

      const { data, error } = await supabase
        .from('pb_invoices')
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `) // Example join
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching invoice ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data ? {
           ...data,
           patientName: data.client_record ? `${data.client_record.first_name || ''} ${data.client_record.last_name || ''}`.trim() : 'N/A',
           amount: data.pb_invoice_metadata?.total || 0,
           items: data.pb_invoice_metadata?.items || [],
       } : null;

      return mappedData;
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
        client_record_id: invoiceData.patientId,
        status: invoiceData.status || 'pending', // Default status
        pb_invoice_metadata: { // Store items/amount in metadata JSONB
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

      const { data, error } = await supabase
        .from('pb_invoices')
        .insert(dataToInsert)
        .select()
        .single();

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
         client_record_id: invoiceData.patientId, // Allow changing patient? Maybe not.
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

      const { data, error } = await supabase
        .from('pb_invoices')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

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

      const { error } = await supabase
        .from('pb_invoices')
        .delete()
        .eq('id', id);

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

       const { data, error } = await supabase
         .from('pb_invoices')
         .update({ status: 'paid', updated_at: new Date().toISOString(), date_modified: new Date().toISOString() }) // Assuming 'paid' is a valid status
         .eq('id', id)
         .select()
         .single();

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
