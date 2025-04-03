import React, { useState, useEffect } from 'react';
import {
  useNotes, // Assuming you might want to fetch existing notes
  useAddNote,
  useUpdateNote,
} from '../../apis/notes/hooks'; // Import note hooks
import { useAuth } from '../../context/AuthContext'; // To get current user
import {
  Check,
  Edit,
  CheckCircle,
  Save,
  Lock,
  Clipboard,
  Calendar,
  ArrowDown,
  ArrowUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';

const PatientFollowUpNotes = ({ patient, selectedSession, onClose }) => {
  // Get current user for attribution
  const { currentUser } = useAuth();
  const createdByName = currentUser?.name || 'Provider';

  // Fetch existing notes for this patient (optional, depends on requirements)
  // We might only need the *latest* follow-up note, which could be passed as a prop
  // or fetched specifically. For simplicity, we'll assume we might need to check
  // if a note for this session already exists.
  const { data: notesData, isLoading: isLoadingNotes, error: errorNotes } = useNotes(
    patient?.id,
    { category: 'follow-up', sessionId: selectedSession?.id }, // Example filter
    { enabled: !!patient?.id && !!selectedSession?.id } // Only fetch if patient and session are present
  );
  const existingNote = notesData?.data?.[0] || notesData?.[0]; // Assuming API returns array, take first match

  // Mutation hooks
  const addNoteMutation = useAddNote({
    onSuccess: () => {
      toast.success('Follow-up note saved.');
      if (onClose) onClose();
    },
    onError: (error) => toast.error(`Failed to save note: ${error.message}`),
  });
  const updateNoteMutation = useUpdateNote({
    onSuccess: () => {
      toast.success('Follow-up note updated.');
      if (onClose) onClose();
    },
    onError: (error) => toast.error(`Failed to update note: ${error.message}`),
  });

  // Local state for UI editability
  const [editable, setEditable] = useState({
    weight: false,
    intervalHistory: false,
    treatmentPlan: false,
  });

  // Local state for form data
  const [formData, setFormData] = useState({
    intervalHistory: '',
    currentWeight: patient?.currentWeight || 0,
    previousWeight: patient?.previousWeight || 0,
    treatmentPlan: {
      medicationPlan: 'continue',
      lifestyleRecommendations: 'continue',
      providerComments: '',
      followUpInterval: '4_weeks',
    },
  });

  // Effect to populate form with existing note data or patient data
  useEffect(() => {
    if (existingNote?.data) {
      // If an existing note for this session is found, load its data
      setFormData({
        intervalHistory: existingNote.data.intervalHistory || '',
        currentWeight: existingNote.data.currentWeight || patient?.currentWeight || 0,
        // Use the weight from the note as previous if available, else patient's previous
        previousWeight: existingNote.data.previousWeight || patient?.previousWeight || 0,
        treatmentPlan: {
          medicationPlan: existingNote.data.treatmentPlan?.medicationPlan || 'continue',
          lifestyleRecommendations: existingNote.data.treatmentPlan?.lifestyleRecommendations || 'continue',
          providerComments: existingNote.data.treatmentPlan?.providerComments || '',
          followUpInterval: existingNote.data.treatmentPlan?.followUpInterval || '4_weeks',
        },
      });
    } else if (patient) {
      // Initialize with patient data if no specific note found
      setFormData(prev => ({
        ...prev,
        currentWeight: patient.currentWeight || 0,
        previousWeight: patient.previousWeight || 0, // Might need better logic for initial previous weight
      }));
    }
  }, [existingNote, patient]); // Rerun if existingNote or patient changes

  const handleEdit = (field) => {
    setEditable((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (field === 'treatmentPlan') {
      setFormData((prev) => ({
        ...prev,
        treatmentPlan: { ...prev.treatmentPlan, [name]: newValue },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

   const handleWeightChange = (e) => {
     const { value } = e.target;
     setFormData((prev) => ({
       ...prev,
       // Keep previous weight stable unless explicitly changed elsewhere
       currentWeight: parseFloat(value) || 0,
     }));
   };


  const calculateWeightChange = () => {
    const current = formData.currentWeight || 0;
    const previous = formData.previousWeight || 0;
    const change = current - previous;
    const percentChange = previous ? Math.abs((change / previous) * 100).toFixed(1) : 0;
    return { change, percentChange };
  };

  // Save note using mutation hooks
  const saveNote = () => {
    const weightChange = calculateWeightChange();
    const noteData = {
      title: `Follow-up Visit - ${new Date().toLocaleDateString()}`,
      content: `Follow-up visit for ${patient?.name}.`, // Basic content
      category: 'follow-up',
      createdBy: createdByName,
      data: { // Store structured data
        ...formData,
        weightChange: weightChange.change,
        weightChangePercent: weightChange.percentChange,
        sessionId: selectedSession?.id, // Link to session if available
      },
    };

    if (existingNote?.id) {
      // Update existing note
      updateNoteMutation.mutate({ noteId: existingNote.id, patientId: patient?.id, ...noteData });
    } else {
      // Create new note
      addNoteMutation.mutate({ patientId: patient?.id, ...noteData });
    }
    // Resetting edit state is handled by onSuccess callbacks of mutations
  };

  // Plan options remain the same
  const planOptions = [
    { value: 'continue', label: 'Continue current dose' },
    { value: 'increase', label: 'Increase dose' },
    { value: 'decrease', label: 'Decrease dose' },
    { value: 'pause', label: 'Pause medication temporarily' },
    { value: 'switch', label: 'Switch to alternate medication' },
    { value: 'discontinue', label: 'Discontinue medication' },
  ];

  const weightChange = calculateWeightChange();
  const isMutating = addNoteMutation.isLoading || updateNoteMutation.isLoading;

  // Handle initial loading state for notes
  if (isLoadingNotes) {
     return (
       <div className="max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden p-8 flex justify-center items-center h-96">
         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
       </div>
     );
   }

   // Handle error state for notes
   if (errorNotes) {
     return (
       <div className="max-w-5xl mx-auto bg-red-50 p-8 rounded-lg text-red-700 text-center">
         <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
         Error loading previous notes: {errorNotes.message}
       </div>
     );
   }


  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-700 px-6 py-4 text-white">
         {/* ... Header content ... */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {patient?.name || 'Patient'} - Follow-up Visit
              </h2>
              <div className="flex items-center mt-1">
                {patient?.medication && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                    {patient.medication}
                  </span>
                )}
                <span className="text-sm opacity-80">
                  Last Visit:{' '}
                  {patient?.lastVisit
                    ? new Date(patient.lastVisit).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-green-700 disabled:opacity-50"
              onClick={saveNote}
              disabled={isMutating} // Disable during mutation
            >
              { isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </button>
          </div>
      </div>

      {/* Weight stats banner */}
      <div className="bg-white p-3 border-b">
         {/* ... Weight banner content ... */}
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-500">Current Weight</div>
              <div className="text-xl font-bold">
                {formData.currentWeight} lbs
              </div>
              <div className="text-xs text-gray-500">
                Previous: {formData.previousWeight} lbs
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Weight Change</div>
              <div className="flex items-baseline">
                <span
                  className={`text-xl font-bold ${weightChange.change < 0 ? 'text-green-600' : weightChange.change > 0 ? 'text-red-600' : 'text-gray-600'}`}
                >
                  {weightChange.change >= 0 ? '+' : ''}{weightChange.change} lbs
                </span>
                <span className="ml-1 text-sm text-gray-600">
                  ({weightChange.percentChange}%)
                </span>
              </div>
            </div>
          </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Interval History Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
           {/* ... Interval History content ... */}
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
                  {editable.intervalHistory ? ( <Check className="h-5 w-5" /> ) : ( <Edit className="h-5 w-5" /> )}
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
                     onChange={(e) => handleInputChange(e, 'intervalHistory')}
                     placeholder="Enter patient's reported changes since last visit..."
                   ></textarea>
                   <div className="mt-3 flex justify-end">
                     <button
                       className="text-indigo-600 px-3 py-1 rounded text-sm font-medium flex items-center"
                       onClick={() => handleEdit('intervalHistory')}
                     >
                       <Check className="h-4 w-4 mr-1" /> Confirm
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="text-gray-700 whitespace-pre-line">
                   {formData.intervalHistory || 'No interval history recorded.'}
                 </div>
               )}
             </div>
        </div>

        {/* Weight Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
           {/* ... Weight content ... */}
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
                  {editable.weight ? ( <Check className="h-5 w-5" /> ) : ( <Edit className="h-5 w-5" /> )}
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
                         name="currentWeight"
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
                           {weightChange.change < 0 ? ( <ArrowDown className="h-3 w-3 inline mr-0.5" /> ) : ( <ArrowUp className="h-3 w-3 inline mr-0.5" /> )}
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
                       <Check className="h-4 w-4 mr-1" /> Confirm
                     </button>
                   )}
                 </div>
               </div>
             </div>
        </div>

        {/* Treatment Plan Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
           {/* ... Treatment Plan content ... */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Treatment Plan</h3>
              <div className="flex items-center">
                <div className="flex items-center mr-2 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs">
                  <Lock className="h-3 w-3 mr-1" /> Provider only
                </div>
                <button
                  className="text-gray-400 hover:text-indigo-600"
                  onClick={() => handleEdit('treatmentPlan')}
                >
                  {editable.treatmentPlan ? ( <Check className="h-5 w-5" /> ) : ( <Edit className="h-5 w-5" /> )}
                </button>
              </div>
            </div>
             <div className="px-4 py-3">
               {editable.treatmentPlan ? (
                 <div className="space-y-4">
                   {/* ... Editable Treatment Plan fields ... */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medication Plan</label>
                      <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" name="medicationPlan" value={formData.treatmentPlan.medicationPlan} onChange={(e) => handleInputChange(e, 'treatmentPlan')}>
                        {planOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lifestyle Recommendations</label>
                      <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" name="lifestyleRecommendations" value={formData.treatmentPlan.lifestyleRecommendations} onChange={(e) => handleInputChange(e, 'treatmentPlan')}>
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
                      <textarea rows={2} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Additional treatment notes, recommendations, or concerns..." name="providerComments" value={formData.treatmentPlan.providerComments} onChange={(e) => handleInputChange(e, 'treatmentPlan')}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Interval</label>
                      <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" name="followUpInterval" value={formData.treatmentPlan.followUpInterval} onChange={(e) => handleInputChange(e, 'treatmentPlan')}>
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
                       <Check className="h-4 w-4 mr-1" /> Confirm Plan
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {/* ... Read-only Treatment Plan display ... */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Medication Plan</label>
                        <div className="mt-1"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle className="h-3.5 w-3.5 mr-1" />{planOptions.find(option => option.value === formData.treatmentPlan.medicationPlan)?.label || 'Continue current dose'}</span></div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lifestyle Plan</label>
                        <div className="mt-1"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{formData.treatmentPlan.lifestyleRecommendations === 'continue' ? 'Continue current plan' : formData.treatmentPlan.lifestyleRecommendations === 'increase_exercise' ? 'Increase exercise' : formData.treatmentPlan.lifestyleRecommendations === 'diet_changes' ? 'Modify diet' : formData.treatmentPlan.lifestyleRecommendations === 'food_journal' ? 'Start food journal' : formData.treatmentPlan.lifestyleRecommendations === 'nutrition_referral' ? 'Refer to nutritionist' : 'Custom plan'}</span></div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Provider Comments</label>
                      <div className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-md whitespace-pre-line">{formData.treatmentPlan.providerComments || 'No provider comments recorded.'}</div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Next Follow-up</label>
                        <div className="mt-1"><span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"><Calendar className="h-3.5 w-3.5 mr-1" />{formData.treatmentPlan.followUpInterval.replace('_', ' ')}</span></div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"><Calendar className="h-4 w-4 mr-1" />Schedule Follow-up</button>
                    </div>
                 </div>
               )}
             </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 flex items-center hover:bg-green-700 disabled:opacity-50"
            onClick={saveNote}
            disabled={isMutating}
          >
            { isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Finalize Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFollowUpNotes;
