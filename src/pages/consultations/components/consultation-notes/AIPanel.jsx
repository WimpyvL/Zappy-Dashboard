import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';

const AIPanel = ({ showAIPanel, toggleAIPanel, initialInsights }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInsights, setEditedInsights] = useState('');
  const [editedReasoning, setEditedReasoning] = useState('');

  // Initialize state with initial insights when panel is shown or initialInsights change
  useEffect(() => {
    if (showAIPanel && initialInsights) {
      // Assuming initialInsights is an object like { recommendations: [], reasoning: '' }
      // Adjust this based on the actual structure of initialInsights prop
      setEditedInsights(formatRecommendations(initialInsights.recommendations || []));
      setEditedReasoning(initialInsights.reasoning || '');
    } else if (showAIPanel && !initialInsights) {
       // Fallback static data if no initialInsights provided
       setEditedInsights(formatRecommendations([
         { text: 'Semaglutide 0.25mg weekly', confidence: 94 },
         { text: 'Metformin 500mg daily', confidence: 91 },
         { text: 'Sildenafil 50mg PRN', confidence: 96 },
       ]));
       setEditedReasoning('Patient has BMI of 32.4 (obese) and A1C of 5.6% (pre-diabetic). Semaglutide is recommended for weight loss with strong evidence for efficacy. Metformin is recommended for pre-diabetes management. Sildenafil is recommended based on patient\'s reported ED symptoms.');
    }
  }, [showAIPanel, initialInsights]);

  // Helper to format recommendations for display/editing
  const formatRecommendations = (recommendations) => {
    return recommendations.map(rec => `${rec.text} (${rec.confidence}% confidence)`).join('\n');
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // Placeholder for saving edited insights (frontend state only)
    console.log('Saving edited AI insights:', { recommendations: editedInsights, reasoning: editedReasoning });
    // In a real implementation, you would send this data to a backend API
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    // Revert changes and exit editing mode
    if (initialInsights) {
       setEditedInsights(formatRecommendations(initialInsights.recommendations || []));
       setEditedReasoning(initialInsights.reasoning || '');
    } else {
       // Revert to fallback static data if no initialInsights
       setEditedInsights(formatRecommendations([
         { text: 'Semaglutide 0.25mg weekly', confidence: 94 },
         { text: 'Metformin 500mg daily', confidence: 91 },
         { text: 'Sildenafil 50mg PRN', confidence: 96 },
       ]));
       setEditedReasoning('Patient has BMI of 32.4 (obese) and A1C of 5.6% (pre-diabetic). Semaglutide is recommended for weight loss with strong evidence for efficacy. Metformin is recommended for pre-diabetes management. Sildenafil is recommended based on patient\'s reported ED symptoms.');
    }
    setIsEditing(false);
  };

  if (!showAIPanel) return null;

  return (
    <div className="ai-panel" style={{ display: 'flex' }}>
      <div className="ai-panel-content">
        <div className="panel-header">
          <h3>AI Treatment Insights</h3>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveClick}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancelClick}
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
            <button className="close-button" onClick={toggleAIPanel}>×</button>
          </div>
        </div>
        <div>
          {isEditing ? (
            <>
              <div className="mb-4">
                <label htmlFor="editedInsights" className="block text-gray-700 font-semibold mb-2">Recommendations</label>
                <textarea
                  id="editedInsights"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                  value={editedInsights}
                  onChange={(e) => setEditedInsights(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                 <label htmlFor="editedReasoning" className="block text-gray-700 font-semibold mb-2">Reasoning</label>
                 <textarea
                   id="editedReasoning"
                   rows="4"
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                   value={editedReasoning}
                   onChange={(e) => setEditedReasoning(e.target.value)}
                 ></textarea>
              </div>
            </>
          ) : (
            <>
              <p>AI-generated treatment recommendations based on patient data.</p>
              <ul>
                {editedInsights.split('\n').map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '16px', marginTop: 0, marginBottom: '8px' }}>Reasoning</h4>
                <p style={{ fontSize: '15px', margin: 0 }}>
                  {editedReasoning}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
