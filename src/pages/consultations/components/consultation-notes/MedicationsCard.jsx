import React from 'react';
import { Plus } from 'lucide-react';
import MedicationItem from './MedicationItem';

const MedicationsCard = ({ 
  medicationData, 
  medicationDosages, 
  openMedicationControls, 
  openMedicationInstructions,
  toggleMedication, 
  toggleMedicationControls, 
  toggleMedicationInstructions, 
  selectDosage,
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
      <div className="card-header">
        Select Medications
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search meds..." 
            style={{ fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px 20px 2px 4px', width: '120px' }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      <div className="card-body">
        {/* Render medications by category */}
        {Object.entries(medicationsByCategory).map(([category, meds]) => (
          <div className="medication-category" key={category}>
            <div className={`category-header ${categoryHeaderClasses[category] || ''}`}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className={`service-dot ${category}-dot`}></span>
                {categoryNames[category] || category}
              </div>
            </div>
            
            {/* Render medications in this category */}
            {meds.map(med => (
              <MedicationItem
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
                isPatientPreference={med.isPatientPreference}
              />
            ))}
          </div>
        ))}
        
        {/* Add More Medications Button */}
        <div className="add-more-meds-container">
          <button className="add-more-meds-button" onClick={toggleMoreMeds}>
            <Plus size={14} className="mr-1" />
            {showMoreMeds ? 'Hide Additional Medications' : 'Add More Medications'}
          </button>
          
          {/* More Medications Panel */}
          {showMoreMeds && (
            <div className="add-more-meds-panel">
              <div className="add-more-meds-header">
                <span>Additional Medications</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    style={{ fontSize: '0.9rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', padding: '0.125rem .25rem', backgroundColor: 'white' }}
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
                    style={{ fontSize: '0.9rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', padding: '0.125rem .25rem', width: '100px' }}
                    value={medicationSearchTerm}
                    onChange={handleMedicationSearch}
                  />
                </div>
              </div>
              
              <div className="add-more-meds-list">
                {filteredMedications.map(med => (
                  <div key={med.id} className="med-checkbox-item">
                    <div>
                      <input 
                        type="checkbox" 
                        id={`${med.id}_more`}
                      />
                      <label htmlFor={`${med.id}_more`}>
                        {med.name} 
                        {med.description && <span style={{ color: '#6b7280', fontSize: '.8rem' }}> {med.description}</span>}
                      </label>
                    </div>
                    <button 
                      className="add-button"
                      onClick={() => addListedMed(med.id)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-custom-med-button-container">
                <button className="add-custom-med-button">
                  <Plus size={12} />
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
