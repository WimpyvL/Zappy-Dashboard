import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  handleApiError, 
  handleFormErrors, 
  handleNetworkError, 
  handleAuthError,
  ERROR_TYPES
} from '../utils/errorHandlingSystem';

/**
 * Custom hook for consistent error handling across the application
 * @param {Object} options - Configuration options
 * @returns {Object} Error handling utilities
 */
const useErrorHandler = (options = {}) => {
  const {
    context = 'Application',
    defaultMessage = 'An unexpected error occurred',
    onError: customOnError = null,
    captureAnalytics = true
  } = options;
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Handle API errors
   * @param {Error} err - The error object
   * @param {string} operationContext - Context where the error occurred
   * @param {Object} handlerOptions - Additional options for error handling
   * @returns {Object} Standardized error object
   */
  const handleError = useCallback((err, operationContext = context, handlerOptions = {}) => {
    const fullContext = `${context}${operationContext !== context ? ` - ${operationContext}` : ''}`;
    
    // Determine if this is a network error
    const isNetworkError = 
      err?.message?.includes('network') ||
      err?.message?.includes('connection') ||
      err?.message?.includes('offline') ||
      err?.name === 'NetworkError';
    
    // Determine if this is an auth error
    const isAuthError = 
      err?.message?.includes('authentication') ||
      err?.message?.includes('unauthorized') ||
      err?.message?.includes('not logged in') ||
      err?.message?.includes('session expired') ||
      err?.code === 'PGRST301' ||
      err?.code === 'PGRST302';
    
    // Call the appropriate error handler
    let errorObj;
    
    if (isNetworkError) {
      errorObj = handleNetworkError(err, fullContext, {
        toast,
        setError,
        setIsLoading,
        onError: customOnError,
        ...handlerOptions
      });
    } else if (isAuthError) {
      errorObj = handleAuthError(err, fullContext, {
        toast,
        setError,
        setIsLoading,
        onError: customOnError,
        onAuthFailure: () => {
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        },
        ...handlerOptions
      });
    } else {
      errorObj = handleApiError(err, fullContext, {
        toast,
        setError,
        setIsLoading,
        onError: customOnError,
        ...handlerOptions
      });
    }
    
    // Track error in analytics if enabled
    if (captureAnalytics && process.env.NODE_ENV === 'production') {
      // This would be replaced with actual analytics tracking
      console.log('Would track error in analytics:', {
        errorType: errorObj.type,
        errorMessage: errorObj.message,
        errorCode: errorObj.code,
        context: fullContext,
        severity: errorObj.severity
      });
    }
    
    return errorObj;
  }, [context, customOnError, captureAnalytics]);
  
  /**
   * Handle form validation errors
   * @param {Object} validationErrors - Validation errors object
   * @param {Object} handlerOptions - Additional options for error handling
   * @returns {Object} Standardized error object
   */
  const handleFormError = useCallback((validationErrors, handlerOptions = {}) => {
    return handleFormErrors(validationErrors, {
      toast,
      context: `${context} - Form Validation`,
      onError: customOnError,
      ...handlerOptions
    });
  }, [context, customOnError]);
  
  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {Object} options - Options for error handling
   * @returns {Function} Wrapped function with error handling
   */
  const withErrorHandling = useCallback((fn, options = {}) => {
    const {
      operationContext = 'Operation',
      setLoadingState = true,
      rethrow = false
    } = options;
    
    return async (...args) => {
      try {
        if (setLoadingState) {
          setIsLoading(true);
        }
        
        resetError();
        return await fn(...args);
      } catch (err) {
        const errorObj = handleError(err, operationContext);
        
        if (rethrow) {
          throw errorObj;
        }
        
        return { error: errorObj };
      } finally {
        if (setLoadingState) {
          setIsLoading(false);
        }
      }
    };
  }, [handleError, resetError]);
  
  /**
   * Create a retry function for retryable errors
   * @param {Function} fn - Function to retry
   * @param {Object} options - Retry options
   * @returns {Function} Function that will retry on failure
   */
  const createRetryFunction = useCallback((fn, options = {}) => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      onRetry = null
    } = options;
    
    return async (...args) => {
      let currentRetry = 0;
      
      const executeWithRetry = async (retryCount) => {
        try {
          return await fn(...args);
        } catch (err) {
          // Check if we should retry
          const errorObj = handleError(err, 'Retryable Operation', {
            showToast: retryCount === 0, // Only show toast on first error
          });
          
          if (retryCount < maxRetries && errorObj.type !== ERROR_TYPES.VALIDATION) {
            currentRetry = retryCount + 1;
            
            // Call onRetry callback if provided
            if (onRetry) {
              onRetry(currentRetry, maxRetries, err);
            }
            
            // Exponential backoff
            const delay = retryDelay * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Retry the operation
            return executeWithRetry(currentRetry);
          }
          
          // Max retries reached or non-retryable error
          throw errorObj;
        }
      };
      
      return executeWithRetry(0);
    };
  }, [handleError]);
  
  return {
    error,
    setError,
    isLoading,
    setIsLoading,
    resetError,
    handleError,
    handleFormError,
    withErrorHandling,
    createRetryFunction
  };
};

export default useErrorHandler;