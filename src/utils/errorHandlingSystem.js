/**
 * Enhanced error handling system for the telehealth application
 */

import { toast } from 'react-toastify';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  DATABASE: 'database',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  CRITICAL: 'critical',   // Application cannot continue, requires immediate attention
  HIGH: 'high',           // Major feature is broken, requires user intervention
  MEDIUM: 'medium',       // Feature partially broken but usable, should be fixed soon
  LOW: 'low',             // Minor issue, can be fixed in future releases
  INFO: 'info'            // Informational only, not an actual error
};

/**
 * Maps API error codes to error types
 * @param {string} code - Error code from API
 * @returns {string} Error type
 */
export const mapErrorCodeToType = (code) => {
  if (!code) return ERROR_TYPES.UNKNOWN;
  
  // Supabase error codes
  const errorCodeMap = {
    // Authentication errors
    'PGRST301': ERROR_TYPES.AUTHENTICATION,
    'PGRST302': ERROR_TYPES.AUTHENTICATION,
    
    // Authorization errors
    '42501': ERROR_TYPES.AUTHORIZATION,
    
    // Not found errors
    'PGRST116': ERROR_TYPES.NOT_FOUND,
    
    // Database errors
    '23505': ERROR_TYPES.DATABASE, // Unique violation
    '23503': ERROR_TYPES.DATABASE, // Foreign key violation
    '23514': ERROR_TYPES.DATABASE, // Check constraint violation
    '42P01': ERROR_TYPES.DATABASE, // Undefined table
    '22P02': ERROR_TYPES.DATABASE, // Invalid input syntax
    
    // Default
    'default': ERROR_TYPES.UNKNOWN
  };
  
  return errorCodeMap[code] || errorCodeMap.default;
};

/**
 * Determines error severity based on error type and context
 * @param {string} errorType - Type of error
 * @param {string} context - Context where error occurred
 * @returns {string} Error severity level
 */
export const determineErrorSeverity = (errorType, context) => {
  // Critical contexts - errors here are usually critical
  const criticalContexts = [
    'payment',
    'checkout',
    'prescription',
    'medication'
  ];
  
  // High severity contexts
  const highSeverityContexts = [
    'authentication',
    'patient data',
    'medical records',
    'consultation'
  ];
  
  // Error type severity mapping
  const typeSeverityMap = {
    [ERROR_TYPES.AUTHENTICATION]: ERROR_SEVERITY.HIGH,
    [ERROR_TYPES.AUTHORIZATION]: ERROR_SEVERITY.HIGH,
    [ERROR_TYPES.DATABASE]: ERROR_SEVERITY.HIGH,
    [ERROR_TYPES.SERVER]: ERROR_SEVERITY.HIGH,
    [ERROR_TYPES.NETWORK]: ERROR_SEVERITY.MEDIUM,
    [ERROR_TYPES.API]: ERROR_SEVERITY.MEDIUM,
    [ERROR_TYPES.VALIDATION]: ERROR_SEVERITY.LOW,
    [ERROR_TYPES.NOT_FOUND]: ERROR_SEVERITY.MEDIUM,
    [ERROR_TYPES.TIMEOUT]: ERROR_SEVERITY.MEDIUM,
    [ERROR_TYPES.UNKNOWN]: ERROR_SEVERITY.MEDIUM
  };
  
  // Check if context is critical
  if (criticalContexts.some(c => context.toLowerCase().includes(c))) {
    return ERROR_SEVERITY.CRITICAL;
  }
  
  // Check if context is high severity
  if (highSeverityContexts.some(c => context.toLowerCase().includes(c))) {
    return ERROR_SEVERITY.HIGH;
  }
  
  // Default to type-based severity
  return typeSeverityMap[errorType] || ERROR_SEVERITY.MEDIUM;
};

/**
 * Creates a standardized error object
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @returns {Object} Standardized error object
 */
