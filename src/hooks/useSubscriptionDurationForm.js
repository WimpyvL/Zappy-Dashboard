import { useState } from 'react';

/**
 * Custom hook for managing subscription duration form state and validation
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and handlers
 */
const useSubscriptionDurationForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    duration_months: initialData.duration_months || 1,
    duration_days: initialData.duration_days || null,
    discount_percent: initialData.discount_percent || 0
  });

  const [errors, setErrors] = useState({});

  /**
   * Handle text input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Handle numeric input changes
   * @param {Event} e - Input change event
   */
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : Number(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate the form data
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    
    // Validate duration
    if (
      (formData.duration_months === 0 || formData.duration_months === null || formData.duration_months === '') && 
      (formData.duration_days === 0 || formData.duration_days === null || formData.duration_days === '')
    ) {
      newErrors.duration = 'Either months or days duration must be specified';
    }
    
    // Validate discount percent
    if (formData.discount_percent < 0 || formData.discount_percent > 100) {
      newErrors.discount_percent = 'Discount must be between 0 and 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    errors,
    setFormData,
    handleInputChange,
    handleNumericChange,
    validateForm
  };
};

export default useSubscriptionDurationForm;
