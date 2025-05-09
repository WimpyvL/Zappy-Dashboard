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
  const { 
    patientId, 
    items, 
    amount, 
    status, 
    dueDate, 
    subscription_plan_id, 
    discount_amount, 
    tax_rate, 
    tax_amount 
  } = invoiceData;
  
  // Get patient info to include in the invoice
  let patientData = { first_name: '', last_name: '', email: '' };
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('first_name, last_name, email')
      .eq('id', patientId)
      .single();
      
    if (error) {
      console.error('Error fetching patient data:', error);
    } else if (data) {
      patientData = data;
    }
  } catch (err) {
    console.error('Exception fetching patient data:', err);
  }
  
  const formattedInvoice = {
    patient_id: patientId,  // Using the correct column name (snake_case)
    status: status || 'pending',
    pb_invoice_metadata: {
      items: items || [],
      total: amount || 0,
      patient_name: `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim(),
      patient_email: patientData.email || '',
      // Store subscription plan ID in metadata instead of direct column
      subscription_plan_id: subscription_plan_id || null,
      // Generate a readable invoice ID based on subscription or first item
      invoice_id: subscription_plan_id ? 
        `SUB-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}` : 
        (items && items.length > 0) ? 
          `INV-${items[0].name.substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 10000)}` : 
          `INV-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`
    },
    due_date: dueDate || null,
    invoice_amount: parseFloat(amount) || 0,
    amount_paid: 0,
    due_amount: parseFloat(amount) || 0,
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
