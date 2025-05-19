import { useState, useEffect, useCallback } from 'react';

const useSubscriptionDurationForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]); // Added errors to dependency array

  // Handle numeric field changes
  const handleNumericChange = useCallback((e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : parseFloat(value);

    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]); // Added errors to dependency array

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if ((formData.duration_months === undefined || formData.duration_months <= 0) && (formData.duration_days === undefined || formData.duration_days <= 0)) {
       newErrors.duration = 'At least one duration type (months or days) must be greater than 0.';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Added formData to dependency array

  return {
    formData,
    errors,
    handleInputChange,
    handleNumericChange,
    validateForm,
    setFormData // Expose setFormData for initial state setting in the component
  };
};

export default useSubscriptionDurationForm;
