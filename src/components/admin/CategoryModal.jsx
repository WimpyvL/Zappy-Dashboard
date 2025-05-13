import React from 'react';
import Modal from '../ui/Modal';
import useCategoryForm from '../../hooks/useCategoryForm';
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

  // Initial form state definition (can be kept here or moved to hook)
  const initialFormData = {
    name: '',
    description: '',
    category_id: '',
    status: 'active',
    display_order: 0,
    icon: '',
    show_in_marketplace: true,
    show_in_admin: true
  };

  const {
    formData,
    errors,
    handleInputChange,
    handleNameChange,
    validateForm,
  } = useCategoryForm(category, initialFormData);

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
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          placeholder="e.g. hair-loss"
          required
          error={errors.category_id}
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
          name="display_order"
          type="number"
          min="0"
          step="1"
          value={formData.display_order}
          onChange={handleInputChange}
          helpText="Lower numbers appear first in lists"
        />
      </FormSection>

      <FormSection title="Display Options">
        <div className="flex space-x-6">
          <FormCheckbox
            label="Show in Marketplace"
            name="show_in_marketplace"
            checked={formData.show_in_marketplace}
            onChange={handleInputChange}
          />

          <FormCheckbox
            label="Show in Admin"
            name="show_in_admin"
            checked={formData.show_in_admin}
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
