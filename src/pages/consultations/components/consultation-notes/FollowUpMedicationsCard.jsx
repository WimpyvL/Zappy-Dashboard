import React from 'react';
import { Plus, Loader } from 'lucide-react';
import FollowUpMedicationItem from './FollowUpMedicationItem';

const FollowUpMedicationsCard = ({
  medicationData,
  medicationDosages,
  previousMedicationDosages,
  toggleMedication,
  selectDosage,
  updateApproach,
  showMoreMeds,
  toggleMoreMeds,
  addListedMed,
  isLoading = false,
  error = null
}) => {
  // Group medications by category
  const medicationsByCategory = Object.entries(medicationData || {}).reduce((acc, [medId, med]) => {
    if (!acc[med.category]) {
      acc[med.category] = [];
    }
    acc[med.category].push({ id: medId, ...med });
    return acc;
  }, {});

  // Category display names
  const categoryNames = {
    'wm': 'Weight Management',
    'ed': 'ED',
    'pc': 'Primary Care',
    'mh': 'Mental Health'
  };

  // Category header classes
  const categoryHeaderClasses = {
    'wm': 'wm-header',
    'ed': 'ed-header',
    'pc': 'pc-header',
    'mh': 'mh-header'
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
        <div className="bg-[#4f46e5] px-4 py-3 text-white flex justify-between items-center">
          <h3 className="font-medium">Medications</h3>
        </div>
        <div className="p-4 flex justify-center items-center h-32">
          <Loader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
          <span className="text-sm text-gray-500">Loading medications...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
        <div className="bg-[#4f46e5] px-4 py-3 text-white flex justify-between items-center">
          <h3 className="font-medium">Medications</h3>
        </div>
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
            <p>Error loading medications: {error.message || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
      <div className="bg-[#4f46e5] px-4 py-3 text-white flex justify-between items-center">
        <h3 className="font-medium">Medications</h3>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded flex items-center"
            onClick={toggleMoreMeds}
          >
            <Plus size={14} className="mr-1" />
            Add Medication
          </button>
        </div>
      </div>
      <div className="p-4">
        {/* Render medications by category */}
        {Object.entries(medicationsByCategory).length > 0 ? (
          Object.entries(medicationsByCategory).map(([category, meds]) => (
            <div className="mb-4" key={category}>
              <div 
                className={`category-header ${categoryHeaderClasses[category] || ''} text-left mb-2 py-1 font-semibold text-sm flex items-center border-b border-gray-200`}
              >
                <span 
                  className={`service-dot ${category}-dot mr-2 w-2.5 h-2.5 rounded-full inline-block`}
                  style={{ 
                    backgroundColor: category === 'wm' ? '#3b82f6' : 
                                    category === 'ed' ? '#ec4899' : 
                                    category === 'pc' ? '#10b981' :
                                    category === 'mh' ? '#8b5cf6' : '#6b7280'
                  }}
                ></span>
                <span>{categoryNames[category] || category}</span>
              </div>
              
              {/* Render medications in this category */}
              <div className="pl-2">
                {meds.map(med => (
                  <FollowUpMedicationItem
                    key={med.id}
                    medId={med.id}
                    medication={med}
                    dosage={medicationDosages[med.id]}
                    previousDosage={previousMedicationDosages?.[med.id]}
                    toggleMedication={toggleMedication}
                    selectDosage={selectDosage}
                    updateApproach={updateApproach}
                    isPatientPreference={med.isPatientPreference}
                    supportedApproaches={med.supportedApproaches}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 py-2">No medications found from previous consultations</div>
        )}

        {/* More Medications Panel */}
        {showMoreMeds && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Medication</h4>
            <p className="text-xs text-gray-500 mb-3">
              Select from common medications or search for others
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {['Semaglutide', 'Metformin', 'Sildenafil', 'Tadalafil'].map(medName => (
                <button
                  key={medName}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 text-left"
                  onClick={() => addListedMed(medName.toLowerCase())}
                >
                  {medName}
                </button>
              ))}
            </div>
            
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search medications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpMedicationsCard;
