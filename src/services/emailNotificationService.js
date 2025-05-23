/**
 * Email Notification Service
 * 
 * This service provides email notification functionality using SendGrid.
 * It includes templates for various prescription and order status updates.
 */

import axios from 'axios';
import { supabase } from '../lib/supabase';

// SendGrid API configuration
const SENDGRID_CONFIG = {
  apiKey: process.env.REACT_APP_SENDGRID_API_KEY,
  apiUrl: 'https://api.sendgrid.com/v3',
  fromEmail: process.env.REACT_APP_SENDGRID_FROM_EMAIL || 'notifications@zappy.health',
  fromName: process.env.REACT_APP_SENDGRID_FROM_NAME || 'Zappy Health',
};

// Email template IDs
const EMAIL_TEMPLATES = {
  // Order related templates
  ORDER_CONFIRMATION: 'd-abc123456789', // Replace with actual template IDs
  ORDER_SHIPPED: 'd-def123456789',
  ORDER_DELIVERED: 'd-ghi123456789',
  ORDER_DELAYED: 'd-jkl123456789',
  
  // Prescription related templates
  PRESCRIPTION_RECEIVED: 'd-mno123456789',
  PRESCRIPTION_UNDER_REVIEW: 'd-pqr123456789',
  PRESCRIPTION_APPROVED: 'd-stu123456789',
  PRESCRIPTION_DENIED: 'd-vwx123456789',
  PRESCRIPTION_REQUIRES_INFO: 'd-yz0123456789',
  
  // Refill related templates
  REFILL_REMINDER: 'd-123abc456def',
  REFILL_PROCESSED: 'd-456def789ghi',
  REFILL_READY: 'd-789ghi012jkl',
  
  // General templates
  WELCOME: 'd-012jkl345mno',
  PASSWORD_RESET: 'd-345mno678pqr',
  ACCOUNT_VERIFICATION: 'd-678pqr901stu',
};

/**
 * Send an email using SendGrid API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.templateId - SendGrid template ID
 * @param {Object} options.dynamicData - Dynamic template data
 * @param {string} [options.subject] - Email subject (optional, can be defined in template)
 * @param {string} [options.from] - Sender email (optional, defaults to config)
 * @param {string} [options.fromName] - Sender name (optional, defaults to config)
 * @returns {Promise<Object>} SendGrid API response
 */
const sendEmail = async (options) => {
  try {
    const { to, templateId, dynamicData, subject, from, fromName } = options;
    
    if (!to || !templateId) {
      throw new Error('Recipient email and template ID are required');
    }
    
    if (!SENDGRID_CONFIG.apiKey) {
      console.error('SendGrid API key not configured');
      throw new Error('Email service not properly configured');
    }
    
    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: dynamicData || {},
          subject: subject || undefined,
        },
      ],
      from: {
        email: from || SENDGRID_CONFIG.fromEmail,
        name: fromName || SENDGRID_CONFIG.fromName,
      },
      template_id: templateId,
    };
    
    const response = await axios.post(
      `${SENDGRID_CONFIG.apiUrl}/mail/send`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      error: error.message || 'Failed to send email',
      details: error.response?.data || {}
    };
  }
};

/**
 * Log email notification in the database
 * @param {Object} options - Email log options
 * @param {string} options.type - Notification type
 * @param {string} options.recipientEmail - Recipient email
 * @param {string} [options.recipientId] - Recipient user ID (if available)
 * @param {string} [options.orderId] - Related order ID (if applicable)
 * @param {string} [options.prescriptionId] - Related prescription ID (if applicable)
 * @param {Object} [options.metadata] - Additional metadata
 * @param {boolean} [options.success] - Whether the email was sent successfully
 * @param {string} [options.errorMessage] - Error message if sending failed
 * @returns {Promise<Object>} Database insert result
 */
const logEmailNotification = async (options) => {
  try {
    const { 
      type, 
      recipientEmail, 
      recipientId, 
      orderId, 
      prescriptionId, 
      metadata, 
      success, 
      errorMessage 
    } = options;
    
    if (!type || !recipientEmail) {
      throw new Error('Notification type and recipient email are required');
    }
    
    const { data, error } = await supabase
      .from('email_notifications')
      .insert({
        type,
        recipient_email: recipientEmail,
        recipient_id: recipientId,
        order_id: orderId,
        prescription_id: prescriptionId,
        metadata: metadata || {},
        success: success !== undefined ? success : true,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
      })
      .select();
      
    if (error) {
      console.error('Error logging email notification:', error);
      return { error: 'Failed to log email notification' };
    }
    
    return { success: true, notification: data[0] };
  } catch (error) {
    console.error('Error in logEmailNotification:', error);
    return { error: error.message || 'Failed to log email notification' };
  }
};

