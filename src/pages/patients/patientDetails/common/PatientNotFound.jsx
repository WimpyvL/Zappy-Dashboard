// components/common/PatientNotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PatientNotFound = ({ patientId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-red-600 mb-4">Patient Not Found</h2>
      <p>Patient ID: {patientId}</p>
      <div className="mt-4">
        <Link to="/patients" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Patients List
        </Link>
      </div>
    </div>
  );
};

export default PatientNotFound;
