// components/patients/components/PatientHeader.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar } from 'lucide-react';
import PatientModal from '../PatientModal';

const PatientHeader = ({ patient, patientId }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  // Removed unused calculateAge function

  // Format date for display (e.g., Jan 1, 1990)
  //   const today = new Date();
  //   let age = today.getFullYear() - birthDate.getFullYear();
  //   const m = today.getMonth() - birthDate.getMonth();
  //   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
  //     age--;
  //   }
  //   return age;
  // };

  // Format date for display (e.g., Jan 1, 1990)
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown DOB';
    try {
      const date = new Date(dateString);
      // Add check for invalid date object after parsing
      if (isNaN(date.getTime())) {
          return 'Invalid DOB';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid DOB Format';
    }
  };


  return (
    <div className="flex justify-between items-center">
      <div>
        <Link
          to="/patients"
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Patients
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">
          {/* Use first_name and last_name from schema */}
          {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient Name'}{' '}
          <span className="text-lg font-normal text-gray-500">
            {/* Use date_of_birth from schema */}
            ({formatDate(patient.date_of_birth)})
          </span>
        </h1>
      </div>
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </button>
        <button
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          onClick={() =>
            (window.location.href = `/sessions/new?patientId=${patientId}`)
          }
        >
          <Calendar className="h-4 w-4 mr-1" />
          Schedule Session
        </button>
      </div>
      <PatientModal
        isOpen={showAddModal}
        patientData={{ ...patient }}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default PatientHeader;
