// components/patients/components/PatientInfo.jsx
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react'; // Removed unused StatusBadge import
import PatientSubscriptions from '../PatientSubscriptions';
// Removed StatusBadge import as 'status' column doesn't exist on patients table

const PatientInfo = ({ patient }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Calculate patient age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Patient Information Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Patient Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm font-medium">{patient.phone}</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-sm font-medium">
                {/* Use separate address fields from schema */}
                {patient.address || patient.city || patient.state || patient.zip
                  ? `${patient.address || ''}${patient.city ? ', ' + patient.city : ''}${patient.state ? ', ' + patient.state : ''} ${patient.zip || ''}`.trim().replace(/^,|,$/g, '').replace(/ , /g, ', ')
                  : 'No address on file'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="text-sm font-medium">
              {/* Use date_of_birth from schema */}
              {formatDate(patient.date_of_birth)} (Age: {calculateAge(patient.date_of_birth)})
            </p>
          </div>
          {/* Removed Status section as 'status' column doesn't exist on patients */}
          {/* Removed Preferred Pharmacy section as column doesn't exist on patients */}
        </div>
      </div>

      {/* Medical Information Card - Removed fields not directly on patient record */}
      {/* TODO: Fetch and display related medical info (doctor, meds, notes, visits) separately */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Medical Information (Placeholder)
        </h2>
        <div className="space-y-3 text-sm text-gray-500">
          <p>Assigned Doctor: (Data not available)</p>
          <p>Current Medication: (Data not available)</p>
          <p>Medical Notes: (Data not available)</p>
          <p>Last Visit: (Data not available)</p>
          <p>Next Appointment: (Data not available)</p>
          {/* Add links or buttons here later to navigate to relevant sections like Notes or Sessions */}
        </div>
      </div>

      {/* Subscription Card */}
      <div className="md:col-span-2">
        <PatientSubscriptions patient={patient} />
      </div>
    </div>
  );
};

export default PatientInfo;
