import { useState } from 'react';
import { toast } from 'react-toastify';
import { processConsultationApproval } from '../services/consultationInvoiceService';

/**
 * Hook for handling consultation approval and invoice generation
 * @returns {Object} The consultation approval hook
 */
export const useConsultationApproval = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  /**
   * Approve a consultation and generate an invoice
   * @param {Object} params - The parameters
   * @param {string} params.consultationId - The consultation ID
   * @param {string} params.approverId - The ID of the provider who approved the consultation
   * @param {Object} params.approvalData - Data from the approval form
   * @returns {Promise<Object>} The result of the operation
   */
  const approveConsultation = async (params) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const approvalResult = await processConsultationApproval(params);
      
      if (approvalResult.success) {
        toast.success(approvalResult.message || 'Consultation approved successfully');
        setResult(approvalResult.data);
        return approvalResult.data;
      } else {
        toast.error(approvalResult.message || 'Failed to approve consultation');
        throw new Error(approvalResult.message);
      }
    } catch (error) {
      console.error('Error approving consultation:', error);
      toast.error('Failed to approve consultation');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    approveConsultation,
    isProcessing,
    result
  };
};