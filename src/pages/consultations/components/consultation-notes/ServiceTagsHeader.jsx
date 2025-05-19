import React from 'react';
import { Plus, X } from 'lucide-react';

const ServiceTagsHeader = ({ 
  patientName, 
  activeServices, 
  toggleServicePanel, 
  removeServiceTag,
  toggleAIPanel 
}) => {
  return (
    <header className="consultation-header">
      <div className="patient-name-header">{patientName || 'Sarah Johnson'} - Initial Visit</div>
      <div className="service-tags">
        {Object.entries(activeServices).map(([id, service]) => (
          <div key={id} className="service-tag">
            <span className={`service-dot ${service.dotClass}`}></span>
            {service.name}
            <button 
              className="remove" 
              onClick={(e) => removeServiceTag(id, e)}
              aria-label={`Remove ${service.name}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          className="add-service" 
          onClick={toggleServicePanel}
          aria-label="Add Service"
        >
          <Plus size={14} />
          <span>Add Service</span>
        </button>
      </div>
      <div className="header-ai-notice">
        <button onClick={toggleAIPanel} aria-label="AI Treatment Insights">
          <div className="ai-badge" style={{ transform: 'scale(0.9)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2"/></svg>
          </div>
          <span>AI Treatment Insights</span>
        </button>
      </div>
    </header>
  );
};

export default ServiceTagsHeader;
