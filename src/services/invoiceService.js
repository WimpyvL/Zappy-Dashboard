import { supabase } from '../lib/supabase';
import { createInvoice } from '../apis/invoices/api';

/**
 * Get all invoices for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - The patient's invoices
 */
export const getPatientInvoices = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('pb_invoices')
      .select('*')
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
 * Get invoice by ID
 * @param {string} invoiceId - The ID of the invoice
 * @returns {Promise<Object>} - The invoice
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const { data, error } = await supabase
      .from('pb_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting invoice:', error.message);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Calculate tax amount based on subtotal and tax rate
 * @param {number} subtotal - The subtotal amount
 * @param {number} taxRate - The tax rate (e.g., 0.07 for 7%)
 * @returns {number} - The tax amount
 */
export const calculateTax = (subtotal, taxRate = 0) => {
  return parseFloat((subtotal * taxRate).toFixed(2));
};

/**
 * Calculate discount amount based on subtotal and discount percentage
 * @param {number} subtotal - The subtotal amount
 * @param {number} discountPercentage - The discount percentage (e.g., 10 for 10%)
 * @returns {number} - The discount amount
 */
export const calculateDiscount = (subtotal, discountPercentage = 0) => {
  return parseFloat((subtotal * (discountPercentage / 100)).toFixed(2));
};

/**
 * Calculate total amount based on subtotal, tax, and discount
 * @param {number} subtotal - The subtotal amount
 * @param {number} taxAmount - The tax amount
 * @param {number} discountAmount - The discount amount
 * @returns {number} - The total amount
 */
export const calculateTotal = (subtotal, taxAmount = 0, discountAmount = 0) => {
  return parseFloat((subtotal + taxAmount - discountAmount).toFixed(2));
};

/**
 * Generate invoice items from order items
 * @param {Array} orderItems - The order items
 * @returns {Array} - The invoice items
 */
export const generateInvoiceItems = (orderItems) => {
  return orderItems.map(item => ({
    name: item.productName || 'Product',
    description: `${item.dosage || ''} ${item.frequency || ''}`.trim(),
    quantity: item.quantity || 1,
    unit_price: item.price || 0,
    amount: (item.price || 0) * (item.quantity || 1)
  }));
};

/**
 * Generate invoice from consultation
 * @param {Object} params - The parameters
 * @param {Object} params.consultation - The consultation
 * @param {Object} params.order - The order
 * @param {Object} params.subscriptionPlan - The subscription plan (optional)
 * @param {number} params.taxRate - The tax rate (optional)
 * @param {number} params.discountPercentage - The discount percentage (optional)
 * @returns {Promise<Object>} - The generated invoice
 */
export const generateInvoiceFromConsultation = async ({
  consultation,
  order,
  subscriptionPlan = null,
  taxRate = 0,
  discountPercentage = 0
}) => {
  try {
    if (!consultation || !consultation.patient_id) {
      throw new Error('Consultation is required with patient_id');
    }

    // Get patient information
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name, email')
      .eq('id', consultation.patient_id)
      .single();
    
    if (patientError) {
      console.error('Error fetching patient data:', patientError);
      throw new Error('Failed to fetch patient data');
    }

    // Generate invoice items from order or subscription plan
    let invoiceItems = [];
    let subtotal = 0;

    if (order && order.items) {
      // Generate invoice items from order
      invoiceItems = generateInvoiceItems(order.items);
      subtotal = order.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    } else if (subscriptionPlan) {
      // Generate invoice item from subscription plan
      invoiceItems = [{
        name: subscriptionPlan.name || 'Subscription Plan',
        description: subscriptionPlan.description || '',
        quantity: 1,
        unit_price: subscriptionPlan.price || 0,
        amount: subscriptionPlan.price || 0
      }];
      subtotal = subscriptionPlan.price || 0;
    } else {
      throw new Error('Either order or subscription plan is required');
    }

    // Calculate tax and discount
    const taxAmount = calculateTax(subtotal, taxRate);
    const discountAmount = calculateDiscount(subtotal, discountPercentage);
    const total = calculateTotal(subtotal, taxAmount, discountAmount);

    // Generate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice
    const invoiceData = {
      patientId: consultation.patient_id,
      items: invoiceItems,
      amount: total,
      status: 'pending',
      dueDate: dueDate.toISOString(),
      subscription_plan_id: subscriptionPlan?.id || null,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount
    };

    const invoice = await createInvoice(invoiceData);

    // Update consultation with invoice ID
    const { error: updateError } = await supabase
      .from('consultations')
      .update({ invoice_id: invoice.id })
      .eq('id', consultation.id);
    
    if (updateError) {
      console.error('Error updating consultation with invoice ID:', updateError);
      // Don't throw error, just log it
    }

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error generating invoice from consultation:', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Generate invoice for subscription renewal
 * @param {Object} params - The parameters
 * @param {string} params.patientId - The patient ID
 * @param {Object} params.subscriptionPlan - The subscription plan
 * @param {number} params.taxRate - The tax rate (optional)
 * @param {number} params.discountPercentage - The discount percentage (optional)
 * @returns {Promise<Object>} - The generated invoice
 */
export const generateSubscriptionRenewalInvoice = async ({
  patientId,
  subscriptionPlan,
  taxRate = 0,
  discountPercentage = 0
}) => {
  try {
    if (!patientId || !subscriptionPlan) {
      throw new Error('Patient ID and subscription plan are required');
    }

    // Get patient information
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name, email')
      .eq('id', patientId)
      .single();
    
    if (patientError) {
      console.error('Error fetching patient data:', patientError);
      throw new Error('Failed to fetch patient data');
    }

    // Generate invoice item from subscription plan
    const invoiceItems = [{
      name: `${subscriptionPlan.name || 'Subscription'} Renewal`,
      description: subscriptionPlan.description || '',
      quantity: 1,
      unit_price: subscriptionPlan.price || 0,
      amount: subscriptionPlan.price || 0
    }];
    
    const subtotal = subscriptionPlan.price || 0;

    // Calculate tax and discount
    const taxAmount = calculateTax(subtotal, taxRate);
    const discountAmount = calculateDiscount(subtotal, discountPercentage);
    const total = calculateTotal(subtotal, taxAmount, discountAmount);

    // Generate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice
    const invoiceData = {
      patientId,
      items: invoiceItems,
      amount: total,
      status: 'pending',
      dueDate: dueDate.toISOString(),
      subscription_plan_id: subscriptionPlan.id,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount
    };

    const invoice = await createInvoice(invoiceData);

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error generating subscription renewal invoice:', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Mark invoice as paid
 * @param {string} invoiceId - The ID of the invoice
 * @param {Object} paymentDetails - The payment details (optional)
 * @returns {Promise<Object>} - The updated invoice
 */
export const markInvoiceAsPaid = async (invoiceId, paymentDetails = {}) => {
  try {
    const { data, error } = await supabase
      .from('pb_invoices')
      .update({
        status: 'paid',
        payment_method: paymentDetails.paymentMethod || null,
        payment_id: paymentDetails.paymentId || null,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error marking invoice as paid:', error.message);
    return { success: false, error: error.message, data: null };
  }
};
