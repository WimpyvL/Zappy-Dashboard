import { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  generateInvoiceFromConsultation, 
  generateSubscriptionRenewalInvoice,
  markInvoiceAsPaid
} from '../services/invoiceService';

/**
 * Hook for using the invoice service
 * @returns {Object} The invoice service hook
 */
export const useInvoiceService = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  /**
   * Generate an invoice from a consultation
   * @param {Object} params - The parameters
   * @returns {Promise<Object>} The generated invoice
   */
  const generateInvoice = async (params) => {
    setIsGenerating(true);
    try {
      const result = await generateInvoiceFromConsultation(params);
      if (result.success) {
        toast.success('Invoice generated successfully');
        return result.data;
      } else {
        toast.error(`Failed to generate invoice: ${result.error}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  /**
   * Generate a subscription renewal invoice
   * @param {Object} params - The parameters
   * @returns {Promise<Object>} The generated invoice
   */
  const generateRenewalInvoice = async (params) => {
    setIsGenerating(true);
    try {
      const result = await generateSubscriptionRenewalInvoice(params);
      if (result.success) {
        toast.success('Renewal invoice generated successfully');
        return result.data;
      } else {
        toast.error(`Failed to generate renewal invoice: ${result.error}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating renewal invoice:', error);
      toast.error('Failed to generate renewal invoice');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  /**
   * Mark an invoice as paid
   * @param {string} invoiceId - The invoice ID
   * @param {Object} paymentDetails - The payment details
   * @returns {Promise<Object>} The updated invoice
   */
  const markAsPaid = async (invoiceId, paymentDetails = {}) => {
    setIsUpdating(true);
    try {
      const result = await markInvoiceAsPaid(invoiceId, paymentDetails);
      if (result.success) {
        toast.success('Invoice marked as paid');
        return result.data;
      } else {
        toast.error(`Failed to mark invoice as paid: ${result.error}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    generateInvoice,
    generateRenewalInvoice,
    markAsPaid,
    isGenerating,
    isUpdating
  };
};