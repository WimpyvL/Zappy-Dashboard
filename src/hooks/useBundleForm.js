import { useState, useEffect, useCallback } from 'react';

const useBundleForm = (bundle, products, initialFormData) => {
  const isEditMode = !!bundle;

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  const [regularTotal, setRegularTotal] = useState(0);

  // Load bundle data if in edit mode
  useEffect(() => {
    if (isEditMode && bundle) {
      setFormData({
        ...initialFormData,
        ...bundle,
        // Ensure arrays are properly initialized
        includedProducts: Array.isArray(bundle.includedProducts) ? [...bundle.includedProducts] : [],
        tags: Array.isArray(bundle.tags) ? [...bundle.tags] : []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, bundle, initialFormData]);

  // Calculate discount and regular total when included products change
  useEffect(() => {
    if (products.length > 0 && formData.includedProducts.length > 0) {
      let total = 0;

      formData.includedProducts.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (product.type === 'medication' && item.doseId) {
            const dose = product.doses?.find(d => d.id === item.doseId);
            if (dose && product.oneTimePurchasePrice) {
              total += product.oneTimePurchasePrice * (item.quantity || 1);
            }
          } else if (product.price) {
            total += product.price * (item.quantity || 1);
          }
        }
      });

      setRegularTotal(total);

      if (formData.price > 0 && total > 0) {
        const discountAmount = total - formData.price;
        const discountPercentage = (discountAmount / total) * 100;
        setCalculatedDiscount(discountPercentage);
      } else {
        setCalculatedDiscount(0);
      }
    } else {
      setRegularTotal(0);
      setCalculatedDiscount(0);
    }
  }, [formData.includedProducts, formData.price, products]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked :
                    (type === 'number' || name === 'price' || name === 'discount')
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

  // Handle product selection
  const handleProductSelectionChange = useCallback((productId, doseId = null) => {
    setFormData(prev => {
      const currentProducts = prev.includedProducts || [];
      const productIndex = currentProducts.findIndex(
        p => p.productId === productId && (doseId ? p.doseId === doseId : !p.doseId)
      );

      let newProducts;
      if (productIndex > -1) {
        // Remove product if it exists
        newProducts = currentProducts.filter((_, index) => index !== productIndex);
      } else {
        // Add product with quantity 1
        newProducts = [...currentProducts, {
          productId,
          doseId: doseId || null,
          quantity: 1
        }];
      }

      return { ...prev, includedProducts: newProducts };
    });
  }, []);

  // Handle product quantity change
  const handleQuantityChange = useCallback((productId, doseId, quantity) => {
    setFormData(prev => {
      const newProducts = prev.includedProducts.map(item => {
        if (item.productId === productId && (doseId ? item.doseId === doseId : !item.doseId)) {
          return { ...item, quantity: parseInt(quantity) || 1 };
        }
        return item;
      });

      return { ...prev, includedProducts: newProducts };
    });
  }, []);

  // Handle tag inputs
  const handleTagsChange = useCallback((tags) => {
    setFormData(prev => ({ ...prev, tags }));
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bundle name is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than zero';
    }

    if (!formData.includedProducts || formData.includedProducts.length === 0) {
      newErrors.includedProducts = 'At least one product must be included';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Added formData to dependency array

  // Get product name for display
  const getProductName = useCallback((productId, doseId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Unknown Product';

    if (doseId && product.doses) {
      const dose = product.doses.find(d => d.id === doseId);
      return dose ? `${product.name} ${dose.value}` : product.name;
    }

    return product.name;
  }, [products]); // Added products to dependency array

  // Get product price for display
  const getProductPrice = useCallback((productId, doseId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    if (product.type === 'medication' && doseId) {
      return product.oneTimePurchasePrice || 0;
    }

    return product.price || 0;
  }, [products]); // Added products to dependency array


  return {
    formData,
    errors,
    calculatedDiscount,
    regularTotal,
    handleInputChange,
    handleProductSelectionChange,
    handleQuantityChange,
    handleTagsChange,
    validateForm,
    getProductName,
    getProductPrice,
    setFormData // Expose setFormData for initial state setting in the component
  };
};

export default useBundleForm;
