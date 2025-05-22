import React from 'react';

const AlertCenterCard = ({ adjustFollowUp, setAdjustFollowUp }) => {
  return (
    <div className="alert-card" style={{ 
      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      marginBottom: '8px'
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
        <span style={{ color: 'white' }}>Alert Center</span>
      </div>
      <div style={{ padding: '10px 14px', fontSize: '14px', backgroundColor: '#fffbeb' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span><strong>Interaction:</strong> Monitor hypotension (Sildenafil + Semaglutide).</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>Monitoring:</strong> Check TSH at f/u.</span>
        </div>
        
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>
          Follow-up adjusted to 2 weeks due to medication interactions
        </div>
      </div>
    </div>
  );
};

export default AlertCenterCard;
