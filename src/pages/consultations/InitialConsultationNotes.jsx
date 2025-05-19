import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useServices } from '../../apis/services/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useProducts } from '../../apis/products/hooks';
import { useCategories } from '../../apis/categories/hooks';
import { useCreateConsultation } from '../../apis/consultations/hooks';
import { usePatientFormSubmissions } from '../../apis/formSubmissions/hooks';
import { Loader2, AlertTriangle } from 'lucide-react';

// Import components
import {
  ServiceTagsHeader,
  ServicePanel,
  AlertCenterCard,
  PatientInfoCard,
  MedicationsCard,
  CommunicationCard,
  AssessmentPlanCard,
  ConsultationFooter,
  AIPanel,
  IntakeFormPanel
} from './components/consultation-notes';

// Import CSS for the component
import './InitialConsultationNotes.css';

const InitialConsultationNotes = ({
  patient,
  onClose,
  consultationData,
  consultationId,
  readOnly = false,
  updateStatusMutation,
}) => {
  // --- Data Fetching Hooks ---
  const { isLoading: isLoadingServices, error: errorServices } = useServices();
  const { isLoading: isLoadingPlans, error: errorPlans } = useSubscriptionPlans();
  const { data: productsData, isLoading: isLoadingProducts, error: errorProducts } = useProducts();
  const { data: categoriesData, isLoading: isLoadingCategories, error: errorCategories } = useCategories();
  const createConsultationMutation = useCreateConsultation({
    onSuccess: () => {
      toast.success("Consultation submitted successfully!");
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Error creating new consultation:", error);
    }
  });

  // --- Mock Data ---
  const mockServicesWithPlans = [
    { id: 1, name: 'Weight Management Program', availablePlans: [{ planId: 101, duration: 'Monthly', requiresSubscription: true }], recommendedFollowUp: 'Monthly' },
    { id: 2, name: 'ED Consultation', availablePlans: [{ planId: 201, duration: 'One-Time', requiresSubscription: false }], recommendedFollowUp: '3_months' },
  ];
  const allServices = mockServicesWithPlans;
  const allProducts = useMemo(() => productsData?.data || productsData || [], [productsData]);

  // --- State Hooks ---
  const [hpi, setHpi] = useState('');
  const [pmh, setPmh] = useState('');
  const [contraindications, setContraindications] = useState('No known contra-indications...');
  const [selectedServiceId, setSelectedServiceId] = useState(1);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [messageToPatient, setMessageToPatient] = useState('Continue medication as prescribed');
  const [assessmentPlan, setAssessmentPlan] = useState('Obesity with good response to treatment');
  const [followUpPlan, setFollowUpPlan] = useState('Monthly');

  // --- New UI State ---
  const [activeServices, setActiveServices] = useState({
    'wm': { name: 'Weight Management', dotClass: 'wm-dot' },
    'ed': { name: 'ED', dotClass: 'ed-dot' }
  });
  const [showServicePanel, setShowServicePanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [adjustFollowUp, setAdjustFollowUp] = useState(true);
  
  // --- Medication Controls State ---
  const [openMedicationControls, setOpenMedicationControls] = useState({});
  const [openMedicationInstructions, setOpenMedicationInstructions] = useState({});
  const [medicationDosages, setMedicationDosages] = useState({
    semaglutide: '0.25mg',
    metformin: '500mg',
    sildenafil: '50mg'
  });
  
  // --- Follow-up Options State ---
  const [selectedFollowUpPeriod, setSelectedFollowUpPeriod] = useState('2w');
  const [followUpDisplayText, setFollowUpDisplayText] = useState('2 weeks');
  
  // --- Patient Education Resources State ---
  const [selectedResources, setSelectedResources] = useState([]);
  const [showMoreResources, setShowMoreResources] = useState(false);
  
  // --- More Medications Panel State ---
  const [showMoreMeds, setShowMoreMeds] = useState(false);
  const [medicationSearchTerm, setMedicationSearchTerm] = useState('');
  const [medicationCategory, setMedicationCategory] = useState('All');
  
  // --- Assessment Details State ---
  const [showAssessmentDetails, setShowAssessmentDetails] = useState(false);

  // --- Service Options ---
  // Map categories from the API to service options with fallback
  const serviceOptions = useMemo(() => {
    // Fallback service options in case API data is not available
    const fallbackOptions = [
      { id: 'wm', name: 'Weight Management', dotClass: 'wm-dot' },
      { id: 'ed', name: 'ED', dotClass: 'ed-dot' },
      { id: 'pc', name: 'Primary Care', dotClass: 'pc-dot' },
      { id: 'mh', name: 'Mental Health', dotClass: 'mh-dot' },
      { id: 'wh', name: 'Women\'s Health', dotClass: 'wh-dot' },
      { id: 'derm', name: 'Dermatology', dotClass: 'derm-dot' },
      { id: 'hair', name: 'Hair Loss', dotClass: 'hair-dot' }
    ];
    
    // If categories data is available, use it; otherwise use fallback
    if (categoriesData?.data && categoriesData.data.length > 0) {
      return categoriesData.data.map(category => ({
        id: category.category_id,
        name: category.name,
        dotClass: `${category.category_id}-dot`
      }));
    }
    
    return fallbackOptions;
  }, [categoriesData]);
  
  // --- Resource Options ---
  const resourceOptions = [
    { id: 'glp1', name: 'GLP-1 Guide', category: 'wm', dotClass: 'wm-dot' },
    { id: 'ed', name: 'ED Guide', category: 'ed', dotClass: 'ed-dot' },
    { id: 'diet', name: 'Diet Plan', category: '', dotClass: '' },
    { id: 'exercise', name: 'Exercise Plan', category: '', dotClass: '' },
    { id: 'safety', name: 'Safety Info', category: '', dotClass: '' }
  ];
  
  // --- Additional Medications ---
  const additionalMedications = [
    { id: 'amlodipine', name: 'Amlodipine', category: 'pc', description: 'BP' },
    { id: 'lisinopril', name: 'Lisinopril', category: 'pc', description: 'BP' },
    { id: 'atorvastatin', name: 'Atorvastatin', category: 'pc', description: 'Cholesterol' },
    { id: 'escitalopram', name: 'Escitalopram', category: 'mh', description: 'SSRI' },
    { id: 'bupropion', name: 'Bupropion', category: 'mh', description: 'NDRI' },
    { id: 'tadalafil', name: 'Tadalafil', category: 'ed', description: 'Cialis' }
  ];
  
  // --- Medication Data ---
  const medicationData = {
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
        { value: '2.4mg', label: '2.4mg' }
      ],
      instructions: [
        '• Inject SC once wkly.',
        '• Rotate sites.'
      ],
      selected: true
    },
    metformin: {
      name: 'Metformin',
      category: 'wm',
      frequency: 'daily',
      dosageOptions: [
        { value: '500mg', label: '500' },
        { value: '850mg', label: '850' },
        { value: '1g', label: '1g' }
      ],
      instructions: [
        '• Take with food.'
      ],
      selected: true
    },
    sildenafil: {
      name: 'Sildenafil',
      brandName: 'Viagra',
      category: 'ed',
      frequency: 'PRN',
      dosageOptions: [
        { value: '25mg', label: '25' },
        { value: '50mg', label: '50' },
        { value: '100mg', label: '100mg' }
      ],
      instructions: [
        '• Take 30-60 min pre-activity.'
      ],
      selected: true
    }
  };

  // --- Derived Data ---
  const getServiceById = useCallback((id) => allServices.find((s) => s.id === id), [allServices]);
  
  // --- Fetch patient's form submissions ---
  const { data: formSubmissions } = usePatientFormSubmissions(patient?.id);
  
  // Get the latest submission for each category
  const latestSubmissions = useMemo(() => {
    if (!formSubmissions) return {};
    
    const submissions = {};
    formSubmissions.forEach(submission => {
      const categoryId = submission.category_id;
      if (!submissions[categoryId] || 
          new Date(submission.submitted_at) > new Date(submissions[categoryId].submitted_at)) {
        submissions[categoryId] = submission;
      }
    });
    
    return submissions;
  }, [formSubmissions]);

  // --- Effects ---
  useEffect(() => {
    if (consultationData) {
      // Populate form from existing data
      setHpi(consultationData.notes?.hpi || '');
      setPmh(consultationData.notes?.pmh || '');
      setContraindications(consultationData.notes?.contraindications || '');
      setSelectedServiceId(consultationData.medicationOrder?.serviceId || 1);
      setSelectedMedications(Array.isArray(consultationData.medicationOrder?.selectedMedications) 
        ? consultationData.medicationOrder.selectedMedications 
        : []);
      setMessageToPatient(consultationData.communication?.messageToPatient || '');
      setAssessmentPlan(consultationData.communication?.assessmentPlan || '');
      setFollowUpPlan(consultationData.communication?.followUpPlan || 'Monthly');
    }
  }, [consultationData]);
  
  // Effect to pre-select medications based on patient's intake form
  useEffect(() => {
    if (Object.keys(latestSubmissions).length > 0) {
      // Create a map of product IDs to medication IDs for lookup
      const productToMedicationMap = {
        // Map product IDs to medication keys
        'semaglutide_product': 'semaglutide',
        'metformin_product': 'metformin',
        'sildenafil_product': 'sildenafil',
        'tadalafil_product': 'tadalafil'
      };
      
      // Find preferred products from form submissions
      Object.values(latestSubmissions).forEach(submission => {
        if (submission.preferred_product_id) {
          const medicationId = productToMedicationMap[submission.preferred_product_id];
          
          if (medicationId && medicationData[medicationId]) {
            // Pre-select this medication and mark as patient preference
            const updatedMedicationData = { ...medicationData };
            updatedMedicationData[medicationId].selected = true;
            updatedMedicationData[medicationId].isPatientPreference = true;
            
            // If this is a new medication, add it to the dosages
            if (!medicationDosages[medicationId]) {
              setMedicationDosages(prev => ({
                ...prev,
                [medicationId]: updatedMedicationData[medicationId].dosageOptions[0].value
              }));
            }
            
            toast.info(`Pre-selected ${updatedMedicationData[medicationId].name} based on patient's intake form`);
          }
        }
      });
    }
  }, [latestSubmissions, medicationData]);

  // --- Event Handlers ---
  const toggleServicePanel = () => {
    setShowServicePanel(!showServicePanel);
  };

  const addServiceTag = (id, name, dotClass) => {
    if (!activeServices[id]) {
      setActiveServices(prev => ({
        ...prev,
        [id]: { name, dotClass }
      }));
      toast.info(`${name} service added.`);
    }
  };

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

  const toggleAIPanel = () => {
    setShowAIPanel(!showAIPanel);
  };

  const toggleIntakeForm = () => {
    setShowIntakeForm(!showIntakeForm);
  };
  
