import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['invoices'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  patientInvoices: (patientId) => [...queryKeys.all, 'patient', patientId],
};

// Fetch all invoices (for admin)
export const useInvoices = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        toast.error(`Error fetching invoices: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    ...options,
  });
};

// Fetch invoices for a patient
export const usePatientInvoices = (patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patientInvoices(patientId),
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching invoices for patient ${patientId}:`, error);
        toast.error(`Error fetching invoices: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!patientId,
    ...options,
  });
};

// Fetch a single invoice by ID
export const useInvoiceById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching invoice ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        toast.error(`Error fetching invoice details: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create a new invoice
export const useCreateInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceData) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          patient_id: invoiceData.patient_id,
          consultation_id: invoiceData.consultation_id,
          items: invoiceData.items,
          status: invoiceData.status || 'pending',
          due_date: invoiceData.due_date,
          created_at: invoiceData.created_at || new Date().toISOString(),
          updated_at: invoiceData.updated_at || new Date().toISOString(),
          total: invoiceData.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0),
          payment_method: invoiceData.payment_method,
          payment_id: invoiceData.payment_id,
          notes: invoiceData.notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        toast.error(`Error creating invoice: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientInvoices(data.patient_id) });
      toast.success('Invoice created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating invoice: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update an invoice
export const useUpdateInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, invoiceData }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...invoiceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating invoice ${id}:`, error);
        toast.error(`Error updating invoice: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientInvoices(data.patient_id) });
      toast.success('Invoice updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating invoice: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update invoice status
export const useUpdateInvoiceStatus = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, paymentMethod, paymentId }) => {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
        if (paymentMethod) updateData.payment_method = paymentMethod;
        if (paymentId) updateData.payment_id = paymentId;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating invoice status ${id}:`, error);
        toast.error(`Error updating invoice status: ${error.message}`);
        throw new Error(error.message);
      }
      
      // If the invoice is marked as paid, update any associated follow-ups
      if (status === 'paid') {
        const { error: followUpError } = await supabase
          .from('patient_follow_ups')
          .update({ 
            payment_status: 'paid',
            updated_at: new Date().toISOString() 
          })
          .eq('invoice_id', id);
          
        if (followUpError) {
          console.error(`Error updating follow-up payment status for invoice ${id}:`, followUpError);
          // Don't throw error, just log it
        }
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientInvoices(data.patient_id) });
      queryClient.invalidateQueries({ queryKey: ['followUps'] }); // Invalidate follow-ups queries
      toast.success(`Invoice marked as ${variables.status}`);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating invoice status: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Delete an invoice
export const useDeleteInvoice = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientId }) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting invoice ${id}:`, error);
        toast.error(`Error deleting invoice: ${error.message}`);
        throw new Error(error.message);
      }
      
      return { id, patientId };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientInvoices(variables.patientId) });
      toast.success('Invoice deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting invoice: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
