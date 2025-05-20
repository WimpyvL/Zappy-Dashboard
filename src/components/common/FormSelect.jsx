import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable form select component with accessibility features
 */
const FormSelect = forwardRef(({
  id,
  name,
  label,
  value = '',
  options = [],
  placeholder = 'Select an option',
  helpText,
  error,
  required = false,
  disabled = false,
  className = '',
  onChange,
  onBlur,
  onFocus,
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  ...props
}, ref) => {
  // Generate unique IDs for accessibility
  const selectId = id || `select-${name}`;
  const helpTextId = helpText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  
  // Combine aria-describedby values
  const describedBy = [
    ariaDescribedBy,
    helpTextId,
    errorId
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-1`}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          className={`block w-full p-2 pr-8 border ${
            error 
              ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } rounded-md shadow-sm appearance-none bg-white ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => {
            // Handle both string options and {value, label} objects
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {helpText && !error && (
        <p 
          id={helpTextId}
          className="mt-1 text-xs text-gray-500"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

FormSelect.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
      })
    ])
  ),
  placeholder: PropTypes.string,
  helpText: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  ariaDescribedBy: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string
};

export default FormSelect;