import React from 'react';
import { Plus, Loader } from 'lucide-react';
import NewMedicationItem from './NewMedicationItem';

const MedicationsCard = ({
  medicationData,
  medicationDosages,
  openMedicationControls,
  openMedicationInstructions,
  toggleMedication,
  toggleMedicationControls,
  toggleMedicationInstructions,
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
      <div style={{ 
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          padding: '10px 14px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '15px',
          backgroundColor: '#4f46e5'
        }}>
          <span style={{ color: 'white' }}>Medications</span>
        </div>
        <div style={{ 
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '128px'
        }}>
          <Loader className="animate-spin" size={24} style={{ color: '#3b82f6' }} />
          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>Loading medications...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ 
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          padding: '10px 14px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '15px',
          backgroundColor: '#4f46e5'
        }}>
          <span style={{ color: 'white' }}>Medications</span>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ 
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <p>Error loading medications: {error.message || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '6px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      marginBottom: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        padding: '10px 14px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '15px',
        backgroundColor: '#4f46e5'
      }}>
        <span style={{ color: 'white' }}>Medications</span>
      </div>
      <div style={{ padding: '16px' }}>
        {/* Render medications by category */}
        {Object.entries(medicationsByCategory).length > 0 ? (
          Object.entries(medicationsByCategory).map(([category, meds]) => (
            <div style={{ marginBottom: '16px' }} key={category}>
              <div className={`category-header ${categoryHeaderClasses[category] || ''}`} style={{ 
                textAlign: 'left',
                marginBottom: '8px',
                padding: '4px 0',
                fontWeight: 600,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span 
                  className={`service-dot ${category}-dot`} 
                  style={{ 
                    marginRight: '8px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    backgroundColor: category === 'wm' ? '#3b82f6' : 
                                    category === 'ed' ? '#ec4899' : 
                                    category === 'pc' ? '#10b981' :
                                    category === 'mh' ? '#8b5cf6' : '#6b7280'
                  }}
                ></span>
                <span>{categoryNames[category] || category}</span>
              </div>
              
              {/* Render medications in this category */}
              <div style={{ paddingLeft: '8px' }}>
                {meds.map(med => (
                  <NewMedicationItem
                    key={med.id}
                    medId={med.id}
                    medication={med}
                    dosage={medicationDosages[med.id]}
                    openControls={openMedicationControls[med.id]}
                    openInstructions={openMedicationInstructions[med.id]}
                    toggleMedication={toggleMedication}
                    toggleControls={toggleMedicationControls}
                    toggleInstructions={toggleMedicationInstructions}
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
          <div style={{ fontSize: '14px', color: '#6b7280', padding: '8px 0' }}>No medications selected</div>
        )}

        {/* Add More Medications Button - Simplified */}
        <div style={{ marginTop: '16px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'normal',
              background: '#3b82f6', // Blue-500
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '2px 4px'
            }}
            onClick={toggleMoreMeds}
          >
            <Plus size={12} style={{ marginRight: '4px' }} />
            Add Medication
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationsCard;
