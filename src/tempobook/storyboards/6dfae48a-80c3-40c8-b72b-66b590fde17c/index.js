import React from 'react';
import PharmacyTable from '@/pages/pharmacy/components/PharmacyTable';

export default function PharmacyTableStoryboard() {
  // Sample pharmacies data
  const samplePharmacies = [
    {
      id: 'pharm_1',
      name: 'MedRx Pharmacy',
      pharmacy_type: 'Compounding',
      contact_name: 'Sarah Johnson',
      contact_email: 'sarah@medrx.example.com',
      contact_phone: '(555) 123-4567',
      active: true,
      served_state_codes: ['CA', 'NY', 'TX', 'FL'],
    },
    {
      id: 'pharm_2',
      name: 'HealthPlus Pharmacy',
      pharmacy_type: 'Retail',
      contact_name: 'Michael Brown',
      contact_email: 'michael@healthplus.example.com',
      contact_phone: '(555) 987-6543',
      active: true,
      served_state_codes: ['WA', 'OR', 'CA', 'AZ'],
    },
    {
      id: 'pharm_3',
      name: 'CareFirst Pharmacy',
      pharmacy_type: 'Mail Order',
      contact_name: 'Jessica Lee',
      contact_email: 'jessica@carefirst.example.com',
      contact_phone: '(555) 456-7890',
      active: false,
      served_state_codes: ['NY', 'NJ', 'CT', 'PA', 'MA'],
    },
  ];

  const handleEdit = (pharmacy) => {
    console.log('Edit pharmacy:', pharmacy);
  };

  const handleDelete = (pharmacyId) => {
    console.log('Delete pharmacy with ID:', pharmacyId);
  };

  return (
    <div className="bg-white p-4">
      <h2 className="text-xl font-bold mb-4">Pharmacy Management</h2>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <PharmacyTable
          pharmacies={samplePharmacies}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