export const createErrorObject = (error, context) => {
  const errorType = error.code ? mapErrorCodeToType(error.code) : ERROR_TYPES.UNKNOWN;
  const severity = determineErrorSeverity(errorType, context);
  
  return {
    originalError: error,
    message: error.message || 'An unexpected error occurred',
    code: error.code,
    type: errorType,
    context,
    severity,
    timestamp: new Date().toISOString(),
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};

/**
 * Gets user-friendly error message based on error type and code
 * @param {Object} errorObj - Standardized error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (errorObj) => {
  // Default messages by error type
  const defaultMessages = {
    [ERROR_TYPES.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
    [ERROR_TYPES.API]: 'The server encountered an issue processing your request.',
    [ERROR_TYPES.VALIDATION]: 'Please check the form for errors.',
    [ERROR_TYPES.AUTHENTICATION]: 'Your session has expired. Please sign in again.',
    [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
    [ERROR_TYPES.SERVER]: 'The server encountered an error. Our team has been notified.',
    [ERROR_TYPES.DATABASE]: 'A database error occurred. Please try again later.',
    [ERROR_TYPES.TIMEOUT]: 'The request timed out. Please try again.',
    [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again later.'
  };
  
  // Specific error code messages
  if (errorObj.code) {
    const codeMessages = {
      'PGRST116': 'The requested resource was not found.',
      '23505': 'A record with this information already exists.',
      '23503': 'This operation cannot be completed due to related data constraints.',
      '23514': 'The data does not meet the required conditions.',
      '42P01': 'There is a configuration issue with the database.',
      '42501': 'You do not have permission to perform this action.',
      '22P02': 'The input format is invalid.'
    };
    
    if (codeMessages[errorObj.code]) {
      return codeMessages[errorObj.code];
    }
  }
  
  // Use original error message if it seems user-friendly
  if (errorObj.originalError?.message && 
      !errorObj.originalError.message.includes('Error:') &&
      !errorObj.originalError.message.includes('Exception:') &&
      errorObj.originalError.message.length < 100) {
    return errorObj.originalError.message;
  }
  
  // Fall back to default message for the error type
  return defaultMessages[errorObj.type] || defaultMessages[ERROR_TYPES.UNKNOWN];
};

/**
 * Logs error to appropriate channels based on severity
 * @param {Object} errorObj - Standardized error object
 */
export const logError = (errorObj) => {
  const { severity, context, type, message, code } = errorObj;
  
  // Always log to console
  console.error(`[${severity.toUpperCase()}][${context}][${type}]`, errorObj);
  
  // In production, we would send to error monitoring service based on severity
  if (process.env.NODE_ENV === 'production') {
    // This would be replaced with actual error monitoring service
    if (severity === ERROR_SEVERITY.CRITICAL || severity === ERROR_SEVERITY.HIGH) {
      // Simulate sending to error monitoring service
      console.error('CRITICAL ERROR - Would be sent to monitoring service:', errorObj);
      
      // In a real implementation:
      // errorMonitoringService.captureException(errorObj.originalError, {
      //   level: severity,
      //   tags: { context, type },
      //   extra: { code, standardizedMessage: message }
      // });
    }
  }
};

/**
 * Determines if an error should trigger a retry
 * @param {Object} errorObj - Standardized error object
 * @returns {boolean} Whether the operation should be retried
 */
export const isRetryableError = (errorObj) => {
  const retryableTypes = [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.TIMEOUT,
    ERROR_TYPES.SERVER
  ];
  
  // Don't retry critical errors
  if (errorObj.severity === ERROR_SEVERITY.CRITICAL) {
    return false;
  }
  
  return retryableTypes.includes(errorObj.type);
};

/**
 * Enhanced API error handler
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @param {Object} options - Additional options
 * @returns {Object} Standardized error object
 */
export const handleApiError = (error, context, options = {}) => {
  const {
    toast: toastFn = toast,
    setError = null,
    setIsLoading = null,
    onError = null,
    showToast = true,
    retry = null
  } = options;
  
  // Create standardized error object
  const errorObj = createErrorObject(error, context);
  
  // Log the error
  logError(errorObj);
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(errorObj);
  
  // Show toast notification if enabled
  if (showToast && toastFn) {
    const toastOptions = {};
    
    // Set toast options based on severity
    if (errorObj.severity === ERROR_SEVERITY.CRITICAL) {
      toastOptions.autoClose = false; // Don't auto-close critical errors
    }
    
    toastFn.error(`${context}: ${userMessage}`, toastOptions);
  }
  
  // Set error state if provided
  if (setError) {
    setError(userMessage);
  }
  
  // Update loading state if provided
  if (setIsLoading) {
    setIsLoading(false);
  }
  
  // Handle retry if applicable
  if (retry && isRetryableError(errorObj)) {
    const { retryFn, maxRetries = 3, currentRetry = 0, retryDelay = 1000 } = retry;
    
    if (currentRetry < maxRetries && typeof retryFn === 'function') {
      console.log(`Retrying operation (${currentRetry + 1}/${maxRetries})...`);
      
      // Exponential backoff
      const delay = retryDelay * Math.pow(2, currentRetry);
      
      setTimeout(() => {
        retryFn(currentRetry + 1);
      }, delay);
    }
  }
  
  // Call additional error handler if provided
  if (onError && typeof onError === 'function') {
    onError(errorObj);
  }
  
  return errorObj;
};

/**
 * Enhanced form validation error handler
 * @param {Object} errors - Validation errors object
 * @param {Object} options - Additional options
 */
export const handleFormErrors = (errors, options = {}) => {
  const {
    setFieldErrors = null,
    toast: toastFn = toast,
    showToast = true,
    context = 'Form Validation'
  } = options;
  
  if (!errors) return;
  
  // Create standardized error object
  const errorObj = createErrorObject(
    new Error('Form validation failed'),
    context
  );
  
  errorObj.type = ERROR_TYPES.VALIDATION;
  errorObj.validationErrors = errors;
  
  // Log the error
  logError(errorObj);
  
  // Set field-specific errors
  if (setFieldErrors) {
    setFieldErrors(errors);
  }
  
  // Show toast with first error message
  if (showToast && toastFn) {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      toastFn.error(`${errors[firstErrorField]}`);
    } else {
      toastFn.error('Please check the form for errors');
    }
  }
  
  return errorObj;
};

