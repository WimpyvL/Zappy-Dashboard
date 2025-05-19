import React from 'react';
import { ChevronDown, ChevronUp, Settings, FileText, Heart } from 'lucide-react';

const MedicationItem = ({ 
  medId,
  medication, 
  dosage,
  openControls,
  openInstructions,
  toggleMedication,
  toggleControls,
  toggleInstructions,
  selectDosage,
  isPatientPreference = false
}) => {
  return (
    <>
      {/* Medication Item */}
      <div 
        className={`medication-item ${medication.selected ? 'selected' : ''} ${openControls ? 'no-bottom-border-if-controls-open' : ''}`}
      >
        <div className="medication-name">
          <input 
            type="checkbox" 
            id={medId} 
            checked={medication.selected} 
            onChange={() => toggleMedication(medId)} 
            className="mr-2" 
          />
          <div>
            <span>
              {medication.name} 
              {medication.brandName && <span style={{ color: '#6b7280', fontSize: '14px' }}>({medication.brandName})</span>}
            </span>
            {isPatientPreference && (
              <div className="patient-preference-badge">
                <Heart size={12} className="text-blue-600 mr-1" />
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Patient Preference
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
          <span className="editable">{dosage}</span>
          <span>{medication.frequency}</span>
          <button 
            onClick={() => toggleControls(medId)} 
            style={{ background: 'none', border: 'none', padding: '0 0 0 4px', color: '#6b7280', cursor: 'pointer' }}
          >
            {openControls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {/* Medication Controls */}
      {openControls && (
        <div className="medication-controls">
          <div className="details-row">
            <span className="details-label">Dosage:</span>
            <div className="dosage-pills">
              {medication.dosageOptions.map(option => (
                <span 
                  key={option.value}
                  className={`dosage-pill ${dosage === option.value ? 'selected' : ''}`}
                  onClick={() => selectDosage(medId, option.value)}
                >
                  {option.label}
                </span>
              ))}
            </div>
          </div>
          <div className="details-row">
            <span className="details-label">Duration:</span>
            <span className="editable" contentEditable>
              {medication.category === 'wm' ? '6 mos' : '3 mos'}
            </span>
          </div>
          <div className="details-row">
            <span className="details-label">Approach:</span>
            <select defaultValue={medication.frequency === 'PRN' ? 'PRN' : 'Escal.'}>
              <option>Maint.</option>
              <option>Escal.</option>
              {medication.frequency === 'PRN' && <option>PRN</option>}
              {medication.category === 'ed' && <option>Daily</option>}
            </select>
          </div>
        </div>
      )}
      
      {/* Medication Instructions Footer */}
      {medication.selected && (
        <div className="medication-item-footer">
          <span 
            onClick={() => toggleInstructions(medId)} 
            style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {openInstructions ? 'Hide Instructions' : 'View Instructions'}
          </span>
        </div>
      )}
      
      {/* Medication Instructions */}
      {openInstructions && (
        <div className="simple-instructions">
          {medication.instructions.map((instruction, index) => (
            <p key={index}>{instruction}</p>
          ))}
        </div>
      )}
    </>
  );
};

export default MedicationItem;
