import { useState, useCallback, useEffect } from 'react';
import { validateForm } from '../utils/validation';

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for form fields
 * @param {Function} onSubmit - Function to call on successful form submission
 * @returns {Object} - Form state, handlers, and validation state
 */
const useFormValidation = (initialValues, validationRules, onSubmit) => {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when initialValues change
  useEffect(() => {
    setValues(initialValues || {});
  }, [initialValues]);
  
  // Handle input change
  const handleChange = useCallback((name, value) => {
    // Support for nested properties using dot notation (e.g., 'user.name')
    if (name.includes('.')) {
      const parts = name.split('.');
      const lastPart = parts.pop();
      
      setValues(prevValues => {
        // Create a deep copy to avoid mutating the previous state
        const newValues = JSON.parse(JSON.stringify(prevValues));
        
        // Navigate to the nested object
        let current = newValues;
        for (const part of parts) {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
        
        // Set the value
        current[lastPart] = value;
        return newValues;
      });
    } else {
      setValues(prevValues => ({
        ...prevValues,
        [name]: value
      }));
    }
    
    // Mark field as touched
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  }, [errors]);
  
  // Handle input blur
  const handleBlur = useCallback((name) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    // Validate the field on blur
    const fieldRules = {};
    Object.keys(validationRules).forEach(key => {
      if (key === name || key.startsWith(`${name}.`)) {
        fieldRules[key] = validationRules[key];
      }
    });
    
    if (Object.keys(fieldRules).length > 0) {
      const fieldErrors = validateForm(values, fieldRules);
      setErrors(prevErrors => ({
        ...prevErrors,
        ...fieldErrors
      }));
    }
  }, [values, validationRules]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Validate all fields
    const formErrors = validateForm(values, validationRules);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // If no errors, submit the form
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors(prevErrors => ({
          ...prevErrors,
          form: error.message || 'An error occurred during submission'
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validationRules, onSubmit]);
  
  // Reset the form
  const resetForm = useCallback(() => {
    setValues(initialValues || {});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set a specific form value
  const setFieldValue = useCallback((name, value) => {
    handleChange(name, value);
  }, [handleChange]);
  
  // Set multiple form values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues
    }));
  }, []);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setMultipleValues
  };
};

export default useFormValidation;