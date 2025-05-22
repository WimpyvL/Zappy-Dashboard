import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useSubscriptionDurationForm from '../../hooks/useSubscriptionDurationForm';

/**
 * Modal component for creating and editing subscription durations
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {Object} props.duration - Duration data for editing (null for create mode)
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 */
const SubscriptionDurationModal = ({ isOpen, onClose, onSubmit, duration, isSubmitting }) => {
  const isEditMode = !!duration;
  const { formData, errors, setFormData, handleInputChange, handleNumericChange, validateForm } = useSubscriptionDurationForm(duration || {});

  // Reset form when modal opens/closes or duration changes
  useEffect(() => {
    if (isOpen && duration) {
      setFormData({
        name: duration.name || '',
        duration_months: duration.duration_months || 1,
        duration_days: duration.duration_days || null,
        discount_percent: duration.discount_percent || 0
      });
    }
  }, [isOpen, duration, setFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditMode ? 'Edit Billing Cycle' : 'Add New Billing Cycle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Monthly, Quarterly, Annual"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Duration Months */}
          <div className="mb-4">
            <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Months)
            </label>
            <input
              type="number"
              id="duration_months"
              name="duration_months"
              value={formData.duration_months === null ? '' : formData.duration_months}
              onChange={handleNumericChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 1, 3, 6, 12"
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of months for this billing cycle
            </p>
          </div>

          {/* Duration Days */}
          <div className="mb-4">
            <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Days)
            </label>
            <input
              type="number"
              id="duration_days"
              name="duration_days"
              value={formData.duration_days === null ? '' : formData.duration_days}
              onChange={handleNumericChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 30, 90, 180, 365"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Specify exact number of days instead of months
            </p>
          </div>

          {/* Discount Percent */}
          <div className="mb-4">
            <label htmlFor="discount_percent" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage
            </label>
            <input
              type="number"
              id="discount_percent"
              name="discount_percent"
              value={formData.discount_percent === null ? '' : formData.discount_percent}
              onChange={handleNumericChange}
              min="0"
              max="100"
              className={`w-full p-2 border rounded-md ${errors.discount_percent ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 0, 5, 10, 15"
            />
            <p className="mt-1 text-xs text-gray-500">
              Discount percentage applied to subscriptions with this billing cycle
            </p>
            {errors.discount_percent && (
              <p className="mt-1 text-sm text-red-500">{errors.discount_percent}</p>
            )}
          </div>

          {/* Duration Error */}
          {errors.duration && (
            <div className="mb-4">
              <p className="text-sm text-red-500">{errors.duration}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionDurationModal;
