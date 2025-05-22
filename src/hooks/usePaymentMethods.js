import { useState, useCallback } from 'react';

/**
 * Custom hook for managing payment methods
 * @param {Object} options - Configuration options
 * @param {Function} options.onSelect - Callback when a payment method is selected
 * @returns {Object} - Payment methods state and handlers
 */
const usePaymentMethods = ({
  onSelect
} = {}) => {
  // In a real implementation, this would fetch from an API
  // For now, we'll use mock data
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm_1', last4: '4242', brand: 'visa', expMonth: 12, expYear: 2028 },
    { id: 'pm_2', last4: '5555', brand: 'mastercard', expMonth: 10, expYear: 2026 },
  ]);
  
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Selects a payment method
   * @param {string} paymentMethodId - The ID of the payment method to select
   */
  const selectPaymentMethod = useCallback((paymentMethodId) => {
    setSelectedPaymentMethodId(paymentMethodId);
    setError(null);
    
    if (onSelect) {
      const selectedMethod = paymentMethods.find(method => method.id === paymentMethodId);
      onSelect(selectedMethod);
    }
  }, [paymentMethods, onSelect]);
  
  /**
   * Gets the selected payment method
   * @returns {Object|null} - The selected payment method or null if none selected
   */
  const getSelectedPaymentMethod = useCallback(() => {
    return paymentMethods.find(method => method.id === selectedPaymentMethodId) || null;
  }, [paymentMethods, selectedPaymentMethodId]);
  
  /**
   * Adds a new payment method
   * @param {Object} paymentMethodData - The payment method data to add
   * @returns {Promise<Object>} - The added payment method
   */
  const addPaymentMethod = useCallback(async (paymentMethodData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new payment method object
      const newPaymentMethod = {
        id: `pm_${Math.random().toString(36).substr(2, 9)}`,
        last4: paymentMethodData.last4 || '1234',
        brand: paymentMethodData.brand || 'visa',
        expMonth: paymentMethodData.expMonth || 12,
        expYear: paymentMethodData.expYear || 2028
      };
      
      // Add to the list
      setPaymentMethods(prevMethods => [...prevMethods, newPaymentMethod]);
      
      // Select the new method
      selectPaymentMethod(newPaymentMethod.id);
      
      return newPaymentMethod;
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      setError(error.message || 'Failed to add payment method');
      throw error;
      
    } finally {
      setIsLoading(false);
    }
  }, [selectPaymentMethod]);
  
  /**
   * Removes a payment method
   * @param {string} paymentMethodId - The ID of the payment method to remove
   * @returns {Promise<boolean>} - Whether the removal was successful
   */
  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from the list
      setPaymentMethods(prevMethods => 
        prevMethods.filter(method => method.id !== paymentMethodId)
      );
      
      // If the removed method was selected, clear the selection
      if (selectedPaymentMethodId === paymentMethodId) {
        setSelectedPaymentMethodId(null);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error removing payment method:', error);
      setError(error.message || 'Failed to remove payment method');
      return false;
      
    } finally {
      setIsLoading(false);
    }
  }, [selectedPaymentMethodId]);
  
  /**
   * Gets a card brand icon
   * @param {string} brand - The card brand
   * @returns {string} - The icon representation
   */
  const getCardBrandIcon = useCallback((brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳'; // Replace with actual Visa icon
      case 'mastercard':
        return '💳'; // Replace with actual Mastercard icon
      case 'amex':
        return '💳'; // Replace with actual Amex icon
      default:
        return '💳';
    }
  }, []);
  
  return {
    paymentMethods,
    selectedPaymentMethodId,
    isLoading,
    error,
    selectPaymentMethod,
    getSelectedPaymentMethod,
    addPaymentMethod,
    removePaymentMethod,
    getCardBrandIcon
  };
};

export default usePaymentMethods;