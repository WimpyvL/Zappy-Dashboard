/**
 * Utility functions for consistent error handling across the application
 */

/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Function} toast - Toast notification function
 * @param {Function} setError - State setter for error message
 * @param {Function} setIsLoading - State setter for loading state
 * @param {Function} onError - Optional callback for additional error handling
 * @returns {string} User-friendly error message
 */
export const handleApiError = (
  error, 
  context, 
  toast, 
  setError = null, 
  setIsLoading = null,
  onError = null
) => {
  console.error(`Error in ${context}:`, error);
  
  // Determine user-friendly error message
  let errorMessage = 'An unexpected error occurred';
  
  if (error.message) {
    errorMessage = error.message;
  }
  
  // Handle specific error codes
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        errorMessage = 'The requested resource was not found';
        break;
      case '23505':
        errorMessage = 'A duplicate record already exists';
        break;
      case '42P01':
        errorMessage = 'Database configuration error';
        break;
      case '42501':
        errorMessage = 'You do not have permission to perform this action';
        break;
      case '23503':
        errorMessage = 'This operation violates referential integrity constraints';
        break;
      case '23514':
        errorMessage = 'The data violates a check constraint';
        break;
      case '22P02':
        errorMessage = 'Invalid input syntax';
        break;
      // Add more error codes as needed
    }
  }
  
  // Show toast notification
  if (toast) {
    toast.error(`${context}: ${errorMessage}`);
  }
  
  // Set error state if provided
  if (setError) {
    setError(errorMessage);
  }
  
  // Update loading state if provided
  if (setIsLoading) {
    setIsLoading(false);
  }
  
  // Call additional error handler if provided
  if (onError && typeof onError === 'function') {
    onError(error);
  }
  
  return errorMessage;
};

/**
 * Handles form validation errors
 * @param {Object} errors - Validation errors object
 * @param {Function} setFieldErrors - State setter for field errors
 * @param {Function} toast - Toast notification function
 */
export const handleFormErrors = (errors, setFieldErrors, toast) => {
  if (!errors) return;
  
  // Set field-specific errors
  if (setFieldErrors) {
    setFieldErrors(errors);
  }
  
  // Show toast with first error message
  if (toast) {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      toast.error(`Validation error: ${errors[firstErrorField]}`);
    } else {
      toast.error('Please check the form for errors');
    }
  }
};

/**
 * Creates a validation error object for form fields
 * @param {Object} fields - Object with field names as keys and error messages as values
 * @returns {Object} Validation errors object
 */
export const createValidationErrors = (fields) => {
  return Object.entries(fields).reduce((acc, [field, error]) => {
    if (error) {
      acc[field] = error;
    }
    return acc;
  }, {});
};

/**
 * Validates that required fields are present
 * @param {Object} data - Form data
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object|null} Validation errors object or null if valid
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required`;
    }
  });
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Default export for backward compatibility with existing code
const errorHandling = {
  handleApiError,
  handleFormErrors,
  createValidationErrors,
  validateRequiredFields
};

export default errorHandling;
