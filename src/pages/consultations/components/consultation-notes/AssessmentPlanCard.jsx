import React from 'react';
import { Info } from 'lucide-react';

const AssessmentPlanCard = ({
  showAssessmentDetails,
  toggleAssessmentDetails,
  assessmentPlan,
  setAssessmentPlan
}) => {
  return (
    <div className="card">
      <div className="card-header">
        Assessment & Plan
        <button 
          onClick={toggleAssessmentDetails} 
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '14px', 
            color: '#3b82f6', 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer', 
            padding: 0, 
            fontWeight: 'normal' 
          }}
        >
          <Info size={14} className="mr-1" />
          {showAssessmentDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      <div className="card-body">
        <ul style={{ fontSize: '15px', marginBottom: '12px', paddingLeft: 0, listStyleType: 'none' }}>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span className="service-dot wm-dot"></span>
            Semaglutide 0.25mg wkly
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span className="service-dot ed-dot"></span>
            Sildenafil 50mg PRN
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span className="service-dot wm-dot"></span>
            Metformin 500mg daily
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', paddingLeft: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Levothyroxine 75mcg (cont.)</span>
          </li>
        </ul>
        
        {/* Assessment Details Section */}
        {showAssessmentDetails && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '15px', marginBottom: '8px' }}>
              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span className="service-dot wm-dot"></span>
                Weight Management
              </div>
              <div style={{ paddingLeft: '12px' }}>
                • BMI 32.4, A1C 5.6%<br/>
                • Semaglutide 0.25mg wkly (6mo)<br/>
                • Metformin 500mg daily (6mo)<br/>
                • Goal: 15-20 lb loss
              </div>
            </div>
            
            <div style={{ fontSize: '15px', marginBottom: '8px' }}>
              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span className="service-dot ed-dot"></span>
                ED
              </div>
              <div style={{ paddingLeft: '12px' }}>
                • Sildenafil 50mg PRN (3mo)<br/>
                • Monitor for hypotension with Semaglutide
              </div>
            </div>
          </div>
        )}
        
        {/* Notes Section */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '15px' }}>
            <span style={{ fontWeight: '600' }}>Notes:</span>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Auto-populated</span>
          </div>
          <textarea 
            style={{ 
              width: '100%', 
              height: '60px', 
              padding: '6px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '4px', 
              fontSize: '15px', 
              fontFamily: 'inherit', 
              resize: 'vertical' 
            }}
            value={assessmentPlan}
            onChange={(e) => setAssessmentPlan(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AssessmentPlanCard;
