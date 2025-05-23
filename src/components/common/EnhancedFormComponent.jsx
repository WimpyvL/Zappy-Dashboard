import React, { useState } from 'react';
import { validateForm } from '../../utils/validation';

/**
 * Enhanced form component with proper validation
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} props.initialData - Initial form data
 * @param {Object} props.children - Form children components
 */
export const EnhancedFormComponent = ({ onSubmit, initialData = {}, children }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validationRules = {
    name: { 
      required: true, 
      message: 'Name is required' 
    },
    email: { 
      required: true,
      pattern: /^\S+@\S+\.\S+$/,
      patternMessage: 'Invalid email format'
    },
    price: {
      required: true,
      validate: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          return 'Price must be a positive number';
        }
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validateForm(formData, validationRules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {errors.form}
        </div>
      )}
      
      {/* Form fields with consistent styling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      {/* Render children with formData, errors, and updateField */}
      {children && typeof children === 'function' 
        ? children({ formData, errors, updateField }) 
        : children}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default EnhancedFormComponent;
