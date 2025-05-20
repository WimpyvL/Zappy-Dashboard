import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, AlertCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { ERROR_SEVERITY, ERROR_TYPES } from '../../utils/errorHandlingSystem';

/**
 * Error Alert component for displaying error messages
 */
export const ErrorAlert = ({ 
  error, 
  severity = ERROR_SEVERITY.MEDIUM, 
  onRetry = null,
  onDismiss = null,
  className = '',
  showDetails = false
}) => {
  // Determine styling based on severity
  const getSeverityStyles = () => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return {
          container: 'border-red-500 bg-red-50',
          title: 'text-red-800',
          text: 'text-red-700',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case ERROR_SEVERITY.HIGH:
        return {
          container: 'border-red-400 bg-red-50',
          title: 'text-red-800',
          text: 'text-red-700',
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case ERROR_SEVERITY.MEDIUM:
        return {
          container: 'border-amber-400 bg-amber-50',
          title: 'text-amber-800',
          text: 'text-amber-700',
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case ERROR_SEVERITY.LOW:
        return {
          container: 'border-blue-300 bg-blue-50',
          title: 'text-blue-800',
          text: 'text-blue-700',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          container: 'border-gray-300 bg-gray-50',
          title: 'text-gray-800',
          text: 'text-gray-700',
          icon: <Info className="h-5 w-5 text-gray-600" />,
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const styles = getSeverityStyles();
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  const errorDetails = error?.stack || error?.details || JSON.stringify(error, null, 2);

  return (
    <div className={`p-4 border rounded-md ${styles.container} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="ml-3 w-full">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {severity === ERROR_SEVERITY.CRITICAL ? 'Critical Error' : 'Error'}
          </h3>
          <div className={`mt-2 text-sm ${styles.text}`}>
            <p>{errorMessage}</p>
            
            {showDetails && process.env.NODE_ENV !== 'production' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 text-xs bg-white bg-opacity-50 rounded overflow-auto max-h-40">
                  {errorDetails}
                </pre>
              </details>
            )}
          </div>
          
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${styles.button}`}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorAlert.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  severity: PropTypes.oneOf(Object.values(ERROR_SEVERITY)),
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  showDetails: PropTypes.bool
};

/**
 * Inline Error component for form fields
 */
export const InlineError = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`} role="alert">
      {message}
    </p>
  );
};

InlineError.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

/**
 * Error Banner component for page-level errors
 */
export const ErrorBanner = ({ 
  error, 
  onRetry = null, 
  onDismiss = null,
  className = ''
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  
  return (
    <div className={`bg-red-600 ${className}`}>
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-red-800">
              <AlertTriangle className="h-5 w-5 text-white" />
            </span>
            <p className="ml-3 font-medium text-white truncate">
              <span>{errorMessage}</span>
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
              >
                Try Again
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center justify-center rounded-md p-2 text-white hover:bg-red-500 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorBanner.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  className: PropTypes.string
};

/**
 * API Error component for displaying API-specific errors
 */
export const ApiError = ({ 
  error, 
  onRetry = null,
  className = ''
}) => {
  // Determine if this is a network error
  const isNetworkError = error?.type === ERROR_TYPES.NETWORK || 
                         error?.message?.includes('network') ||
                         error?.message?.includes('connection');
  
  // Determine if this is an authentication error
  const isAuthError = error?.type === ERROR_TYPES.AUTHENTICATION || 
                      error?.code === 'PGRST301' || 
                      error?.code === 'PGRST302';
  
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {isNetworkError ? 'Network Error' : 
         isAuthError ? 'Authentication Error' : 
         'Error Loading Data'}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {typeof error === 'string' ? error : 
         error?.message || 'An unexpected error occurred while loading data.'}
      </p>
      
      {isAuthError && (
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-200 mr-3"
        >
          Sign In
        </button>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-200"
          aria-label="Retry loading data"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

ApiError.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  onRetry: PropTypes.func,
  className: PropTypes.string
};

/**
 * Form Error Summary component for displaying multiple form errors
 */
export const FormErrorSummary = ({ 
  errors = {}, 
  className = '' 
}) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }
  
  return (
    <div className={`p-4 border border-red-300 rounded-md bg-red-50 mb-6 ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            There {Object.keys(errors).length === 1 ? 'is an issue' : 'are issues'} with your submission
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

FormErrorSummary.propTypes = {
  errors: PropTypes.object,
  className: PropTypes.string
};

/**
 * Error Fallback component for use with ErrorBoundary
 */
export const ErrorFallback = ({
  error,
  errorInfo,
  resetErrorBoundary,
  strategy = 'default'
}) => {
  // Determine severity based on strategy
  const getSeverity = () => {
    switch (strategy) {
      case 'critical':
        return ERROR_SEVERITY.CRITICAL;
      case 'minimal':
        return ERROR_SEVERITY.LOW;
      default:
        return ERROR_SEVERITY.MEDIUM;
    }
  };

  return (
    <ErrorAlert
      error={error}
      severity={getSeverity()}
      onRetry={resetErrorBoundary}
      showDetails={!!errorInfo}
      className="m-4"
    />
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
  strategy: PropTypes.string
};

export default {
  ErrorAlert,
  InlineError,
  ErrorBanner,
  ApiError,
  FormErrorSummary,
  ErrorFallback
};