import { supabase } from '../lib/supabase';

/**
 * Get all invoices for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - The patient's invoices
 */
export const getPatientInvoices = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting patient invoices:', error.message);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get a specific invoice by ID
 * @param {string} invoiceId - The ID of the invoice
 * @returns {Promise<Object>} - The invoice details
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', invoiceId)
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting invoice by ID:', error.message);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Update invoice status
 * @param {string} invoiceId - The ID of the invoice
 * @param {string} status - The new status ('pending', 'paid', 'cancelled')
 * @returns {Promise<Object>} - The result of the update operation
 */
export const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', invoiceId);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating invoice status:', error.message);
    return { success: false, error: error.message };
  }
};
