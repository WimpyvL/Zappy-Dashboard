import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useServices } from "../apis/services/hooks";
import { useSubscriptionPlans } from "../apis/subscriptionPlans/hooks";
import { useProducts } from "../apis/products/hooks";
import {
  useCreateConsultation,
  useUpdateConsultation,
  useUpdateConsultationStatus, // Import status update hook
} from "../apis/consultations/hooks";

// Mock data (replace with actual hook data when available and structure confirmed)
const mockServicesWithPlans = [
  { id: 1, name: 'Weight Management Program', availablePlans: [{ planId: 101, duration: 'Monthly', requiresSubscription: true }, { planId: 102, duration: 'Quarterly', requiresSubscription: true }], recommendedFollowUp: 'Monthly' },
  { id: 2, name: 'HRT Consultation', availablePlans: [{ planId: 201, duration: 'One-Time', requiresSubscription: false }], recommendedFollowUp: '6_months' },
  { id: 3, name: 'General Wellness Check', availablePlans: [], recommendedFollowUp: '12_months' },
];
const mockAllPlans = [
    { id: 101, name: 'Monthly Weight Loss Plan', price: 199.00 },
    { id: 102, name: 'Quarterly Weight Loss Plan', price: 549.00 },
    { id: 201, name: 'HRT Consult Fee', price: 150.00 },
];

