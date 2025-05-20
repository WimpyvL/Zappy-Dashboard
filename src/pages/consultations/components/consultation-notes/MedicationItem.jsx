import React from 'react';
import { ChevronDown, ChevronUp, Pencil, FileText, Heart } from 'lucide-react';

const MedicationItem = ({
  medId,
  medication,
  dosage,
  openInstructions, // Keep openInstructions for instructions toggle
  toggleMedication,
  toggleInstructions, // Keep toggleInstructions for instructions toggle
  selectDosage,
  isPatientPreference = false,
  supportedApproaches = ['Maint.', 'Escalation', 'PRN', 'Daily'] // Default to all options if not provided
}) => {
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
  const defaultApproach = medication.frequency === 'PRN' ? 'PRN' : 'Escalation'; // Adjust default logic as needed

  // Component state
  const [editedInstructions, setEditedInstructions] = React.useState(
    Array.isArray(medication.instructions)
      ? medication.instructions.join('\n')
      : (medication.instructions || '')
  );
  const [isEditingInstructions, setIsEditingInstructions] = React.useState(false);
  const [planDuration, setPlanDuration] = React.useState(
    medication.category === 'wm' ? '6_mos' : '3_mos'
  );
  const [approach, setApproach] = React.useState(defaultApproach);
  const [frequency, setFrequency] = React.useState(medication.frequency || 'dly');

  // Save instructions handler (frontend only)
  const handleSaveInstructions = () => {
    // In a real app, this would update the backend or parent state
    // For now, just update the local medication.instructions array
    medication.instructions = editedInstructions.split('\n');
    setIsEditingInstructions(false);
  };

  return (
    <>
      {/* Medication Item */}
      <div
        className={`medication-item ${medication.selected ? 'selected' : ''}`}
        style={{ 
          padding: '12px 14px',
          borderRadius: '6px',
          border: medication.selected ? '1px solid #3b82f6' : '1px solid #d1d5db',
          backgroundColor: medication.selected ? '#f0f9ff' : 'white',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Medication Name Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
            <input
              type="checkbox"
              id={medId}
              checked={medication.selected}
              onChange={() => {
                console.log(`Toggling medication ${medId} from ${medication.selected} to ${!medication.selected}`);
                // Directly update the medication's selected state
                medication.selected = !medication.selected;
                // Then call toggleMedication to update the state
                toggleMedication(medId);
              }}
              style={{ 
                marginRight: '10px',
                marginTop: '3px',
                width: '16px',
                height: '16px',
                accentColor: '#3b82f6'
              }}
            />
            {/* Toggle Button - Added for direct toggling */}
            <button
              onClick={() => {
                console.log(`Button toggling medication ${medId} from ${medication.selected} to ${!medication.selected}`);
                // Directly update the medication's selected state
                medication.selected = !medication.selected;
                // Force a re-render
                toggleMedication(medId);
              }}
              style={{
                padding: '2px 6px',
                marginRight: '10px',
                backgroundColor: medication.selected ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {medication.selected ? 'Unselect' : 'Select'}
            </button>
            <div style={{ flex: '1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', fontSize: '15px' }}>
                  {medication.name}
                  {medication.brandName && <span style={{ color: '#4b5563', fontSize: '14px', marginLeft: '4px' }}>({medication.brandName})</span>}
                </span>
                {/* Frequency dropdown */}
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
                  <option value="tid">Three Times Daily</option>
                  <option value="prn">PRN</option>
                  <option value="monthly">Monthly</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
          
            {/* Dosage Row - Only show when medication is selected */}
            {medication.selected && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                flexWrap: 'nowrap', 
                width: '100%', 
                overflow: 'auto',
                paddingLeft: '26px' /* Align with content after checkbox */
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
      {medication.selected && (
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
                      onChange={(e) => setApproach(e.target.value)}
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
                      onChange={(e) => setApproach(e.target.value)}
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

export default MedicationItem;
