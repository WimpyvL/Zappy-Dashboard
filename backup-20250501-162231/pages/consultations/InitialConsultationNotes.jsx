import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { toast } from 'react-toastify';
import { useServices } from '../../apis/services/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useProducts } from '../../apis/products/hooks';
import { useCreateConsultation } from '../../apis/consultations/hooks';
import { User, Loader2, AlertTriangle } from 'lucide-react';

// Import the new section components
import PatientInfoSection from './components/PatientInfoSection';
import ServiceMedicationOrderSection from './components/ServiceMedicationOrderSection';
import CommunicationSection from './components/CommunicationSection';

const InitialConsultationNotes = ({
  patient,
  onClose,
  consultationData,
  consultationId,
  readOnly = false,
  updateStatusMutation,
}) => {
  // Instantiate the create mutation hook
  const createConsultationMutation = useCreateConsultation({
    onSuccess: () => {
      toast.success("Consultation submitted successfully!");
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Error creating new consultation:", error);
      // Toast handled in hook
    }
  });

  // --- Data Fetching --- (Keep hooks for data needed by sub-components)
  const { /* data: _servicesData, */ isLoading: isLoadingServices, error: errorServices } = useServices(); // Removed unused var
  const { /* data: _plansData, */ isLoading: isLoadingPlans, error: errorPlans } = useSubscriptionPlans(); // Removed unused var
  const { data: productsData, isLoading: isLoadingProducts, error: errorProducts } = useProducts();

  // --- Process Fetched Data --- (Keep processing needed for props)
  // Using mock data temporarily as per original code - replace when hooks are confirmed
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
  const allServices = mockServicesWithPlans; // Use mock
  const allPlans = mockAllPlans; // Use mock
  // Wrap allProducts initialization in useMemo
  const allProducts = useMemo(() => productsData?.data || productsData || [], [productsData]);


  // --- State Hooks --- (Keep all state here, pass setters down)
  const [hpi, setHpi] = useState('');
  const [pmh, setPmh] = useState('');
  const [contraindications, setContraindications] = useState('No known contra-indications for GLP-1 therapy...');
  const [selectedServiceId, setSelectedServiceId] = useState(1);
  const [treatmentApproach, setTreatmentApproach] = useState('Maintenance');
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [messageToPatient, setMessageToPatient] = useState('Continue medication as prescribed, diet and exercise');
  const [assessmentPlan, setAssessmentPlan] = useState('Obesity with good response to [Medication], continue treatment');
  const [followUpPlan, setFollowUpPlan] = useState('Monthly');
  const [expandedMessage, setExpandedMessage] = useState(`Dear Patient, ... [Your full message template]`);
  const [expandedAssessment, setExpandedAssessment] = useState(`[Patient Age/Gender]... [Your full assessment template]`);

  // --- Template Data --- (Keep here, pass down)
  const assessmentTemplates = [
    { id: 't1', name: 'Std. Maint.', text: 'Obesity stable on [Medication]. Continue current dose. Monitor weight monthly. Follow up in 3 months.' },
    { id: 't2', name: 'Escalate', text: 'Patient tolerating [Medication] well, weight loss plateaued. Escalate dose to [New Dose]. Counsel on potential side effects. Follow up in 1 month.' },
    { id: 't3', name: 'New Pt.', text: 'New patient with BMI [BMI]. Initiate [Medication] at starting dose. Discussed diet/exercise plan. Titrate dose as tolerated. Follow up in 2 weeks.' },
  ];
  const messageTemplates = [
    { id: 'm1', name: 'Continue Rx', text: 'Continue current medication as prescribed. Maintain diet and exercise. Follow up as scheduled.' },
    { id: 'm2', name: 'Dose Change', text: 'We are adjusting your medication dose to [New Dose]. Please follow the updated instructions. Contact us with any questions. Follow up in [Timeframe].' },
    { id: 'm3', name: 'Consult Approved', text: 'Your consultation has been reviewed and approved. Your prescription will be sent to the pharmacy. Please allow 24-48 hours for processing. Follow up as needed.' },
  ];

  // --- Derived Data & Effects ---
  // Wrap getServiceById in useCallback
  const getServiceById = React.useCallback((id) => allServices.find((s) => s.id === id), [allServices]);
  // Wrap getServicePlans in useCallback
  const getServicePlans = React.useCallback((serviceId) => {
    const service = getServiceById(serviceId);
    return Array.isArray(service?.availablePlans) ? service.availablePlans : [];
  }, [getServiceById]); // Dependency is now stable

  // Now use the useCallback version in useMemo dependency

  // Now use the useCallback version in useMemo dependency
  const plansForSelectedService = useMemo(() => getServicePlans(selectedServiceId), [selectedServiceId, getServicePlans]);

  const availableMedications = useMemo(() => allProducts.filter(
    (p) => p.type === 'medication' && Array.isArray(p.doses) && p.doses.length > 0
  ), [allProducts]); // Memoize derived data

  // Effect to populate form from consultationData or reset
  useEffect(() => {
    if (consultationData) {
      // Populate state from consultationData... (same logic as before)
      setHpi(consultationData.notes?.hpi || '');
      setPmh(consultationData.notes?.pmh || '');
      setContraindications(consultationData.notes?.contraindications || 'No known contra-indications for GLP-1 therapy...');
      setSelectedServiceId(consultationData.medicationOrder?.serviceId || 1);
      setTreatmentApproach(consultationData.medicationOrder?.treatmentApproach || 'Maintenance');
      setSelectedMedications(Array.isArray(consultationData.medicationOrder?.selectedMedications) ? consultationData.medicationOrder.selectedMedications.map(med => ({ productId: med.productId || med.id, doseId: med.doseId, planId: med.planId })) : []);
      setMessageToPatient(consultationData.communication?.messageToPatient || 'Continue medication as prescribed, diet and exercise');
      setAssessmentPlan(consultationData.communication?.assessmentPlan || 'Obesity with good response to [Medication], continue treatment');
      setFollowUpPlan(consultationData.communication?.followUpPlan || 'Monthly');
      setExpandedMessage(consultationData.communication?.expandedMessage || `Dear Patient, ... [Your full message template]`);
      setExpandedAssessment(consultationData.communication?.expandedAssessment || `[Patient Age/Gender]... [Your full assessment template]`);
    } else {
      // Reset state for new consultation... (same logic as before)
      setHpi('');
      setPmh('');
      setContraindications('No known contra-indications for GLP-1 therapy...');
      setSelectedServiceId(1);
      setTreatmentApproach('Maintenance');
      setSelectedMedications([]);
      setMessageToPatient('Continue medication as prescribed, diet and exercise');
      setAssessmentPlan('Obesity with good response to [Medication], continue treatment');
      const defaultService = getServiceById(1);
      setFollowUpPlan(defaultService?.recommendedFollowUp || 'Monthly');
      setExpandedMessage(`Dear Patient, ... [Your full message template]`);
      setExpandedAssessment(`[Patient Age/Gender]... [Your full assessment template]`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, consultationData]); // Dependencies remain the same

  // --- Event Handlers --- (Keep handlers here, pass down)
  const handleServiceChange = (e) => {
    const newServiceId = parseInt(e.target.value);
    setSelectedServiceId(newServiceId);
    setSelectedMedications([]);
    const selectedService = getServiceById(newServiceId);
    setFollowUpPlan(selectedService?.recommendedFollowUp || 'Monthly');
  };

  const handleMedicationSelectionChange = (product) => {
    if (readOnly || !product || !Array.isArray(product.doses) || product.doses.length === 0) return;
    setSelectedMedications((prevSelected) => {
      const isSelected = prevSelected.some((m) => m.productId === product.id);
      if (isSelected) {
        return prevSelected.filter((m) => m.productId !== product.id);
      } else {
        const productDetail = availableMedications.find(p => p.id === product.id);
        const defaultDoseId = productDetail?.doses[0]?.id;
        const defaultPlanId = plansForSelectedService.length > 0 ? plansForSelectedService[0].planId : null;
        if (defaultDoseId !== undefined) {
          return [...prevSelected, { productId: product.id, doseId: defaultDoseId, planId: defaultPlanId }];
        }
        return prevSelected;
      }
    });
  };

  const handleDosageChange = (productId, newDoseId) => {
    if (readOnly) return;
    const doseIdNumber = parseInt(newDoseId);
    setSelectedMedications((prevSelected) =>
      prevSelected.map((med) => med.productId === productId ? { ...med, doseId: doseIdNumber } : med)
    );
  };

  const handlePlanChangeForMedication = (productId, newPlanId) => {
    if (readOnly) return;
    setSelectedMedications((prevSelected) =>
      prevSelected.map((med) => med.productId === productId ? { ...med, planId: newPlanId ? parseInt(newPlanId) : null } : med)
    );
  };

  // --- Save/Submit Handlers --- (Keep logic here)
  const handleSave = () => {
    // ... (Save logic remains the same, using current state) ...
     const saveData = {
      consultationId: consultationId,
      patientId: patient?.id,
      patientInfo: { hpi, pmh, contraindications },
      medicationOrder: { serviceId: selectedServiceId, treatmentApproach, selectedMedications },
      communication: { messageToPatient, assessmentPlan, followUpPlan, expandedMessage, expandedAssessment },
    };
    console.log('Saving note with data:', saveData);
    toast.success('Note saved successfully! (Placeholder)');
    if (onClose) onClose();
  };

  const handleSubmit = async () => {
    const currentConsultationId = consultationData?.id || consultationId;
    const submissionPayload = {
      patientId: patient?.id,
      patientInfo: { hpi, pmh, contraindications },
      medicationOrder: { serviceId: selectedServiceId, treatmentApproach, selectedMedications },
      communication: { messageToPatient, assessmentPlan, followUpPlan, expandedMessage, expandedAssessment },
    };

    if (currentConsultationId) {
      // --- Logic for EXISTING consultation (Approve/Invoice) ---
      console.log(`Approving/Invoicing existing consultation ${currentConsultationId}:`, submissionPayload);
      try {
        const response = await fetch(`/api/consultations/${currentConsultationId}/approve-and-invoice`, { /* ... fetch options ... */ });
        if (!response.ok) { /* ... error handling ... */ }
        toast.success("Consultation approved successfully! An invoice will be sent to the patient.");
        if (onClose) onClose();
      } catch (error) { /* ... error handling ... */ }
    } else {
      // --- Logic for NEW consultation (Create) ---
      console.log("Creating new consultation:", submissionPayload);
      try {
        const apiPayload = {
          patient_id: submissionPayload.patientId,
          consultation_type: getServiceById(submissionPayload.medicationOrder?.serviceId)?.name || 'Unknown',
          status: 'pending',
          client_notes: JSON.stringify(submissionPayload.patientInfo),
          provider_notes: JSON.stringify({
            treatmentApproach: submissionPayload.medicationOrder?.treatmentApproach,
            selectedMedications: submissionPayload.medicationOrder?.selectedMedications,
            assessmentPlan: submissionPayload.communication?.assessmentPlan,
            followUpPlan: submissionPayload.communication?.followUpPlan,
            messageToPatient: submissionPayload.communication?.messageToPatient,
            expandedAssessment: submissionPayload.communication?.expandedAssessment,
            expandedMessage: submissionPayload.communication?.expandedMessage,
          }),
          submitted_at: new Date().toISOString(),
        };
        console.log("Calling createConsultationMutation with payload:", apiPayload);
        createConsultationMutation.mutate(apiPayload);
        // onSuccess/onError/onClose handled by the mutation hook setup
      } catch (error) {
        console.error("Error creating new consultation:", error);
        toast.error(`Error: ${error.message || 'Could not create consultation.'}`);
      }
    }
  };

  const handleEdit = () => {
    if (!updateStatusMutation || !consultationId) { /* ... error handling ... */ return; }
    updateStatusMutation.mutate(
      { consultationId: consultationId, status: 'pending' },
      { onSuccess: () => { /* ... */ }, onError: (error) => { /* ... */ } }
    );
  };

  // --- Loading & Error States ---
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
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-700 px-6 py-4 text-white flex-shrink-0">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{patient?.name || 'Patient Name'} - Initial Consultation</h2>
            <div className="text-sm opacity-80">DOB: {patient?.dob || 'YYYY-MM-DD'}</div>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className="md:w-2/5 p-6 border-r border-gray-200">
            <PatientInfoSection
              hpi={hpi}
              pmh={pmh}
              contraindications={contraindications}
              onHpiChange={setHpi}
              onPmhChange={setPmh}
              onContraindicationsChange={setContraindications}
              readOnly={readOnly}
            />
          </div>

          {/* Right Panel */}
          <div className="md:w-3/5 p-4">
            <ServiceMedicationOrderSection
              allServices={allServices}
              allProducts={allProducts}
              allPlans={allPlans}
              selectedServiceId={selectedServiceId}
              treatmentApproach={treatmentApproach}
              selectedMedications={selectedMedications}
              plansForSelectedService={plansForSelectedService}
              availableMedications={availableMedications}
              onServiceChange={(e) => handleServiceChange(e)} // Pass event directly
              onTreatmentApproachChange={setTreatmentApproach}
              onMedicationSelectionChange={handleMedicationSelectionChange}
              onDosageChange={handleDosageChange}
              onPlanChangeForMedication={handlePlanChangeForMedication}
              readOnly={readOnly}
            />
            <CommunicationSection
              messageToPatient={messageToPatient}
              assessmentPlan={assessmentPlan}
              followUpPlan={followUpPlan}
              expandedMessage={expandedMessage}
              expandedAssessment={expandedAssessment}
              messageTemplates={messageTemplates}
              assessmentTemplates={assessmentTemplates}
              onMessageChange={setMessageToPatient}
              onAssessmentChange={setAssessmentPlan}
              onFollowUpChange={setFollowUpPlan}
              onExpandedMessageChange={setExpandedMessage}
              onExpandedAssessmentChange={setExpandedAssessment}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-white flex-shrink-0">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={onClose}>
          {readOnly ? 'Close' : 'Cancel'}
        </button>
        {readOnly && consultationData?.status !== 'archived' && (
           <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700" onClick={handleEdit} disabled={updateStatusMutation?.isLoading}>
             {updateStatusMutation?.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} Edit
           </button>
        )}
        {!readOnly && (
          <>
            <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700" onClick={handleSave}>
              Save Note
            </button>
            <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={createConsultationMutation.isLoading}>
              {createConsultationMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InitialConsultationNotes;
