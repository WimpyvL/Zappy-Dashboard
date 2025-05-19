import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';

const PatientInfoCard = ({ patient, patientHistory, onSaveHistory, toggleIntakeForm }) => {
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editedHistory, setEditedHistory] = useState('');

  // Initialize editedHistory state when patientHistory prop changes or editing starts
  useEffect(() => {
    if (!isEditingHistory) {
      setEditedHistory(patientHistory || '');
    }
  }, [patientHistory, isEditingHistory]);

  const handleEditHistoryClick = () => {
    setIsEditingHistory(true);
  };

  const handleSaveHistory = () => {
    if (onSaveHistory) {
      onSaveHistory(editedHistory); // Call the callback from the parent
    }
    setIsEditingHistory(false);
    console.log('Saving edited patient history (frontend state updated):', editedHistory);
  };

  const handleCancelHistory = () => {
    // Revert changes and exit editing mode
    setEditedHistory(patientHistory || ''); // Revert to the prop value
    setIsEditingHistory(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        Patient Information
        <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
          <button
            onClick={toggleIntakeForm}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 'normal',
              fontSize: '14px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
              <path d="M9 17H7A5 5 0 017 7h1a2 2 0 002-2V3a1 1 0 00-1-1H7a5 5 0 000 10h2M15 7h2a5 5 0 010 10h-1a2 2 0 00-2 2v2a1 1 0 001 1h1a5 5 0 000-10h-2m-3 6h2m-1-4h.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
            View Intake Form
          </button>
          {isEditingHistory ? (
            <>
              <button
                onClick={handleSaveHistory}
                style={{
                  background: '#d1fae5', // Light green background
                  color: '#065f46', // Dark green text
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #a7f3d0', // Green border
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}
              >
                <Save size={14} className="mr-1" />
                Save
              </button>
              <button
                onClick={handleCancelHistory}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}
              >
                <X size={14} className="mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditHistoryClick}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              <Edit size={14} className="mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {/* Intake Form Data Section */}
        {patient?.intakeData && (
          <div className="patient-intake-data" style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Intake Form Data</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              {patient.intakeData.basicInfo && (
                <>
                  <div><span style={{ fontWeight: '500' }}>Height:</span> {patient.intakeData.basicInfo.height}</div>
                  <div><span style={{ fontWeight: '500' }}>Weight:</span> {patient.intakeData.basicInfo.weight} {patient.intakeData.basicInfo.weightUnit || 'lbs'}</div>
                  {patient.intakeData.basicInfo.goalWeight && (
                    <div><span style={{ fontWeight: '500' }}>Goal Weight:</span> {patient.intakeData.basicInfo.goalWeight} {patient.intakeData.basicInfo.weightUnit || 'lbs'}</div>
                  )}
                </>
              )}
              {patient.intakeData.healthHistory && (
                <>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ fontWeight: '500' }}>Medical Conditions:</span> {
                    patient.intakeData.healthHistory.medicalConditions?.length
                      ? patient.intakeData.healthHistory.medicalConditions.join(', ')
                      : 'None reported'
                  }</div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ fontWeight: '500' }}>Current Medications:</span> {
                    patient.intakeData.healthHistory.medicationsText || 'None reported'
                  }</div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div style={{ fontSize: '15px', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Patient History:</span>{' '}
          {isEditingHistory ? (
            <textarea
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '6px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              value={editedHistory}
              onChange={(e) => setEditedHistory(e.target.value)}
            />
          ) : (
            patientHistory || 'No history provided.'
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;
