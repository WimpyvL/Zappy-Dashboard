// components/patients/components/PatientHeader.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar } from 'lucide-react';
// import PatientModal from '../PatientModal'; // Removed import for deleted component

// TODO: Re-implement Edit functionality using the new CrudModal if needed here.
// This header currently only displays info and links elsewhere.
// The edit button might need to be moved or trigger a state change in the parent (PatientDetail.jsx)
// to open the CrudModal there.

const PatientHeader = ({ patient, patientId }) => {
  // const [showAddModal, setShowAddModal] = useState(false); // State for old modal removed
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

  const navigate = useNavigate();

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
      {/* Buttons removed as requested */}
      {/* Removed old modal instance */}
    </div>
  );
};

export default PatientHeader;
