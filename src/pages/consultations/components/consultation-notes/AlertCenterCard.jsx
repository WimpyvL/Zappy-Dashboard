import React from 'react';

const AlertCenterCard = ({ adjustFollowUp, setAdjustFollowUp }) => {
  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
      <div className="card-header" style={{ borderBottomColor: '#fde68a' }}>
        Alert Center
        <span style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.7 }}>AI-flagged</span>
      </div>
      <div className="card-body">
        <div className="alert-center-item warning">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span><strong>Interaction:</strong> Monitor hypotension (Sildenafil + Semaglutide).</span>
        </div>
        <div className="alert-center-item info">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span><strong>Monitoring:</strong> Check TSH at f/u.</span>
        </div>
        <div style={{ fontSize: '15px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #fde084' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <input 
              type="checkbox" 
              id="adjustFollowUp" 
              checked={adjustFollowUp}
              onChange={() => setAdjustFollowUp(!adjustFollowUp)}
              style={{ marginRight: '6px', position: 'relative', top: '1px' }}
            />
            <label htmlFor="adjustFollowUp">Adjust f/u to 2 wks.</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCenterCard;