/**
 * Get patient email from patient ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<string|null>} Patient email or null if not found
 */
const getPatientEmail = async (patientId) => {
  try {
    if (!patientId) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('patients')
      .select('email, user_id')
      .eq('id', patientId)
      .single();
      
    if (error || !data) {
      console.error('Error getting patient email:', error);
      return null;
    }
    
    // If patient has email, return it
    if (data.email) {
      return data.email;
    }
    
    // If patient has user_id, get email from auth.users
    if (data.user_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', data.user_id)
        .single();
        
      if (userError || !userData) {
        console.error('Error getting user email:', userError);
        return null;
      }
      
      return userData.email;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getPatientEmail:', error);
    return null;
  }
};

/**
 * Send order confirmation email
 * @param {Object} options - Email options
 * @param {string} options.orderId - Order ID
 * @param {string} [options.patientId] - Patient ID (optional if recipientEmail is provided)
 * @param {string} [options.recipientEmail] - Recipient email (optional if patientId is provided)
 * @returns {Promise<Object>} Result
 */
export const sendOrderConfirmationEmail = async (options) => {
  try {
    const { orderId, patientId, recipientEmail } = options;
    
    if (!orderId) {
      return { error: 'Order ID is required' };
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        patient:patient_id (*),
        items:order_items (*)
      `)
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      console.error('Error getting order details:', orderError);
      return { error: 'Failed to get order details' };
    }
    
    // Get recipient email
    let toEmail = recipientEmail;
    if (!toEmail && patientId) {
      toEmail = await getPatientEmail(patientId);
    } else if (!toEmail && order.patient) {
      toEmail = await getPatientEmail(order.patient.id);
    }
    
    if (!toEmail) {
      return { error: 'Recipient email not found' };
    }
    
    // Format order items for email
    const formattedItems = order.items.map(item => ({
      name: item.product_name || item.name,
      quantity: item.quantity,
      price: item.price,
      total: (item.price * item.quantity).toFixed(2),
    }));
    
    // Calculate order totals
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = order.tax_amount || 0;
    const shipping = order.shipping_amount || 0;
    const discount = order.discount_amount || 0;
    const total = subtotal + tax + shipping - discount;
    
    // Prepare dynamic data for email template
    const dynamicData = {
      order_id: order.id,
      order_number: order.order_number || order.id,
      order_date: new Date(order.created_at).toLocaleDateString(),
      customer_name: order.patient?.name || 'Valued Customer',
      items: formattedItems,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      shipping_address: order.shipping_address || {},
      billing_address: order.billing_address || {},
      payment_method: order.payment_method || 'Credit Card',
      estimated_delivery: order.estimated_delivery_date || 'To be determined',
      order_status_url: `${window.location.origin}/orders/${order.id}`,
    };
    
    // Send email
    const emailResult = await sendEmail({
      to: toEmail,
      templateId: EMAIL_TEMPLATES.ORDER_CONFIRMATION,
      dynamicData,
      subject: `Order Confirmation #${order.order_number || order.id}`,
    });
    
    // Log email notification
    await logEmailNotification({
      type: 'order_confirmation',
      recipientEmail: toEmail,
      recipientId: order.patient?.id,
      orderId: order.id,
      metadata: {
        order_number: order.order_number || order.id,
        total: total.toFixed(2),
      },
      success: !emailResult.error,
      errorMessage: emailResult.error,
    });
    
    return emailResult;
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return { error: error.message || 'Failed to send order confirmation email' };
  }
};

/**
 * Send order shipped email
 * @param {Object} options - Email options
 * @param {string} options.orderId - Order ID
 * @param {string} [options.trackingNumber] - Tracking number (if available)
 * @param {string} [options.carrier] - Shipping carrier (if available)
 * @param {string} [options.patientId] - Patient ID (optional if recipientEmail is provided)
 * @param {string} [options.recipientEmail] - Recipient email (optional if patientId is provided)
 * @returns {Promise<Object>} Result
 */
