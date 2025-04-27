import { supabase } from '../../lib/supabase';

export const fetchInvoices = async () => {
  // Update to use pb_invoices table
  const { data, error } = await supabase
    .from('pb_invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchInvoiceById = async (id) => {
  // Update to use pb_invoices table
  const { data, error } = await supabase
    .from('pb_invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createInvoice = async (invoiceData) => {
  // Format the data according to pb_invoices structure
  const { patientId, items, amount, status, dueDate } = invoiceData;
  
  const formattedInvoice = {
    patient_id: patientId,  // Using the correct column name (snake_case)
    status: status || 'pending',
    pb_invoice_metadata: {
      items: items || [],
      total: amount || 0
    },
    due_date: dueDate || null,
    invoice_amount: amount || 0,
    amount_paid: 0,
    due_amount: amount || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Insert into pb_invoices table
  const { data, error } = await supabase
    .from('pb_invoices')
    .insert(formattedInvoice)
    .select();
  
  if (error) throw error;
  return data;
};

export const updateInvoice = async (id, updates) => {
  // Update to use pb_invoices table
  const { data, error } = await supabase
    .from('pb_invoices')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

export const deleteInvoice = async (id) => {
  // Update to use pb_invoices table
  const { error } = await supabase
    .from('pb_invoices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
