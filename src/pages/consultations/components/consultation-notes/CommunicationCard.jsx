import React, { useState, useEffect } from 'react';
import { Edit, Plus, AlertCircle, RefreshCw, Save, X, Sparkles } from 'lucide-react';
import { useFollowUpTemplatesByCategoryAndPeriod } from '../../../../apis/followUps/hooks';
// Removed toast import

const CommunicationCard = ({
  selectedFollowUpPeriod,
  followUpDisplayText,
  selectFollowupPeriod,
  resourceOptions,
  selectedResources,
  toggleResource,
  showMoreResources,
  toggleMoreResources,
  serviceCategory = 'weight_management', // Default to weight management if not provided
  requiresPayment = true, // Default to requiring payment for follow-ups
  medicationData = {}, // Added to access medication data
  medicationDosages = {} // Added to access medication dosages
}) => {
  // State for follow-up template
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  
  // Fetch follow-up templates for the selected period and category
  const { data: followUpTemplates, isLoading: isLoadingTemplates, error: templatesError } = 
    useFollowUpTemplatesByCategoryAndPeriod(serviceCategory, selectedFollowUpPeriod, {
      // Log errors but don't show toast notifications
      onError: (error) => {
        console.error(`Error fetching follow-up templates: ${error.message}`);
      }
    });
  
  // Update selected template when templates are loaded or period changes
  useEffect(() => {
    if (followUpTemplates && followUpTemplates.length > 0) {
      setSelectedTemplateId(followUpTemplates[0].id);
    } else {
      setSelectedTemplateId(null);
    }
  }, [followUpTemplates, selectedFollowUpPeriod]);

  // New state for AI-generated content
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Preset prompts for quick selection
  const presetPrompts = [
    "Generate a patient message summarizing the prescribed medications and follow-up plan.",
    "Create a detailed message explaining medication instructions and potential side effects.",
    "Write a concise message focusing on the treatment goals and next steps.",
    "Draft a friendly message emphasizing the importance of medication adherence."
  ];

  // Function to generate AI content based on medications and custom prompt
  const generateAIContent = async () => {
    setIsLoadingAI(true);
    setIsEditingMessage(true);
    try {
      // Get selected medications
      const selectedMeds = Object.keys(medicationData)
        .filter(medId => medicationData[medId] && medicationData[medId].selected)
        .map(medId => ({
          name: medicationData[medId].name,
          dosage: medicationDosages[medId] || '',
          frequency: medicationData[medId].frequency || '',
          category: medicationData[medId].category || ''
        }));
      
      // Group medications by category
      const medsByCategory = {};
      selectedMeds.forEach(med => {
        if (!medsByCategory[med.category]) {
          medsByCategory[med.category] = [];
        }
        medsByCategory[med.category].push(med);
      });
      
      // In production, this would be an API call to your AI service with the custom prompt
      // For now, we'll simulate different responses based on the prompt
      const response = await new Promise(resolve => 
        setTimeout(() => {
          let content = '';
          
          // If we have a custom prompt, use it to influence the generated content
          if (customPrompt && customPrompt.trim()) {
            // Simulate different responses based on the prompt
            if (customPrompt.includes('side effects') || customPrompt.includes('detailed')) {
              content = 'Based on our consultation, I\'ve prescribed the following treatment plan with detailed instructions:\n\n';
              
              // Add medications by category with side effects
              Object.keys(medsByCategory).forEach(category => {
                const categoryName = category === 'wm' ? 'Weight Management' : 
                                    category === 'ed' ? 'ED' : 
                                    category === 'pc' ? 'Primary Care' : 
                                    category === 'mh' ? 'Mental Health' : category;
                
                content += `**${categoryName}**:\n`;
                medsByCategory[category].forEach(med => {
                  content += `- ${med.name} ${med.dosage} ${med.frequency}\n`;
                  
                  // Add side effects based on medication
                  if (med.name.includes('Semaglutide')) {
                    content += `  • Possible side effects: nausea, vomiting, diarrhea, abdominal pain\n`;
                    content += `  • Take with or without food. Start with low dose and increase gradually.\n`;
                  } else if (med.name.includes('Metformin')) {
                    content += `  • Possible side effects: diarrhea, nausea, stomach upset\n`;
                    content += `  • Take with meals to minimize GI side effects.\n`;
                  } else if (med.name.includes('Sildenafil')) {
                    content += `  • Possible side effects: headache, flushing, indigestion\n`;
                    content += `  • Take 30-60 minutes before sexual activity. Do not take more than once daily.\n`;
                  }
                });
                content += '\n';
              });
              
              content += 'Please monitor for these side effects and contact us if you experience any severe reactions. We\'ll follow up in ' + 
                        followUpDisplayText + ' to assess your progress and make any necessary adjustments.';
            } 
            else if (customPrompt.includes('concise') || customPrompt.includes('brief')) {
              content = 'Treatment Plan Summary:\n\n';
              
              // Add medications in a concise format
              Object.keys(medsByCategory).forEach(category => {
                const categoryName = category === 'wm' ? 'Weight Management' : 
                                    category === 'ed' ? 'ED' : 
                                    category === 'pc' ? 'Primary Care' : 
                                    category === 'mh' ? 'Mental Health' : category;
                
                content += `${categoryName}: `;
                content += medsByCategory[category].map(med => 
                  `${med.name} ${med.dosage} ${med.frequency}`
                ).join(', ');
                content += '\n';
              });
              
              content += `\nFollow-up: ${followUpDisplayText}`;
            }
            else if (customPrompt.includes('adherence') || customPrompt.includes('importance')) {
              content = 'Dear Patient,\n\n';
              content += 'Thank you for your visit today. I\'ve prescribed the following medications for your treatment:\n\n';
              
              // Add medications by category
              Object.keys(medsByCategory).forEach(category => {
                const categoryName = category === 'wm' ? 'Weight Management' : 
                                    category === 'ed' ? 'ED' : 
                                    category === 'pc' ? 'Primary Care' : 
                                    category === 'mh' ? 'Mental Health' : category;
                
                content += `**${categoryName}**:\n`;
                medsByCategory[category].forEach(med => {
                  content += `- ${med.name} ${med.dosage} ${med.frequency}\n`;
                });
                content += '\n';
              });
              
              content += 'It\'s extremely important that you take these medications exactly as prescribed. Consistent medication adherence is the key to achieving the best results from your treatment plan.\n\n';
              content += 'Some tips for staying on track:\n';
              content += '• Set daily reminders on your phone\n';
              content += '• Use a pill organizer\n';
              content += '• Keep a medication log\n';
              content += '• Store your medications in a visible location\n\n';
              
              content += `We'll follow up in ${followUpDisplayText} to check on your progress. Please reach out if you have any questions or concerns before then.`;
            }
            else {
              // Default response for other custom prompts
              content = 'Based on your request, here is your personalized treatment plan:\n\n';
              
              // Add medications by category
              Object.keys(medsByCategory).forEach(category => {
                const categoryName = category === 'wm' ? 'Weight Management' : 
                                    category === 'ed' ? 'ED' : 
                                    category === 'pc' ? 'Primary Care' : 
                                    category === 'mh' ? 'Mental Health' : category;
                
                content += `**${categoryName}**:\n`;
                medsByCategory[category].forEach(med => {
                  content += `- ${med.name} ${med.dosage} ${med.frequency}\n`;
                });
                content += '\n';
              });
              
              content += `We'll follow up in ${followUpDisplayText} to assess your progress. Please take all medications as prescribed and contact us if you have any questions or concerns.`;
            }
          } 
          else {
            // Default response if no custom prompt is provided
            if (selectedMeds.length === 0) {
              content = 'No medications have been selected for your treatment plan.';
            } else {
              content = 'Based on our consultation, I\'ve prescribed the following treatment plan:\n\n';
              
              // Add medications by category
              Object.keys(medsByCategory).forEach(category => {
                const categoryName = category === 'wm' ? 'Weight Management' : 
                                    category === 'ed' ? 'ED' : 
                                    category === 'pc' ? 'Primary Care' : 
                                    category === 'mh' ? 'Mental Health' : category;
                
                content += `**${categoryName}**:\n`;
                medsByCategory[category].forEach(med => {
                  content += `- ${med.name} ${med.dosage} ${med.frequency}\n`;
                });
                content += '\n';
              });
              
              content += 'Please take these medications as prescribed. We\'ll follow up in ' + 
                        followUpDisplayText + ' to assess your progress and make any necessary adjustments.';
            }
          }
          
          // Clear the custom prompt after generating content
          setCustomPrompt('');
          
          resolve({ content });
        }, 1500) // Slightly longer delay to simulate more complex processing
      );
      
      setAiGeneratedContent(response.content);
      setEditedMessage(response.content);
      // Success is obvious, no need for toast notification
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // We no longer auto-generate content on mount
  // This is now triggered by the AI Compose button click

  // Toggle message editing
  const toggleMessageEdit = () => {
    if (!isEditingMessage) {
      setEditedMessage(aiGeneratedContent);
    } else {
      // Save changes when exiting edit mode
      setAiGeneratedContent(editedMessage);
      // Success is obvious, no need for toast notification
    }
    setIsEditingMessage(!isEditingMessage);
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
        <span style={{ color: 'white' }}>Patient Communication</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditingMessage ? (
            <>
              <button
                onClick={toggleMessageEdit}
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
                disabled={isLoadingAI}
              >
                <Save size={14} className="mr-1" />
                Save
              </button>
              <button
                onClick={() => setIsEditingMessage(false)}
                style={{
                  background: '#6b7280', // Gray-500
                  color: '#374151',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}
                disabled={isLoadingAI}
              >
                <X size={14} className="mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
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
                  onClick={() => setShowPromptInput(!showPromptInput)}
                  disabled={isLoadingAI}
                >
                  <Sparkles size={12} style={{ marginRight: '4px' }} />
                  AI Compose
                </button>
                <button 
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
                  onClick={toggleMessageEdit}
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
        {showPromptInput && !isEditingMessage && !isLoadingAI && (
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
                  generateAIContent();
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
        
        {/* Patient Message Section */}
        <div style={{ marginBottom: '8px' }} className="compact-section">
          <div style={{ 
            fontWeight: '600', 
            fontSize: '14px', 
            marginBottom: '4px'
          }}>
            Patient Message:
          </div>
          <div 
            style={{ 
              padding: '8px', 
              backgroundColor: 'white', 
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '8px',
              whiteSpace: 'pre-line',
              border: '1px solid #e5e7eb',
              position: 'relative'
            }}
          >
            {isLoadingAI ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '20px',
                minHeight: '100px'
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
                  AI is composing patient message...
                </div>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : isEditingMessage ? (
              <>
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    resize: 'vertical',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </>
            ) : (
              <div>
                {aiGeneratedContent || 'Click "AI Compose" to generate a patient message.'}
                {!isEditingMessage && !isLoadingAI && (
                  <button
                    onClick={() => {
                      // Auto-generate without showing prompt input
                      setCustomPrompt('');
                      generateAIContent();
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
        
        {/* Follow-up Options */}
        <div style={{ marginBottom: '8px' }} className="compact-section">
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }} className="section-title">Follow-up:</div>
          </div>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '8px'
          }} className="followup-options">
            <div 
              style={{ 
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: selectedFollowUpPeriod === '2w' ? '#dbeafe' : '#f3f4f6',
                border: `1px solid ${selectedFollowUpPeriod === '2w' ? '#93c5fd' : '#e5e7eb'}`,
                color: selectedFollowUpPeriod === '2w' ? '#1e40af' : '#374151',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              onClick={() => selectFollowupPeriod('2w')}
            >
              2w
            </div>
            <div 
              style={{ 
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: selectedFollowUpPeriod === '4w' ? '#dbeafe' : '#f3f4f6',
                border: `1px solid ${selectedFollowUpPeriod === '4w' ? '#93c5fd' : '#e5e7eb'}`,
                color: selectedFollowUpPeriod === '4w' ? '#1e40af' : '#374151',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              onClick={() => selectFollowupPeriod('4w')}
            >
              4w
            </div>
            <div 
              style={{ 
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: selectedFollowUpPeriod === '6w' ? '#dbeafe' : '#f3f4f6',
                border: `1px solid ${selectedFollowUpPeriod === '6w' ? '#93c5fd' : '#e5e7eb'}`,
                color: selectedFollowUpPeriod === '6w' ? '#1e40af' : '#374151',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              onClick={() => selectFollowupPeriod('6w')}
            >
              6w
            </div>
            <div 
              style={{ 
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: selectedFollowUpPeriod === 'custom' ? '#dbeafe' : '#f3f4f6',
                border: `1px solid ${selectedFollowUpPeriod === 'custom' ? '#93c5fd' : '#e5e7eb'}`,
                color: selectedFollowUpPeriod === 'custom' ? '#1e40af' : '#374151',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              onClick={() => selectFollowupPeriod('custom')}
            >
              Custom
            </div>
          </div>
          
          {/* Follow-up Template Selection */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Follow-up Template:</div>
            <select
              value={selectedTemplateId || ''}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              {isLoadingTemplates ? (
                <option>Loading templates...</option>
              ) : templatesError ? (
                <option>Standard Follow-up</option>
              ) : followUpTemplates && followUpTemplates.length > 0 ? (
                followUpTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))
              ) : (
                <option>Standard Follow-up</option>
              )}
            </select>
          </div>
        </div>
        
        {/* Patient Education Resources */}
        <div style={{ marginBottom: '8px' }} className="compact-section">
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }} className="section-title">Patient Education: Attach relevant instructions</div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '6px'
          }} className="resource-grid">
            {resourceOptions.slice(0, 3).map(resource => (
              <div 
                key={resource.id}
                style={{ 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: selectedResources.includes(resource.id) ? '#dbeafe' : '#f3f4f6',
                  border: `1px solid ${selectedResources.includes(resource.id) ? '#93c5fd' : '#e5e7eb'}`,
                  color: selectedResources.includes(resource.id) ? '#1e40af' : '#374151',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
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
              style={{ 
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                color: '#374151',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onClick={toggleMoreResources}
            >
              <span>More...</span>
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          {/* No selected resources display - just use color change in the grid */}
          
          {/* More Resources Panel */}
          {showMoreResources && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Additional Resources</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {resourceOptions.slice(3).map(resource => (
                  <div 
                    key={resource.id}
                    style={{ 
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: selectedResources.includes(resource.id) ? '#dbeafe' : '#f3f4f6',
                      border: `1px solid ${selectedResources.includes(resource.id) ? '#93c5fd' : '#e5e7eb'}`,
                      color: selectedResources.includes(resource.id) ? '#1e40af' : '#374151',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: 0
                    }}
                    onClick={() => toggleResource(resource.id)}
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
