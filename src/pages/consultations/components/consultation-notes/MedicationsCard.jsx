import React from 'react';
import { Plus } from 'lucide-react';
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
  medicationSearchTerm,
  medicationCategory,
  handleMedicationSearch,
  handleMedicationCategoryChange,
  filteredMedications,
  addListedMed
}) => {
  // Group medications by category
  const medicationsByCategory = Object.entries(medicationData).reduce((acc, [medId, med]) => {
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

  return (
    <div className="card">
      <div className="card-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <span style={{ fontWeight: '600', fontSize: '15px', color: '#1f2937' }}>Select Medications</span>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search meds..." 
            style={{ 
              fontSize: '13px', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px', 
              padding: '3px 24px 3px 8px', 
              width: '120px',
              color: '#374151'
            }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      <div className="card-body">
        {/* Render medications by category */}
        {Object.entries(medicationsByCategory).map(([category, meds]) => (
          <div className="medication-category" key={category}>
            <div className={`category-header ${categoryHeaderClasses[category] || ''}`} style={{
              padding: '8px 12px',
              marginTop: '8px',
              marginBottom: '4px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              borderLeft: '3px solid',
              borderLeftColor: category === 'wm' ? '#3b82f6' : 
                              category === 'ed' ? '#ec4899' : 
                              category === 'pc' ? '#10b981' : 
                              category === 'mh' ? '#8b5cf6' : '#6b7280'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  marginRight: '8px',
                  backgroundColor: category === 'wm' ? '#3b82f6' : 
                                  category === 'ed' ? '#ec4899' : 
                                  category === 'pc' ? '#10b981' : 
                                  category === 'mh' ? '#8b5cf6' : '#6b7280'
                }}></span>
                <span style={{ fontWeight: '500', fontSize: '14px', color: '#374151' }}>
                  {categoryNames[category] || category}
                </span>
              </div>
            </div>
            
            {/* Render medications in this category */}
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
        ))}

          {/* Add More Medications Button */}
        <div className="add-more-meds-container" style={{ marginTop: '12px' }}>
          <button 
            className="add-more-meds-button" 
            onClick={toggleMoreMeds}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <Plus size={14} style={{ marginRight: '6px' }} />
            {showMoreMeds ? 'Hide Additional Medications' : 'Add More Medications'}
          </button>
          
          {/* More Medications Panel */}
          {showMoreMeds && (
            <div className="add-more-meds-panel" style={{ 
              marginTop: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div className="add-more-meds-header" style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ fontWeight: '500', fontSize: '14px' }}>Additional Medications</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    style={{ 
                      fontSize: '13px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '3px 8px', 
                      backgroundColor: 'white',
                      color: '#374151'
                    }}
                    value={medicationCategory}
                    onChange={handleMedicationCategoryChange}
                  >
                    <option>All</option>
                    <option>WM</option>
                    <option>ED</option>
                    <option>PC</option>
                    <option>MH</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    style={{ 
                      fontSize: '13px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '3px 8px', 
                      width: '100px',
                      color: '#374151'
                    }}
                    value={medicationSearchTerm}
                    onChange={handleMedicationSearch}
                  />
                </div>
              </div>
              
              <div className="add-more-meds-list" style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                padding: '8px 0'
              }}>
                {filteredMedications.map(med => (
                  <div key={med.id} className="med-checkbox-item" style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    addListedMed(med.id);
                    // Close the additional medications panel after adding
                    toggleMoreMeds();
                  }}
                  >
                    <input 
                      type="checkbox" 
                      id={`${med.id}_more`}
                      style={{ 
                        marginRight: '8px',
                        width: '16px',
                        height: '16px',
                        accentColor: '#3b82f6',
                        cursor: 'pointer'
                      }}
                      onChange={() => {
                        addListedMed(med.id);
                        // Close the additional medications panel after adding
                        toggleMoreMeds();
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label htmlFor={`${med.id}_more`} style={{ cursor: 'pointer', flex: 1 }}>
                      {med.name} 
                      {med.description && <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '4px' }}> {med.description}</span>}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="add-custom-med-button-container" style={{ 
                padding: '8px 12px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <button className="add-custom-med-button" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer'
                }}>
                  <Plus size={12} style={{ marginRight: '4px' }} />
                  Add Custom
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationsCard;
