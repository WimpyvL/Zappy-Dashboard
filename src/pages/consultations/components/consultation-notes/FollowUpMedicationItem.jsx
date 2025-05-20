import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Pencil, FileText, Heart, ArrowUp, ArrowDown, Minus, X } from 'lucide-react';

const FollowUpMedicationItem = ({
  medId,
  medication,
  dosage,
  previousDosage,
  openInstructions,
  toggleMedication,
  toggleInstructions,
  selectDosage,
  updateApproach,
  isPatientPreference = false,
  supportedApproaches = ['Maint.', 'Escalation', 'PRN', 'Daily']
}) => {
  // Local state to track selection
  const [isSelected, setIsSelected] = useState(medication.selected || false);
  
  // Update local state when medication.selected changes
  useEffect(() => {
    setIsSelected(medication.selected || false);
  }, [medication.selected]);

  // Define all possible approach options with their display labels
  const allApproachOptions = [
    { value: 'Maint.', label: 'Maint.' },
    { value: 'Escalation', label: 'Escal.' },
    { value: 'PRN', label: 'PRN' },
    { value: 'Daily', label: 'Daily' },
  ];

  // Filter approach options based on the supportedApproaches prop
  const availableApproachOptions = allApproachOptions.filter(option =>
    supportedApproaches.includes(option.value)
  );

  // Determine the default selected approach based on medication frequency or a default
  const defaultApproach = medication.frequency === 'PRN' ? 'PRN' : 'Escalation';

  // Component state
  const [editedInstructions, setEditedInstructions] = useState(
    Array.isArray(medication.instructions)
      ? medication.instructions.join('\n')
      : (medication.instructions || '')
  );
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [planDuration, setPlanDuration] = useState(
    medication.category === 'wm' ? '6_mos' : '3_mos'
  );
  const [approach, setApproach] = useState(medication.approach || defaultApproach);
  const [frequency, setFrequency] = useState(medication.frequency || 'dly');
  
  // New state for follow-up adjustments
  const [adjustmentAction, setAdjustmentAction] = useState('maintain');
  
  // Get current and previous dosage values for comparison
  const getCurrentDosageValue = () => {
    if (!dosage) return 0;
    const numericValue = parseFloat(dosage.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };
  
  const getPreviousDosageValue = () => {
    if (!previousDosage) return 0;
    const numericValue = parseFloat(previousDosage.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };
  
  // Calculate if current dosage is higher, lower, or the same as previous
  const currentValue = getCurrentDosageValue();
  const previousValue = getPreviousDosageValue();
  
  // Determine if we can increase or decrease based on available dosage options
  const canIncrease = medication.dosageOptions && 
    medication.dosageOptions.some(opt => {
      const optValue = parseFloat(opt.value.replace(/[^\d.]/g, ''));
      return !isNaN(optValue) && optValue > currentValue;
    });
    
  const canDecrease = medication.dosageOptions && 
    medication.dosageOptions.some(opt => {
      const optValue = parseFloat(opt.value.replace(/[^\d.]/g, ''));
      return !isNaN(optValue) && optValue < currentValue && optValue > 0;
    });

  // Handle medication toggle
  const handleToggle = () => {
    console.log(`FollowUpMedicationItem: Toggling medication ${medId} from ${isSelected} to ${!isSelected}`);
    
    // Update local state first
    setIsSelected(!isSelected);
    
    // Then call the parent component's toggle function
    toggleMedication(medId);
  };

  // Save instructions handler
  const handleSaveInstructions = () => {
    medication.instructions = editedInstructions.split('\n');
    setIsEditingInstructions(false);
  };
  
  // Handle adjustment action
  const handleAdjustment = (action) => {
    setAdjustmentAction(action);
    
    // If stopping medication, deselect it
    if (action === 'stop') {
      setIsSelected(false);
      toggleMedication(medId);
      return;
    }
    
    // Make sure medication is selected
    if (!isSelected) {
      setIsSelected(true);
      toggleMedication(medId);
    }
    
    // Handle increase/decrease actions
    if (action === 'increase' && canIncrease) {
      // Find next higher dosage
      const currentValue = getCurrentDosageValue();
      const nextDosage = medication.dosageOptions.find(opt => {
        const optValue = parseFloat(opt.value.replace(/[^\d.]/g, ''));
        return !isNaN(optValue) && optValue > currentValue;
      });
      
      if (nextDosage) {
        selectDosage(medId, nextDosage.value);
      }
    } else if (action === 'decrease' && canDecrease) {
      // Find next lower dosage
      const currentValue = getCurrentDosageValue();
      
      // Sort dosage options by value
      const sortedOptions = [...medication.dosageOptions].sort((a, b) => {
        const aValue = parseFloat(a.value.replace(/[^\d.]/g, ''));
        const bValue = parseFloat(b.value.replace(/[^\d.]/g, ''));
        return bValue - aValue; // Sort in descending order
      });
      
      // Find the highest dosage that's lower than current
      const prevDosage = sortedOptions.find(opt => {
        const optValue = parseFloat(opt.value.replace(/[^\d.]/g, ''));
        return !isNaN(optValue) && optValue < currentValue;
      });
      
      if (prevDosage) {
        selectDosage(medId, prevDosage.value);
      }
    }
    
    // Update approach based on adjustment
    if (action === 'increase') {
      setApproach('Escalation');
      updateApproach(medId, 'Escalation');
    } else if (action === 'decrease') {
      setApproach('Maint.');
      updateApproach(medId, 'Maint.');
    } else if (action === 'maintain') {
      // When maintain is clicked, revert to the previous dosage if available
      if (previousDosage) {
        selectDosage(medId, previousDosage);
      }
      setApproach('Maint.');
      updateApproach(medId, 'Maint.');
    }
  };

  return (
    <>
      {/* Medication Item */}
      <div
        className={`medication-item ${isSelected ? 'selected' : ''}`}
        style={{ 
          padding: isSelected ? '12px 14px' : '6px 10px',
          borderRadius: '6px',
          border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
          backgroundColor: isSelected ? '#f0f9ff' : 'white',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Medication Name Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
            <input
              type="checkbox"
              id={medId}
              checked={isSelected}
              onChange={handleToggle}
              style={{ 
                marginRight: '10px',
                marginTop: '3px',
                width: '16px',
                height: '16px',
                accentColor: '#3b82f6',
                cursor: 'pointer'
              }}
            />
            
            <div style={{ flex: '1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', fontSize: isSelected ? '15px' : '14px' }}>
                  {medication.name}
                  {medication.brandName && <span style={{ color: '#4b5563', fontSize: isSelected ? '14px' : '13px', marginLeft: '4px' }}>({medication.brandName})</span>}
                </span>
                {/* Frequency dropdown - only show when selected */}
                {isSelected && (
                  <select
                    value={frequency}
                    onChange={e => {
                      setFrequency(e.target.value);
                      medication.frequency = e.target.value;
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      width: '110px',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      color: '#374151',
                      flexShrink: 0
                    }}
                  >
                    <option value="wkly">Weekly</option>
                    <option value="dly">Daily</option>
                    <option value="bid">Twice Daily</option>
                    <option value="prn">PRN</option>
                  </select>
                )}
              </div>
              
              {/* Previous dosage indicator */}
              {previousDosage && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                  Previous: {previousDosage}
                </div>
              )}
              
              {isPatientPreference && (
                <div className="patient-preference-badge" style={{ marginTop: '4px' }}>
                  <Heart size={12} style={{ color: '#2563eb', marginRight: '4px' }} />
                  <span style={{ 
                    fontSize: '12px', 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    Patient Preference
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Adjustment Actions - Always show for follow-up */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '8px',
            paddingLeft: '26px'
          }}>
            <button
              onClick={() => handleAdjustment('increase')}
              disabled={!canIncrease}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: adjustmentAction === 'increase' ? '#dcfce7' : '#f9fafb',
                color: adjustmentAction === 'increase' ? '#166534' : '#374151',
                border: adjustmentAction === 'increase' ? '1px solid #86efac' : '1px solid #d1d5db',
                cursor: canIncrease ? 'pointer' : 'not-allowed',
                opacity: canIncrease ? 1 : 0.5
              }}
            >
              <ArrowUp size={14} style={{ marginRight: '4px' }} />
              Increase
            </button>
            
            <button
              onClick={() => handleAdjustment('maintain')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: adjustmentAction === 'maintain' ? '#dbeafe' : '#f9fafb',
                color: adjustmentAction === 'maintain' ? '#1e40af' : '#374151',
                border: adjustmentAction === 'maintain' ? '1px solid #93c5fd' : '1px solid #d1d5db',
                cursor: 'pointer'
              }}
            >
              <Minus size={14} style={{ marginRight: '4px' }} />
              Maintain
            </button>
            
            <button
              onClick={() => handleAdjustment('decrease')}
              disabled={!canDecrease}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: adjustmentAction === 'decrease' ? '#fee2e2' : '#f9fafb',
                color: adjustmentAction === 'decrease' ? '#b91c1c' : '#374151',
                border: adjustmentAction === 'decrease' ? '1px solid #fecaca' : '1px solid #d1d5db',
                cursor: canDecrease ? 'pointer' : 'not-allowed',
                opacity: canDecrease ? 1 : 0.5
              }}
            >
              <ArrowDown size={14} style={{ marginRight: '4px' }} />
              Decrease
            </button>
            
            <button
              onClick={() => handleAdjustment('stop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: adjustmentAction === 'stop' ? '#fef2f2' : '#f9fafb',
                color: adjustmentAction === 'stop' ? '#991b1b' : '#374151',
                border: adjustmentAction === 'stop' ? '1px solid #fee2e2' : '1px solid #d1d5db',
                cursor: 'pointer'
              }}
            >
              <X size={14} style={{ marginRight: '4px' }} />
              Stop
            </button>
          </div>
          
          {/* Dosage Row - Only show when medication is selected */}
          {isSelected && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              flexWrap: 'nowrap', 
              width: '100%', 
              overflow: 'auto',
              paddingLeft: '26px'
            }}>
              {medication.dosageOptions.map(option => (
                <span
                  key={option.value}
                  className={`dosage-pill ${dosage === option.value ? 'selected' : ''}`}
                  onClick={() => selectDosage(medId, option.value)}
                  style={{
                    padding: '3px 8px',
                    border: dosage === option.value ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: dosage === option.value ? '#dbeafe' : 'white',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    fontWeight: dosage === option.value ? '500' : 'normal',
                    color: dosage === option.value ? '#1e40af' : '#4b5563',
                    boxShadow: dosage === option.value ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    fontSize: '13px',
                    flexShrink: 0
                  }}
                >
                  {option.label}
                </span>
              ))}
              <input
                type="text"
                placeholder="Custom"
                value={dosage && !medication.dosageOptions.some(opt => opt.value === dosage) ? dosage : ''}
                onChange={(e) => selectDosage(medId, e.target.value)}
                style={{
                  padding: '3px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  width: '90px',
                  color: '#374151',
                  flexShrink: 0
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Combined Duration and Instructions Box */}
      {isSelected && (
        <div className="medication-item-footer" style={{ 
          marginTop: '6px',
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {isEditingInstructions ? (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                fontSize: '14px', 
                marginBottom: '10px',
                padding: '6px 8px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '16px', flexGrow: 1 }}>
                  {/* Plan (formerly Duration) */}
                  <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '60px' }}>Plan:</span>
                    <select 
                      value={planDuration}
                      onChange={(e) => setPlanDuration(e.target.value)}
                      style={{ 
                        marginLeft: '6px',
                        padding: '3px 8px',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '120px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="1_mo">1 month</option>
                      <option value="3_mos">3 months</option>
                      <option value="6_mos">6 months</option>
                      <option value="12_mos">12 months</option>
                      <option value="prn">PRN</option>
                    </select>
                  </div>
                  {/* Approach */}
                  <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '80px' }}>Approach:</span>
                    <select 
                      value={approach}
                      onChange={(e) => {
                        const newApproach = e.target.value;
                        setApproach(newApproach);
                        updateApproach(medId, newApproach);
                      }}
                      style={{ 
                        marginLeft: '6px',
                        padding: '3px 8px',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '120px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      {availableApproachOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <textarea
                value={editedInstructions}
                onChange={e => setEditedInstructions(e.target.value)}
                placeholder="Enter instructions here..."
                style={{
                  width: '100%',
                  minHeight: '50px',
                  maxHeight: '80px',
                  padding: '6px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '4px',
                  fontStyle: 'italic'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsEditingInstructions(false)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInstructions}
                  style={{
                    background: '#d1fae5',
                    color: '#065f46',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #a7f3d0',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                fontSize: '14px', 
                marginBottom: '10px',
                padding: '6px 8px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '16px', flexGrow: 1 }}>
                  {/* Plan (formerly Duration) */}
                  <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '60px' }}>Plan:</span>
                    <select 
                      value={planDuration}
                      onChange={(e) => setPlanDuration(e.target.value)}
                      style={{ 
                        marginLeft: '6px',
                        padding: '3px 8px',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '120px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="1_mo">1 month</option>
                      <option value="3_mos">3 months</option>
                      <option value="6_mos">6 months</option>
                      <option value="12_mos">12 months</option>
                      <option value="prn">PRN</option>
                    </select>
                  </div>
                  {/* Approach */}
                  <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '80px' }}>Approach:</span>
                    <select 
                      value={approach}
                      onChange={(e) => {
                        const newApproach = e.target.value;
                        setApproach(newApproach);
                        updateApproach(medId, newApproach);
                      }}
                      style={{ 
                        marginLeft: '6px',
                        padding: '3px 8px',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '120px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      {availableApproachOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                borderTop: '1px dashed #d1d5db',
                paddingTop: '8px',
                marginTop: '4px'
              }}>
                <div style={{ 
                  fontSize: '14px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line',
                  flex: '1',
                  fontStyle: 'italic',
                  color: '#374151',
                  padding: '0 4px'
                }}>
                  <span style={{ 
                    fontWeight: 600, 
                    fontSize: '14px', 
                    marginRight: '6px', 
                    fontStyle: 'normal',
                    color: '#1f2937'
                  }}>Instructions:</span>
                  {Array.isArray(medication.instructions) && medication.instructions.length > 0
                    ? medication.instructions.join(', ')
                    : (medication.instructions || 'None provided')}
                </div>
                <button
                  onClick={() => setIsEditingInstructions(true)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px'
                  }}
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FollowUpMedicationItem;
