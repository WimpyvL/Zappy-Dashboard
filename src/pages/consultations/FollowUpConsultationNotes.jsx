import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useUpdateSession } from '../../apis/sessions/hooks';
import { useCreateNote } from '../../apis/notes/hooks';
import { useConsultationById } from '../../apis/consultations/hooks';
import { Loader2 } from 'lucide-react';

// Import components
import {
  ServiceTagsHeader,
  ServicePanel,
  CommunicationCard,
  AssessmentPlanCard,
  ConsultationFooter,
  AIComposition
} from './components/consultation-notes';
import FollowUpMedicationsCard from './components/consultation-notes/FollowUpMedicationsCard';

// Import CSS
import './InitialConsultationNotes.css';

const FollowUpConsultationNotes = ({
  patient,
  session,
  onClose,
  readOnly = false
}) => {
  // Get current provider from auth context
  const { currentUser } = useAuth();
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // State hooks
  const [hpi, setHpi] = useState(session?.session_notes || '');
  const [assessmentPlan, setAssessmentPlan] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('4 weeks');
  
  // Service state
  const [activeServices, setActiveServices] = useState({});
  const [showServicePanel, setShowServicePanel] = useState(false);
  
  // Medication state
  const [medicationData, setMedicationData] = useState({});
  const [medicationDosages, setMedicationDosages] = useState({});
  const [previousMedicationDosages, setPreviousMedicationDosages] = useState({});
  const [showMoreMeds, setShowMoreMeds] = useState(false);
  
  // Follow-up specific state
  const [intervalHistory, setIntervalHistory] = useState('');
  const [currentWeight, setCurrentWeight] = useState(patient?.currentWeight || 0);
  const [previousWeight, setPreviousWeight] = useState(patient?.previousWeight || 0);
  const [selectedFollowUpPeriod, setSelectedFollowUpPeriod] = useState('4w');
  const [followUpDisplayText, setFollowUpDisplayText] = useState('4 weeks');
  
  // New state for service-specific progress
  const [a1c, setA1c] = useState(patient?.lastA1c || 0);
  const [bloodPressure, setBloodPressure] = useState(patient?.lastBloodPressure || '');
  const [effectivenessRating, setEffectivenessRating] = useState('');
  const [sideEffects, setSideEffects] = useState([]);
  const [frequencyOfUse, setFrequencyOfUse] = useState('');
  
  // AI generation state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // New state for patient subscriptions
  const [patientSubscriptions, setPatientSubscriptions] = useState([]);
  
  // Patient Education Resources State
  const [selectedResources, setSelectedResources] = useState([]);
  const [showMoreResources, setShowMoreResources] = useState(false);
  
  // Resource Options
  const resourceOptions = [
    { id: 'glp1', name: 'GLP-1 Guide', category: 'wm', dotClass: 'wm-dot' },
    { id: 'ed', name: 'ED Guide', category: 'ed', dotClass: 'ed-dot' },
    { id: 'diet', name: 'Diet Plan', category: '', dotClass: '' },
    { id: 'exercise', name: 'Exercise Plan', category: '', dotClass: '' },
    { id: 'safety', name: 'Safety Info', category: '', dotClass: '' }
  ];
  
  // Fetch the patient's most recent consultation
  const { data: consultationData, isLoading: isLoadingConsultation } = useConsultationById(
    session?.consultation_id || patient?.last_consultation_id,
    { enabled: !!(session?.consultation_id || patient?.last_consultation_id) }
  );
  
  // Effect to load medications from previous consultation
  useEffect(() => {
    if (consultationData) {
      try {
        // Extract medications from consultation data
        const medications = {};
        const dosages = {};
        const previousDosages = {};
        
        // Check if medication_order exists and has medications
        if (consultationData.medication_order && Array.isArray(consultationData.medication_order.medications)) {
          consultationData.medication_order.medications.forEach(med => {
            // Create medication data structure
            medications[med.id] = {
              name: med.name,
              brandName: med.brandName || '',
              category: med.category || 'wm', // Default to weight management if not specified
              frequency: med.frequency || 'dly',
              instructions: med.instructions || [],
              selected: true, // Pre-select medications from previous consultation
              approach: med.approach || 'Maintenance',
              supportedApproaches: ['Maint.', 'Escalation', 'PRN'],
              dosageOptions: []
            };
            
            // Set current dosage (will be updated by user)
            dosages[med.id] = med.dosage;
            
            // Store previous dosage for reference
            previousDosages[med.id] = med.dosage;
            
            // Add dosage options based on medication type
            if (med.id === 'semaglutide') {
              medications[med.id].dosageOptions = [
                { value: '0.25mg', label: '0.25' },
                { value: '0.5mg', label: '0.5' },
                { value: '1mg', label: '1.0' },
                { value: '1.7mg', label: '1.7' },
                { value: '2.4mg', label: '2.4' }
              ];
            } else if (med.id === 'metformin') {
              medications[med.id].dosageOptions = [
                { value: '500mg', label: '500' },
                { value: '850mg', label: '850' },
                { value: '1000mg', label: '1000' },
                { value: '1500mg', label: '1500' },
                { value: '2000mg', label: '2000' }
              ];
            } else if (med.id === 'sildenafil' || med.id === 'tadalafil') {
              medications[med.id].dosageOptions = [
                { value: '25mg', label: '25' },
                { value: '50mg', label: '50' },
                { value: '100mg', label: '100' }
              ];
            } else {
              // Generic dosage options for other medications
              medications[med.id].dosageOptions = [
                { value: '10mg', label: '10' },
                { value: '20mg', label: '20' },
                { value: '40mg', label: '40' }
              ];
            }
          });
        }
        
        // Update state with medication data
        setMedicationData(medications);
        setMedicationDosages(dosages);
        setPreviousMedicationDosages(previousDosages);
        
      } catch (error) {
        console.error('Error processing medication data:', error);
      }
    }
  }, [consultationData]);
  
  // Add a template semaglutide medication if none exists (for demo purposes)
  useEffect(() => {
    if (Object.keys(medicationData).length === 0) {
      // Add template semaglutide for testing
      setMedicationData({
        semaglutide: {
          name: 'Semaglutide',
          brandName: 'Wegovy',
          category: 'wm',
          frequency: 'wkly',
          dosageOptions: [
            { value: '0.25mg', label: '0.25' },
            { value: '0.5mg', label: '0.5' },
            { value: '1mg', label: '1.0' },
            { value: '1.7mg', label: '1.7' },
            { value: '2.4mg', label: '2.4' }
          ],
          instructions: [
            '• Inject SC once wkly.',
            '• Rotate sites.'
          ],
          selected: true,
          approach: 'Escalation',
          supportedApproaches: ['Maint.', 'Escalation']
        }
      });
      
      setMedicationDosages({
        semaglutide: '0.5mg'
      });
      
      setPreviousMedicationDosages({
        semaglutide: '0.25mg'
      });
    }
  }, [medicationData]);
  
  // Mutations
  const updateSessionMutation = useUpdateSession();
  const createNoteMutation = useCreateNote();
  
  // Effect to populate form with session data if available
  useEffect(() => {
    if (session) {
      // Set active service based on session type
      if (session.type) {
        setActiveServices({
          [session.type.toLowerCase()]: { 
            name: session.type, 
            dotClass: `${session.type.toLowerCase()}-dot` 
          }
        });
      }
      
      // Set notes from session
      setHpi(session.session_notes || '');
    }
  }, [session]);
  
  // Fetch patient subscriptions
  useEffect(() => {
    if (patient?.id) {
      // Import the subscription service
      const fetchPatientSubscriptions = async () => {
        try {
          const { getPatientSubscriptions } = await import('../../services/subscriptionService');
          const subscriptions = await getPatientSubscriptions(patient.id);
          setPatientSubscriptions(subscriptions);
          
          // Set active services based on subscription categories
          const serviceMap = {
            'wm': { name: 'Weight Management', dotClass: 'wm-dot' },
            'ed': { name: 'ED', dotClass: 'ed-dot' },
            'pc': { name: 'Primary Care', dotClass: 'pc-dot' },
            'mh': { name: 'Mental Health', dotClass: 'mh-dot' },
            'wh': { name: 'Women\'s Health', dotClass: 'wh-dot' },
            'derm': { name: 'Dermatology', dotClass: 'derm-dot' },
            'hair': { name: 'Hair Loss', dotClass: 'hair-dot' }
          };
          
          // Create active services object from subscriptions
          const newActiveServices = {};
          subscriptions.forEach(sub => {
            if (sub.category && serviceMap[sub.category]) {
              newActiveServices[sub.category] = serviceMap[sub.category];
            }
          });
          
          // Only update if we found subscriptions with valid categories
          if (Object.keys(newActiveServices).length > 0) {
            setActiveServices(newActiveServices);
          }
        } catch (error) {
          console.error('Error fetching patient subscriptions:', error);
        }
      };
      
      fetchPatientSubscriptions();
    }
  }, [patient]);
  
  // Service-specific progress rendering function
  const renderServiceSpecificProgress = () => {
    // Get primary service category
    const primaryService = Object.keys(activeServices)[0] || '';
    
    switch (primaryService) {
      case 'wm':
        return (
          <div className="pt-2 mt-2">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Weight Management Progress</h4>
              <button
                className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center"
                onClick={async () => {
                  // Simulate AI generation
                  setIsGeneratingAI(true);
                  toast.info("Generating progress notes...");
                  
                  // In a real implementation, this would call an API
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  
                  // Generate content based on weight data
                  let generatedContent = '';
                  
                  if (currentWeight && previousWeight) {
                    const weightDiff = currentWeight - previousWeight;
                    const percentChange = previousWeight ? Math.abs((weightDiff / previousWeight) * 100).toFixed(1) : 0;
                    
                    if (weightDiff < 0) {
                      generatedContent = `Patient has lost ${Math.abs(weightDiff)} pounds (${percentChange}%) since last visit. ${
                        medicationData.semaglutide ? 
                        `Continuing ${medicationData.semaglutide.name} ${medicationDosages.semaglutide} with good response.` : 
                        'Current weight management plan is effective.'
                      } Patient reports ${Math.random() > 0.5 ? 'increased energy levels' : 'improved sleep patterns'} and ${
                        Math.random() > 0.5 ? 'better adherence to dietary recommendations' : 'more consistent exercise routine'
                      }.`;
                    } else if (weightDiff > 0) {
                      generatedContent = `Patient has gained ${weightDiff} pounds (${percentChange}%) since last visit. ${
                        medicationData.semaglutide ? 
                        `May need to adjust ${medicationData.semaglutide.name} dosage or review adherence.` : 
                        'Current weight management plan may need adjustment.'
                      } Patient reports ${Math.random() > 0.5 ? 'some difficulty with dietary adherence' : 'challenges maintaining exercise routine'} due to ${
                        Math.random() > 0.5 ? 'work stress' : 'family obligations'
                      }.`;
                    } else {
                      generatedContent = `Patient's weight has remained stable since last visit. ${
                        medicationData.semaglutide ? 
                        `Continuing ${medicationData.semaglutide.name} ${medicationDosages.semaglutide} with stable response.` : 
                        'Current weight management plan is maintaining stability.'
                      } Patient reports ${Math.random() > 0.5 ? 'consistent adherence to plan' : 'satisfaction with current regimen'}.`;
                    }
                  } else {
                    generatedContent = `Weight management progress assessment pending complete data. ${
                      medicationData.semaglutide ? 
                      `Patient is currently on ${medicationData.semaglutide.name} ${medicationDosages.semaglutide}.` : 
                      'No current weight management medications noted.'
                    } Recommend comprehensive review of weight history and treatment plan at this visit.`;
                  }
                  
                  setIntervalHistory(generatedContent);
                  setIsGeneratingAI(false);
                  toast.success("Progress notes generated");
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Weight (lbs)
                </label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Weight (lbs)
                </label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={previousWeight}
                  onChange={(e) => setPreviousWeight(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            {(currentWeight - previousWeight) !== 0 && (
              <div className={`p-3 rounded-md mb-4 ${(currentWeight - previousWeight) < 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                <p className="text-sm font-medium">
                  Weight change: {(currentWeight - previousWeight) > 0 ? '+' : ''}{(currentWeight - previousWeight)} lbs 
                  ({previousWeight ? Math.abs(((currentWeight - previousWeight) / previousWeight) * 100).toFixed(1) : 0}%)
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  A1C (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={a1c}
                  onChange={(e) => setA1c(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'ed':
        return (
          <div className="pt-2 mt-2">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">ED Treatment Progress</h4>
              <button
                className="p-1 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center"
                onClick={async () => {
                  // Simulate AI generation
                  setIsGeneratingAI(true);
                  toast.info("Generating ED progress notes...");
                  
                  // In a real implementation, this would call an API
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  
                  // Generate content based on ED treatment data
                  let generatedContent = '';
                  
                  // Use the effectiveness rating if available
                  if (effectivenessRating) {
                    if (effectivenessRating === 'very_effective') {
                      generatedContent = `Patient reports excellent results with current ED treatment. ${
                        frequencyOfUse ? `Has used medication ${
                          frequencyOfUse === 'not_used' ? 'infrequently' :
                          frequencyOfUse === '1-2_times' ? '1-2 times' :
                          frequencyOfUse === '3-5_times' ? '3-5 times' : 'more than 5 times'
                        } since last visit.` : ''
                      } ${
                        sideEffects.length > 0 ? 
                        `Reports ${sideEffects.includes('None') ? 'no side effects' : `side effects including ${sideEffects.join(', ')}`}.` : 
                        'No side effects reported.'
                      } Patient is satisfied with current regimen and wishes to continue.`;
                    } else if (effectivenessRating === 'somewhat_effective') {
                      generatedContent = `Patient reports partial improvement with current ED treatment. ${
                        frequencyOfUse ? `Has used medication ${
                          frequencyOfUse === 'not_used' ? 'infrequently' :
                          frequencyOfUse === '1-2_times' ? '1-2 times' :
                          frequencyOfUse === '3-5_times' ? '3-5 times' : 'more than 5 times'
                        } since last visit.` : ''
                      } ${
                        sideEffects.length > 0 ? 
                        `Reports ${sideEffects.includes('None') ? 'no side effects' : `side effects including ${sideEffects.join(', ')}`}.` : 
                        'No side effects reported.'
                      } May benefit from dosage adjustment or alternative medication.`;
                    } else {
                      generatedContent = `Patient reports minimal to no improvement with current ED treatment. ${
                        frequencyOfUse ? `Has used medication ${
                          frequencyOfUse === 'not_used' ? 'infrequently' :
                          frequencyOfUse === '1-2_times' ? '1-2 times' :
                          frequencyOfUse === '3-5_times' ? '3-5 times' : 'more than 5 times'
                        } since last visit.` : ''
                      } ${
                        sideEffects.length > 0 ? 
                        `Reports ${sideEffects.includes('None') ? 'no side effects' : `side effects including ${sideEffects.join(', ')}`}.` : 
                        'No side effects reported.'
                      } Recommend reassessment of treatment approach and possible medication change.`;
                    }
                  } else {
                    generatedContent = `Patient follow-up for ED treatment. Assessment of treatment efficacy pending complete data. ${
                      Object.values(medicationData).some(med => med.category === 'ed') ?
                      `Currently prescribed ED medication(s): ${
                        Object.values(medicationData)
                          .filter(med => med.category === 'ed')
                          .map(med => `${med.name} ${medicationDosages[med.id] || ''}`)
                          .join(', ')
                      }.` :
                      'No current ED medications noted.'
                    } Recommend comprehensive review of treatment plan at this visit.`;
                  }
                  
                  setIntervalHistory(generatedContent);
                  setIsGeneratingAI(false);
                  toast.success("ED progress notes generated");
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How effective has your treatment been?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'very_effective', label: 'Very Effective' },
                  { value: 'somewhat_effective', label: 'Somewhat Effective' },
                  { value: 'not_effective', label: 'Not Effective' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`py-2 px-3 text-sm rounded-md ${
                      effectivenessRating === option.value
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => setEffectivenessRating(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often have you used the medication?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'not_used', label: 'Not Used' },
                  { value: '1-2_times', label: '1-2 Times' },
                  { value: '3-5_times', label: '3-5 Times' },
                  { value: 'more_than_5', label: 'More Than 5 Times' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`py-2 px-3 text-sm rounded-md ${
                      frequencyOfUse === option.value
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => setFrequencyOfUse(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you experienced any side effects?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Headache',
                  'Flushing',
                  'Upset Stomach',
                  'Vision Changes',
                  'Muscle Pain',
                  'None'
                ].map(effect => (
                  <div key={effect} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`side-effect-${effect}`}
                      checked={sideEffects.includes(effect)}
                      onChange={() => {
                        if (sideEffects.includes(effect)) {
                          setSideEffects(sideEffects.filter(e => e !== effect));
                        } else {
                          setSideEffects([...sideEffects, effect]);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`side-effect-${effect}`} className="ml-2 text-sm text-gray-700">
                      {effect}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="pt-2 mt-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Treatment Progress</h4>
              <button
                className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center"
                onClick={async () => {
                  // Simulate AI generation
                  setIsGeneratingAI(true);
                  toast.info("Generating treatment progress notes...");
                  
                  // In a real implementation, this would call an API
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  
                  // Generate content based on patient data and service type
                  const primaryService = Object.keys(activeServices)[0] || '';
                  let generatedContent = '';
                  
                  if (primaryService === 'pc') {
                    generatedContent = `Patient reports overall improvement in general health. Vital signs stable. No new complaints.`;
                  } else if (primaryService === 'mh') {
                    generatedContent = `Patient reports ${Math.random() > 0.5 ? 'improved' : 'stable'} mood and sleep patterns. Continuing with current treatment plan.`;
                  } else {
                    generatedContent = `Patient reports ${Math.random() > 0.5 ? 'good' : 'satisfactory'} progress with current treatment regimen. No significant adverse effects reported.`;
                  }
                  
                  setIntervalHistory(generatedContent);
                  setIsGeneratingAI(false);
                  toast.success("Treatment progress notes generated");
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <textarea
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Document patient's progress here..."
              value={intervalHistory}
              onChange={(e) => setIntervalHistory(e.target.value)}
            ></textarea>
          </div>
        );
    }
  };
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const errors = {};
    if (!hpi.trim()) errors.hpi = 'Session notes are required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }
    
    // Update session notes
    updateSessionMutation.mutate({
      id: session.id,
      sessionData: {
        session_notes: hpi,
        followUpNeeded: false // Mark as addressed
      }
    }, {
      onSuccess: () => {
        // Create a follow-up note
        createNoteMutation.mutate({
          patientId: patient?.id,
          title: `Follow-up Visit - ${new Date().toLocaleDateString()}`,
          content: hpi,
          note_type: 'follow-up',
          createdBy: currentUser?.name || 'Provider',
          data: {
            intervalHistory,
            currentWeight,
            previousWeight,
            weightChange: currentWeight - previousWeight,
            assessmentPlan,
            followUpPlan,
            sessionId: session?.id,
            services: Object.keys(activeServices).map(key => ({
              id: key,
              name: activeServices[key].name
            }))
          }
        }, {
          onSuccess: () => {
            toast.success('Follow-up note saved successfully!');
            if (onClose) onClose();
          }
        });
      }
    });
  };
  
  // Service options
  const serviceOptions = [
    { id: 'wm', name: 'Weight Management', dotClass: 'wm-dot' },
    { id: 'ed', name: 'ED', dotClass: 'ed-dot' },
    { id: 'pc', name: 'Primary Care', dotClass: 'pc-dot' },
    { id: 'mh', name: 'Mental Health', dotClass: 'mh-dot' },
    { id: 'wh', name: 'Women\'s Health', dotClass: 'wh-dot' },
    { id: 'derm', name: 'Dermatology', dotClass: 'derm-dot' },
    { id: 'hair', name: 'Hair Loss', dotClass: 'hair-dot' }
  ];
  
  // Toggle service panel
  const toggleServicePanel = () => {
    setShowServicePanel(!showServicePanel);
  };
  
  // Add service tag
  const addServiceTag = (id, name, dotClass) => {
    if (!activeServices[id]) {
      setActiveServices(prev => ({
        ...prev,
        [id]: { name, dotClass }
      }));
      toast.info(`${name} service added.`);
    }
  };
  
  // Remove service tag
  const removeServiceTag = (id, event) => {
    event.stopPropagation();
    if (activeServices[id]) {
      const serviceName = activeServices[id].name;
      setActiveServices(prev => {
        const newServices = { ...prev };
        delete newServices[id];
        return newServices;
      });
      toast.info(`${serviceName} service removed.`);
    }
  };
  
  // Toggle resource selection
  const toggleResource = (resourceId) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };
  
  // Toggle more resources panel
  const toggleMoreResources = () => {
    setShowMoreResources(!showMoreResources);
  };
  
  // Follow-up period selection
  const selectFollowupPeriod = (period) => {
    setSelectedFollowUpPeriod(period);
    
    // Update display text
    let displayText = '';
    switch (period) {
      case '2w': displayText = '2 weeks'; break;
      case '4w': displayText = '4 weeks'; break;
      case '6w': displayText = '6 weeks'; break;
      case '8w': displayText = '8 weeks'; break;
      case '12w': displayText = '12 weeks'; break;
      default: displayText = '4 weeks';
    }
    
    setFollowUpDisplayText(displayText);
    setFollowUpPlan(displayText);
  };
  
  // Loading state
  const isLoading = isLoadingConsultation || updateSessionMutation.isLoading || createNoteMutation.isLoading;
  
  if (isLoading) {
    return <div className="bg-white flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-indigo-600" /></div>;
  }
  
  return (
    <div className="consultation-notes-container">
      {/* Header */}
      <ServiceTagsHeader 
        patientName={patient?.name}
        activeServices={activeServices}
        toggleServicePanel={toggleServicePanel}
        removeServiceTag={removeServiceTag}
        title="Follow-up Visit" // Changed from "Initial Visit" to "Follow-up Visit"
      />

      {/* Service Panel */}
      <ServicePanel 
        showServicePanel={showServicePanel}
        toggleServicePanel={toggleServicePanel}
        serviceOptions={serviceOptions}
        activeServices={activeServices}
        addServiceTag={addServiceTag}
      />

      {/* Subscription plans removed as requested */}

      {/* Main Content */}
      <div className="container">
        <div className="main-grid">
          {/* Left Column */}
          <div>
            {/* Treatment Progress Card - Only showing this section as requested */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
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
                <span style={{ color: 'white' }}>Treatment Progress</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                  <button
                    onClick={async () => {
                      // Simulate AI generation
                      setIsGeneratingAI(true);
                      toast.info("Generating progress notes...");
                      
                      // In a real implementation, this would call an API
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      
                      // Generate content based on patient data and service type
                      const primaryService = Object.keys(activeServices)[0] || '';
                      let generatedContent = '';
                      
                      if (primaryService === 'wm') {
                        if (currentWeight && previousWeight) {
                          const weightDiff = currentWeight - previousWeight;
                          const percentChange = previousWeight ? Math.abs((weightDiff / previousWeight) * 100).toFixed(1) : 0;
                          
                          if (weightDiff < 0) {
                            generatedContent = `Patient has lost ${Math.abs(weightDiff)} pounds (${percentChange}%) since last visit. ${
                              medicationData.semaglutide ? 
                              `Continuing ${medicationData.semaglutide.name} ${medicationDosages.semaglutide} with good response.` : 
                              'Current weight management plan is effective.'
                            } Patient reports ${Math.random() > 0.5 ? 'increased energy levels' : 'improved sleep patterns'} and ${
                              Math.random() > 0.5 ? 'better adherence to dietary recommendations' : 'more consistent exercise routine'
                            }.`;
                          } else if (weightDiff > 0) {
                            generatedContent = `Patient has gained ${weightDiff} pounds (${percentChange}%) since last visit. ${
                              medicationData.semaglutide ? 
                              `May need to adjust ${medicationData.semaglutide.name} dosage or review adherence.` : 
                              'Current weight management plan may need adjustment.'
                            } Patient reports ${Math.random() > 0.5 ? 'some difficulty with dietary adherence' : 'challenges maintaining exercise routine'} due to ${
                              Math.random() > 0.5 ? 'work stress' : 'family obligations'
                            }.`;
                          } else {
                            generatedContent = `Patient's weight has remained stable since last visit. ${
                              medicationData.semaglutide ? 
                              `Continuing ${medicationData.semaglutide.name} ${medicationDosages.semaglutide} with stable response.` : 
                              'Current weight management plan is maintaining stability.'
                            } Patient reports ${Math.random() > 0.5 ? 'consistent adherence to plan' : 'satisfaction with current regimen'}.`;
                          }
                        } else {
                          generatedContent = `Patient reports feeling ${
                            Math.random() > 0.5 ? 'better' : 'about the same'
                          } since last visit. ${
                            medicationData.semaglutide ? 
                            `Has been taking ${medicationData.semaglutide.name} as prescribed with ${
                              Math.random() > 0.5 ? 'no' : 'minimal'
                            } side effects.` : ''
                          }`;
                        }
                      } else if (primaryService === 'ed') {
                        generatedContent = `Patient reports ${
                          Math.random() > 0.5 ? 'improvement' : 'stable results'
                        } with current ED treatment. No significant side effects noted. Continuing current medication regimen.`;
                      } else if (primaryService === 'pc') {
                        generatedContent = `Patient reports overall improvement in general health. Vital signs stable. No new complaints.`;
                      } else if (primaryService === 'mh') {
                        generatedContent = `Patient reports ${Math.random() > 0.5 ? 'improved' : 'stable'} mood and sleep patterns. Continuing with current treatment plan.`;
                      } else {
                        generatedContent = `Patient reports ${Math.random() > 0.5 ? 'good' : 'satisfactory'} progress with current treatment regimen. No significant adverse effects reported.`;
                      }
                      
                      setIntervalHistory(generatedContent);
                      setIsGeneratingAI(false);
                      toast.success("Progress notes generated");
                    }}
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
                    <svg width="12" height="12" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l4 4L3 21l4-4L13 3z" />
                    </svg>
                    AI Compose
                  </button>
                  <button
                    onClick={() => {
                      // Edit action
                      console.log("Edit clicked");
                    }}
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
                    <svg width="12" height="12" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.5 2.5C19.3284 3.32843 19.3284 4.67157 18.5 5.5L10 14L6 15L7 11L15.5 2.5C16.3284 1.67157 17.6716 1.67157 18.5 2.5Z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-4">
                {/* Only render the service-specific progress section */}
                {renderServiceSpecificProgress()}
              </div>
            </div>
            
            {/* Medications Card */}
            <FollowUpMedicationsCard 
              medicationData={medicationData}
              medicationDosages={medicationDosages}
              previousMedicationDosages={previousMedicationDosages}
              toggleMedication={(medId) => {
                const updatedData = { ...medicationData };
                updatedData[medId].selected = !updatedData[medId].selected;
                setMedicationData(updatedData);
              }}
              selectDosage={(medId, dosage) => {
                setMedicationDosages(prev => ({
                  ...prev,
                  [medId]: dosage
                }));
              }}
              updateApproach={(medId, approach) => {
                const updatedData = { ...medicationData };
                if (updatedData[medId]) {
                  updatedData[medId].approach = approach;
                  setMedicationData(updatedData);
                }
              }}
              showMoreMeds={showMoreMeds}
              toggleMoreMeds={() => setShowMoreMeds(!showMoreMeds)}
              addListedMed={(medId) => {
                // Handle adding a new medication
                if (medId === 'semaglutide') {
                  const newMed = {
                    name: 'Semaglutide',
                    brandName: 'Wegovy',
                    category: 'wm',
                    frequency: 'wkly',
                    dosageOptions: [
                      { value: '0.25mg', label: '0.25' },
                      { value: '0.5mg', label: '0.5' },
                      { value: '1mg', label: '1.0' },
                      { value: '1.7mg', label: '1.7' },
                      { value: '2.4mg', label: '2.4' }
                    ],
                    instructions: [
                      '• Inject SC once wkly.',
                      '• Rotate sites.'
                    ],
                    selected: true,
                    approach: 'Escalation',
                    supportedApproaches: ['Maint.', 'Escalation']
                  };
                  
                  setMedicationData(prev => ({
                    ...prev,
                    [medId]: newMed
                  }));
                  
                  setMedicationDosages(prev => ({
                    ...prev,
                    [medId]: '0.25mg'
                  }));
                  
                  toast.success(`Added ${newMed.name}`);
                }
              }}
              validationErrors={validationErrors}
            />
          </div>
          
          {/* Right Column */}
          <div>
            {/* Communication Card - Fixed with required props */}
            <CommunicationCard 
              patient={patient}
              session={session}
              selectedFollowUpPeriod={selectedFollowUpPeriod}
              followUpDisplayText={followUpDisplayText}
              selectFollowupPeriod={selectFollowupPeriod}
              resourceOptions={resourceOptions}
              selectedResources={selectedResources}
              toggleResource={toggleResource}
              showMoreResources={showMoreResources}
              toggleMoreResources={toggleMoreResources}
              medicationData={medicationData}
              medicationDosages={medicationDosages}
              serviceCategory={Object.keys(activeServices)[0] || 'general'}
            />
            
            {/* Assessment & Plan Card - Moved under Communication Card */}
            <AssessmentPlanCard 
              assessmentPlan={hpi}
              setAssessmentPlan={setHpi}
              followUpPlan={followUpPlan}
              setFollowUpPlan={setFollowUpPlan}
              validationErrors={validationErrors}
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <ConsultationFooter 
        onSave={handleSave}
        onCancel={onClose}
        isSaving={updateSessionMutation.isLoading || createNoteMutation.isLoading}
      />
    </div>
  );
};

export default FollowUpConsultationNotes;
