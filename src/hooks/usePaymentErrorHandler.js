import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

/**
 * Hook for handling payment errors and providing recovery options
 * @returns {Object} Error handling methods and state
 */
export const usePaymentErrorHandler = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  
  /**
   * Map error types to user-friendly messages
   */
  const errorMessages = {
    'card_declined': 'Your card was declined. Please try another payment method.',
    'insufficient_funds': 'Your card has insufficient funds.',
    'expired_card': 'Your card has expired.',
    'processing_error': 'An error occurred while processing your payment.',
    'authentication_required': 'This card requires authentication.',
    'session_expired': 'Your checkout session has expired.',
    'network_error': 'A network error occurred. Please check your connection.',
    'default': 'An error occurred during payment processing.'
  };
  
  /**
   * Handle a payment error and determine recovery options
   * @param {Object} error - The error object
   * @param {string} sessionId - The checkout session ID (optional)
   * @returns {Object} Recovery information
   */
  const handlePaymentError = async (error, sessionId = null) => {
    setIsRecovering(true);
    
    // Extract error type from the error object
    const errorType = error.type || error.code || 'default';
    setErrorType(errorType);
    
    // Get user-friendly message
    const message = error.message || errorMessages[errorType] || errorMessages.default;
    setErrorMessage(message);
    
    // Determine recovery action based on error type
    let recoveryAction;
    
    switch (errorType) {
      case 'card_declined':
      case 'insufficient_funds':
      case 'expired_card':
        recoveryAction = 'try_another_card';
        break;
      case 'session_expired':
        recoveryAction = 'refresh_session';
        break;
      case 'network_error':
        recoveryAction = 'retry';
        break;
      case 'authentication_required':
        recoveryAction = 'authenticate';
        break;
      default:
        recoveryAction = 'contact_support';
    }
    
    // Handle recovery based on action type
    try {
      if (recoveryAction === 'refresh_session' && sessionId) {
        // Automatically refresh the session
        const result = await paymentService.handlePaymentFailure(sessionId, errorType);
        
        setIsRecovering(false);
        return { 
          recoverable: true, 
          message,
          action: recoveryAction,
          recoveryUrl: result.recoveryUrl,
          newSessionId: result.newSessionId
        };
      }
      
      if (recoveryAction === 'authenticate' && sessionId) {
        // Handle 3D Secure authentication
        setIsRecovering(false);
        return {
          recoverable: true,
          message,
          action: recoveryAction,
          redirectUrl: error.redirectUrl || '#'
        };
      }
      
      setIsRecovering(false);
      return { 
        recoverable: recoveryAction !== 'contact_support', 
        message,
        action: recoveryAction
      };
    } catch (recoveryError) {
      console.error('Error during payment recovery:', recoveryError);
      
      setIsRecovering(false);
      return {
        recoverable: false,
        message: 'Unable to recover from payment error. Please try again later.',
        action: 'contact_support'
      };
    }
  };
  
  /**
   * Clear the current error state
   */
  const clearError = () => {
    setErrorType(null);
    setErrorMessage(null);
  };
  
  /**
   * Retry a payment after an error
   * @param {string} sessionId - The checkout session ID
   * @returns {Promise<Object>} Result of the retry attempt
   */
  const retryPayment = async (sessionId) => {
    try {
      setIsRecovering(true);
      
      // In a real implementation, this would retry the payment
      const result = await paymentService.verifyPaymentStatus(sessionId);
      
      setIsRecovering(false);
      clearError();
      
      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error retrying payment:', error);
      
      // Handle the new error
      const errorResult = await handlePaymentError(error, sessionId);
      
      return {
        success: false,
        error: errorResult
      };
    }
  };
  
  /**
   * Navigate to support for unrecoverable errors
   */
  const contactSupport = () => {
    // In a real implementation, this might open a support chat or navigate to a help page
    navigate('/support', { 
      state: { 
        errorType, 
        errorMessage 
      } 
    });
  };
  
  return { 
    handlePaymentError, 
    retryPayment,
    contactSupport,
    clearError,
    isRecovering, 
    errorType,
    errorMessage
  };
};

export default usePaymentErrorHandler;
