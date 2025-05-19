import React from 'react';
import { Edit, Plus } from 'lucide-react';

const CommunicationCard = ({
  selectedFollowUpPeriod,
  followUpDisplayText,
  selectFollowupPeriod,
  resourceOptions,
  selectedResources,
  toggleResource,
  showMoreResources,
  toggleMoreResources
}) => {
  return (
    <div className="card">
      <div className="card-header">
        Patient Communication
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
      <div className="card-body">
        <div style={{ fontSize: '15px', marginBottom: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span className="service-dot wm-dot"></span>
              <span style={{ fontWeight: '600' }}>Weight Management:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Semaglutide 0.25mg</strong> wkly <span style={{ color: '#6b7280' }}>(6mo)</span></li>
              <li><strong>Metformin 500mg</strong> daily <span style={{ color: '#6b7280' }}>(6mo)</span></li>
            </ul>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span className="service-dot ed-dot"></span>
              <span style={{ fontWeight: '600' }}>ED:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Sildenafil 50mg</strong> PRN <span style={{ color: '#6b7280' }}>(3mo)</span></li>
            </ul>
          </div>
        </div>
        
        {/* Follow-up Options */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid #e5e7eb', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '15px' }}>
            <span style={{ fontWeight: '600' }}>Follow-up:</span>
            <span id="followup-period">{followUpDisplayText}</span>
          </div>
          <div className="followup-options">
            <div 
              className={`followup-option ${selectedFollowUpPeriod === '2w' ? 'selected' : ''}`} 
              onClick={() => selectFollowupPeriod('2w')}
            >
              2w
            </div>
            <div 
              className={`followup-option ${selectedFollowUpPeriod === '4w' ? 'selected' : ''}`} 
              onClick={() => selectFollowupPeriod('4w')}
            >
              4w
            </div>
            <div 
              className={`followup-option ${selectedFollowUpPeriod === '6w' ? 'selected' : ''}`} 
              onClick={() => selectFollowupPeriod('6w')}
            >
              6w
            </div>
            <div 
              className={`followup-option ${selectedFollowUpPeriod === 'custom' ? 'selected' : ''}`} 
              onClick={() => selectFollowupPeriod('custom')}
            >
              Custom
            </div>
          </div>
        </div>
        
        {/* Patient Education Resources */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Patient Education:</div>
          <div className="resource-grid">
            {resourceOptions.slice(0, 3).map(resource => (
              <div 
                key={resource.id}
                className={`resource-button ${selectedResources.includes(resource.id) ? 'selected' : ''}`}
                onClick={() => toggleResource(resource.id)}
              >
                <span>
                  {resource.dotClass && <span className={`service-dot ${resource.dotClass}`}></span>}
                  {resource.name}
                </span>
                {selectedResources.includes(resource.id) ? (
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path d="M6 12h12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </div>
            ))}
            <div 
              className="resource-button"
              onClick={toggleMoreResources}
            >
              <span>More...</span>
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          {/* Selected Resources Display */}
          {selectedResources.length > 0 && (
            <div id="selected-resources" style={{ marginTop: '8px' }}>
              {selectedResources.map(resourceId => {
                const resource = resourceOptions.find(r => r.id === resourceId);
                return resource ? (
                  <div 
                    key={resourceId}
                    style={{ 
                      fontSize: '14px',
                      padding: '4px 8px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{resource.name}</span>
                    <button 
                      onClick={() => toggleResource(resourceId)}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '0 2px'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          {/* More Resources Panel */}
          {showMoreResources && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Additional Resources</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {resourceOptions.slice(3).map(resource => (
                  <div 
                    key={resource.id}
                    className={`resource-button ${selectedResources.includes(resource.id) ? 'selected' : ''}`}
                    onClick={() => toggleResource(resource.id)}
                    style={{ margin: 0 }}
                  >
                    <span>{resource.name}</span>
                    {selectedResources.includes(resource.id) ? (
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path d="M6 12h12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <button 
                  onClick={toggleMoreResources}
                  style={{ 
                    fontSize: '14px',
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCard;