export const useConsultationNotesForm = (patient, consultationData, consultationId, onClose) => {
  // --- Data Fetching ---
  const { data: servicesData, isLoading: isLoadingServices, error: errorServices } = useServices();
  const { data: plansData, isLoading: isLoadingPlans, error: errorPlans } = useSubscriptionPlans();
  const { data: productsData, isLoading: isLoadingProducts, error: errorProducts } = useProducts();

  // --- Process Fetched Data ---
  // Replace mocks when hooks provide real data
  const allServices = useMemo(() => servicesData?.data || mockServicesWithPlans, [servicesData]);
  const allPlans = useMemo(() => plansData?.data || mockAllPlans, [plansData]);
  const allProducts = useMemo(() => productsData?.data || productsData || [], [productsData]); // Handle potential direct array response

  // --- State Hooks ---
  const [hpi, setHpi] = useState('');
  const [pmh, setPmh] = useState('');
  const [contraindications, setContraindications] = useState('No known contra-indications for GLP-1 therapy...');
  const [selectedServiceId, setSelectedServiceId] = useState(1);
  const [treatmentApproach, setTreatmentApproach] = useState('Maintenance');
  const [selectedMedications, setSelectedMedications] = useState([]); // Format: { productId, doseId, planId }
  const [messageToPatient, setMessageToPatient] = useState('Continue medication as prescribed, diet and exercise');
  const [assessmentPlan, setAssessmentPlan] = useState('Obesity with good response to [Medication], continue treatment');
  const [followUpPlan, setFollowUpPlan] = useState('Monthly');
  const [expandedMessage, setExpandedMessage] = useState(`Dear Patient, ... [Your full message template]`);
  const [expandedAssessment, setExpandedAssessment] = useState(`[Patient Age/Gender]... [Your full assessment template]`);
  const [isReadOnly, setIsReadOnly] = useState(false); // Internal read-only state

  // --- Mutations ---
  const createConsultationMutation = useCreateConsultation({
    onSuccess: (data) => {
      toast.success("Consultation submitted successfully!");
      if (onClose) onClose(data); // Pass created data back if needed
    },
    onError: (error) => {
      console.error("Error creating new consultation:", error);
      // Toast likely handled globally or within the hook itself
    }
  });

  const updateConsultationMutation = useUpdateConsultation({
     onSuccess: (data) => {
       toast.success("Consultation updated successfully!");
       if (onClose) onClose(data); // Pass updated data back if needed
     },
     onError: (error) => {
       console.error("Error updating consultation:", error);
       // Toast likely handled globally or within the hook itself
     }
  });

  // Mutation specifically for unlocking (changing status to pending)
  const updateStatusMutationForUnlock = useUpdateConsultationStatus({
    onSuccess: () => {
      toast.success("Consultation unlocked for editing.");
      setIsReadOnly(false); // Update internal state immediately
      // Optionally refetch the main consultation data if needed after status change
      // This depends on how the parent component gets consultationData
    },
    onError: (error) => {
      toast.error(
        `Failed to unlock for editing: ${error.message || "Unknown error"}`
      );
    },
  });

  // --- Derived Data & Helpers ---
  const getServiceById = useCallback((id) => {
    const serviceIdNumber = parseInt(id);
    return allServices.find((s) => s.id === serviceIdNumber);
  }, [allServices]);

  const getServicePlans = useCallback((serviceId) => {
    const service = getServiceById(serviceId);
    // Ensure availablePlans is always an array
    return Array.isArray(service?.availablePlans) ? service.availablePlans : [];
  }, [getServiceById]);

  const plansForSelectedService = useMemo(() => getServicePlans(selectedServiceId), [selectedServiceId, getServicePlans]);

  const availableMedications = useMemo(() => allProducts.filter(
    (p) => p.type === 'medication' && Array.isArray(p.doses) && p.doses.length > 0
  ), [allProducts]);

  // --- Effects ---
  // Effect to populate form from consultationData or reset
  useEffect(() => {
    const currentReadOnly = consultationData?.status === 'reviewed' || consultationData?.status === 'archived';
    setIsReadOnly(currentReadOnly);

    if (consultationData) {
      // Safely access nested properties
      const notes = consultationData.notes || consultationData.client_notes || {}; // Adjust based on actual data structure
      const medicationOrder = consultationData.medicationOrder || {}; // Adjust based on actual data structure
      const communication = consultationData.communication || {}; // Adjust based on actual data structure
      const providerNotes = consultationData.provider_notes || {}; // Adjust based on actual data structure

      // Attempt to parse JSON strings if necessary
      const parsedNotes = typeof notes === 'string' ? JSON.parse(notes || '{}') : notes;
      const parsedProviderNotes = typeof providerNotes === 'string' ? JSON.parse(providerNotes || '{}') : providerNotes;

      setHpi(parsedNotes.hpi || '');
      setPmh(parsedNotes.pmh || '');
      setContraindications(parsedNotes.contraindications || 'No known contra-indications for GLP-1 therapy...');

      // Use service_id if available, fallback to medicationOrder.serviceId
      setSelectedServiceId(consultationData.service_id || medicationOrder.serviceId || 1);
      setTreatmentApproach(parsedProviderNotes.treatmentApproach || medicationOrder.treatmentApproach || 'Maintenance');

      // Handle selected medications carefully, checking array type and mapping properties
      const meds = parsedProviderNotes.selectedMedications || medicationOrder.selectedMedications;
      setSelectedMedications(Array.isArray(meds) ? meds.map(med => ({
          productId: med.productId || med.id, // Allow for different property names
          doseId: med.doseId,
          planId: med.planId
      })) : []);

      setMessageToPatient(parsedProviderNotes.messageToPatient || communication.messageToPatient || 'Continue medication as prescribed, diet and exercise');
      setAssessmentPlan(parsedProviderNotes.assessmentPlan || communication.assessmentPlan || 'Obesity with good response to [Medication], continue treatment');
      setFollowUpPlan(parsedProviderNotes.followUpPlan || communication.followUpPlan || 'Monthly');
      setExpandedMessage(parsedProviderNotes.expandedMessage || communication.expandedMessage || `Dear Patient, ... [Your full message template]`);
      setExpandedAssessment(parsedProviderNotes.expandedAssessment || communication.expandedAssessment || `[Patient Age/Gender]... [Your full assessment template]`);

    } else {
      // Reset state for new consultation
      setHpi('');
      setPmh('');
      setContraindications('No known contra-indications for GLP-1 therapy...');
      setSelectedServiceId(1); // Default service
      setTreatmentApproach('Maintenance');
      setSelectedMedications([]);
      setMessageToPatient('Continue medication as prescribed, diet and exercise');
      setAssessmentPlan('Obesity with good response to [Medication], continue treatment');
      const defaultService = getServiceById(1);
      setFollowUpPlan(defaultService?.recommendedFollowUp || 'Monthly');
      setExpandedMessage(`Dear Patient, ... [Your full message template]`);
      setExpandedAssessment(`[Patient Age/Gender]... [Your full assessment template]`);
    }
  }, [patient, consultationData, getServiceById]); // Add getServiceById dependency

  // --- Event Handlers ---
  const handleServiceChange = useCallback((e) => {
    if (isReadOnly) return;
    const newServiceId = parseInt(e.target.value);
    setSelectedServiceId(newServiceId);
    setSelectedMedications([]); // Reset meds when service changes
    const selectedService = getServiceById(newServiceId);
    setFollowUpPlan(selectedService?.recommendedFollowUp || 'Monthly');
  }, [isReadOnly, getServiceById]);

  const handleMedicationSelectionChange = useCallback((product) => {
    if (isReadOnly || !product || !Array.isArray(product.doses) || product.doses.length === 0) return;
    setSelectedMedications((prevSelected) => {
      const isSelected = prevSelected.some((m) => m.productId === product.id);
      if (isSelected) {
        return prevSelected.filter((m) => m.productId !== product.id);
      } else {
        // Find the detailed product info again to ensure doses are available
        const productDetail = availableMedications.find(p => p.id === product.id);
        const defaultDoseId = productDetail?.doses[0]?.id;
        const defaultPlanId = plansForSelectedService.length > 0 ? plansForSelectedService[0].planId : null;
        if (defaultDoseId !== undefined) {
          return [...prevSelected, { productId: product.id, doseId: defaultDoseId, planId: defaultPlanId }];
        }
        console.warn("Could not add medication - no default dose found for:", product.name);
        return prevSelected; // Return previous state if no valid dose
      }
    });
  }, [isReadOnly, availableMedications, plansForSelectedService]);

  const handleDosageChange = useCallback((productId, newDoseId) => {
    if (isReadOnly) return;
    const doseIdNumber = parseInt(newDoseId);
    if (isNaN(doseIdNumber)) return; // Prevent NaN
    setSelectedMedications((prevSelected) =>
      prevSelected.map((med) => med.productId === productId ? { ...med, doseId: doseIdNumber } : med)
    );
  }, [isReadOnly]);

  const handlePlanChangeForMedication = useCallback((productId, newPlanId) => {
    if (isReadOnly) return;
    setSelectedMedications((prevSelected) =>
      prevSelected.map((med) => med.productId === productId ? { ...med, planId: newPlanId ? parseInt(newPlanId) : null } : med)
    );
  }, [isReadOnly]);

  // --- Form Submission Logic ---
  const getSubmissionPayload = useCallback(() => {
     // Construct payload from current state
     const patientInfo = { hpi, pmh, contraindications };
     const medicationOrder = { serviceId: selectedServiceId, treatmentApproach, selectedMedications };
     const communication = { messageToPatient, assessmentPlan, followUpPlan, expandedMessage, expandedAssessment };

     // Structure for API (adjust based on actual API requirements)
     const apiPayload = {
       patient_id: patient?.id,
       consultation_type: getServiceById(medicationOrder.serviceId)?.name || 'Unknown',
       status: consultationData?.status || 'pending', // Keep existing status or default to pending
       client_notes: JSON.stringify(patientInfo),
       provider_notes: JSON.stringify({
         treatmentApproach: medicationOrder.treatmentApproach,
         selectedMedications: medicationOrder.selectedMedications,
         assessmentPlan: communication.assessmentPlan,
         followUpPlan: communication.followUpPlan,
         messageToPatient: communication.messageToPatient,
         expandedAssessment: communication.expandedAssessment,
         expandedMessage: communication.expandedMessage,
       }),
       // Include submitted_at only for new consultations? API might handle this.
       // submitted_at: consultationId ? undefined : new Date().toISOString(),
       // service_id: medicationOrder.serviceId, // REMOVED: Column does not exist in consultations table
     };
     return apiPayload;
  }, [
      patient?.id, hpi, pmh, contraindications, selectedServiceId, treatmentApproach,
      selectedMedications, messageToPatient, assessmentPlan, followUpPlan,
      expandedMessage, expandedAssessment, getServiceById, consultationData?.status
  ]);

  const handleSave = useCallback(() => {
    if (!consultationId) {
        toast.error("Cannot save note for a new consultation. Please submit first.");
        return;
    }
    const payload = getSubmissionPayload();
    console.log('Saving note (updating consultation) with data:', payload);
    updateConsultationMutation.mutate({ consultationId, ...payload });
    // onSuccess/onError handled by mutation setup
  }, [consultationId, getSubmissionPayload, updateConsultationMutation]);

  const handleSubmit = useCallback(() => {
    const payload = getSubmissionPayload();
    if (consultationId) {
      // Logic for updating/approving EXISTING consultation
      // This might involve changing status or other specific actions
      // For now, let's assume 'submit' on existing means 'update'
      console.log(`Updating existing consultation ${consultationId}:`, payload);
      updateConsultationMutation.mutate({ consultationId, ...payload });
    } else {
      // Logic for creating NEW consultation
      console.log("Creating new consultation:", payload);
      createConsultationMutation.mutate(payload);
    }
    // onSuccess/onError/onClose handled by mutation setup
  }, [
    consultationId,
    getSubmissionPayload,
    createConsultationMutation,
    updateConsultationMutation,
  ]);

  const handleEnableEditing = useCallback(() => {
    if (!consultationId) {
      toast.error("Cannot enable editing for a new consultation.");
      return;
    }
    console.log(`Requesting edit unlock for consultation ${consultationId}`);
    updateStatusMutationForUnlock.mutate({ consultationId, status: "pending" });
  }, [consultationId, updateStatusMutationForUnlock]);

  // --- Loading & Error States ---
  const isLoading = isLoadingServices || isLoadingPlans || isLoadingProducts;
  const error = errorServices || errorPlans || errorProducts;
  const isSubmitting = createConsultationMutation.isLoading || updateConsultationMutation.isLoading;

  // --- Return Values ---
  return {
    // State Values
    hpi,
    pmh,
    contraindications,
    selectedServiceId,
    treatmentApproach,
    selectedMedications,
    messageToPatient,
    assessmentPlan,
    followUpPlan,
    expandedMessage,
    expandedAssessment,
    isReadOnly,

    // Setters
    setHpi,
    setPmh,
    setContraindications,
    // setSelectedServiceId, // Handled by handleServiceChange
    setTreatmentApproach,
    // setSelectedMedications, // Handled by specific handlers
    setMessageToPatient,
    setAssessmentPlan,
    setFollowUpPlan,
    setExpandedMessage,
    setExpandedAssessment,
    setIsReadOnly, // Allow external control if needed, e.g., for edit unlock

    // Handlers
    handleServiceChange,
    handleMedicationSelectionChange,
    handleDosageChange,
    handlePlanChangeForMedication,
    handleSave,
    handleSubmit,

    // Processed Data
    allServices,
    allProducts,
    allPlans,
    plansForSelectedService,
    availableMedications,

    // Loading/Error/Mutation States
    isLoading,
    error,
    isSubmitting,
    isUnlocking: updateStatusMutationForUnlock.isLoading, // Loading state for unlock action
    // Expose mutations if needed externally, though handlers are preferred
    // createConsultationMutation,
    // updateConsultationMutation,

    // Handler for unlocking
    handleEnableEditing,
  };
};
