import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Check, 
  Edit, 
  CheckCircle, 
  Save,
  Lock,
  Clipboard,
  Calendar,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

const PatientFollowUpNotes = ({ patient, selectedSession, onClose }) => {
  const { getPatientNotes, addPatientNote, updatePatientNote } = useAppContext();
  const [editable, setEditable] = useState({
    weight: false,
    intervalHistory: false,
    treatmentPlan: false
  });

  const [formData, setFormData] = useState({
    intervalHistory: '',
    currentWeight: 0,
    previousWeight: 0,
    treatmentPlan: {
      medicationPlan: 'continue',
      lifestyleRecommendations: 'continue',
      providerComments: '',
      followUpInterval: '4_weeks'
    }
  });

  // Load patient data and notes when component mounts
  useEffect(() => {
    if (patient) {
      // Get most recent follow-up note if it exists
      const patientNotes = getPatientNotes ? getPatientNotes(patient.id) : [];
      const followUpNote = patientNotes?.find(note => note.category === 'follow-up');
      
      // Calculate weight change
      let previousWeight = patient.previousWeight || 0;
      let currentWeight = patient.currentWeight || 0;
      
      if (followUpNote && followUpNote.data) {
        // If we have a previous note, use its data
        const noteData = followUpNote.data;
        setFormData({
          intervalHistory: noteData.intervalHistory || '',
          currentWeight: noteData.currentWeight || currentWeight,
          previousWeight: noteData.previousWeight || previousWeight,
          treatmentPlan: noteData.treatmentPlan || {
            medicationPlan: 'continue',
            lifestyleRecommendations: 'continue',
            providerComments: '',
            followUpInterval: '4_weeks'
          }
        });
      } else {
        // Otherwise, initialize with patient data
        setFormData({
          intervalHistory: '',
          currentWeight: currentWeight,
          previousWeight: previousWeight,
          treatmentPlan: {
            medicationPlan: 'continue',
            lifestyleRecommendations: 'continue',
            providerComments: '',
            followUpInterval: '4_weeks'
          }
        });
      }
    }
  }, [patient, getPatientNotes]);

  const handleEdit = (field) => {
    setEditable({
      ...editable,
      [field]: !editable[field]
    });
  };

  const handleInputChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    
    if (field === 'treatmentPlan') {
      setFormData({
        ...formData,
        treatmentPlan: {
          ...formData.treatmentPlan,
          [name]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleWeightChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      currentWeight: parseFloat(value)
    });
  };

  const calculateWeightChange = () => {
    const change = formData.currentWeight - formData.previousWeight;
    const percentChange = formData.previousWeight ? 
      Math.abs((change / formData.previousWeight) * 100).toFixed(1) : 0;
    
    return {
      change,
      percentChange
    };
  };

  const saveNote = async () => {
    // Calculate some derived values
    const weightChange = calculateWeightChange();
    
    // Prepare the note data
    const noteData = {
      ...formData,
      weightChange: weightChange.change,
      weightChangePercent: weightChange.percentChange,
      sessionId: selectedSession?.id,
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Check if we're updating an existing note or creating a new one
      const patientNotes = getPatientNotes ? getPatientNotes(patient.id) : [];
      const followUpNote = patientNotes?.find(note => note.category === 'follow-up');
      
      if (followUpNote) {
        // Update existing note
        await updatePatientNote(
          patient.id, 
          followUpNote.id, 
          {
            title: `Follow-up Visit - ${new Date().toLocaleDateString()}`,
            content: `Follow-up visit for ${patient.name}. Current medication: ${patient.medication}.`,
            category: 'follow-up',
            data: noteData
          }
        );
      } else {
        // Create new note
        await addPatientNote(
          patient.id, 
          {
            title: `Follow-up Visit - ${new Date().toLocaleDateString()}`,
            content: `Follow-up visit for ${patient.name}. Current medication: ${patient.medication}.`,
            category: 'follow-up',
            createdBy: 'Current Provider', // This would be the logged-in provider
            data: noteData
          }
        );
      }
      
      // Reset all editable states
      setEditable({
        weight: false,
        intervalHistory: false,
        treatmentPlan: false
      });

      // Notify parent component that we're done
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error saving note:', error);
      // Show an error message to the user
    }
  };

  // Get plan options for the dropdown
  const planOptions = [
    { value: "continue", label: "Continue current dose" },
    { value: "increase", label: "Increase dose" },
    { value: "decrease", label: "Decrease dose" },
    { value: "pause", label: "Pause medication temporarily" },
    { value: "switch", label: "Switch to alternate medication" },
    { value: "discontinue", label: "Discontinue medication" }
  ];

  const weightChange = calculateWeightChange();

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      {/* Header with patient info */}
      <div className="bg-indigo-700 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{patient.name} - Follow-up Visit</h2>
            <div className="flex items-center mt-1">
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                {patient.medication}
              </span>
              <span className="text-sm opacity-80">
                Last Visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            onClick={saveNote}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
        </div>
      </div>
      
      {/* Weight stats banner */}
      <div className="bg-white p-3 border-b">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-500">Current Weight</div>
            <div className="text-xl font-bold">{formData.currentWeight} lbs</div>
            <div className="text-xs text-gray-500">Previous: {formData.previousWeight} lbs</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Weight Change</div>
            <div className="flex items-baseline">
              <span className={`text-xl font-bold ${weightChange.change < 0 ? 'text-green-600' : weightChange.change > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {weightChange.change} lbs
              </span>
              <span className="ml-1 text-sm text-gray-600">({weightChange.percentChange}%)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Interval History Section - Prefilled but editable */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Interval History</h3>
            <div className="flex items-center">
              <div className="flex items-center mr-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                <Clipboard className="h-3 w-3 mr-1" />
                Patient-reported
              </div>
              <button 
                className="text-gray-400 hover:text-indigo-600"
                onClick={() => handleEdit('intervalHistory')}
              >
                {editable.intervalHistory ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="px-4 py-3">
            {editable.intervalHistory ? (
              <div>
                <textarea 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={3}
                  name="intervalHistory"
                  value={formData.intervalHistory}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="Enter patient's reported changes since last visit..."
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button 
                    className="text-indigo-600 px-3 py-1 rounded text-sm font-medium flex items-center"
                    onClick={() => handleEdit('intervalHistory')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700">
                {formData.intervalHistory || 'No interval history recorded.'}
              </div>
            )}
          </div>
        </div>
        
        {/* Weight Section - Simple, focused on current data */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Weight</h3>
            <div className="flex items-center">
              <div className="flex items-center mr-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                <Clipboard className="h-3 w-3 mr-1" />
                Patient-reported
              </div>
              <button 
                className="text-gray-400 hover:text-indigo-600"
                onClick={() => handleEdit('weight')}
              >
                {editable.weight ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-sm font-medium text-gray-700">Current Weight</label>
                </div>
                {editable.weight ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="block w-28 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.currentWeight}
                      onChange={handleWeightChange}
                    />
                    <span className="ml-2 text-gray-500">lbs</span>
                  </div>
                ) : (
                  <div className="text-lg font-medium">
                    {formData.currentWeight} lbs
                    {weightChange.change !== 0 && (
                      <span className={`ml-2 text-sm ${weightChange.change < 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded-full`}>
                        {weightChange.change < 0 ? (
                          <ArrowDown className="h-3 w-3 inline mr-0.5" />
                        ) : (
                          <ArrowUp className="h-3 w-3 inline mr-0.5" />
                        )}
                        {Math.abs(weightChange.change)} lbs
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-end">
                {editable.weight && (
                  <button 
                    className="text-indigo-600 px-3 py-1 rounded text-sm font-medium flex items-center"
                    onClick={() => handleEdit('weight')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Treatment Plan Section - Primary focus for provider edits */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Treatment Plan</h3>
            <div className="flex items-center">
              <div className="flex items-center mr-2 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Provider only
              </div>
              <button 
                className="text-gray-400 hover:text-indigo-600"
                onClick={() => handleEdit('treatmentPlan')}
              >
                {editable.treatmentPlan ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="px-4 py-3">
            {editable.treatmentPlan ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication Plan</label>
                  <select 
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    name="medicationPlan"
                    value={formData.treatmentPlan.medicationPlan}
                    onChange={(e) => handleInputChange(e, 'treatmentPlan')}
                  >
                    {planOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lifestyle Recommendations</label>
                  <select 
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    name="lifestyleRecommendations"
                    value={formData.treatmentPlan.lifestyleRecommendations}
                    onChange={(e) => handleInputChange(e, 'treatmentPlan')}
                  >
                    <option value="continue">Continue current diet and exercise plan</option>
                    <option value="increase_exercise">Increase exercise frequency/intensity</option>
                    <option value="diet_changes">Modify dietary approach</option>
                    <option value="food_journal">Start food journal</option>
                    <option value="nutrition_referral">Refer to nutritionist</option>
                    <option value="custom">Custom plan (specify below)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Comments</label>
                  <textarea
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Additional treatment notes, recommendations, or concerns..."
                    name="providerComments"
                    value={formData.treatmentPlan.providerComments}
                    onChange={(e) => handleInputChange(e, 'treatmentPlan')}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Interval</label>
                  <select 
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    name="followUpInterval"
                    value={formData.treatmentPlan.followUpInterval}
                    onChange={(e) => handleInputChange(e, 'treatmentPlan')}
                  >
                    <option value="2_weeks">2 weeks</option>
                    <option value="4_weeks">4 weeks</option>
                    <option value="8_weeks">8 weeks</option>
                    <option value="12_weeks">12 weeks</option>
                  </select>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button 
                    className="text-indigo-600 px-3 py-1 rounded text-sm font-medium flex items-center"
                    onClick={() => handleEdit('treatmentPlan')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medication Plan</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        {planOptions.find(option => option.value === formData.treatmentPlan.medicationPlan)?.label || 'Continue current dose'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lifestyle Plan</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {formData.treatmentPlan.lifestyleRecommendations === 'continue' ? 'Continue current diet and exercise plan' :
                         formData.treatmentPlan.lifestyleRecommendations === 'increase_exercise' ? 'Increase exercise frequency/intensity' :
                         formData.treatmentPlan.lifestyleRecommendations === 'diet_changes' ? 'Modify dietary approach' :
                         formData.treatmentPlan.lifestyleRecommendations === 'food_journal' ? 'Start food journal' :
                         formData.treatmentPlan.lifestyleRecommendations === 'nutrition_referral' ? 'Refer to nutritionist' : 
                         'Custom plan'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider Comments</label>
                  <div className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-md">
                    {formData.treatmentPlan.providerComments || 'No provider comments recorded.'}
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Next Follow-up</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formData.treatmentPlan.followUpInterval === '2_weeks' ? '2 weeks' :
                         formData.treatmentPlan.followUpInterval === '4_weeks' ? '4 weeks' :
                         formData.treatmentPlan.followUpInterval === '8_weeks' ? '8 weeks' : '12 weeks'}
                      </span>
                    </div>
                  </div>
                  
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 flex items-center"
            onClick={saveNote}
          >
            <Save className="h-4 w-4 mr-2" />
            Finalize Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFollowUpNotes;