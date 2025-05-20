import React, { useEffect, useState } from 'react';

const AIPanel = ({ showAIPanel, toggleAIPanel, initialInsights }) => {
  const [insights, setInsights] = useState('');
  const [reasoning, setReasoning] = useState('');

  // Initialize state with initial insights when panel is shown or initialInsights change
  useEffect(() => {
    if (showAIPanel && initialInsights) {
      // Assuming initialInsights is an object like { recommendations: [], reasoning: '' }
      setInsights(formatRecommendations(initialInsights.recommendations || []));
      setReasoning(initialInsights.reasoning || '');
    } else if (showAIPanel && !initialInsights) {
      // Fallback static data if no initialInsights provided
      setInsights(formatRecommendations([
        { text: 'Semaglutide 0.25mg weekly', confidence: 94 },
        { text: 'Metformin 500mg daily', confidence: 91 },
        { text: 'Sildenafil 50mg PRN', confidence: 96 },
      ]));
      setReasoning('Patient has BMI of 32.4 (obese) and A1C of 5.6% (pre-diabetic). Semaglutide is recommended for weight loss with strong evidence for efficacy. Metformin is recommended for pre-diabetes management. Sildenafil is recommended based on patient\'s reported ED symptoms.');
    }
  }, [showAIPanel, initialInsights]);

  // Helper to format recommendations for display
  const formatRecommendations = (recommendations) => {
    return recommendations.map(rec => `${rec.text} (${rec.confidence}% confidence)`).join('\n');
  };

  if (!showAIPanel) return null;

  return (
    <div className="ai-panel" style={{ display: 'flex' }}>
      <div className="ai-panel-content">
        <div className="panel-header">
          <h3>AI Treatment Insights</h3>
          <div className="flex items-center">
            <button
              className="close-button ml-auto"
              onClick={toggleAIPanel}
              aria-label="Close AI panel"
            >
              ×
            </button>
          </div>
        </div>
        <div>
          <p>AI-generated treatment recommendations based on patient data.</p>
          <ul>
            {insights.split('\n').map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '16px', marginTop: 0, marginBottom: '8px' }}>Reasoning</h4>
            <p style={{ fontSize: '15px', margin: 0 }}>
              {reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
