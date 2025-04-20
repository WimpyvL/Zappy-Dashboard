// utils/errorHandling.js
import auditLogService from './auditLogService'; // Import the audit log service

/**
 * Utility functions for handling API errors consistently across the application
 */

// Add script to index.html for Tempo error handling
// <script src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js"></script>

/**
 * Format error message from API response
 * @param {Object} error - Axios error object
 * @returns {String} Formatted error message
 */
export const getErrorMessage = (error) => {
  // Handle different error scenarios
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Supabase errors
  if (error?.code?.startsWith('PGRST') || error?.code?.startsWith('SUPABASE')) {
    return error.message || 'Database operation failed';
  }

  if (typeof error === 'object' && error !== null) {
    // If error is an object, convert it to a string
    if (error.message) {
      return error.message;
    }

    // If it's an Error object but doesn't have a message property
    return String(error);
  }

  if (error.response) {
    // The request was made and the server responded with an error status
    if (error.response.data) {
      // Handle Supabase API response format
      if (error.response.data.error) {
        return error.response.data.error.message || 'Database operation failed';
      }
      // If the server returns a specific error message
      if (error.response.data.message) {
        return error.response.data.message;
      }

      // Multiple error messages may be returned as an array
      if (
        error.response.data.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        return error.response.data.errors.join(', ');
      }

      // Sometimes errors are returned as an object with field names as keys
      if (
        error.response.data.errors &&
        typeof error.response.data.errors === 'object'
      ) {
        return Object.values(error.response.data.errors).flat().join(', ');
      }
    }

    // Return generic message based on status code
    if (error.response.status === 400) {
      return 'Bad request - please check your input';
    }

    if (error.response.status === 401) {
      return 'Authentication failed - please log in again';
    }

    if (error.response.status === 403) {
      return 'You do not have permission to perform this action';
    }

    if (error.response.status === 404) {
      return 'The requested resource was not found';
    }

    if (error.response.status === 422) {
      return 'Validation failed - please check your input';
    }

    if (error.response.status >= 500) {
      return 'Server error - please try again later';
    }

    return `Error: ${error.response.status} ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    return 'Network error - please check your connection';
  } else {
    // Something else happened in setting up the request
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Formats form validation errors from backend responses
 * @param {Object} error - Axios error object
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const getFormErrors = (error) => {
  const formErrors = {};

  if (!error.response || !error.response.data) {
    formErrors.form = getErrorMessage(error);
    return formErrors;
  }

  // Handle Laravel/Symfony style validation errors
  if (
    error.response.data.errors &&
    typeof error.response.data.errors === 'object'
  ) {
    // Convert array of errors for each field to a single string
    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
      formErrors[field] = Array.isArray(messages) ? messages[0] : messages;
    });
    return formErrors;
  }

  // Fallback to general error message
  formErrors.form = getErrorMessage(error);
  return formErrors;
};

/**
 * Log error to console or error tracking service
 * @param {Object} error - Error object
 * @param {String} context - Context where the error occurred
 */
export const logError = (error, context = 'Unknown Context') => { // Added default context
  // Always log to console regardless of environment for visibility during testing
  console.error(`Error in ${context}:`, error);

  // Also log the error to the backend using the audit log service
  // We pass the error object and the context. We don't pass userId here,
  // auditLogService.logError might fetch it if needed, or it might be null.
  // We also don't pass additionalDetails here, but could enhance this later.
  if (error instanceof Error) { // Ensure we have an Error object
      auditLogService.logError(error, context);
  } else {
      // If it's not an Error object, create one to ensure message/stack are captured
      auditLogService.logError(new Error(getErrorMessage(error)), context, { originalError: error });
  }


  // In production, you might still want to log to an external service like Sentry
  // if (process.env.NODE_ENV === 'production') {
    // Example of Sentry integration:
    // import * as Sentry from '@sentry/react';
    // Sentry.captureException(error, { extra: { context } });
  // }
};

/**
 * Handle specific error types like auth errors
 * @param {Object} error - Axios error object
 * @returns {Boolean} True if the error was handled
 */
export const handleSpecialErrors = (error) => {
  // Handle authentication errors
  if (error.response && error.response.status === 401) {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');

    // Redirect to login page
    window.location.href = '/login';
    return true;
  }

  // Add other special error handling as needed

  return false;
};

/**
 * Safe error renderer for React components
 * Ensures errors are always rendered as strings, not objects
 * @param {any} error - The error to render
 * @returns {String} A string representation of the error
 */
export const safeErrorRenderer = (error) => {
  if (!error) return '';

  // If it's already a string, return it
  if (typeof error === 'string') return error;

  // If it's an Error object with a message property
  if (error instanceof Error) return error.message;

  // If it's some other object, try to stringify it
  try {
    return JSON.stringify(error);
  } catch (e) {
    return 'An error occurred';
  }
};

const errorHandling = {
  getErrorMessage,
  getFormErrors,
  logError,
  handleSpecialErrors,
  safeErrorRenderer,
};

export default errorHandling;
