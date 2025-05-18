import React, { useState } from 'react';
import EmailPatientModal from '@/pages/consultations/components/EmailPatientModal';

export default function EmailPatientModalStoryboard() {
  const [isOpen, setIsOpen] = useState(true);

  // Sample consultation for the modal
  const sampleConsultation = {
    id: 'consult_123',
    patientName: 'John Smith',
    email: 'john.smith@example.com',
    service: 'Weight Management',
    status: 'pending',
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1500);
  };

  return (
    <div className="bg-white p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Open Email Modal
        </button>
      </div>

      <EmailPatientModal
        isOpen={isOpen}
        onClose={handleClose}
        consultation={sampleConsultation}
      />
    </div>
  );
}