/**
 * Handles network errors specifically
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @param {Object} options - Additional options
 * @returns {Object} Standardized error object
 */
export const handleNetworkError = (error, context, options = {}) => {
  const errorObj = createErrorObject(error, context);
  errorObj.type = ERROR_TYPES.NETWORK;
  
  return handleApiError(errorObj.originalError, context, {
    ...options,
    retry: options.retry || { maxRetries: 3, retryDelay: 2000 }
  });
};

/**
 * Handles authentication errors specifically
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @param {Object} options - Additional options
 * @returns {Object} Standardized error object
 */
export const handleAuthError = (error, context, options = {}) => {
  const errorObj = createErrorObject(error, context);
  errorObj.type = ERROR_TYPES.AUTHENTICATION;
  
  // Special handling for auth errors (e.g., redirect to login)
  const { onAuthFailure } = options;
  if (onAuthFailure && typeof onAuthFailure === 'function') {
    onAuthFailure(errorObj);
  }
  
  return handleApiError(errorObj.originalError, context, options);
};

// Default export for backward compatibility
const errorHandlingSystem = {
  handleApiError,
  handleFormErrors,
  handleNetworkError,
  handleAuthError,
  createErrorObject,
  getUserFriendlyMessage,
  logError,
  isRetryableError,
  ERROR_TYPES,
  ERROR_SEVERITY
};

export default errorHandlingSystem;