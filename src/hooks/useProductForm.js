import { useState, useEffect, useCallback } from 'react';

const useProductForm = (product, services, initialFormData) => {
  const isEditMode = !!product;

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        ...initialFormData,
        ...product,
        // Ensure arrays are properly initialized
        associatedServiceIds: Array.isArray(product.associatedServiceIds) ? [...product.associatedServiceIds] : [],
        interactionWarnings: Array.isArray(product.interactionWarnings) ? [...product.interactionWarnings] : [],
        doses: Array.isArray(product.doses)
          ? product.doses.map(d => ({ ...d, id: d.id || `temp_${Date.now()}` }))
          : [],
        indications: Array.isArray(product.indications) ? [...product.indications] : [],
        contraindications: Array.isArray(product.contraindications) ? [...product.contraindications] : [],
        educationalMaterials: Array.isArray(product.educationalMaterials) ? [...product.educationalMaterials] : [],
        restrictedStates: Array.isArray(product.restrictedStates) ? [...product.restrictedStates] : []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, product, initialFormData]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked :
                    (type === 'number' || name === 'price' || name === 'oneTimePurchasePrice')
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

  // Handle service selection
  const handleServiceSelectionChange = useCallback((serviceId) => {
    setFormData(prev => {
      const currentIds = prev.associatedServiceIds || [];
      const newIds = currentIds.includes(serviceId)
        ? currentIds.filter(id => id !== serviceId)
        : [...currentIds, serviceId];
      return { ...prev, associatedServiceIds: newIds };
    });
  }, []);

  // Handle tag inputs
  const handleTagsChange = useCallback((field, tags) => {
    setFormData(prev => ({ ...prev, [field]: tags }));
  }, []);

  // Handle doses changes
  const handleDosesChange = useCallback((updatedDoses) => {
    setFormData(prev => ({ ...prev, doses: updatedDoses }));
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.type === 'medication' && (!formData.doses || formData.doses.length === 0)) {
      newErrors.doses = 'At least one dose is required for medications';
    }

    if (formData.type !== 'medication' && (formData.price === undefined || formData.price <= 0)) {
      newErrors.price = 'Price must be greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Added formData to dependency array

  // Toggle shipping restrictions
  const toggleShippingRestrictions = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      shippingRestrictions: !prev.shippingRestrictions,
      restrictedStates: !prev.shippingRestrictions ? prev.restrictedStates : []
    }));
  }, []);

  // Toggle state restriction
  const toggleStateRestriction = useCallback((state) => {
    setFormData(prev => {
      const currentStates = prev.restrictedStates || [];
      const newStates = currentStates.includes(state)
        ? currentStates.filter(s => s !== state)
        : [...currentStates, state];
      return { ...prev, restrictedStates: newStates };
    });
  }, []);

  return {
    formData,
    errors,
    handleInputChange,
    handleServiceSelectionChange,
    handleTagsChange,
    handleDosesChange,
    validateForm,
    toggleShippingRestrictions,
    toggleStateRestriction,
    setFormData // Expose setFormData for initial state setting in the component
  };
};

export default useProductForm;
