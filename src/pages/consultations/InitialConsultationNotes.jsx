import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useServices } from '../../apis/services/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useProducts } from '../../apis/products/hooks';
import { useCategories } from '../../apis/categories/hooks';
import { useCreateConsultation } from '../../apis/consultations/hooks';
import { usePatientFormSubmissions } from '../../apis/formSubmissions/hooks';
import { useScheduleFollowUp, useFollowUpTemplatesByCategoryAndPeriod } from '../../apis/followUps/hooks';
import { useCreateInvoice } from '../../apis/invoices/hooks';
import { useAuth } from '../../contexts/auth/AuthContext'; // Import auth context
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
  // Get current provider from auth context
  const { currentUser } = useAuth();
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});
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

  // --- Patient History State ---
  const [patientHistoryState, setPatientHistoryState] = useState(patient?.healthHistory || '');

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
  const [selectedFollowUpTemplateId, setSelectedFollowUpTemplateId] = useState(null);
  
  // Get the primary service category for template selection
  const primaryServiceCategory = useMemo(() => {
    const serviceKeys = Object.keys(activeServices);
    return serviceKeys.length > 0 ? serviceKeys[0] : 'weight_management';
  }, [activeServices]);
  
  // Fetch follow-up templates for the selected period and category
  const { data: followUpTemplates } = useFollowUpTemplatesByCategoryAndPeriod(
    primaryServiceCategory,
    selectedFollowUpPeriod
  );
  
  // Update selected template when templates are loaded or period changes
  useEffect(() => {
    if (followUpTemplates && followUpTemplates.length > 0) {
      setSelectedFollowUpTemplateId(followUpTemplates[0].id);
    } else {
      setSelectedFollowUpTemplateId(null);
    }
  }, [followUpTemplates, selectedFollowUpPeriod]);
  
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
  const [medicationData, setMedicationData] = useState({
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
      selected: true,
      approach: 'Escalation', // Add default approach
      supportedApproaches: ['Maint.', 'Escalation'] // Example: GLP-1 supports Maint and Escalation
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
      selected: true,
      approach: 'Maintenance', // Add default approach
      supportedApproaches: ['Maint.'] // Example: Metformin supports only Maintenance
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
      selected: true,
      approach: 'PRN', // Add default approach
      supportedApproaches: ['PRN'] // Example: Sildenafil supports only PRN
    }
  });

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
      // Initialize patient history state from consultation data if available
      setPatientHistoryState(consultationData.notes?.patientHistory || patient?.healthHistory || '');
    } else if (patient?.intakeData) {
      // Pre-populate form with intake data if no consultation data exists
      const healthHistory = patient.intakeData.healthHistory;
      if (healthHistory) {
        // Create HPI from chief complaint
        if (healthHistory.chiefComplaint) {
          setHpi(`Patient reports: ${healthHistory.chiefComplaint}`);
        }
        
        // Create PMH from medical conditions
        if (healthHistory.medicalConditions?.length) {
          setPmh(healthHistory.medicalConditions.join(', '));
        }
        
        // Set contraindications from allergies
        if (healthHistory.allergiesText) {
          setContraindications(`Allergies: ${healthHistory.allergiesText}`);
        }
      }
    }
  }, [consultationData, patient]); // Added patient to dependency array
  
  // Effect to pre-select medications based on patient's intake form
  useEffect(() => {
    if (Object.keys(latestSubmissions).length > 0) {
      // Function to convert product ID to medication ID
      const getProductAsMedicationId = (productId) => {
        // Remove any '_product' suffix if present
        return productId.replace('_product', '');
      };
      
      // Find preferred products from form submissions
      Object.values(latestSubmissions).forEach(submission => {
        if (submission.preferred_product_id) {
          const medicationId = getProductAsMedicationId(submission.preferred_product_id);
          
          if (medicationId && medicationData[medicationId]) {
            // If this is a new medication, add it to the dosages
            if (!medicationDosages[medicationId]) {
              setMedicationDosages(prevDosages => ({
                ...prevDosages,
                [medicationId]: medicationData[medicationId].dosageOptions[0].value
              }));
            }
            
            // Pre-select this medication and mark as patient preference
            setMedicationData(prev => {
              const updatedMedicationData = { ...prev };
              updatedMedicationData[medicationId].selected = true;
              updatedMedicationData[medicationId].isPatientPreference = true;
              
              toast.info(`Pre-selected ${updatedMedicationData[medicationId].name} based on patient's intake form`);
              
              return updatedMedicationData;
            });
          }
        }
      });
    }
  }, [latestSubmissions, medicationData, medicationDosages]);

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
      
      // Find the corresponding service ID in allServices
      const matchingService = allServices.find(s => s.name === name);
      if (matchingService) {
        setSelectedServiceId(matchingService.id);
      }
      
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
  
  // --- Patient History Handlers ---
  const handleSavePatientHistory = async (history) => {
    setPatientHistoryState(history);
    
    // Save to patient record if this is a new consultation
    if (!consultationId && patient?.id) {
      try {
        // Import the patient history service
        const { updatePatientHistory } = await import('../../services/patientService');
        
        await updatePatientHistory(patient.id, history);
        toast.success('Patient history updated');
      } catch (error) {
        console.error('Error updating patient history:', error);
        toast.error('Failed to update patient history');
      }
    }
    
    console.log('Patient history updated in parent state:', history);
  };

  // Track if this is the initial mount
  const initialMountRef = React.useRef(true);

  // --- Follow-up Options Handlers ---
  const selectFollowupPeriod = (period, showToast = true) => {
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

    // Only show toast if it's not the initial mount and showToast is true
    if (!initialMountRef.current && showToast) {
      toast.info(`Follow-up: ${displayText}`);
    }
  };

  // Effect to update follow-up when adjustFollowUp changes
  useEffect(() => {
    if (adjustFollowUp) {
      selectFollowupPeriod('2w', false); // Do not show toast on mount
    }

    // After the first render, set initialMount to false
    initialMountRef.current = false;
  }, [adjustFollowUp]);
  
  // Effect to handle follow-up scheduling based on active services
  useEffect(() => {
    // When active services change, update follow-up recommendations
    if (Object.keys(activeServices).length > 0) {
      const primaryServiceKey = Object.keys(activeServices)[0];
      const matchingService = allServices.find(s =>
        s.name === activeServices[primaryServiceKey].name
      );
      
      if (matchingService?.recommendedFollowUp) {
        // Convert service's recommended follow-up to our period format
        const periodMap = {
          'Weekly': '1w',
          'Bi-weekly': '2w',
          'Monthly': '4w',
          '3_months': '12w'
        };
        
        const period = periodMap[matchingService.recommendedFollowUp] || '4w';
        selectFollowupPeriod(period, false); // Don't show toast on auto-selection
      }
    }
  }, [activeServices, allServices]);
  
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
        setMedicationData(prev => {
          const newMedicationData = { ...prev };
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
            selected: true,
            approach: 'Maintenance' // Add default approach
          };
          return newMedicationData;
        });
        
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
    // Removed toast notification for dosage change
  };
  
  // Function to update medication approach
  const updateMedicationApproach = (medId, approach) => {
    setMedicationData(prev => {
      const updated = { ...prev };
      if (updated[medId]) {
        updated[medId] = {
          ...updated[medId],
          approach
        };
      }
      return updated;
    });
  };
  
  const toggleMedication = (medId) => {
    // Toggle medication selection and update state
    setMedicationDosages(prev => {
      const newDosages = { ...prev };
      if (medicationData[medId] && medicationData[medId].selected) {
        // If unchecking, remove dosage entry
        delete newDosages[medId];
      }
      return newDosages;
    });

    setOpenMedicationControls(prev => {
      const newControls = { ...prev };
      delete newControls[medId];
      return newControls;
    });

    setOpenMedicationInstructions(prev => {
      const newInstructions = { ...prev };
      delete newInstructions[medId];
      return newInstructions;
    });

    // Update medicationData to toggle selected state
    setMedicationData(prev => {
      const updatedMedicationData = { ...prev };
      if (updatedMedicationData[medId]) {
        updatedMedicationData[medId].selected = !updatedMedicationData[medId].selected;
      }
      return updatedMedicationData;
    });
    
    // Remove all toast notifications (React Toastify)
    if (typeof toast.dismiss === 'function') {
      toast.dismiss();
    }
  };

  const handleSave = () => {
    toast.success('Note saved successfully!');
    if (onClose) onClose();
  };

  // Initialize mutations
  const scheduleFollowUpMutation = useScheduleFollowUp();
  const createInvoiceMutation = useCreateInvoice();

  // Validate consultation data before submission
  const validateConsultationData = (data) => {
    const errors = {};
    
    if (!data.patient_id) errors.patient = 'Patient ID is required';
    if (!data.provider_id) errors.provider = 'Provider ID is required';
    if (!data.notes.hpi) errors.hpi = 'HPI is required';
    if (data.medication_order.medications.length === 0) {
      errors.medications = 'At least one medication must be selected';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Function to select appropriate notification template based on consultation data
  const getNotificationTemplate = (consultationData) => {
    // Select template based on service, medications, or other factors
    const serviceTemplates = {
      1: 'tpl_weight_management',
      2: 'tpl_ed',
      3: 'tpl_hair_loss'
    };
    
    // First try to match by service
    if (serviceTemplates[consultationData.service_id]) {
      return serviceTemplates[consultationData.service_id];
    }
    
    // Then try to match by medication
    const hasSemaglutide = consultationData.medication_order.medications.some(med => med.id === 'semaglutide');
    if (hasSemaglutide) {
      return 'tpl_glp1';
    }
    
    const hasSildenafil = consultationData.medication_order.medications.some(med => med.id === 'sildenafil');
    if (hasSildenafil) {
      return 'tpl_ed';
    }
    
    // Default template
    return 'tpl_standard';
  };

  const handleSubmit = useCallback(async () => {
    try {
      // Import the notification service
      const { notifyPatientOfNewNote } = await import('../../services/notificationService');

      // 1. Prepare consultation data
      const consultationData = {
        patient_id: patient?.id,
        provider_id: currentUser?.id || null, // Use authenticated provider ID
        service_id: selectedServiceId, // Include selected service ID
        service_name: allServices.find(s => s.id === selectedServiceId)?.name || '', // Include service name
        status: 'completed',
        notes: {
          hpi,
          pmh,
          contraindications,
          assessmentPlan,
          patientHistory: patientHistoryState // Include edited history in submission data
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
              instructions: medicationData[medId].instructions,
              approach: medicationData[medId].approach || 'Maintenance' // Add approach
            }))
        },
        follow_up: {
          period: selectedFollowUpPeriod,
          display_text: followUpDisplayText,
          template_id: selectedFollowUpTemplateId
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

      // Validate consultation data before submission
      const { isValid, errors } = validateConsultationData(consultationData);
      if (!isValid) {
        // Display errors and prevent submission
        setValidationErrors(errors);
        Object.values(errors).forEach(error => {
          toast.error(error);
        });
        return;
      }
      
      // Clear any previous validation errors
      setValidationErrors({});
      
      // 2. Submit consultation
      const result = await createConsultationMutation.mutateAsync(consultationData);

      // 3. Create an invoice for the follow-up service if needed
      let invoiceId = null;
      if (result && patient?.id) {
        // Import invoice validation service
        const { shouldCreateInvoice } = await import('../../services/invoiceValidationService');
        
        // Check if we should create an invoice
        const invoiceValidation = await shouldCreateInvoice(patient.id, selectedFollowUpPeriod);
        
        if (invoiceValidation.shouldCreate) {
          // Define the follow-up service price based on period
          const followUpServicePrice =
            selectedFollowUpPeriod === '2w' ? 49.99 :
            selectedFollowUpPeriod === '4w' ? 39.99 :
            selectedFollowUpPeriod === '6w' ? 29.99 :
            59.99; // Custom or default price
          
          // Create the invoice
          const invoice = await createInvoiceMutation.mutateAsync({
            patient_id: patient.id,
            consultation_id: result.id,
            items: [{
              description: `Follow-up consultation (${followUpDisplayText})`,
              amount: followUpServicePrice,
              quantity: 1
            }],
            status: 'pending',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
            created_at: new Date().toISOString()
          });
        
          if (invoice) {
            invoiceId = invoice.id;
            toast.info(`Invoice created for follow-up service: $${followUpServicePrice}`);
          }
        } else if (invoiceValidation.reason) {
          toast.info(`No invoice created: ${invoiceValidation.reason}`);
        }
      }

      // 4. Schedule the follow-up (will be activated after payment)
      if (result && patient?.id && selectedFollowUpTemplateId) {
        await scheduleFollowUpMutation.mutateAsync({
          patientId: patient.id,
          consultationId: result.id,
          templateId: selectedFollowUpTemplateId,
          period: selectedFollowUpPeriod,
          paymentStatus: 'pending', // Will be updated to 'paid' after invoice is paid
          invoiceId: invoiceId
        });
        
        toast.info(`Follow-up scheduled for ${followUpDisplayText} (pending payment)`);
      }

      // 5. Notify patient of new note
      if (result && patient?.id) {
        // Use default template for now
        const notificationResult = await notifyPatientOfNewNote({
          patientId: patient.id,
          noteId: result.id,
          templateId: getNotificationTemplate(consultationData)
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
  }, [
    patient,
    hpi,
    pmh,
    contraindications,
    assessmentPlan,
    patientHistoryState,
    medicationData, // This includes the approach property now
    medicationDosages,
    selectedFollowUpPeriod,
    followUpDisplayText,
    selectedFollowUpTemplateId,
    selectedResources,
    resourceOptions,
    createConsultationMutation,
    createInvoiceMutation,
    scheduleFollowUpMutation,
    onClose
  ]);

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
        title="Initial Visit" // Explicitly set title for initial consultation
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
              patientHistory={patientHistoryState} // Pass history from state
              onSaveHistory={handleSavePatientHistory} // Pass save callback
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
              updateApproach={updateMedicationApproach}
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
              serviceCategory={primaryServiceCategory}
              medicationData={medicationData}
              medicationDosages={medicationDosages}
            />
            
            {/* Assessment & Plan Card */}
              {/* Prepare selected medications for AssessmentPlanCard */}
              <AssessmentPlanCard 
                assessmentPlan={assessmentPlan}
                setAssessmentPlan={setAssessmentPlan}
                selectedMedications={Object.keys(medicationData)
                  .filter(medId => medicationData[medId].selected)
                  .map(medId => ({
                    id: medId,
                    name: medicationData[medId].name,
                    dosage: medicationDosages[medId],
                    frequency: medicationData[medId].frequency,
                    category: medicationData[medId].category
                  }))}
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
