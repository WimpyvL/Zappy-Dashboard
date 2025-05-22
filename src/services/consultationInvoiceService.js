import { supabase } from '../lib/supabase';
import { generateInvoiceFromConsultation } from './invoiceService';
import { getSubscriptionPlanById } from '../apis/subscriptionPlans/api';

/**
 * Get subscription plan for a product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} The subscription plan
 */
export const getSubscriptionPlanForProduct = async (productId) => {
  try {
    if (!productId) return null;
    
    // Query the product_subscription_plans table to find the subscription plan for this product
    const { data, error } = await supabase
      .from('product_subscription_plans')
      .select('subscription_plan_id')
      .eq('product_id', productId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No subscription plan found
      console.error('Error fetching subscription plan for product:', error);
      throw error;
    }
    
    if (!data || !data.subscription_plan_id) return null;
    
    // Get the subscription plan details
    const subscriptionPlan = await getSubscriptionPlanById(data.subscription_plan_id);
    return subscriptionPlan;
  } catch (error) {
    console.error('Error in getSubscriptionPlanForProduct:', error);
    return null;
  }
};

/**
 * Generate invoice after consultation approval
 * @param {Object} params - The parameters
 * @param {string} params.consultationId - The consultation ID
 * @param {string} params.approverId - The ID of the provider who approved the consultation
 * @param {Object} params.approvalNotes - Optional notes from the approval
 * @returns {Promise<Object>} The result of the operation
 */
export const generateInvoiceAfterApproval = async ({
  consultationId,
  approverId,
  approvalNotes = {}
}) => {
  try {
    if (!consultationId) {
      throw new Error('Consultation ID is required');
    }
    
    // Get the consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select(`
        *,
        patient:patient_id(*),
        order:order_id(*)
      `)
      .eq('id', consultationId)
      .single();
    
    if (consultationError) {
      console.error('Error fetching consultation:', consultationError);
      throw new Error('Failed to fetch consultation');
    }
    
    // Update consultation status to approved
    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', consultationId);
    
    if (updateError) {
      console.error('Error updating consultation status:', updateError);
      throw new Error('Failed to update consultation status');
    }
    
    // Get the order
    const order = consultation.order;
    if (!order) {
      throw new Error('Consultation has no associated order');
    }
    
    // Get the product from the order
    const product = order.items && order.items.length > 0 ? order.items[0] : null;
    if (!product) {
      throw new Error('Order has no products');
    }
    
    // Get the subscription plan for the product
    const subscriptionPlan = await getSubscriptionPlanForProduct(product.productId);
    
    // Generate the invoice
    const invoiceResult = await generateInvoiceFromConsultation({
      consultation,
      order,
      subscriptionPlan,
      taxRate: 0, // No tax for prescriptions
      discountPercentage: 0 // No discount by default
    });
    
    if (!invoiceResult.success) {
      throw new Error(invoiceResult.error || 'Failed to generate invoice');
    }
    
    return {
      success: true,
      message: 'Consultation approved and invoice generated',
      data: {
        consultation,
        invoice: invoiceResult.data
      }
    };
  } catch (error) {
    console.error('Error in generateInvoiceAfterApproval:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate invoice after approval',
      error
    };
  }
};

/**
 * Process consultation approval
 * @param {Object} params - The parameters
 * @param {string} params.consultationId - The consultation ID
 * @param {string} params.approverId - The ID of the provider who approved the consultation
 * @param {Object} params.approvalData - Data from the approval form
 * @returns {Promise<Object>} The result of the operation
 */
export const processConsultationApproval = async ({
  consultationId,
  approverId,
  approvalData = {}
}) => {
  try {
    // Generate invoice after approval
    const result = await generateInvoiceAfterApproval({
      consultationId,
      approverId,
      approvalNotes: approvalData.notes
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to process consultation approval');
    }
    
    // Get the invoice
    const invoice = result.data.invoice;
    
    // Send notification to patient about the approval and invoice
    // This would be implemented in a notification service
    
    return {
      success: true,
      message: 'Consultation approved and invoice generated',
      data: {
        consultation: result.data.consultation,
        invoice
      }
    };
  } catch (error) {
    console.error('Error in processConsultationApproval:', error);
    return {
      success: false,
      message: error.message || 'Failed to process consultation approval',
      error
    };
  }
};