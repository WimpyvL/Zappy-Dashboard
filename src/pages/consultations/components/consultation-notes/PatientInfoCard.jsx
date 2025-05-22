import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Sparkles } from 'lucide-react';

const PatientInfoCard = ({ patient, patientHistory, onSaveHistory, toggleIntakeForm }) => {
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editedHistory, setEditedHistory] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Preset prompts for quick selection
  const presetPrompts = [
    "Generate a comprehensive patient history based on available data.",
    "Create a detailed history with focus on medical conditions and current medications.",
    "Write a concise patient history focusing on key findings and chief complaints.",
    "Draft a patient history with emphasis on relevant past medical history."
  ];

  // Initialize editedHistory state when patientHistory prop changes or editing starts
  useEffect(() => {
    if (!isEditingHistory) {
      setEditedHistory(patientHistory || '');
    }
  }, [patientHistory, isEditingHistory]);

  const handleEditHistoryClick = () => {
    setIsEditingHistory(true);
  };
  
  const handleAIGenerate = () => {
    setIsGeneratingAI(true);
    setIsEditingHistory(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      // Generate a comprehensive patient history based on available data
      let aiGeneratedHistory = '';
      
      // If we have a custom prompt, use it to influence the generated content
      if (customPrompt && customPrompt.trim()) {
        // Simulate different responses based on the prompt
        if (customPrompt.includes('detailed') || customPrompt.includes('medical conditions') || customPrompt.includes('medications')) {
          if (patient?.intakeData) {
            const { basicInfo, healthHistory } = patient.intakeData;
            
            // Detailed history with focus on medical conditions and medications
            aiGeneratedHistory += `PATIENT DEMOGRAPHICS: 43-year-old female presenting for weight management and ED treatment.\n\n`;
            
            // Add detailed vitals
            if (basicInfo) {
              const height = basicInfo.height || '';
              const weight = basicInfo.weight || '';
              const weightUnit = basicInfo.weightUnit || 'lbs';
              
              aiGeneratedHistory += `VITALS:\n`;
              aiGeneratedHistory += `• Height: ${height}\n`;
              aiGeneratedHistory += `• Weight: ${weight} ${weightUnit}\n`;
              aiGeneratedHistory += `• BMI: 32.4 (Class I Obesity)\n`;
              aiGeneratedHistory += `• BP: 118/76 mmHg\n`;
              aiGeneratedHistory += `• HR: 72 bpm\n\n`;
              
              if (basicInfo.goalWeight) {
                aiGeneratedHistory += `GOALS:\n`;
                aiGeneratedHistory += `• Target weight: ${basicInfo.goalWeight} ${weightUnit}\n`;
                aiGeneratedHistory += `• Weight loss needed: ${weight - basicInfo.goalWeight} ${weightUnit}\n\n`;
              }
            }
            
            // Add detailed medical history
            if (healthHistory) {
              aiGeneratedHistory += `MEDICAL HISTORY:\n`;
              
              if (healthHistory.medicalConditions?.length) {
                aiGeneratedHistory += `• Active conditions: ${healthHistory.medicalConditions.join(', ')}\n`;
              } else {
                aiGeneratedHistory += `• No active medical conditions reported\n`;
              }
              
              aiGeneratedHistory += `• Past surgical history: None reported\n`;
              aiGeneratedHistory += `• Family history: Father with hypertension, mother with type 2 diabetes\n\n`;
              
              // Add detailed current medications
              aiGeneratedHistory += `CURRENT MEDICATIONS:\n`;
              if (healthHistory.medicationsText) {
                const meds = healthHistory.medicationsText.split(',');
                meds.forEach(med => {
                  aiGeneratedHistory += `• ${med.trim()}\n`;
                });
                aiGeneratedHistory += `\n`;
              } else {
                aiGeneratedHistory += `• No current medications reported\n\n`;
              }
              
              // Add detailed allergies
              aiGeneratedHistory += `ALLERGIES:\n`;
              if (healthHistory.allergiesText) {
                const allergies = healthHistory.allergiesText.split(',');
                allergies.forEach(allergy => {
                  aiGeneratedHistory += `• ${allergy.trim()}\n`;
                });
                aiGeneratedHistory += `\n`;
              } else {
                aiGeneratedHistory += `• NKDA (No Known Drug Allergies)\n\n`;
              }
            }
            
            // Add detailed chief complaint and assessment
            aiGeneratedHistory += `CHIEF COMPLAINT:\n`;
            aiGeneratedHistory += `• Primary: Difficulty with weight management\n`;
            aiGeneratedHistory += `• Secondary: Erectile dysfunction\n`;
            aiGeneratedHistory += `• Duration: Reports struggling with weight for >5 years, ED symptoms for ~1 year\n\n`;
            
            aiGeneratedHistory += `ASSESSMENT:\n`;
            aiGeneratedHistory += `• BMI 32.4 (Class I Obesity)\n`;
            aiGeneratedHistory += `• Likely metabolic syndrome contributing to both weight issues and ED\n`;
            aiGeneratedHistory += `• No contraindications to weight management medications identified\n`;
            aiGeneratedHistory += `• No contraindications to ED treatment identified\n`;
            aiGeneratedHistory += `• Patient is motivated to lose weight and improve overall health\n`;
            aiGeneratedHistory += `• Potential medication interaction between Semaglutide and Sildenafil - monitor for hypotension`;
          } else {
            // Fallback if no intake data is available
            aiGeneratedHistory = `DETAILED PATIENT HISTORY:\n\n`;
            aiGeneratedHistory += `DEMOGRAPHICS: 43-year-old female\n\n`;
            aiGeneratedHistory += `VITALS:\n• Height: 5'6"\n• Weight: 185 lbs\n• BMI: 32.4 (Class I Obesity)\n• BP: 118/76 mmHg\n• HR: 72 bpm\n\n`;
            aiGeneratedHistory += `MEDICAL HISTORY:\n• No significant past medical history reported\n• No surgical history\n• Family history: Father with hypertension, mother with type 2 diabetes\n\n`;
            aiGeneratedHistory += `CURRENT MEDICATIONS:\n• Levothyroxine 75mcg daily\n\n`;
            aiGeneratedHistory += `ALLERGIES:\n• NKDA (No Known Drug Allergies)\n\n`;
            aiGeneratedHistory += `CHIEF COMPLAINT:\n• Primary: Difficulty with weight management despite diet and exercise\n• Secondary: Erectile dysfunction\n• Duration: Reports struggling with weight for >5 years, ED symptoms for ~1 year\n\n`;
            aiGeneratedHistory += `ASSESSMENT:\n• BMI 32.4 (Class I Obesity)\n• Likely metabolic syndrome contributing to both weight issues and ED\n• No contraindications to weight management medications identified\n• No contraindications to ED treatment identified\n• Patient is motivated to lose weight and improve overall health\n• Potential medication interaction between Semaglutide and Sildenafil - monitor for hypotension`;
          }
        } 
        else if (customPrompt.includes('concise') || customPrompt.includes('key findings')) {
          // Concise history focusing on key findings
          aiGeneratedHistory = `43yo female with BMI 32.4 presenting for weight management and ED treatment.\n\n`;
          aiGeneratedHistory += `Key findings:\n`;
          aiGeneratedHistory += `• No significant past medical history\n`;
          aiGeneratedHistory += `• Current medications: Levothyroxine 75mcg\n`;
          aiGeneratedHistory += `• NKDA\n`;
          aiGeneratedHistory += `• Reports difficulty losing weight despite diet and exercise\n`;
          aiGeneratedHistory += `• ED symptoms for approximately 1 year\n`;
          aiGeneratedHistory += `• No contraindications to weight management or ED medications\n`;
          aiGeneratedHistory += `• Goal: 15-20 lb weight loss`;
        }
        else if (customPrompt.includes('past medical history') || customPrompt.includes('relevant')) {
          // History with emphasis on past medical history
          aiGeneratedHistory = `PAST MEDICAL HISTORY FOCUS:\n\n`;
          aiGeneratedHistory += `43-year-old female with BMI 32.4 presenting for weight management and ED treatment.\n\n`;
          aiGeneratedHistory += `RELEVANT PAST MEDICAL HISTORY:\n`;
          aiGeneratedHistory += `• No chronic medical conditions\n`;
          aiGeneratedHistory += `• No previous surgeries\n`;
          aiGeneratedHistory += `• No hospitalizations\n`;
          aiGeneratedHistory += `• Family history significant for:\n`;
          aiGeneratedHistory += `  - Father: Hypertension\n`;
          aiGeneratedHistory += `  - Mother: Type 2 diabetes\n`;
          aiGeneratedHistory += `  - No family history of cardiovascular disease or cancer\n\n`;
          aiGeneratedHistory += `RELEVANT MEDICATIONS:\n`;
          aiGeneratedHistory += `• Levothyroxine 75mcg daily (continued from prior provider)\n`;
          aiGeneratedHistory += `• No history of weight management medications\n`;
          aiGeneratedHistory += `• No history of ED treatments\n\n`;
          aiGeneratedHistory += `ALLERGIES: NKDA\n\n`;
          aiGeneratedHistory += `RELEVANT SOCIAL HISTORY:\n`;
          aiGeneratedHistory += `• Non-smoker\n`;
          aiGeneratedHistory += `• Alcohol: 2-3 drinks per week\n`;
          aiGeneratedHistory += `• Exercise: 1-2 times per week, 30 minutes of walking\n`;
          aiGeneratedHistory += `• Diet: Reports frequent dining out, high carbohydrate intake\n\n`;
          aiGeneratedHistory += `ASSESSMENT: Patient is a good candidate for weight management and ED treatment with no contraindications identified based on past medical history.`;
        }
        else {
          // Default response for other custom prompts
          if (patient?.intakeData) {
            const { basicInfo, healthHistory } = patient.intakeData;
            
            // Start with basic demographics
            aiGeneratedHistory += `43-year-old female presenting for weight management and ED treatment.\n\n`;
            
            // Add height/weight/BMI if available
            if (basicInfo) {
              const height = basicInfo.height || '';
              const weight = basicInfo.weight || '';
              const weightUnit = basicInfo.weightUnit || 'lbs';
              
              if (height && weight) {
                aiGeneratedHistory += `VITALS: Height ${height}, Weight ${weight} ${weightUnit}, BMI 32.4.\n\n`;
              }
              
              if (basicInfo.goalWeight) {
                aiGeneratedHistory += `Patient's goal weight: ${basicInfo.goalWeight} ${weightUnit}.\n\n`;
              }
            }
            
            // Add medical history if available
            if (healthHistory) {
              aiGeneratedHistory += `MEDICAL HISTORY: `;
              
              if (healthHistory.medicalConditions?.length) {
                aiGeneratedHistory += `${healthHistory.medicalConditions.join(', ')}.\n\n`;
              } else {
                aiGeneratedHistory += `No significant past medical history.\n\n`;
              }
              
              // Add current medications
              aiGeneratedHistory += `CURRENT MEDICATIONS: `;
              if (healthHistory.medicationsText) {
                aiGeneratedHistory += `${healthHistory.medicationsText}.\n\n`;
              } else {
                aiGeneratedHistory += `No current medications reported.\n\n`;
              }
              
              // Add allergies if available
              if (healthHistory.allergiesText) {
                aiGeneratedHistory += `ALLERGIES: ${healthHistory.allergiesText}.\n\n`;
              } else {
                aiGeneratedHistory += `ALLERGIES: NKDA (No Known Drug Allergies).\n\n`;
              }
            }
            
            // Add chief complaint and assessment
            aiGeneratedHistory += `CHIEF COMPLAINT: Patient reports difficulty with weight management and erectile dysfunction.\n\n`;
            aiGeneratedHistory += `ASSESSMENT: Patient is overweight with BMI of 32.4, which may be contributing to erectile dysfunction. Patient is motivated to lose weight and improve overall health. No contraindications to weight management medications or ED treatment identified.`;
          } else {
            // Fallback if no intake data is available
            aiGeneratedHistory = `43-year-old female presenting for weight management and ED treatment. Patient reports difficulty losing weight despite diet and exercise. BMI 32.4, indicating obesity. Patient also reports erectile dysfunction. No contraindications to weight management medications or ED treatment identified. Patient is motivated to improve health and lose 15-20 pounds.`;
          }
        }
      } 
      else {
        // Default response if no custom prompt is provided
        if (patient?.intakeData) {
          const { basicInfo, healthHistory } = patient.intakeData;
          
          // Start with basic demographics
          aiGeneratedHistory += `43-year-old female presenting for weight management and ED treatment.\n\n`;
          
          // Add height/weight/BMI if available
          if (basicInfo) {
            const height = basicInfo.height || '';
            const weight = basicInfo.weight || '';
            const weightUnit = basicInfo.weightUnit || 'lbs';
            
            if (height && weight) {
              aiGeneratedHistory += `VITALS: Height ${height}, Weight ${weight} ${weightUnit}, BMI 32.4.\n\n`;
            }
            
            if (basicInfo.goalWeight) {
              aiGeneratedHistory += `Patient's goal weight: ${basicInfo.goalWeight} ${weightUnit}.\n\n`;
            }
          }
          
          // Add medical history if available
          if (healthHistory) {
            aiGeneratedHistory += `MEDICAL HISTORY: `;
            
            if (healthHistory.medicalConditions?.length) {
              aiGeneratedHistory += `${healthHistory.medicalConditions.join(', ')}.\n\n`;
            } else {
              aiGeneratedHistory += `No significant past medical history.\n\n`;
            }
            
            // Add current medications
            aiGeneratedHistory += `CURRENT MEDICATIONS: `;
            if (healthHistory.medicationsText) {
              aiGeneratedHistory += `${healthHistory.medicationsText}.\n\n`;
            } else {
              aiGeneratedHistory += `No current medications reported.\n\n`;
            }
            
            // Add allergies if available
            if (healthHistory.allergiesText) {
              aiGeneratedHistory += `ALLERGIES: ${healthHistory.allergiesText}.\n\n`;
            } else {
              aiGeneratedHistory += `ALLERGIES: NKDA (No Known Drug Allergies).\n\n`;
            }
          }
          
          // Add chief complaint and assessment
          aiGeneratedHistory += `CHIEF COMPLAINT: Patient reports difficulty with weight management and erectile dysfunction.\n\n`;
          aiGeneratedHistory += `ASSESSMENT: Patient is overweight with BMI of 32.4, which may be contributing to erectile dysfunction. Patient is motivated to lose weight and improve overall health. No contraindications to weight management medications or ED treatment identified.`;
        } else {
          // Fallback if no intake data is available
          aiGeneratedHistory = `43-year-old female presenting for weight management and ED treatment. Patient reports difficulty losing weight despite diet and exercise. BMI 32.4, indicating obesity. Patient also reports erectile dysfunction. No contraindications to weight management medications or ED treatment identified. Patient is motivated to improve health and lose 15-20 pounds.`;
        }
      }
      
      // Clear the custom prompt after generating content
      setCustomPrompt('');
      
      setEditedHistory(aiGeneratedHistory);
      setIsGeneratingAI(false);
    }, 1500);
  };

  const handleSaveHistory = () => {
    if (onSaveHistory) {
      onSaveHistory(editedHistory); // Call the callback from the parent
    }
    setIsEditingHistory(false);
    console.log('Saving edited patient history (frontend state updated):', editedHistory);
  };

  const handleCancelHistory = () => {
    // Revert changes and exit editing mode
    setEditedHistory(patientHistory || ''); // Revert to the prop value
    setIsEditingHistory(false);
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
        <span style={{ color: 'white' }}>Patient Information</span>
        <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
          <button
            onClick={toggleIntakeForm}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 'normal',
              fontSize: '14px'
            }}
          >
            View Intake Form
          </button>
          {isEditingHistory ? (
            <>
              <button
                onClick={handleSaveHistory}
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
                onClick={handleCancelHistory}
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
                  onClick={handleEditHistoryClick}
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
        {showPromptInput && !isEditingHistory && !isGeneratingAI && (
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
                  backgroundColor: 'white'
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
        
        {/* Intake Form Data Section */}
        {patient?.intakeData && (
          <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#4f46e5', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Intake Form Data</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              {patient.intakeData.basicInfo && (
                <>
                  <div><span style={{ fontWeight: '500' }}>Height:</span> {patient.intakeData.basicInfo.height}</div>
                  <div><span style={{ fontWeight: '500' }}>Weight:</span> {patient.intakeData.basicInfo.weight} {patient.intakeData.basicInfo.weightUnit || 'lbs'}</div>
                  {patient.intakeData.basicInfo.goalWeight && (
                    <div><span style={{ fontWeight: '500' }}>Goal Weight:</span> {patient.intakeData.basicInfo.goalWeight} {patient.intakeData.basicInfo.weightUnit || 'lbs'}</div>
                  )}
                </>
              )}
              {patient.intakeData.healthHistory && (
                <>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ fontWeight: '500' }}>Medical Conditions:</span> {
                    patient.intakeData.healthHistory.medicalConditions?.length
                      ? patient.intakeData.healthHistory.medicalConditions.join(', ')
                      : 'None reported'
                  }</div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ fontWeight: '500' }}>Current Medications:</span> {
                    patient.intakeData.healthHistory.medicationsText || 'None reported'
                  }</div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ 
            fontWeight: '600', 
            fontSize: '14px', 
            marginBottom: '4px'
          }}>
            Patient History:
          </div>
          {isEditingHistory ? (
            isGeneratingAI ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '20px',
                minHeight: '100px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
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
                  AI is composing patient history...
                </div>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '6px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                value={editedHistory}
                onChange={(e) => setEditedHistory(e.target.value)}
              />
            )
          ) : (
            <div style={{ 
              padding: '8px', 
              backgroundColor: 'white', 
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '8px',
              whiteSpace: 'pre-line',
              border: '1px solid #e5e7eb',
              position: 'relative'
            }}>
              {patientHistory || 'No history provided.'}
              {!isEditingHistory && (
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
                    height: '20px',
                    position: 'absolute',
                    top: '8px',
                    right: '8px'
                  }}
                  title="Refresh with AI"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;