export const sendOrderShippedEmail = async (options) => {
  try {
    const { orderId, trackingNumber, carrier, patientId, recipientEmail } = options;
    
    if (!orderId) {
      return { error: 'Order ID is required' };
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        patient:patient_id (*),
        items:order_items (*)
      `)
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      console.error('Error getting order details:', orderError);
      return { error: 'Failed to get order details' };
    }
    
    // Get recipient email
    let toEmail = recipientEmail;
    if (!toEmail && patientId) {
      toEmail = await getPatientEmail(patientId);
    } else if (!toEmail && order.patient) {
      toEmail = await getPatientEmail(order.patient.id);
    }
    
    if (!toEmail) {
      return { error: 'Recipient email not found' };
    }
    
    // Format order items for email
    const formattedItems = order.items.map(item => ({
      name: item.product_name || item.name,
      quantity: item.quantity,
      image_url: item.image_url || '',
    }));
    
    // Prepare dynamic data for email template
    const dynamicData = {
      order_id: order.id,
      order_number: order.order_number || order.id,
      customer_name: order.patient?.name || 'Valued Customer',
      items: formattedItems,
      shipping_address: order.shipping_address || {},
      tracking_number: trackingNumber || order.tracking_number,
      carrier: carrier || order.carrier || 'Our shipping partner',
      tracking_url: getTrackingUrl(trackingNumber || order.tracking_number, carrier || order.carrier),
      estimated_delivery: order.estimated_delivery_date || 'Soon',
      order_status_url: `${window.location.origin}/orders/${order.id}`,
    };
    
    // Send email
    const emailResult = await sendEmail({
      to: toEmail,
      templateId: EMAIL_TEMPLATES.ORDER_SHIPPED,
      dynamicData,
      subject: `Your Order #${order.order_number || order.id} Has Shipped`,
    });
    
    // Log email notification
    await logEmailNotification({
      type: 'order_shipped',
      recipientEmail: toEmail,
      recipientId: order.patient?.id,
      orderId: order.id,
      metadata: {
        order_number: order.order_number || order.id,
        tracking_number: trackingNumber || order.tracking_number,
        carrier: carrier || order.carrier,
      },
      success: !emailResult.error,
      errorMessage: emailResult.error,
    });
    
    return emailResult;
  } catch (error) {
    console.error('Error in sendOrderShippedEmail:', error);
    return { error: error.message || 'Failed to send order shipped email' };
  }
};

/**
 * Send prescription status update email
 * @param {Object} options - Email options
 * @param {string} options.prescriptionId - Prescription ID
 * @param {string} options.status - Prescription status
 * @param {string} [options.patientId] - Patient ID (optional if recipientEmail is provided)
 * @param {string} [options.recipientEmail] - Recipient email (optional if patientId is provided)
 * @param {string} [options.providerName] - Provider name (if available)
 * @param {string} [options.additionalInfo] - Additional information (if applicable)
 * @returns {Promise<Object>} Result
 */
