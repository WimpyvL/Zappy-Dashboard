import { supabase } from '../../lib/supabase';

export const fetchInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchInvoiceById = async (id) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createInvoice = async (invoiceData) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select();
  
  if (error) throw error;
  return data;
};

export const updateInvoice = async (id, updates) => {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

export const deleteInvoice = async (id) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
