import React from 'react';
import { X, Save, CheckCircle, ArrowRight } from 'lucide-react';

const ConsultationFooter = ({ onClose, handleSave, handleSubmit, readOnly }) => {
  return (
    <footer className="consultation-footer">
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
        <div className="ai-badge" style={{ transform: 'scale(0.9)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <span>AI-generated content • Review before signing</span>
        <span style={{ marginLeft: 'auto', opacity: 0.7 }}>Auto-saved</span>
      </div>
      <div className="actions">
        <button className="button button-secondary" onClick={onClose}>
          <X size={14} className="mr-1" />
          Cancel
        </button>
        {!readOnly && (
          <>
            <button className="button button-secondary" onClick={handleSave}>
              <Save size={14} className="mr-1" />
              Save
            </button>
            <button className="button button-primary" onClick={handleSubmit}>
              <CheckCircle size={14} className="mr-1" />
              Submit
            </button>
          </>
        )}
        {readOnly && (
          <button className="button button-blue">
            <ArrowRight size={14} className="mr-1" />
            Next Patient
          </button>
        )}
      </div>
    </footer>
  );
};

export default ConsultationFooter;
