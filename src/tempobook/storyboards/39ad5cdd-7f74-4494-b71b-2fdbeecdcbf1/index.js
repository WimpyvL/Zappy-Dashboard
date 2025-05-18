import React, { useState } from 'react';
import CategoryModal from '@/components/admin/CategoryModal';

export default function CategoryModalStoryboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample category for edit mode
  const sampleCategory = {
    name: 'Hair Loss',
    description:
      'Products and services related to hair loss treatment and prevention',
    categoryId: 'hair-loss',
    status: 'active',
    displayOrder: 2,
    icon: 'hair',
    showInMarketplace: true,
    showInAdmin: true,
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1500);
  };

  const handleSubmit = (formData) => {
    console.log('Form submitted with data:', formData);
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
    }, 1000);
  };

  return (
    <div className="bg-white p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Open Modal
        </button>
      </div>

      <CategoryModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        category={sampleCategory} // Comment this line to see create mode
        isSubmitting={isSubmitting}
        productCount={12} // Only shown in edit mode
      />
    </div>
  );
}
