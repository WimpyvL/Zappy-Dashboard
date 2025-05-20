import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth/AuthContext';

const PatientServicesHeader = ({ greeting }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold text-white">{greeting}, {user?.first_name || 'James'}</h1>
          <p className="text-teal-100 text-sm">The support you need, when you need it.</p>
        </div>
        <button
          className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
          onClick={() => navigate('/profile')}
        >
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PatientServicesHeader;
