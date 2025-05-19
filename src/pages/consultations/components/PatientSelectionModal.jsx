import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, User, Loader2, Search } from 'lucide-react';
import { usePatients } from '../../../apis/patients/hooks'; // Assuming hook exists
import { debounce } from 'lodash';

const PatientSelectionModal = ({ isOpen, onClose, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input
  const debounceSearch = useMemo(() => debounce(setDebouncedSearchTerm, 300), []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debounceSearch(value);
  };

  // Fetch patients based on debounced search term
  const { data: patientsData, isLoading, error } = usePatients(1, { search: debouncedSearchTerm }, 50); // Fetch page 1, limit 50

  const patients = patientsData?.data || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Select Patient for Consultation
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-4 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-gray-400" />
             </div>
            <input
              type="text"
              placeholder="Search patients by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 border rounded-md">
            {isLoading ? (
              <div className="text-center p-4">
                <Loader2 className="h-6 w-6 animate-spin inline-block text-primary" />
              </div>
            ) : error ? (
               <div className="text-center p-4 text-red-600">Error loading patients.</div>
            ) : patients.length > 0 ? (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  className="py-3 px-4 flex items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectPatient(patient)}
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent1/10 flex items-center justify-center text-accent1">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{`${patient.first_name || ''} ${patient.last_name || ''}`.trim()}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No patients found matching "{debouncedSearchTerm}".</p>
            )}
          </div>
        </div>
         <div className="px-6 py-3 bg-gray-50 text-right">
             <button
               type="button"
               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
               onClick={onClose}
             >
               Cancel
             </button>
           </div>
      </div>
    </div>
  );
};

PatientSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectPatient: PropTypes.func.isRequired,
};

export default PatientSelectionModal;
