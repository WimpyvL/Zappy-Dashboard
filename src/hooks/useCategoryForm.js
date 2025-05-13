import { useState, useEffect, useCallback } from 'react';

const useCategoryForm = (category, initialFormData) => {
  const isEditMode = !!category;

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Load category data if in edit mode
  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        ...initialFormData,
        ...category
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, category, initialFormData]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked :
                    (type === 'number' || name === 'display_order')
                      ? parseFloat(value) || 0
                      : value;

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

  // Auto-generate category_id from name
  const handleNameChange = useCallback((e) => {
    const name = e.target.value;
    handleInputChange(e);

    // Only auto-generate if not in edit mode and category_id hasn't been manually set
    if (!isEditMode && !formData.category_id) {
      const category_id = name.toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric characters except hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with a single hyphen
        .replace(/^-|-$/g, '');      // Remove leading and trailing hyphens

      setFormData(prev => ({ ...prev, category_id }));
    }
  }, [isEditMode, formData.category_id, handleInputChange]); // Added dependencies

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.category_id.trim()) {
      newErrors.category_id = 'Category ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.category_id)) {
      newErrors.category_id = 'Category ID must contain only lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Added formData to dependency array

  return {
    formData,
    errors,
    handleInputChange,
    handleNameChange,
    validateForm,
    setFormData // Expose setFormData for initial state setting in the component
  };
};

export default useCategoryForm;
