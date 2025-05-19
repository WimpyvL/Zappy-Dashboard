import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import useSubscriptionPlanForm from '../../hooks/useSubscriptionPlanForm';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox, 
  FormSection,
  TagInput
} from '../ui/FormComponents';

const SubscriptionPlanModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  plan = null, 
  isSubmitting = false,
  products = []
}) => {
  const isEditMode = !!plan;
  
  // Initial form state
  const initialFormData = {
    name: '',
    description: '',
    billingFrequency: 'monthly',
    deliveryFrequency: 'monthly',
    price: 0,
    active: true,
    discount: 0,
    allowedProductDoses: [],
    category: 'hair',
    popularity: 'medium',
    requiresConsultation: true,
    additionalBenefits: [],
    stripePriceId: '',
    // Additional fields
    autoRenew: true,
    trialPeriod: 0,
    minimumCommitment: 0,
    cancellationFee: 0,
    featuredPlan: false
  };

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
  }, [isEditMode, plan]);

  // Handle input changes
  const handleInputChange = (e) => {
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
  };

  // Handle dose selection
  const handleDoseSelectionChange = (productId, doseId) => {
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
  };

  // Handle tag inputs
  const handleTagsChange = (field, tags) => {
    setFormData(prev => ({ ...prev, [field]: tags }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than zero';
    }
    
    if (formData.allowedProductDoses.length === 0) {
      newErrors.allowedProductDoses = 'At least one product dose must be selected';
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

  // Billing frequency options
  const billingFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'biannually', label: 'Biannually' },
    { value: 'annually', label: 'Annually' }
  ];

  // Delivery frequency options
  const deliveryFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Biweekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'bimonthly', label: 'Bimonthly' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'hair', label: 'Hair' },
    { value: 'ed', label: 'ED' },
    { value: 'weight-management', label: 'Weight Management' },
    { value: 'skin', label: 'Skin' },
    { value: 'general-health', label: 'General Health' }
  ];

  // Popularity options
  const popularityOptions = [
    { value: 'high', label: 'High Demand' },
    { value: 'medium', label: 'Medium Demand' },
    { value: 'low', label: 'Low Demand' }
  ];

  // Get product dose name for display
  const getProductDoseName = (productId, doseId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Unknown Product';
    
    const dose = product.doses?.find(d => d.id === doseId);
    return dose ? `${product.name} ${dose.value}` : product.name;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Save Changes' : 'Add Plan'}
      isSubmitting={isSubmitting}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div>
          <FormSection title="Basic Information">
            <FormInput
              label="Plan Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={errors.name}
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Billing Frequency"
                name="billingFrequency"
                value={formData.billingFrequency}
                onChange={handleInputChange}
                options={billingFrequencyOptions}
              />
              
              <FormSelect
                label="Delivery Frequency"
                name="deliveryFrequency"
                value={formData.deliveryFrequency}
                onChange={handleInputChange}
                options={deliveryFrequencyOptions}
              />
            </div>
            
            <FormInput
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              prefix="$"
              error={errors.price}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Discount (%)"
                name="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleInputChange}
              />
              
              <FormSelect
                label="Popularity"
                name="popularity"
                value={formData.popularity}
                onChange={handleInputChange}
                options={popularityOptions}
              />
            </div>
            
            <FormInput
              label="Stripe Price ID"
              name="stripePriceId"
              value={formData.stripePriceId}
              onChange={handleInputChange}
              placeholder="price_..."
            />
          </FormSection>
          
          <FormSection title="Subscription Terms">
            <FormCheckbox
              label="Auto-renew subscription"
              name="autoRenew"
              checked={formData.autoRenew}
              onChange={handleInputChange}
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Trial Period (days)"
                name="trialPeriod"
                type="number"
                min="0"
                value={formData.trialPeriod}
                onChange={handleInputChange}
              />
              
              <FormInput
                label="Minimum Commitment (months)"
                name="minimumCommitment"
                type="number"
                min="0"
                value={formData.minimumCommitment}
                onChange={handleInputChange}
              />
            </div>
            
            <FormInput
              label="Early Cancellation Fee"
              name="cancellationFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.cancellationFee}
              onChange={handleInputChange}
              prefix="$"
            />
          </FormSection>
          
          <FormSection title="Status">
            <div className="flex space-x-6">
              <FormCheckbox
                label="Active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />
              
              <FormCheckbox
                label="Featured Plan"
                name="featuredPlan"
                checked={formData.featuredPlan}
                onChange={handleInputChange}
              />
              
              <FormCheckbox
                label="Requires Consultation"
                name="requiresConsultation"
                checked={formData.requiresConsultation}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>
        </div>
        
        {/* Right Column */}
        <div>
          <FormSection title="Included Products">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Included Product Doses
              </label>
              <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto space-y-2">
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
                                formData.allowedProductDoses?.some(
                                  d => d.productId === product.id && d.doseId === dose.id
                                ) || false
                              }
                              onChange={() => handleDoseSelectionChange(product.id, dose.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`dose-select-${product.id}-${dose.id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {dose.value} {dose.description ? `(${dose.description})` : ''}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {products.filter(p => p.type === 'medication' && p.doses?.length > 0).length === 0 && (
                  <p className="text-xs text-gray-500">
                    No medication products with doses available.
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.allowedProductDoses?.length || 0} doses selected
              </p>
              {errors.allowedProductDoses && (
                <p className="mt-1 text-sm text-red-600">{errors.allowedProductDoses}</p>
              )}
            </div>
          </FormSection>
          
          <FormSection title="Additional Benefits">
            <TagInput
              label="Additional Benefits"
              value={formData.additionalBenefits}
              onChange={(tags) => handleTagsChange('additionalBenefits', tags)}
              placeholder="Add benefit..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Examples: Free anti-nausea medication, Priority shipping, 24/7 support
            </div>
          </FormSection>
          
          <FormSection title="Selected Products Summary">
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Included in this plan:</h4>
              {formData.allowedProductDoses?.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {formData.allowedProductDoses.map((doseRef, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {getProductDoseName(doseRef.productId, doseRef.doseId)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No products selected yet</p>
              )}
              
              {formData.discount > 0 && (
                <div className="mt-3 text-sm text-green-600 font-medium">
                  {formData.discount}% discount applied
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Monthly cost:</span>
                  <span className="font-bold">${formData.price.toFixed(2)}</span>
                </div>
                {formData.billingFrequency !== 'monthly' && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="font-medium">
                      {formData.billingFrequency.charAt(0).toUpperCase() + formData.billingFrequency.slice(1)} billing:
                    </span>
                    <span className="font-bold">
                      ${(formData.price * (
                        formData.billingFrequency === 'quarterly' ? 3 :
                        formData.billingFrequency === 'biannually' ? 6 :
                        formData.billingFrequency === 'annually' ? 12 : 1
                      )).toFixed(2)}
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

export default SubscriptionPlanModal;
