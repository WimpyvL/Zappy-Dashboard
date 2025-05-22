import React from 'react';
import { X } from 'lucide-react';

/**
 * A reusable modal component for CRUD operations
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Modal title
 * @param {boolean} props.isSubmitting - Whether a submission is in progress
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {string} props.submitButtonText - Text for the submit button
 * @param {React.ReactNode} props.children - Modal content
 */
const CrudModal = ({
  isOpen,
  onClose,
  title,
  isSubmitting = false,
  onSubmit,
  submitButtonText = 'Save',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 opacity-100">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={!isSubmitting ? onClose : undefined}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative transition-transform duration-300 scale-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;
