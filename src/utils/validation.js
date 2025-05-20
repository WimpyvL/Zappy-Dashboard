/**
 * Validation utility functions for form inputs
 */

/**
 * Validates an email address with a more robust regex than simple \S+@\S+\.\S+
 * This regex checks for proper email format including domain validation
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validates a height string in the format of feet'inches (e.g., 5'10)
 * @param {string} height - The height string to validate
 * @returns {boolean} - Whether the height format is valid
 */
export const isValidHeight = (height) => {
  const heightRegex = /^\d+'(?:\d{1,2})$/;
  return heightRegex.test(height);
};

/**
 * Validates if a value is a positive number
 * @param {string|number} value - The value to validate
 * @returns {boolean} - Whether the value is a positive number
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The user input to sanitize
 * @returns {string} - The sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates form data based on provided validation rules
 * @param {Object} data - The form data to validate
 * @param {Object} rules - The validation rules
 * @returns {Object} - Object containing any validation errors
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, validations]) => {
    // Get the field value, handling nested objects with dot notation
    const fieldPath = field.split('.');
    let value = data;
    for (const path of fieldPath) {
      value = value?.[path];
      if (value === undefined) break;
    }

    // Apply each validation rule
    validations.forEach(validation => {
      if (validation.required && (value === undefined || value === null || value === '')) {
        errors[field] = validation.message || `${field} is required`;
      } else if (value !== undefined && value !== null && value !== '') {
        if (validation.pattern && !validation.pattern.test(value)) {
          errors[field] = validation.message || `${field} format is invalid`;
        }
        if (validation.validator && !validation.validator(value)) {
          errors[field] = validation.message || `${field} is invalid`;
        }
      }
    });
  });

  return errors;
};