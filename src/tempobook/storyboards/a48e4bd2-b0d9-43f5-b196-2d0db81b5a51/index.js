import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function ModalStoryboard() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1000);
  };

  const handleSubmit = () => {
    alert('Submit action triggered');
    handleClose();
  };

  return (
    <div className="bg-white p-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsOpen(true)}
      >
        Open Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Example Modal"
        onSubmit={handleSubmit}
        submitText="Save Changes"
        size="md"
      >
        <div className="space-y-4">
          <p>This is an example modal with some content.</p>
          <p>You can customize the size, title, and actions.</p>
          <div className="border border-gray-200 rounded p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Modal sizes: sm, md, lg, xl</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
