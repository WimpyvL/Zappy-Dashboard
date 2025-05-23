/**
 * Enhanced form validation utility
 * @param {Object} formData - The form data to validate
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} - Object containing validation errors
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    // Required validation
    if (fieldRules.required) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field] = fieldRules.message || `${field} is required`;
        return;
      }
    }
    
    // Pattern validation
    if (fieldRules.pattern && value) {
      if (!fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.patternMessage || `${field} format is invalid`;
        return;
      }
    }
    
    // Custom validation
    if (fieldRules.validate && value) {
      const error = fieldRules.validate(value, formData);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return errors;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, '').replace(/-/g, ''));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Object containing validation result and message
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    message: ''
  };
  
  if (!password || password.length < 8) {
    result.message = 'Password must be at least 8 characters long';
    return result;
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    result.message = 'Password must include uppercase, lowercase, number, and special character';
    return result;
  }
  
  result.isValid = true;
  return result;
};

export default {
  validateForm,
  isValidEmail,
  isValidPhone,
  validatePassword
};
