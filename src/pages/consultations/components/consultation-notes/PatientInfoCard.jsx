import React from 'react';
import { Edit } from 'lucide-react';

const PatientInfoCard = ({ patient, toggleIntakeForm }) => {
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
          <button 
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
        </div>
      </div>
      <div className="card-body">
        <div style={{ fontSize: '15px', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Chief Complaint:</span> {patient?.chiefComplaint || '43yo F with 15 lb weight gain...'}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;
