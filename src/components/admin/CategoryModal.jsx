import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox, 
  FormSection
} from '../ui/FormComponents';

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category = null, 
  isSubmitting = false,
  productCount = 0
}) => {
  const isEditMode = !!category;
  
  // Initial form state
  const initialFormData = {
    name: '',
    description: '',
    categoryId: '',
    status: 'active',
    displayOrder: 0,
    icon: '',
    showInMarketplace: true,
    showInAdmin: true
  };

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
  }, [isEditMode, category]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                    (type === 'number' || name === 'displayOrder') 
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

  // Auto-generate categoryId from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    handleInputChange(e);
    
    // Only auto-generate if not in edit mode and categoryId hasn't been manually set
    if (!isEditMode && !formData.categoryId) {
      const categoryId = name.toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric characters except hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with a single hyphen
        .replace(/^-|-$/g, '');      // Remove leading and trailing hyphens
      
      setFormData(prev => ({ ...prev, categoryId }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.categoryId.trim()) {
      newErrors.categoryId = 'Category ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.categoryId)) {
      newErrors.categoryId = 'Category ID must contain only lowercase letters, numbers, and hyphens';
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

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];

  // Icon options (can be expanded)
  const iconOptions = [
    { value: '', label: 'None' },
    { value: 'pill', label: 'Pill' },
    { value: 'heart', label: 'Heart' },
    { value: 'hair', label: 'Hair' },
    { value: 'brain', label: 'Brain' },
    { value: 'skin', label: 'Skin' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Category' : 'Add New Category'}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Save Changes' : 'Create Category'}
      isSubmitting={isSubmitting}
      size="md"
    >
      <FormSection title="Basic Information">
        <FormInput
          label="Category Name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          required
          error={errors.name}
        />
        
        <FormInput
          label="Category ID"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          placeholder="e.g. hair-loss"
          required
          error={errors.categoryId}
          helpText="Unique identifier for the category. Use lowercase with hyphens."
        />
        
        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Briefly describe what products and services fall under this category"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions}
          />
          
          <FormSelect
            label="Icon"
            name="icon"
            value={formData.icon}
            onChange={handleInputChange}
            options={iconOptions}
          />
        </div>
        
        <FormInput
          label="Display Order"
          name="displayOrder"
          type="number"
          min="0"
          step="1"
          value={formData.displayOrder}
          onChange={handleInputChange}
          helpText="Lower numbers appear first in lists"
        />
      </FormSection>
      
      <FormSection title="Display Options">
        <div className="flex space-x-6">
          <FormCheckbox
            label="Show in Marketplace"
            name="showInMarketplace"
            checked={formData.showInMarketplace}
            onChange={handleInputChange}
          />
          
          <FormCheckbox
            label="Show in Admin"
            name="showInAdmin"
            checked={formData.showInAdmin}
            onChange={handleInputChange}
          />
        </div>
      </FormSection>
      
      {isEditMode && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            This category is currently used by <span className="font-medium">{productCount}</span> products.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default CategoryModal;
