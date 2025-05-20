import { useState, useCallback } from 'react';
import { isValidEmail } from '../utils/validation';

/**
 * Custom hook for handling account creation logic
 * @param {Function} onSuccess - Callback function to execute on successful account creation
 * @param {Function} onError - Callback function to execute on account creation error
 * @returns {Object} - Account creation state and handlers
 */
const useAccountCreation = (onSuccess, onError) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);
  
  /**
   * Creates a user account with the provided email
   * @param {string} email - The email address to create an account with
   * @returns {Promise<boolean>} - Whether the account creation was successful
   */
  const createAccount = useCallback(async (email) => {
    // Validate email
    if (!email || !isValidEmail(email)) {
      const errorMessage = 'Please provide a valid email address';
      setError(errorMessage);
      if (onError) onError(new Error(errorMessage));
      return false;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call to create an account
      // For now, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate account creation success
      setAccountCreated(true);
      
      // Send verification email (simulated)
      console.log(`Verification email sent to ${email}`);
      
      if (onSuccess) onSuccess({ email });
      return true;
      
    } catch (error) {
      console.error('Error creating account:', error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      if (onError) onError(error);
      return false;
      
    } finally {
      setIsCreating(false);
    }
  }, [onSuccess, onError]);
  
  /**
   * Resets the account creation state
   */
  const resetAccountState = useCallback(() => {
    setIsCreating(false);
    setError(null);
    setAccountCreated(false);
  }, []);
  
  return {
    isCreating,
    error,
    accountCreated,
    createAccount,
    resetAccountState
  };
};

export default useAccountCreation;