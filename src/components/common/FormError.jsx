import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

/**
 * Component for displaying form errors with appropriate styling and accessibility
 */
const FormError = ({ 
  id,
  error,
  className = '',
  showIcon = true,
  variant = 'inline' // 'inline', 'block', or 'alert'
}) => {
  if (!error) return null;
  
  // Handle array of errors
  const errorMessages = Array.isArray(error) ? error : [error];
  
  // Generate unique ID for accessibility
  const errorId = id || `error-${Math.random().toString(36).substr(2, 9)}`;
  
  // Render different variants
  switch (variant) {
    case 'block':
      return (
        <div 
          id={errorId}
          className={`p-3 bg-red-50 border border-red-200 rounded-md ${className}`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex">
            {showIcon && (
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
              </div>
            )}
            <div className={showIcon ? 'ml-3' : ''}>
              {errorMessages.length === 1 ? (
                <p className="text-sm text-red-700">{errorMessages[0]}</p>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                    {errorMessages.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
      
    case 'alert':
      return (
        <div 
          id={errorId}
          className={`p-4 bg-red-100 border-l-4 border-red-500 ${className}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex">
            {showIcon && (
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
              </div>
            )}
            <div className={showIcon ? 'ml-3' : ''}>
              <p className="text-sm font-medium text-red-800">
                {errorMessages.length === 1 ? errorMessages[0] : 'Multiple errors occurred'}
              </p>
              {errorMessages.length > 1 && (
                <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                  {errorMessages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      );
      
    case 'inline':
    default:
      return (
        <p 
          id={errorId}
          className={`mt-1 text-sm text-red-600 ${className}`}
          role="alert"
          aria-live="polite"
        >
          {showIcon && (
            <span className="inline-block mr-1" aria-hidden="true">
              <AlertTriangle className="h-3 w-3 inline" />
            </span>
          )}
          {errorMessages[0]}
        </p>
      );
  }
};

FormError.propTypes = {
  id: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  className: PropTypes.string,
  showIcon: PropTypes.bool,
  variant: PropTypes.oneOf(['inline', 'block', 'alert'])
};

export default FormError;