// Track if this is the initial mount
const initialMountRef = React.useRef(true);

// --- Follow-up Options Handlers ---
const selectFollowupPeriod = (period) => {
  setSelectedFollowUpPeriod(period);
  
  // Update the display text based on the period
  let displayText = '';
  switch (period) {
    case '2w':
      displayText = '2 weeks';
      break;
    case '4w':
      displayText = '4 weeks';
      break;
    case '6w':
      displayText = '6 weeks';
      break;
    case 'custom':
      displayText = 'Custom';
      break;
    default:
      displayText = '2 weeks';
  }
  
  setFollowUpDisplayText(displayText);
  
  // If selecting 2 weeks, also check the adjustFollowUp checkbox
  if (period === '2w') {
    setAdjustFollowUp(true);
  }
  
  // Only show toast if it's not the initial mount
  if (!initialMountRef.current) {
    toast.info(`Follow-up: ${displayText}`);
  }
};
  
// Effect to update follow-up when adjustFollowUp changes
useEffect(() => {
  if (adjustFollowUp) {
    selectFollowupPeriod('2w');
  }
  
  // After the first render, set initialMount to false
  initialMountRef.current = false;
}, [adjustFollowUp]);
  
  // --- Patient Education Resources Handlers ---
  const toggleResource = (id) => {
    setSelectedResources(prev => {
      if (prev.includes(id)) {
        toast.info(`Removed ${getResourceName(id)}`);
        return prev.filter(r => r !== id);
      } else {
        toast.info(`Added ${getResourceName(id)}`);
        return [...prev, id];
      }
    });
  };
  
  const getResourceName = (id) => {
    const resource = resourceOptions.find(r => r.id === id);
    return resource ? resource.name : id;
  };
  
  const toggleMoreResources = () => {
    setShowMoreResources(!showMoreResources);
  };
  
  // --- Assessment Details Handlers ---
  const toggleAssessmentDetails = () => {
    setShowAssessmentDetails(!showAssessmentDetails);
  };
  
  // --- More Medications Panel Handlers ---
  const toggleMoreMeds = () => {
    setShowMoreMeds(!showMoreMeds);
  };
  
  const handleMedicationSearch = (e) => {
    setMedicationSearchTerm(e.target.value);
  };
  
  const handleMedicationCategoryChange = (e) => {
    setMedicationCategory(e.target.value);
  };
  
  const addListedMed = (medId) => {
    const medication = additionalMedications.find(med => med.id === medId);
    if (medication) {
      // Add the medication to medicationData if it doesn't exist
      if (!medicationData[medId]) {
        const newMedicationData = { ...medicationData };
        newMedicationData[medId] = {
          name: medication.name,
          category: medication.category,
          frequency: 'daily',
          dosageOptions: [
            { value: '10mg', label: '10' },
            { value: '20mg', label: '20' },
            { value: '40mg', label: '40' }
          ],
          instructions: [
            '• Take as directed.'
          ],
          selected: true
        };
        
        // Update medication dosages
        setMedicationDosages(prev => ({
          ...prev,
          [medId]: '10mg'
        }));
        
        toast.info(`Added ${medication.name}`);
      }
    }
  };
  
  // Filter additional medications based on search and category
  const filteredMedications = useMemo(() => {
    return additionalMedications.filter(med => {
      const matchesSearch = medicationSearchTerm === '' || 
        med.name.toLowerCase().includes(medicationSearchTerm.toLowerCase()) ||
        (med.description && med.description.toLowerCase().includes(medicationSearchTerm.toLowerCase()));
      
      const matchesCategory = medicationCategory === 'All' || med.category === medicationCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [medicationSearchTerm, medicationCategory]);
  
  // --- Medication Control Handlers ---
  const toggleMedicationControls = (medId) => {
    setOpenMedicationControls(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };
  
  const toggleMedicationInstructions = (medId) => {
    setOpenMedicationInstructions(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };
  
  const selectDosage = (medId, dosage) => {
    setMedicationDosages(prev => ({
      ...prev,
      [medId]: dosage
    }));
    toast.info(`Updated ${medId} to ${dosage}`);
  };
  
  const toggleMedication = (medId) => {
    // Toggle medication selection
    const updatedMedicationData = { ...medicationData };
    if (updatedMedicationData[medId]) {
      updatedMedicationData[medId].selected = !updatedMedicationData[medId].selected;
      
      // If deselecting, close any open controls or instructions
      if (!updatedMedicationData[medId].selected) {
        setOpenMedicationControls(prev => ({
          ...prev,
          [medId]: false
        }));
        setOpenMedicationInstructions(prev => ({
          ...prev,
          [medId]: false
        }));
      }
      
      toast.info(`${updatedMedicationData[medId].selected ? 'Added' : 'Removed'} ${updatedMedicationData[medId].name}`);
    }
  };

  const handleSave = () => {
    toast.success('Note saved successfully!');
    if (onClose) onClose();
  };

  const handleSubmit = async () => {
    try {
      // Import the notification service
      const { notifyPatientOfNewNote } = await import('../../services/notificationService');
      
      // 1. Prepare consultation data
      const consultationData = {
        patient_id: patient?.id,
        provider_id: 'current-provider-id', // TODO: Replace with actual provider ID from auth context
        status: 'completed',
        notes: {
          hpi,
          pmh,
          contraindications,
          assessmentPlan
        },
        medication_order: {
          // Get only selected medications
          medications: Object.keys(medicationData)
            .filter(medId => medicationData[medId].selected)
            .map(medId => ({
              id: medId,
              name: medicationData[medId].name,
              dosage: medicationDosages[medId],
              frequency: medicationData[medId].frequency,
              instructions: medicationData[medId].instructions
            }))
        },
        follow_up: {
          period: selectedFollowUpPeriod,
          display_text: followUpDisplayText
        },
        resources: selectedResources.map(id => {
          const resource = resourceOptions.find(r => r.id === id);
          return {
            id,
            name: resource?.name || id
          };
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 2. Submit consultation
      const result = await createConsultationMutation.mutateAsync(consultationData);
      
      // 3. Notify patient of new note
      if (result && patient?.id) {
        // Use default template for now
        const notificationResult = await notifyPatientOfNewNote({
          patientId: patient.id,
          noteId: result.id,
          templateId: 'tpl_001' // Standard Follow-Up template
        });
        
        if (notificationResult.success) {
          console.log('Patient notification sent successfully:', notificationResult);
          
          // Show success message with notification details
          const channels = Object.keys(notificationResult.channels || {})
            .filter(channel => notificationResult.channels[channel].success)
            .join(', ');
            
          if (channels) {
            toast.success(`Patient notified via: ${channels}`);
          }
        } else {
          console.error('Failed to notify patient:', notificationResult.error);
        }
      }
      
      toast.success("Consultation submitted successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting consultation:', error);
      toast.error('Error submitting consultation. Please try again.');
    }
  };

  // --- Loading & Error States ---
  // Don't block on categories loading, as we have fallback options
  const isLoading = isLoadingServices || isLoadingPlans || isLoadingProducts;
  const error = errorServices || errorPlans || errorProducts;

  if (isLoading) {
    return <div className="bg-white flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-indigo-600" /></div>;
  }
  if (error) {
    return (
      <div className="bg-white flex flex-col items-center justify-center text-red-600 p-8 h-full">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading necessary data for consultation notes.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="consultation-notes-container">
      {/* Header */}
      <ServiceTagsHeader 
        patientName={patient?.name}
        activeServices={activeServices}
        toggleServicePanel={toggleServicePanel}
        removeServiceTag={removeServiceTag}
        toggleAIPanel={toggleAIPanel}
      />

      {/* Service Panel */}
      <ServicePanel 
        showServicePanel={showServicePanel}
        toggleServicePanel={toggleServicePanel}
        serviceOptions={serviceOptions}
        activeServices={activeServices}
        addServiceTag={addServiceTag}
      />

      {/* Main Content */}
      <div className="container">
        <div className="main-grid">
          {/* Left Column */}
          <div>
            {/* Patient Info Card */}
            <PatientInfoCard 
              patient={patient}
              toggleIntakeForm={toggleIntakeForm}
            />

            {/* Alert Center Card */}
            <AlertCenterCard 
              adjustFollowUp={adjustFollowUp}
              setAdjustFollowUp={setAdjustFollowUp}
            />

            {/* Medications Card */}
            <MedicationsCard 
              medicationData={medicationData}
              medicationDosages={medicationDosages}
              openMedicationControls={openMedicationControls}
              openMedicationInstructions={openMedicationInstructions}
              toggleMedication={toggleMedication}
              toggleMedicationControls={toggleMedicationControls}
              toggleMedicationInstructions={toggleMedicationInstructions}
              selectDosage={selectDosage}
              showMoreMeds={showMoreMeds}
              toggleMoreMeds={toggleMoreMeds}
              medicationSearchTerm={medicationSearchTerm}
              medicationCategory={medicationCategory}
              handleMedicationSearch={handleMedicationSearch}
              handleMedicationCategoryChange={handleMedicationCategoryChange}
              filteredMedications={filteredMedications}
              addListedMed={addListedMed}
            />
          </div>

          {/* Right Column */}
          <div>
            {/* Communication Card */}
            <CommunicationCard 
              selectedFollowUpPeriod={selectedFollowUpPeriod}
              followUpDisplayText={followUpDisplayText}
              selectFollowupPeriod={selectFollowupPeriod}
              resourceOptions={resourceOptions}
              selectedResources={selectedResources}
              toggleResource={toggleResource}
              showMoreResources={showMoreResources}
              toggleMoreResources={toggleMoreResources}
            />
            
            {/* Assessment & Plan Card */}
            <AssessmentPlanCard 
              showAssessmentDetails={showAssessmentDetails}
              toggleAssessmentDetails={toggleAssessmentDetails}
              assessmentPlan={assessmentPlan}
              setAssessmentPlan={setAssessmentPlan}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <ConsultationFooter 
        onClose={onClose}
        handleSave={handleSave}
        handleSubmit={handleSubmit}
        readOnly={readOnly}
      />

      {/* AI Panel */}
      <AIPanel 
        showAIPanel={showAIPanel}
        toggleAIPanel={toggleAIPanel}
      />

      {/* Intake Form Panel */}
      <IntakeFormPanel 
        patientId={patient?.id}
        showIntakeForm={showIntakeForm}
        toggleIntakeForm={toggleIntakeForm}
      />
    </div>
  );
};

export default InitialConsultationNotes;
