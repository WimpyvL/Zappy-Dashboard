// components/patients/components/PatientInfo.jsx
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import PatientSubscriptions from '../PatientSubscriptions';
import StatusBadge from './common/StatusBadge';

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
                {patient.address || 'No address on file'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="text-sm font-medium">
              {patient.dob} (Age: {calculateAge(patient.dob)})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div>
              <StatusBadge status={patient.status} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preferred Pharmacy</p>
            <p className="text-sm font-medium">
              {patient.preferredPharmacy || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Information Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Medical Information
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Assigned Doctor</p>
            <p className="text-sm font-medium">{patient.assignedDoctor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Medication</p>
            <p className="text-sm font-medium">{patient.medication}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Medical Notes</p>
            <p className="text-sm font-medium">
              {patient.medicalNotes || 'No notes available'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Visit</p>
            <p className="text-sm font-medium">
              {patient.lastVisit
                ? formatDate(patient.lastVisit)
                : 'No visits recorded'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Appointment</p>
            <p className="text-sm font-medium">
              {patient.nextAppointment
                ? formatDate(patient.nextAppointment)
                : 'No appointment scheduled'}
            </p>
          </div>
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
