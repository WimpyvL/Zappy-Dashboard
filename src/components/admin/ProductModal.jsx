import React, { useState } from 'react';
import Modal from '../ui/Modal';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormSection,
  TagInput
} from '../ui/FormComponents';

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  isSubmitting = false,
  services = []
}) => {
  const isEditMode = !!product;

  // Simplified initial form state
  const initialFormData = {
    name: '',
    description: '',
    price: 0,
    active: true,
    requiresPrescription: false,
    isProgram: false,
    category: 'weight-management',
    interactionWarnings: [],
    doses: [],
    drugClass: '',
    ndcCode: '',
    indications: [],
    contraindications: [],
    // Program-specific fields
    programContent: '',
    programDuration: '',
    educationalContentId: '',
    // Keep these for compatibility
    associatedServiceIds: [],
    stripePriceId: ''
  };

  // Initialize state directly in component
  const [formData, setFormData] = useState(
    product ? {
      name: product.name || '',
      description: product.description || '',
      price: product.price || product.oneTimePurchasePrice || 0,
      active: product.active !== undefined ? product.active : true,
      requiresPrescription: product.requiresPrescription || false,
      isProgram: product.isProgram || false,
      category: product.category || 'weight-management',
      interactionWarnings: Array.isArray(product.interactionWarnings) ? [...product.interactionWarnings] : [],
      doses: Array.isArray(product.doses) ? [...product.doses] : [],
      drugClass: product.drugClass || '',
      ndcCode: product.ndcCode || '',
      indications: Array.isArray(product.indications) ? [...product.indications] : [],
      contraindications: Array.isArray(product.contraindications) ? [...product.contraindications] : [],
      // Program-specific fields
      programContent: product.programContent || '',
      programDuration: product.programDuration || '',
      educationalContentId: product.educationalContentId || '',
      associatedServiceIds: Array.isArray(product.associatedServiceIds) ? [...product.associatedServiceIds] : [],
      stripePriceId: product.stripePriceId || product.stripeOneTimePriceId || ''
    } : initialFormData
  );
  
  const [errors, setErrors] = useState({});
  const [newDosage, setNewDosage] = useState('');
  const [newWarning, setNewWarning] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                    (type === 'number' || name === 'price') ? parseFloat(value) || 0 : value;
    
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

  // Handle category selection
  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
  };


  // Handle tags change
  const handleTagsChange = (field, tags) => {
    setFormData(prev => ({ ...prev, [field]: tags }));
  };

  // Handle dosage management
  const addDosage = () => {
    if (!newDosage.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      doses: [...prev.doses, { 
        id: `temp_${Date.now()}`,
        value: newDosage,
        allowOneTimePurchase: true
      }]
    }));
    setNewDosage('');
  };

  const removeDosage = (index) => {
    setFormData(prev => ({
      ...prev,
      doses: prev.doses.filter((_, i) => i !== index)
    }));
  };

  // Handle warnings management
  const addWarning = () => {
    if (!newWarning.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      interactionWarnings: [...prev.interactionWarnings, newWarning]
    }));
    setNewWarning('');
  };

  const removeWarning = (index) => {
    setFormData(prev => ({
      ...prev,
      interactionWarnings: prev.interactionWarnings.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (formData.requiresPrescription && formData.doses.length === 0) {
      newErrors.doses = 'At least one dosage is required for prescription products';
    }
    
    // Validate program-specific fields
    if (formData.isProgram) {
      if (!formData.programContent.trim()) {
        newErrors.programContent = 'Program summary is required';
      }
      
      if (!formData.programDuration.trim()) {
        newErrors.programDuration = 'Program duration is required';
      }
      
      if (!formData.educationalContentId.trim()) {
        newErrors.educationalContentId = 'Educational content ID is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare submission data
      const submissionData = { ...formData };
      
      // Set type based on isProgram only - simplify to just 'program' or 'product'
      submissionData.type = formData.isProgram ? 'program' : 'product';
      
      // Keep the requiresPrescription flag for products that need prescriptions
      submissionData.requiresPrescription = !formData.isProgram && formData.requiresPrescription;
      
      // Add default shipping settings
      submissionData.eligibleForShipping = !formData.isProgram; // Programs don't need shipping
      submissionData.discreetPackaging = formData.requiresPrescription; // Only use discreet packaging for prescriptions
      
      // Map price to appropriate field based on prescription requirement
      if (formData.requiresPrescription && !formData.isProgram) {
        submissionData.oneTimePurchasePrice = submissionData.price;
        submissionData.stripeOneTimePriceId = submissionData.stripePriceId;
        delete submissionData.price;
      } else {
        delete submissionData.oneTimePurchasePrice;
        delete submissionData.stripeOneTimePriceId;
      }
      
      // Clean up data based on product type
      if (!submissionData.requiresPrescription) {
        delete submissionData.doses;
        delete submissionData.drugClass;
        delete submissionData.ndcCode;
        delete submissionData.indications;
        delete submissionData.contraindications;
      }
      
      if (!submissionData.isProgram) {
        delete submissionData.programContent;
        delete submissionData.programDuration;
        delete submissionData.educationalContentId;
      }
      
      onSubmit(submissionData);
    }
  };

  // Category options
  const categories = [
    { id: 'weight-management', label: 'Weight Management' },
    { id: 'ed', label: 'ED' },
    { id: 'hair', label: 'Hair' },
    { id: 'skin', label: 'Skin' },
    { id: 'general-health', label: 'General Health' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Product' : 'Add New Product'}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Save Changes' : 'Add Product'}
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <FormSection title="Basic Information">
          <FormInput
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            error={errors.name}
          />

          {/* Category Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`px-3 py-1 text-sm rounded-md ${
                    formData.category === category.id
                      ? 'bg-blue-100 text-blue-800 border-blue-300 border'
                      : 'bg-gray-100 text-gray-800 border-gray-200 border'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />

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
            required
          />

          <FormInput
            label="Stripe Price ID"
            name="stripePriceId"
            value={formData.stripePriceId}
            onChange={handleInputChange}
            placeholder="price_..."
          />

          <div className="flex space-x-6 mt-4">
            <FormCheckbox
              label="Active"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
            />
            <FormCheckbox
              label="Requires Prescription"
              name="requiresPrescription"
              checked={formData.requiresPrescription}
              onChange={handleInputChange}
              disabled={formData.isProgram}
            />
            <FormCheckbox
              label="Is Program"
              name="isProgram"
              checked={formData.isProgram}
              onChange={(e) => {
                const isProgram = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  isProgram,
                  // If it's a program, it can't require a prescription
                  requiresPrescription: isProgram ? false : prev.requiresPrescription
                }));
              }}
            />
          </div>
        </FormSection>

        {/* Prescription Details (conditional) */}
        {formData.requiresPrescription && (
          <FormSection title="Prescription Details">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormInput
                label="Drug Class"
                name="drugClass"
                value={formData.drugClass}
                onChange={handleInputChange}
                placeholder="e.g. 5α-reductase inhibitor"
              />

              <FormInput
                label="NDC Code"
                name="ndcCode"
                value={formData.ndcCode}
                onChange={handleInputChange}
                placeholder="National Drug Code"
              />
            </div>
            
            {/* Dosages */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosages</label>
              
              {formData.doses.map((dose, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={dose.value}
                    readOnly
                    className="flex-grow p-2 border rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeDosage(index)}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  placeholder="Add new dosage (e.g., 10mg)"
                  className="flex-grow p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={addDosage}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {errors.doses && (
                <p className="text-sm text-red-600 mt-1">{errors.doses}</p>
              )}
            </div>
            
            {/* Indications */}
            <TagInput
              label="Indications"
              value={formData.indications}
              onChange={(tags) => handleTagsChange('indications', tags)}
              placeholder="Add indication..."
            />
            
            {/* Contraindications */}
            <TagInput
              label="Contraindications"
              value={formData.contraindications}
              onChange={(tags) => handleTagsChange('contraindications', tags)}
              placeholder="Add contraindication..."
            />
            
            {/* Interaction Warnings */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Warnings</label>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newWarning}
                  onChange={(e) => setNewWarning(e.target.value)}
                  placeholder="Add interaction warning..."
                  className="flex-grow p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={addWarning}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {formData.interactionWarnings.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Current warnings:</p>
                  <ul className="space-y-1">
                    {formData.interactionWarnings.map((warning, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="mr-2">•</span>
                        {warning}
                        <button
                          type="button"
                          onClick={() => removeWarning(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Program Details (conditional) */}
        {formData.isProgram && (
          <FormSection title="Program Details">
            <FormInput
              label="Program Duration"
              name="programDuration"
              value={formData.programDuration}
              onChange={handleInputChange}
              placeholder="e.g., 8 weeks, 3 months"
              error={errors.programDuration}
            />
            
            <FormInput
              label="Educational Content ID"
              name="educationalContentId"
              value={formData.educationalContentId}
              onChange={handleInputChange}
              placeholder="Enter the ID of the associated educational content"
              help="Link this program to existing educational content instead of defining content here"
            />
            
            <FormTextarea
              label="Program Summary"
              name="programContent"
              value={formData.programContent}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief summary of what this program includes"
              error={errors.programContent}
            />
            
            <div className="mt-4 bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For detailed program content, please use the Educational Resources section.
                This product should reference existing educational content rather than defining it here.
              </p>
            </div>
          </FormSection>
        )}

        {/* Associated Services */}
        <FormSection title="Associated Services">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select services related to this product
          </label>
          <select
            multiple
            className="w-full h-32 border rounded p-2"
            value={formData.associatedServiceIds.map(id => id.toString())}
            onChange={(e) => {
              const selectedOptions = Array.from(
                e.target.selectedOptions,
                option => parseInt(option.value, 10)
              );
              setFormData(prev => ({
                ...prev,
                associatedServiceIds: selectedOptions
              }));
            }}
          >
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            This helps organize products by related services in the admin interface.
          </p>
        </FormSection>
      </div>
    </Modal>
  );
};

export default ProductModal;