export const sendPrescriptionStatusEmail = async (options) => {
  try {
    const { 
      prescriptionId, 
      status, 
      patientId, 
      recipientEmail, 
      providerName, 
      additionalInfo 
    } = options;
    
    if (!prescriptionId || !status) {
      return { error: 'Prescription ID and status are required' };
    }
    
    // Get prescription details
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id (*),
        provider:provider_id (*),
        medication:medication_id (*)
      `)
      .eq('id', prescriptionId)
      .single();
      
    if (prescriptionError || !prescription) {
      console.error('Error getting prescription details:', prescriptionError);
      return { error: 'Failed to get prescription details' };
    }
    
    // Get recipient email
    let toEmail = recipientEmail;
    if (!toEmail && patientId) {
      toEmail = await getPatientEmail(patientId);
    } else if (!toEmail && prescription.patient) {
      toEmail = await getPatientEmail(prescription.patient.id);
    }
    
    if (!toEmail) {
      return { error: 'Recipient email not found' };
    }
    
    // Determine which template to use based on status
    let templateId;
    let emailSubject;
    
    switch (status.toLowerCase()) {
      case 'received':
        templateId = EMAIL_TEMPLATES.PRESCRIPTION_RECEIVED;
        emailSubject = 'Your Prescription Has Been Received';
        break;
      case 'under_review':
        templateId = EMAIL_TEMPLATES.PRESCRIPTION_UNDER_REVIEW;
        emailSubject = 'Your Prescription Is Under Review';
        break;
      case 'approved':
        templateId = EMAIL_TEMPLATES.PRESCRIPTION_APPROVED;
        emailSubject = 'Your Prescription Has Been Approved';
        break;
      case 'denied':
        templateId = EMAIL_TEMPLATES.PRESCRIPTION_DENIED;
        emailSubject = 'Important Update About Your Prescription';
        break;
      case 'requires_info':
        templateId = EMAIL_TEMPLATES.PRESCRIPTION_REQUIRES_INFO;
        emailSubject = 'Additional Information Needed for Your Prescription';
        break;
      default:
        return { error: 'Invalid prescription status' };
    }
    
    // Prepare dynamic data for email template
    const dynamicData = {
      prescription_id: prescription.id,
      patient_name: prescription.patient?.name || 'Valued Patient',
      medication_name: prescription.medication?.name || 'your medication',
      provider_name: providerName || prescription.provider?.name || 'Your healthcare provider',
      status: formatPrescriptionStatus(status),
      additional_info: additionalInfo || '',
      prescription_details_url: `${window.location.origin}/prescriptions/${prescription.id}`,
    };
    
    // Send email
    const emailResult = await sendEmail({
      to: toEmail,
      templateId,
      dynamicData,
      subject: emailSubject,
    });
    
    // Log email notification
    await logEmailNotification({
      type: `prescription_${status.toLowerCase()}`,
      recipientEmail: toEmail,
      recipientId: prescription.patient?.id,
      prescriptionId: prescription.id,
      metadata: {
        medication_name: prescription.medication?.name,
        provider_name: providerName || prescription.provider?.name,
      },
      success: !emailResult.error,
      errorMessage: emailResult.error,
    });
    
    return emailResult;
  } catch (error) {
    console.error('Error in sendPrescriptionStatusEmail:', error);
    return { error: error.message || 'Failed to send prescription status email' };
  }
};

/**
 * Send refill reminder email
 * @param {Object} options - Email options
 * @param {string} options.prescriptionId - Prescription ID
 * @param {number} [options.daysRemaining] - Days remaining until refill is due
 * @param {string} [options.patientId] - Patient ID (optional if recipientEmail is provided)
 * @param {string} [options.recipientEmail] - Recipient email (optional if patientId is provided)
 * @returns {Promise<Object>} Result
 */
export const sendRefillReminderEmail = async (options) => {
  try {
    const { prescriptionId, daysRemaining, patientId, recipientEmail } = options;
    
    if (!prescriptionId) {
      return { error: 'Prescription ID is required' };
    }
    
    // Get prescription details
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id (*),
        medication:medication_id (*)
      `)
      .eq('id', prescriptionId)
      .single();
      
    if (prescriptionError || !prescription) {
      console.error('Error getting prescription details:', prescriptionError);
      return { error: 'Failed to get prescription details' };
    }
    
    // Get recipient email
    let toEmail = recipientEmail;
    if (!toEmail && patientId) {
      toEmail = await getPatientEmail(patientId);
    } else if (!toEmail && prescription.patient) {
      toEmail = await getPatientEmail(prescription.patient.id);
    }
    
    if (!toEmail) {
      return { error: 'Recipient email not found' };
    }
    
    // Calculate days remaining if not provided
    let days = daysRemaining;
    if (days === undefined && prescription.next_refill_date) {
      const nextRefill = new Date(prescription.next_refill_date);
      const today = new Date();
      const diffTime = nextRefill.getTime() - today.getTime();
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Prepare dynamic data for email template
    const dynamicData = {
      prescription_id: prescription.id,
      patient_name: prescription.patient?.name || 'Valued Patient',
      medication_name: prescription.medication?.name || 'your medication',
      days_remaining: days !== undefined ? days : 'a few',
      refill_date: prescription.next_refill_date 
        ? new Date(prescription.next_refill_date).toLocaleDateString() 
        : 'soon',
      refill_url: `${window.location.origin}/refills/request/${prescription.id}`,
    };
    
    // Send email
    const emailResult = await sendEmail({
      to: toEmail,
      templateId: EMAIL_TEMPLATES.REFILL_REMINDER,
      dynamicData,
      subject: `Refill Reminder: ${prescription.medication?.name || 'Your Medication'}`,
    });
    
    // Log email notification
    await logEmailNotification({
      type: 'refill_reminder',
      recipientEmail: toEmail,
      recipientId: prescription.patient?.id,
      prescriptionId: prescription.id,
      metadata: {
        medication_name: prescription.medication?.name,
        days_remaining: days,
        next_refill_date: prescription.next_refill_date,
      },
      success: !emailResult.error,
      errorMessage: emailResult.error,
    });
    
    return emailResult;
  } catch (error) {
    console.error('Error in sendRefillReminderEmail:', error);
    return { error: error.message || 'Failed to send refill reminder email' };
  }
};

// Helper functions

/**
 * Get tracking URL for a carrier and tracking number
 * @param {string} trackingNumber - Tracking number
 * @param {string} carrier - Carrier name
 * @returns {string} Tracking URL
 */
const getTrackingUrl = (trackingNumber, carrier) => {
  if (!trackingNumber) {
    return '';
  }
  
  const carrierLower = (carrier || '').toLowerCase();
  
  if (carrierLower.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  } else if (carrierLower.includes('fedex')) {
    return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
  } else if (carrierLower.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  } else if (carrierLower.includes('dhl')) {
    return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;
  }
  
  // Generic tracking URL (Google search)
  return `https://www.google.com/search?q=${trackingNumber}`;
};

/**
 * Format prescription status for display
 * @param {string} status - Raw status
 * @returns {string} Formatted status
 */
const formatPrescriptionStatus = (status) => {
  const statusMap = {
    'received': 'Received',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'denied': 'Not Approved',
    'requires_info': 'Requires Additional Information',
  };
  
  return statusMap[status.toLowerCase()] || status;
};

export default {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPrescriptionStatusEmail,
  sendRefillReminderEmail,
};
