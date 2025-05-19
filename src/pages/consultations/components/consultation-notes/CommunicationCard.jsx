import React, { useState, useEffect } from 'react';
import { Edit, Plus, AlertCircle, RefreshCw, Save, X } from 'lucide-react';
import { useFollowUpTemplatesByCategoryAndPeriod } from '../../../../apis/followUps/hooks';
import { toast } from 'react-toastify';

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
    useFollowUpTemplatesByCategoryAndPeriod(serviceCategory, selectedFollowUpPeriod);
  
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

  // Function to generate AI content based on medications
  const generateAIContent = async () => {
    setIsLoadingAI(true);
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
      
      // In production, this would be an API call to your AI service
      // For now, we'll generate a simple message based on the medications
      const response = await new Promise(resolve => 
        setTimeout(() => {
          let content = '';
          
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
          
          resolve({ content });
        }, 1000)
      );
      
      setAiGeneratedContent(response.content);
      setEditedMessage(response.content);
      // Success is obvious, no need for toast notification
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate patient message');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Generate content on mount or when medications change
  useEffect(() => {
    // Only generate if we have medication data
    if (Object.keys(medicationData).length > 0) {
      generateAIContent();
    }
  }, [medicationData, medicationDosages, followUpDisplayText]);

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
    <div className="card">
      <div className="card-header">
        Patient Communication
        <div style={{ display: 'flex', gap: '8px' }}>
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
            onClick={generateAIContent}
            disabled={isLoadingAI}
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </button>
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
      </div>
      <div className="card-body">
        {/* AI-Generated Patient Message */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '6px', 
            fontSize: '15px' 
          }}>
            <span style={{ fontWeight: '600' }}>Patient Message:</span>
            {!isEditingMessage && (
              <button 
                onClick={toggleMessageEdit}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px'
                }}
              >
                <Edit size={13} className="mr-1" />
                Edit
              </button>
            )}
          </div>
          <div 
            style={{ 
              padding: '10px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '80px',
              position: 'relative',
              whiteSpace: 'pre-line'
            }}
          >
            {isLoadingAI ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <span>Generating patient message...</span>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => setIsEditingMessage(false)}
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={13} className="mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={toggleMessageEdit}
                    style={{
                      fontSize: '13px',
                      color: '#3b82f6',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Save size={13} className="mr-1" />
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div>{aiGeneratedContent || 'Click "Refresh" to generate a patient message.'}</div>
            )}
          </div>
        </div>

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
          
          {/* Follow-up Template Selection */}
          {isLoadingTemplates ? (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>Loading follow-up templates...</div>
          ) : templatesError ? (
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginTop: '8px',
              padding: '6px 8px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>Standard Follow-up</div>
              {requiresPayment && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '8px',
                  padding: '6px 8px',
                  backgroundColor: '#fff8e6',
                  borderRadius: '4px',
                  border: '1px solid #fbbf24',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={16} style={{ color: '#d97706', marginRight: '8px', flexShrink: 0 }} />
                  <span>Follow-up will be scheduled after payment is received</span>
                </div>
              )}
            </div>
          ) : followUpTemplates && followUpTemplates.length > 0 ? (
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
                {followUpTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              
              {requiresPayment && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '8px',
                  padding: '6px 8px',
                  backgroundColor: '#fff8e6',
                  borderRadius: '4px',
                  border: '1px solid #fbbf24',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={16} style={{ color: '#d97706', marginRight: '8px', flexShrink: 0 }} />
                  <span>Follow-up will be scheduled after payment is received</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginTop: '8px',
              padding: '6px 8px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px'
            }}>
              No follow-up templates available for this period and service category.
            </div>
          )}
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
