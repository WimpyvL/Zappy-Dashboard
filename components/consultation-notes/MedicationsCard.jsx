import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Heart, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import PropTypes from 'prop-types';

// Category configuration
const CATEGORY_CONFIG = {
  'wm': { name: 'Weight Management', className: 'wm-header', dotClass: 'wm-dot' },
  'ed': { name: 'ED', className: 'ed-header', dotClass: 'ed-dot' },
  'pc': { name: 'Primary Care', className: 'pc-header', dotClass: 'pc-dot' },
  'mh': { name: 'Mental Health', className: 'mh-header', dotClass: 'mh-dot' }
};

// Medication Item Component
const MedicationItem = ({ 
  medication, 
  config,
  onToggle,
  onDosageChange,
  onApproachChange,
  onFrequencyChange,
  onInstructionsChange,
  readOnly = false
}) => {
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState(
    Array.isArray(config?.instructions) 
      ? config.instructions.join('\n') 
      : ''
  );
  
  const isSelected = config?.selected || false;
  
  const handleSaveInstructions = () => {
    onInstructionsChange(medication.id, editedInstructions);
    setIsEditingInstructions(false);
  };
  
  const handleCancelInstructions = () => {
    setEditedInstructions(
      Array.isArray(config?.instructions) 
        ? config.instructions.join('\n') 
        : ''
    );
    setIsEditingInstructions(false);
  };
  
  return (
    <div className="medication-item-container" style={{ marginBottom: '12px' }}>
      {/* Main medication item */}
      <div
        className={`medication-item ${isSelected ? 'selected' : ''}`}
        style={{ 
          padding: isSelected ? '12px 14px' : '8px 12px',
          borderRadius: '6px',
          border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
          backgroundColor: isSelected ? '#f0f9ff' : 'white',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(medication.id)}
            disabled={readOnly}
            style={{ 
              marginTop: '2px',
              width: '16px',
              height: '16px',
              cursor: readOnly ? 'not-allowed' : 'pointer'
            }}
          />
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: isSelected ? '8px' : '0'
            }}>
              <div>
                <span style={{ fontWeight: '500', fontSize: '15px' }}>
                  {medication.name}
                </span>
                {medication.brandName && (
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    marginLeft: '6px' 
                  }}>
                    ({medication.brandName})
                  </span>
                )}
                {medication.isPatientPreference && (
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <Heart size={12} style={{ marginRight: '4px' }} />
                    Patient Preference
                  </span>
                )}
              </div>
              
              {isSelected && !readOnly && (
                <select
                  value={config?.frequency || medication.frequency}
                  onChange={(e) => onFrequencyChange(medication.id, e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="wkly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="bid">Twice Daily</option>
                  <option value="prn">PRN</option>
                </select>
              )}
            </div>
            
            {/* Dosage selection */}
            {isSelected && (
              <div style={{ 
                display: 'flex', 
                gap: '6px', 
                flexWrap: 'wrap',
                marginTop: '8px'
              }}>
                {medication.dosageOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => onDosageChange(medication.id, option.value)}
                    disabled={readOnly}
                    style={{
                      padding: '4px 10px',
                      border: config?.dosage === option.value 
                        ? '2px solid #2563eb' 
                        : '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: config?.dosage === option.value 
                        ? '#dbeafe' 
                        : 'white',
                      color: config?.dosage === option.value 
                        ? '#1e40af' 
                        : '#4b5563',
                      fontSize: '13px',
                      fontWeight: config?.dosage === option.value ? '500' : 'normal',
                      cursor: readOnly ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Instructions and approach section */}
      {isSelected && (
        <div style={{ 
          marginTop: '8px',
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {/* Approach selector */}
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            paddingBottom: '12px',
            borderBottom: '1px dashed #e5e7eb'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#374151',
                display: 'block',
                marginBottom: '4px'
              }}>
                Approach:
              </label>
              <select
                value={config?.approach || medication.defaultApproach}
                onChange={(e) => onApproachChange(medication.id, e.target.value)}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              >
                {medication.supportedApproaches?.map(approach => (
                  <option key={approach} value={approach}>{approach}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Instructions */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                Instructions:
              </span>
              {!readOnly && !isEditingInstructions && (
                <button
                  onClick={() => setIsEditingInstructions(true)}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
            
            {isEditingInstructions ? (
              <div>
                <textarea
                  value={editedInstructions}
                  onChange={(e) => setEditedInstructions(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handleCancelInstructions}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInstructions}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #10b981',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
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
              <div style={{ 
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#4b5563',
                lineHeight: '1.5'
              }}>
                {Array.isArray(config?.instructions) 
                  ? config.instructions.join(' ') 
                  : (medication.instructions?.join(' ') || 'No instructions provided')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add Medication Modal
const AddMedicationModal = ({ 
  isOpen, 
  onClose, 
  onAddMedication,
  additionalMedications = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredMedications = useMemo(() => {
    return additionalMedications.filter(med => {
      const matchesSearch = searchTerm === '' || 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.description && med.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
        med.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [additionalMedications, searchTerm, selectedCategory]);
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Add Medication</h3>
          <button onClick={onClose} style={{ cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '16px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px' 
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '8px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} 
              />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 32px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Categories</option>
              <option value="wm">Weight Management</option>
              <option value="ed">ED</option>
              <option value="pc">Primary Care</option>
              <option value="mh">Mental Health</option>
            </select>
          </div>
        </div>
        
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 16px 16px' 
        }}>
          {filteredMedications.map(med => (
            <div 
              key={med.id}
              style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                onAddMedication(med);
                onClose();
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{med.name}</div>
                  {med.description && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#6b7280',
                      marginTop: '2px'
                    }}>
                      {med.description}
                    </div>
                  )}
                </div>
                <Plus size={16} style={{ color: '#3b82f6' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main MedicationsCard Component
const MedicationsCard = ({
  medicationData,
  medicationDosages,
  toggleMedication,
  selectDosage,
  updateApproach,
  updateFrequency,
  updateInstructions,
  addCustomMedication,
  isMedicationSelected,
  getMedicationConfig,
  readOnly = false
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Group medications by category
  const medicationsByCategory = useMemo(() => {
    const grouped = {};
    
    Object.entries(medicationData || {}).forEach(([medId, medication]) => {
      const category = medication.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push({
        id: medId,
        ...medication
      });
    });
    
    return grouped;
  }, [medicationData]);
  
  // Additional medications for the modal
  const additionalMedications = [
    { id: 'amlodipine', name: 'Amlodipine', category: 'pc', description: 'Blood Pressure' },
    { id: 'lisinopril', name: 'Lisinopril', category: 'pc', description: 'Blood Pressure' },
    { id: 'atorvastatin', name: 'Atorvastatin', category: 'pc', description: 'Cholesterol' },
    { id: 'escitalopram', name: 'Escitalopram', category: 'mh', description: 'SSRI' },
    { id: 'bupropion', name: 'Bupropion', category: 'mh', description: 'NDRI' },
    { id: 'tadalafil', name: 'Tadalafil', category: 'ed', description: 'Cialis' }
  ];
  
  return (
    <>
      <div style={{ 
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: '8px',
        borderLeft: '3px solid #10b981'
      }}>
        <div style={{ 
          padding: '10px 14px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '15px',
          backgroundColor: '#f9fafb'
        }}>
          <span>Medications</span>
        </div>
        
        <div style={{ padding: '16px' }}>
          {Object.entries(medicationsByCategory).map(([category, medications]) => {
            const categoryConfig = CATEGORY_CONFIG[category] || {
              name: category,
              className: '',
              dotClass: ''
            };
            
            return (
              <div key={category} style={{ marginBottom: '20px' }}>
                <div 
                  className={`category-header ${categoryConfig.className}`}
                  style={{ 
                    textAlign: 'left',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    fontWeight: 500,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    borderLeft: '3px solid',
                    borderLeftColor: category === 'wm' ? '#3b82f6' : 
                                    category === 'ed' ? '#ec4899' : 
                                    category === 'pc' ? '#10b981' : 
                                    category === 'mh' ? '#8b5cf6' : '#6b7280'
                  }}
                >
                  <span 
                    className={`service-dot ${categoryConfig.dotClass}`}
                    style={{ marginRight: '8px' }}
                  />
                  <span>{categoryConfig.name}</span>
                </div>
                
                <div style={{ paddingLeft: '8px' }}>
                  {medications.map(medication => (
                    <MedicationItem
                      key={medication.id}
                      medication={medication}
                      config={getMedicationConfig(medication.id)}
                      onToggle={toggleMedication}
                      onDosageChange={selectDosage}
                      onApproachChange={updateApproach}
                      onFrequencyChange={updateFrequency}
                      onInstructionsChange={updateInstructions}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          
          {!readOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#2563eb',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <Plus size={16} style={{ marginRight: '4px' }} />
              Add Medication
            </button>
          )}
        </div>
      </div>
      
      <AddMedicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddMedication={addCustomMedication}
        additionalMedications={additionalMedications}
      />
    </>
  );
};

MedicationsCard.propTypes = {
  medicationData: PropTypes.object.isRequired,
  medicationDosages: PropTypes.object.isRequired,
  toggleMedication: PropTypes.func.isRequired,
  selectDosage: PropTypes.func.isRequired,
  updateApproach: PropTypes.func.isRequired,
  updateFrequency: PropTypes.func.isRequired,
  updateInstructions: PropTypes.func.isRequired,
  addCustomMedication: PropTypes.func.isRequired,
  isMedicationSelected: PropTypes.func.isRequired,
  getMedicationConfig: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
};

export default MedicationsCard;
