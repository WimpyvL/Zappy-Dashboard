import React, { useState } from 'react';
import PharmacyFormModal from '@/pages/pharmacy/components/PharmacyFormModal';

export default function PharmacyFormModalStoryboard() {
  // Sample pharmacy data for edit mode
  const samplePharmacy = {
    name: 'MedRx Pharmacy',
    pharmacy_type: 'Compounding',
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah@medrx.example.com',
    contact_phone: '(555) 123-4567',
    active: true,
    served_state_codes: ['CA', 'NY', 'TX', 'FL'],
  };

  const handleSubmit = async (formData) => {
    console.log('Form submitted with data:', formData);
    // Simulate successful submission
    return true;
  };

  return (
    <div className="bg-white p-4">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-4">Create New Pharmacy</h2>
          <PharmacyFormModal
            onClose={() => console.log('Close clicked')}
            onSubmit={handleSubmit}
            title="Add New Pharmacy"
            submitText="Create Pharmacy"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Edit Existing Pharmacy</h2>
          <PharmacyFormModal
            onClose={() => console.log('Close clicked')}
            onSubmit={handleSubmit}
            title="Edit Pharmacy"
            submitText="Save Changes"
            initialData={samplePharmacy}
          />
        </div>
      </div>
    </div>
  );
}
