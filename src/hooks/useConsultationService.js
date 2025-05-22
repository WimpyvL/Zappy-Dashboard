import { useState } from 'react';
import { toast } from 'react-toastify';
import { createConsultationFromIntake, assignProviderRoundRobin } from '../services/consultationService';

/**
 * Hook for using the consultation service
 * @returns {Object} The consultation service hook
 */
export const useConsultationService = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  /**
   * Create a consultation from intake form data
   * @param {Object} params - The parameters
   * @returns {Promise<Object>} The created consultation
   */
  const createConsultation = async (params) => {
    setIsCreating(true);
    try {
      const consultation = await createConsultationFromIntake(params);
      toast.success('Consultation created successfully');
      return consultation;
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast.error('Failed to create consultation');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  /**
   * Assign a provider to a consultation using round-robin
   * @param {string} categoryId - The category ID
   * @returns {Promise<Object>} The assigned provider
   */
  const assignProvider = async (categoryId) => {
    setIsAssigning(true);
    try {
      const provider = await assignProviderRoundRobin(categoryId);
      toast.success(`Provider ${provider.name} assigned`);
      return provider;
    } catch (error) {
      console.error('Error assigning provider:', error);
      toast.error('Failed to assign provider');
      throw error;
    } finally {
      setIsAssigning(false);
    }
  };
  
  return {
    createConsultation,
    assignProvider,
    isCreating,
    isAssigning
  };
};