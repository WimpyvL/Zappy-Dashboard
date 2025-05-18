import React, { useState } from 'react';
import PatientSelectionModal from '@/pages/consultations/components/PatientSelectionModal';

export default function PatientSelectionModalStoryboard() {
  const [isOpen, setIsOpen] = useState(true);

  // Mock the usePatients hook
  const originalModule = require('@/apis/patients/hooks');

  // Sample patients data
  const samplePatients = [
    {
      id: 'patient_1',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
    },
    {
      id: 'patient_2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.j@example.com',
    },
    {
      id: 'patient_3',
      first_name: 'Robert',
      last_name: 'Davis',
      email: 'robert.d@example.com',
    },
    {
      id: 'patient_4',
      first_name: 'Emily',
      last_name: 'Wilson',
      email: 'emily.w@example.com',
    },
    {
      id: 'patient_5',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.b@example.com',
    },
  ];

  // Override the hook
  originalModule.usePatients = () => ({
    data: { data: samplePatients },
    isLoading: false,
    error: null,
  });

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1500);
  };

  const handleSelectPatient = (patient) => {
    console.log('Selected patient:', patient);
    handleClose();
  };

  return (
    <div className="bg-white p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Select Patient
        </button>
      </div>

      <PatientSelectionModal
        isOpen={isOpen}
        onClose={handleClose}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}
