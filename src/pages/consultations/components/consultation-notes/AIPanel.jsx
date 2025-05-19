import React from 'react';

const AIPanel = ({ showAIPanel, toggleAIPanel }) => {
  if (!showAIPanel) return null;
  
  return (
    <div className="ai-panel" style={{ display: 'flex' }}>
      <div className="ai-panel-content">
        <div className="panel-header">
          <h3>AI Treatment Insights</h3>
          <button className="close-button" onClick={toggleAIPanel}>×</button>
        </div>
        <div>
          <p>AI-generated treatment recommendations based on patient data.</p>
          <ul>
            <li>Semaglutide 0.25mg weekly (94% confidence)</li>
            <li>Metformin 500mg daily (91% confidence)</li>
            <li>Sildenafil 50mg PRN (96% confidence)</li>
          </ul>
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '16px', marginTop: 0, marginBottom: '8px' }}>Reasoning</h4>
            <p style={{ fontSize: '15px', margin: 0 }}>
              Patient has BMI of 32.4 (obese) and A1C of 5.6% (pre-diabetic). 
              Semaglutide is recommended for weight loss with strong evidence for efficacy.
              Metformin is recommended for pre-diabetes management.
              Sildenafil is recommended based on patient's reported ED symptoms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
