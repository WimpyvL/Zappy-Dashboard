import { useState, useEffect, useCallback } from 'react';

const useSubscriptionPlanForm = (plan, products, initialFormData) => {
  const isEditMode = !!plan;

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Load plan data if in edit mode
  useEffect(() => {
    if (isEditMode && plan) {
      setFormData({
        ...initialFormData,
        ...plan,
        // Ensure arrays are properly initialized
        allowedProductDoses: Array.isArray(plan.allowedProductDoses) ? [...plan.allowedProductDoses] : [],
        additionalBenefits: Array.isArray(plan.additionalBenefits) ? [...plan.additionalBenefits] : []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, plan, initialFormData]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked :
                    (type === 'number' || name === 'price' || name === 'discount' ||
                     name === 'trialPeriod' || name === 'minimumCommitment' || name === 'cancellationFee')
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

  // Handle dose selection
  const handleDoseSelectionChange = useCallback((productId, doseId) => {
    setFormData(prev => {
      const currentDoses = prev.allowedProductDoses || [];
      const doseIndex = currentDoses.findIndex(
        d => d.productId === productId && d.doseId === doseId
      );

      let newDoses = doseIndex > -1
        ? currentDoses.filter((_, index) => index !== doseIndex)
        : [...currentDoses, { productId, doseId }];

      return { ...prev, allowedProductDoses: newDoses };
    });
  }, []);

  // Handle tag inputs
  const handleTagsChange = useCallback((field, tags) => {
    setFormData(prev => ({ ...prev, [field]: tags }));
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (formData.price === undefined || formData.price <= 0) {
      newErrors.price = 'Price must be greater than zero';
    }

    if (!formData.allowedProductDoses || formData.allowedProductDoses.length === 0) {
      newErrors.allowedProductDoses = 'At least one product dose must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Added formData to dependency array

  // Get product dose name for display
  const getProductDoseName = useCallback((productId, doseId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Unknown Product';

    const dose = product.doses?.find(d => d.id === doseId);
    return dose ? `${product.name} ${dose.value}` : product.name;
  }, [products]); // Added products to dependency array

  return {
    formData,
    errors,
    handleInputChange,
    handleDoseSelectionChange,
    handleTagsChange,
    validateForm,
    getProductDoseName,
    setFormData // Expose setFormData for initial state setting in the component
  };
};

export default useSubscriptionPlanForm;
