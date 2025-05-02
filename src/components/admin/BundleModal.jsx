import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox, 
  FormSection,
  TagInput
} from '../ui/FormComponents';

const BundleModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  bundle = null, 
  isSubmitting = false,
  products = []
}) => {
  const isEditMode = !!bundle;
  
  // Initial form state
  const initialFormData = {
    name: '',
    description: '',
    bundleId: '',
    category: 'hair',
    price: 0,
    discount: 0,
    active: true,
    includedProducts: [],
    stripePriceId: '',
    // Additional fields
    limitedTimeOffer: false,
    offerEndDate: '',
    featured: false,
    shippingIncluded: true,
    tags: []
  };

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
  }, [isEditMode, bundle]);

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
  const handleInputChange = (e) => {
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
  };

  // Handle product selection
  const handleProductSelectionChange = (productId, doseId = null) => {
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
  };

  // Handle product quantity change
  const handleQuantityChange = (productId, doseId, quantity) => {
    setFormData(prev => {
      const newProducts = prev.includedProducts.map(item => {
        if (item.productId === productId && (doseId ? item.doseId === doseId : !item.doseId)) {
          return { ...item, quantity: parseInt(quantity) || 1 };
        }
        return item;
      });
      
      return { ...prev, includedProducts: newProducts };
    });
  };

  // Handle tag inputs
  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Bundle name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than zero';
    }
    
    if (formData.includedProducts.length === 0) {
      newErrors.includedProducts = 'At least one product must be included';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Category options
  const categoryOptions = [
    { value: 'hair', label: 'Hair' },
    { value: 'ed', label: 'ED' },
    { value: 'weight-management', label: 'Weight Management' },
    { value: 'skin', label: 'Skin' },
    { value: 'general-health', label: 'General Health' }
  ];

  // Get product name for display
  const getProductName = (productId, doseId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Unknown Product';
    
    if (doseId && product.doses) {
      const dose = product.doses.find(d => d.id === doseId);
      return dose ? `${product.name} ${dose.value}` : product.name;
    }
    
    return product.name;
  };

  // Get product price for display
  const getProductPrice = (productId, doseId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    if (product.type === 'medication' && doseId) {
      return product.oneTimePurchasePrice || 0;
    }
    
    return product.price || 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Bundle' : 'Create New Bundle'}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Save Changes' : 'Create Bundle'}
      isSubmitting={isSubmitting}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div>
          <FormSection title="Basic Information">
            <FormInput
              label="Bundle Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={errors.name}
            />
            
            <FormInput
              label="Bundle ID"
              name="bundleId"
              value={formData.bundleId}
              onChange={handleInputChange}
              placeholder="BN-HAIR-001"
            />
            
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
            
            <FormSelect
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions}
            />
            
            <FormInput
              label="Bundle Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              prefix="$"
              error={errors.price}
            />
            
            <FormInput
              label="Stripe Price ID"
              name="stripePriceId"
              value={formData.stripePriceId}
              onChange={handleInputChange}
              placeholder="price_..."
            />
            
            <TagInput
              label="Tags"
              value={formData.tags}
              onChange={handleTagsChange}
              placeholder="Add tag..."
            />
          </FormSection>
          
          <FormSection title="Offer Details">
            <FormCheckbox
              label="Limited Time Offer"
              name="limitedTimeOffer"
              checked={formData.limitedTimeOffer}
              onChange={handleInputChange}
            />
            
            {formData.limitedTimeOffer && (
              <div className="mt-3">
                <FormInput
                  label="Offer End Date"
                  name="offerEndDate"
                  type="date"
                  value={formData.offerEndDate}
                  onChange={handleInputChange}
                />
              </div>
            )}
            
            <div className="flex space-x-6 mt-4">
              <FormCheckbox
                label="Featured Bundle"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              
              <FormCheckbox
                label="Shipping Included"
                name="shippingIncluded"
                checked={formData.shippingIncluded}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>
          
          <FormSection title="Status">
            <FormCheckbox
              label="Active"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
            />
          </FormSection>
        </div>
        
        {/* Right Column */}
        <div>
          <FormSection title="Included Products">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Products to Include
              </label>
              <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto space-y-4">
                {/* Regular Products */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">Products</h4>
                  <div className="space-y-1">
                    {products
                      .filter(p => p.type !== 'medication' || !p.doses?.length)
                      .map(product => (
                        <div key={product.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`product-select-${product.id}`}
                            checked={
                              formData.includedProducts?.some(
                                p => p.productId === product.id && !p.doseId
                              ) || false
                            }
                            onChange={() => handleProductSelectionChange(product.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`product-select-${product.id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {product.name} - ${product.price?.toFixed(2) || '0.00'}
                          </label>
                          
                          {formData.includedProducts?.some(
                            p => p.productId === product.id && !p.doseId
                          ) && (
                            <div className="ml-auto flex items-center">
                              <label className="text-xs text-gray-500 mr-2">Qty:</label>
                              <input
                                type="number"
                                min="1"
                                value={
                                  formData.includedProducts.find(
                                    p => p.productId === product.id && !p.doseId
                                  )?.quantity || 1
                                }
                                onChange={(e) => handleQuantityChange(product.id, null, e.target.value)}
                                className="w-12 h-6 text-xs border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Medication Products with Doses */}
                {products
                  .filter(p => p.type === 'medication' && p.doses?.length > 0)
                  .map(product => (
                    <div key={product.id}>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">
                        {product.name}
                      </h4>
                      <div className="pl-2 space-y-1">
                        {product.doses.map(dose => (
                          <div key={dose.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`dose-select-${product.id}-${dose.id}`}
                              checked={
                                formData.includedProducts?.some(
                                  p => p.productId === product.id && p.doseId === dose.id
                                ) || false
                              }
                              onChange={() => handleProductSelectionChange(product.id, dose.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`dose-select-${product.id}-${dose.id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {dose.value} - ${product.oneTimePurchasePrice?.toFixed(2) || '0.00'}
                            </label>
                            
                            {formData.includedProducts?.some(
                              p => p.productId === product.id && p.doseId === dose.id
                            ) && (
                              <div className="ml-auto flex items-center">
                                <label className="text-xs text-gray-500 mr-2">Qty:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    formData.includedProducts.find(
                                      p => p.productId === product.id && p.doseId === dose.id
                                    )?.quantity || 1
                                  }
                                  onChange={(e) => handleQuantityChange(product.id, dose.id, e.target.value)}
                                  className="w-12 h-6 text-xs border-gray-300 rounded"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {products.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No products available.
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.includedProducts?.length || 0} products selected
              </p>
              {errors.includedProducts && (
                <p className="mt-1 text-sm text-red-600">{errors.includedProducts}</p>
              )}
            </div>
          </FormSection>
          
          <FormSection title="Bundle Summary">
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Included in this bundle:</h4>
              {formData.includedProducts?.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {formData.includedProducts.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>
                          {getProductName(item.productId, item.doseId)}
                          {item.quantity > 1 ? ` (x${item.quantity})` : ''}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        ${(getProductPrice(item.productId, item.doseId) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No products selected yet</p>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Regular Total:</span>
                  <span className="font-medium">${regularTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm mt-1">
                  <span className="font-medium">Bundle Price:</span>
                  <span className="font-bold">${formData.price.toFixed(2)}</span>
                </div>
                
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-sm mt-1 text-green-600">
                    <span className="font-medium">Savings:</span>
                    <span className="font-medium">
                      ${(regularTotal - formData.price).toFixed(2)} ({calculatedDiscount.toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </Modal>
  );
};

export default BundleModal;
