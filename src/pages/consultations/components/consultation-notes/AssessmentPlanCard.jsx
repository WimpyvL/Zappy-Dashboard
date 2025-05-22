import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Sparkles } from 'lucide-react';

const AssessmentPlanCard = ({
  assessmentPlan,
  setAssessmentPlan,
  selectedMedications = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Preset prompts for quick selection
  const presetPrompts = [
    "Generate a comprehensive assessment and plan for this patient's conditions.",
    "Create a detailed assessment with medication instructions and monitoring parameters.",
    "Write a concise assessment focusing on key findings and treatment goals.",
    "Draft an assessment with emphasis on potential medication interactions and precautions."
  ];
  
  const handleEditClick = () => {
    setIsEditing(true);
    // Include all assessment and plan content in the editable textarea
    setEditedContent(
`Weight Management:
• BMI 32.4, A1C 5.6%
• Semaglutide 0.25mg wkly (6mo)
• Metformin 500mg daily (6mo)
• Goal: 15-20 lb loss

ED:
• Sildenafil 50mg PRN (3mo)
• Monitor for hypotension with Semaglutide

Medications:
• Semaglutide 0.25mg wkly
• Sildenafil 50mg PRN
• Metformin 500mg daily
• Levothyroxine 75mcg (cont.)`
    );
  };
  
  const handleAIGenerate = () => {
    setIsGeneratingAI(true);
    setIsEditing(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      let aiGeneratedContent = '';
      
      // If we have a custom prompt, use it to influence the generated content
      if (customPrompt && customPrompt.trim()) {
        // Simulate different responses based on the prompt
        if (customPrompt.includes('detailed') || customPrompt.includes('instructions') || customPrompt.includes('monitoring')) {
          aiGeneratedContent = 
`Weight Management:
• BMI 32.4, A1C 5.6% - Indicates obesity with pre-diabetic tendencies
• Semaglutide 0.25mg wkly (6mo) - Start low dose, monitor for GI side effects
  - Week 1-4: 0.25mg weekly
  - Week 5-8: 0.5mg weekly if tolerated
  - Week 9+: 1.0mg weekly if tolerated
• Metformin 500mg daily (6mo) - Adjunct therapy for insulin resistance
  - Take with food to minimize GI side effects
  - Monitor renal function and B12 levels annually
• Goal: 15-20 lb loss over 6 months with lifestyle modifications
• Recommend Mediterranean diet and 150 min/week moderate exercise
• Monitor: Weight monthly, A1C q3mo, lipid panel q6mo

ED:
• Sildenafil 50mg PRN (3mo) - Take 30-60 min before activity
  - Max frequency: once daily
  - Avoid high-fat meals which may delay onset
• Monitor for hypotension with Semaglutide - Check BP at follow-up
  - Instruct patient to rise slowly from sitting/lying positions
  - Consider dose reduction if symptomatic hypotension occurs
• Avoid nitrates - Contraindicated with PDE5 inhibitors
  - Absolute contraindication with nitroglycerin or isosorbide
  - Potentially fatal hypotension can occur

Medications:
• Semaglutide 0.25mg wkly - Titrate up as tolerated
  - Store in refrigerator, can be at room temp for up to 30 days
  - Inject in abdomen, thigh, or upper arm
• Sildenafil 50mg PRN - Max once daily
  - Take on empty stomach for optimal absorption
  - Full effect may require 8 separate doses
• Metformin 500mg daily - Take with food to minimize GI effects
  - Consider extended-release formulation if GI side effects persist
• Levothyroxine 75mcg (cont.) - Continue current dose, check TSH at follow-up
  - Take on empty stomach, 30-60 min before breakfast
  - Separate from other medications by at least 4 hours`;
        } 
        else if (customPrompt.includes('concise') || customPrompt.includes('key findings')) {
          aiGeneratedContent = 
`Weight Management:
• BMI 32.4, A1C 5.6% - Pre-diabetic obesity
• Semaglutide 0.25mg wkly (6mo)
• Metformin 500mg daily (6mo)
• Goal: 15-20 lb loss in 6 months
• Mediterranean diet, 150 min/week exercise

ED:
• Sildenafil 50mg PRN (3mo)
• Monitor BP with Semaglutide
• Avoid nitrates - contraindicated

Medications:
• Semaglutide 0.25mg wkly - Titrate as tolerated
• Sildenafil 50mg PRN - Max once daily
• Metformin 500mg daily - With food
• Levothyroxine 75mcg - Continue, check TSH`;
        }
        else if (customPrompt.includes('interactions') || customPrompt.includes('precautions')) {
          aiGeneratedContent = 
`Weight Management:
• BMI 32.4, A1C 5.6% - Indicates obesity with pre-diabetic tendencies
• Semaglutide 0.25mg wkly (6mo)
  - PRECAUTION: Risk of hypoglycemia when combined with other glucose-lowering medications
  - PRECAUTION: May cause acute pancreatitis; monitor for severe abdominal pain
  - PRECAUTION: Contraindicated in personal/family history of MTC or MEN2
• Metformin 500mg daily (6mo)
  - PRECAUTION: Risk of lactic acidosis in renal impairment (eGFR <30)
  - PRECAUTION: Hold for 48h after iodinated contrast administration
  - INTERACTION: May decrease B12 absorption; monitor levels
• Goal: 15-20 lb loss over 6 months

ED:
• Sildenafil 50mg PRN (3mo)
  - INTERACTION: Contraindicated with nitrates (severe hypotension)
  - INTERACTION: Use caution with alpha-blockers (orthostatic hypotension)
  - PRECAUTION: Avoid grapefruit juice (increases drug concentration)
• Monitor for hypotension with Semaglutide
  - INTERACTION: Additive hypotensive effect with Sildenafil
  - PRECAUTION: Instruct patient on signs of hypotension

Medications:
• Semaglutide 0.25mg wkly
• Sildenafil 50mg PRN
• Metformin 500mg daily
• Levothyroxine 75mcg (cont.)
  - INTERACTION: Absorption decreased by calcium, iron supplements
  - INTERACTION: Effectiveness may be altered by changes in protein intake`;
        }
        else {
          // Default response for other custom prompts
          aiGeneratedContent = 
`Weight Management:
• BMI 32.4, A1C 5.6% - Indicates obesity with pre-diabetic tendencies
• Semaglutide 0.25mg wkly (6mo) - Start low dose, monitor for GI side effects
• Metformin 500mg daily (6mo) - Adjunct therapy for insulin resistance
• Goal: 15-20 lb loss over 6 months with lifestyle modifications
• Recommend Mediterranean diet and 150 min/week moderate exercise

ED:
• Sildenafil 50mg PRN (3mo) - Take 30-60 min before activity
• Monitor for hypotension with Semaglutide - Check BP at follow-up
• Avoid nitrates - Contraindicated with PDE5 inhibitors

Medications:
• Semaglutide 0.25mg wkly - Titrate up as tolerated
• Sildenafil 50mg PRN - Max once daily
• Metformin 500mg daily - Take with food to minimize GI effects
• Levothyroxine 75mcg (cont.) - Continue current dose, check TSH at follow-up`;
        }
      } 
      else {
        // Default response if no custom prompt is provided
        aiGeneratedContent = 
`Weight Management:
• BMI 32.4, A1C 5.6% - Indicates obesity with pre-diabetic tendencies
• Semaglutide 0.25mg wkly (6mo) - Start low dose, monitor for GI side effects
• Metformin 500mg daily (6mo) - Adjunct therapy for insulin resistance
• Goal: 15-20 lb loss over 6 months with lifestyle modifications
• Recommend Mediterranean diet and 150 min/week moderate exercise

ED:
• Sildenafil 50mg PRN (3mo) - Take 30-60 min before activity
• Monitor for hypotension with Semaglutide - Check BP at follow-up
• Avoid nitrates - Contraindicated with PDE5 inhibitors

Medications:
• Semaglutide 0.25mg wkly - Titrate up as tolerated
• Sildenafil 50mg PRN - Max once daily
• Metformin 500mg daily - Take with food to minimize GI effects
• Levothyroxine 75mcg (cont.) - Continue current dose, check TSH at follow-up`;
      }
      
      // Clear the custom prompt after generating content
      setCustomPrompt('');
      
      setEditedContent(aiGeneratedContent);
      setIsGeneratingAI(false);
    }, 1500);
  };
  
  // Update editedContent when assessmentPlan changes
  useEffect(() => {
    if (assessmentPlan) {
      setEditedContent(assessmentPlan);
    }
  }, [assessmentPlan]);

  const handleSave = () => {
    // Save the edited content back to the parent component
    setAssessmentPlan(editedContent);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    // Reset to the original content
    setEditedContent(assessmentPlan || '');
    setIsEditing(false);
  };
  
  // Group medications by category
  const medicationsByCategory = selectedMedications.reduce((acc, med) => {
    if (!acc[med.category]) {
      acc[med.category] = [];
    }
    acc[med.category].push(med);
    return acc;
  }, {});
  
  // Category display names
  const categoryNames = {
    'wm': 'Weight Management',
    'ed': 'ED',
    'pc': 'Primary Care',
    'mh': 'Mental Health'
  };
  return (
    <div style={{ 
      background: 'white',
      borderRadius: '6px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      marginBottom: '8px',
      border: '1px solid #e5e7eb'
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
        <span style={{ color: 'white' }}>Assessment & Plan</span>
        <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                style={{
                  background: '#d1fae5', // Light green background
                  color: '#065f46', // Dark green text
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #a7f3d0', // Green border
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}
                disabled={isGeneratingAI}
              >
                <Save size={14} className="mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  background: '#6b7280', // Gray-500
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}
                disabled={isGeneratingAI}
              >
                <X size={14} className="mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowPromptInput(!showPromptInput)}
                  style={{
                    background: '#a855f7', // Purple-500
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'normal'
                  }}
                >
                  <Sparkles size={12} style={{ marginRight: '4px' }} />
                  AI Compose
                </button>
                <button
                  onClick={handleEditClick}
                  style={{
                    background: '#3b82f6', // Blue-500
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'normal'
                  }}
                >
                  <Edit size={12} style={{ marginRight: '4px' }} />
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ padding: '10px 14px', fontSize: '14px' }}>
        {/* AI Prompt Input Section - Search Bar Style */}
        {showPromptInput && !isEditing && !isGeneratingAI && (
          <div style={{ 
            marginBottom: '12px', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              position: 'relative',
              flex: 1
            }}>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter AI prompt or select a preset..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingRight: '36px', // Space for the arrow button
                  border: '1px solid #ddd6fe',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#4f46e5'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: customPrompt.trim() ? '#5b21b6' : '#9ca3af'
              }}
              onClick={() => {
                if (customPrompt.trim()) {
                  handleAIGenerate();
                  setShowPromptInput(false);
                }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowPromptInput(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Removed preset prompts as requested */}
        
        {isEditing ? (
          <>
            {isGeneratingAI ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '20px',
                minHeight: '150px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  border: '3px solid #ddd6fe', 
                  borderTopColor: '#8b5cf6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '12px'
                }} />
                <div style={{ color: '#5b21b6', fontWeight: '500' }}>
                  AI is composing assessment & plan...
                </div>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '6px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            )}
          </>
        ) : (
          <div style={{ 
            padding: '8px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '8px',
            whiteSpace: 'pre-line',
            border: '1px solid #e5e7eb'
          }}>
            <div>
              {/* Medications Summary - More compact */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '14px', 
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Medications:</span>
                  {!isEditing && !isGeneratingAI && (
                    <button
                      onClick={() => {
                        // Auto-generate without showing prompt input
                        setCustomPrompt('');
                        handleAIGenerate();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0369a1',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px'
                      }}
                      title="Refresh with AI"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '13px' }}>
                  {selectedMedications.map(med => (
                    <div key={med.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        display: 'inline-block', 
                        marginRight: '4px', 
                        backgroundColor: med.category === 'wm' ? '#3b82f6' : 
                                        med.category === 'ed' ? '#ec4899' : 
                                        '#6b7280' 
                      }}></span>
                      <span>{med.name} {med.dosage} {med.frequency}</span>
                    </div>
                  ))}
                  {selectedMedications.length === 0 && (
                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No medications selected</div>
                  )}
                </div>
              </div>
              
              {/* Assessment Details Section - Always visible, no separation line */}
              <div style={{ marginBottom: '8px' }}>
                {Object.entries(medicationsByCategory).map(([category, meds]) => (
                  <div key={category} className="assessment-item" style={{ marginBottom: '12px' }}>
                    <div className="assessment-header" style={{ 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      marginBottom: '4px', 
                      display: 'flex', 
                      alignItems: 'center',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '2px'
                    }}>
                      <span className={`service-dot ${category}-dot`} style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        display: 'inline-block', 
                        marginRight: '8px', 
                        backgroundColor: category === 'wm' ? '#3b82f6' : 
                                        category === 'ed' ? '#ec4899' : 
                                        category === 'pc' ? '#10b981' :
                                        category === 'mh' ? '#8b5cf6' : '#6b7280'
                      }}></span>
                      {categoryNames[category] || category}
                    </div>
                    <div className="assessment-content" style={{ paddingLeft: '16px' }}>
                      {assessmentPlan ? (
                        <div>{assessmentPlan}</div>
                      ) : (
                        meds.map(med => (
                          <div key={med.id}>• {med.name} {med.dosage} {med.frequency}</div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Notes Section removed as requested */}
      </div>
    </div>
  );
};

export default AssessmentPlanCard;
