import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Import toast
// Removed useAppContext import
import { useServices } from '../../apis/services/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useProducts } from '../../apis/products/hooks';
import { User, Loader2, AlertTriangle } from 'lucide-react'; // Removed unused Check import

const InitialConsultationNotes = ({
  patient,
  onClose,
  consultationData, // Existing consultation data if editing/viewing
  consultationId, // ID of the consultation if editing
  readOnly = false,
  updateStatusMutation, // Accept the mutation hook
  // TODO: Pass mutation hooks for saving/submitting if this component handles it
  // onSaveNote, // Example: function to call mutation hook
  // onSubmitConsultation, // Example: function to call mutation hook
}) => {
  // console.log('Refining product/dose selection state'); // Removed log

  // Fetch necessary data using React Query hooks
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices();
  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: errorPlans,
  } = useSubscriptionPlans();
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useProducts();

  // --- TEMPORARY MOCK DATA FOR TESTING ---
  // TODO: Remove this when useServices hook provides correct data structure
  const mockServicesWithPlans = [
    { id: 1, name: 'Weight Management Program', availablePlans: [{ planId: 101, duration: 'Monthly', requiresSubscription: true }, { planId: 102, duration: 'Quarterly', requiresSubscription: true }], recommendedFollowUp: 'Monthly' }, // Added recommendedFollowUp
    { id: 2, name: 'HRT Consultation', availablePlans: [{ planId: 201, duration: 'One-Time', requiresSubscription: false }], recommendedFollowUp: '6_months' }, // Added recommendedFollowUp
    { id: 3, name: 'General Wellness Check', availablePlans: [], recommendedFollowUp: '12_months' }, // Added recommendedFollowUp
  ];
  const mockAllPlans = [
      { id: 101, name: 'Monthly Weight Loss Plan', price: 199.00 },
      { id: 102, name: 'Quarterly Weight Loss Plan', price: 549.00 },
      { id: 201, name: 'HRT Consult Fee', price: 150.00 },
  ];
  // --- END TEMPORARY MOCK DATA ---

  // Process fetched data (Using mock data for services/plans temporarily)
  // const allServices = servicesData?.data || servicesData || []; // Original
  // const allPlans = plansData?.data || plansData || []; // Original
  const allServices = mockServicesWithPlans; // Use mock
  const allPlans = mockAllPlans; // Use mock
  const allProducts = productsData?.data || productsData || [];

  // --- State Hooks ---
  const [hpi, setHpi] = useState('');
  const [pmh, setPmh] = useState('');
  const [contraindications, setContraindications] = useState(
    'No known contra-indications for GLP-1 therapy...'
  );
  const [selectedServiceId, setSelectedServiceId] = useState(1); // Default or load
  const [treatmentApproach, setTreatmentApproach] = useState('Maintenance');
  const [selectedMedications, setSelectedMedications] = useState([]); // Array of { productId, doseId, planId }
  const [messageToPatient, setMessageToPatient] = useState(
    'Continue medication as prescribed, diet and exercise'
  );
  const [assessmentPlan, setAssessmentPlan] = useState(
    'Obesity with good response to [Medication], continue treatment' // Placeholder
  );
  const [followUpPlan, setFollowUpPlan] = useState('Monthly');
  const [expandedMessage, setExpandedMessage] = useState(
    `Dear Patient, ... [Your full message template]`
  );
  const [expandedAssessment, setExpandedAssessment] = useState(
    `[Patient Age/Gender]... [Your full assessment template]`
  );
  // --- Temporary State for Testing Template Buttons ---
  const [showAssessmentTemplates, setShowAssessmentTemplates] = useState(true); // Hardcoded true for testing

  // --- Template Data ---
  const assessmentTemplates = [
    { id: 't1', name: 'Std. Maint.', text: 'Obesity stable on [Medication]. Continue current dose. Monitor weight monthly. Follow up in 3 months.' },
    { id: 't2', name: 'Escalate', text: 'Patient tolerating [Medication] well, weight loss plateaued. Escalate dose to [New Dose]. Counsel on potential side effects. Follow up in 1 month.' },
    { id: 't3', name: 'New Pt.', text: 'New patient with BMI [BMI]. Initiate [Medication] at starting dose. Discussed diet/exercise plan. Titrate dose as tolerated. Follow up in 2 weeks.' },
  ];

  // --- Template Data for Patient Message ---
  const messageTemplates = [
    { id: 'm1', name: 'Continue Rx', text: 'Continue current medication as prescribed. Maintain diet and exercise. Follow up as scheduled.' },
    { id: 'm2', name: 'Dose Change', text: 'We are adjusting your medication dose to [New Dose]. Please follow the updated instructions. Contact us with any questions. Follow up in [Timeframe].' },
    { id: 'm3', name: 'Consult Approved', text: 'Your consultation has been reviewed and approved. Your prescription will be sent to the pharmacy. Please allow 24-48 hours for processing. Follow up as needed.' },
  ];
  // --- Temporary State for Testing Template Buttons ---
  const [showPatientMessageTemplates, setShowPatientMessageTemplates] = useState(true); // Hardcoded true for testing


  // --- Derived Data & Effects ---

  // Replace context functions with direct data manipulation
  const getServiceById = (id) => allServices.find((s) => s.id === id);
  const getServicePlans = (serviceId) => {
    const service = getServiceById(serviceId);
    // Assuming service.availablePlans holds plan configurations { planId, duration, requiresSubscription }
    return Array.isArray(service?.availablePlans) ? service.availablePlans : [];
  };

  // const selectedService = getServiceById(selectedServiceId); // Removed unused variable
  const plansForSelectedService = getServicePlans(selectedServiceId);
  // --- DEBUG LOGS for Plan Dropdown ---
  // console.log("All Services Data:", allServices); // Removed log
  // console.log("Selected Service ID:", selectedServiceId); // Removed log
  // console.log("Derived Plans for Service:", plansForSelectedService); // Removed log
  // --- END DEBUG LOGS ---

  // Filter available medication products
  const availableMedications = allProducts.filter(
    (p) =>
      p.type === 'medication' && Array.isArray(p.doses) && p.doses.length > 0
    // TODO: Add filtering based on selectedServiceId if needed
  );

  useEffect(() => {
    // Populate initial patient info
    if (patient) {
      setHpi(patient.hpi || '');
      setPmh(patient.pmh || '');
    }
    // Populate from existing consultation data if provided
    if (consultationData) {
      setHpi(consultationData.notes?.hpi || '');
      setPmh(consultationData.notes?.pmh || '');
      setContraindications(
        consultationData.notes?.contraindications || 'No known contra-indications for GLP-1 therapy...'
      );
      setSelectedServiceId(
        consultationData.medicationOrder?.serviceId || 1
      );
      setTreatmentApproach(
        consultationData.medicationOrder?.treatmentApproach || 'Maintenance'
      );
      setSelectedMedications(
        Array.isArray(consultationData.medicationOrder?.selectedMedications)
          ? consultationData.medicationOrder.selectedMedications.map((med) => ({
              productId: med.productId || med.id,
              doseId: med.doseId,
              planId: med.planId,
            }))
          : []
      );
      setMessageToPatient(
        consultationData.communication?.messageToPatient || 'Continue medication as prescribed, diet and exercise'
      );
      setAssessmentPlan(
        consultationData.communication?.assessmentPlan || 'Obesity with good response to [Medication], continue treatment'
      );
      setFollowUpPlan(
        consultationData.communication?.followUpPlan || 'Monthly'
      );
       // Set expanded states based on consultation data if available
       setExpandedMessage(consultationData.communication?.expandedMessage || `Dear Patient, ... [Your full message template]`);
       setExpandedAssessment(consultationData.communication?.expandedAssessment || `[Patient Age/Gender]... [Your full assessment template]`);
    } else {
         // Reset to defaults if no consultationData (e.g., for new consultation)
         setHpi('');
         setPmh('');
         setContraindications('No known contra-indications for GLP-1 therapy...');
         setSelectedServiceId(1);
         setTreatmentApproach('Maintenance');
         setSelectedMedications([]);
         setMessageToPatient('Continue medication as prescribed, diet and exercise');
         setAssessmentPlan('Obesity with good response to [Medication], continue treatment');
         // Set initial follow-up based on default service (ID 1)
         const defaultService = getServiceById(1);
         setFollowUpPlan(defaultService?.recommendedFollowUp || 'Monthly');
         setExpandedMessage(`Dear Patient, ... [Your full message template]`);
         setExpandedAssessment(`[Patient Age/Gender]... [Your full assessment template]`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, consultationData]); // Rerun only when patient or consultationData changes


  // --- Event Handlers --- (Remain largely the same, but rely on fetched data)
  const handleServiceChange = (e) => {
    const newServiceId = parseInt(e.target.value);
    setSelectedServiceId(newServiceId);
    setSelectedMedications([]); // Reset selected meds when service changes

    // Update follow-up plan based on the new service
    const selectedService = getServiceById(newServiceId);
    if (selectedService && selectedService.recommendedFollowUp) {
      setFollowUpPlan(selectedService.recommendedFollowUp);
    } else {
      setFollowUpPlan('Monthly'); // Default if not specified
    }
  };

  const handleMedicationSelectionChange = (product) => {
    if (
      readOnly ||
      !product ||
      !Array.isArray(product.doses) ||
      product.doses.length === 0
    )
      return;
    setSelectedMedications((prevSelected) => {
      const isSelected = prevSelected.some((m) => m.productId === product.id);
      if (isSelected) {
        return prevSelected.filter((m) => m.productId !== product.id);
      } else {
        // Find the product details from the mock/fetched data
         const productDetail = availableMedications.find(p => p.id === product.id);
         const defaultDoseId = productDetail?.doses[0]?.id; // Get first dose ID safely

        const defaultPlanId =
          plansForSelectedService.length > 0
            ? plansForSelectedService[0].planId
            : null;
        // Only add if we found a default dose
        if (defaultDoseId !== undefined) {
            return [
              ...prevSelected,
              {
                productId: product.id,
                doseId: defaultDoseId,
                planId: defaultPlanId,
              },
            ];
        }
        return prevSelected; // Return previous state if no dose found
      }
    });
  };

  const handleDosageChange = (productId, newDoseId) => {
    if (readOnly) return;
    const doseIdNumber = parseInt(newDoseId);
    setSelectedMedications((prevSelected) =>
      prevSelected.map((med) =>
        med.productId === productId ? { ...med, doseId: doseIdNumber } : med
      )
    );
  };

  const handlePlanChangeForMedication = (productId, newPlanId) => {
    if (readOnly) return;
    setSelectedMedications((prevSelected) =>
      prevSelected.map((med) =>
        med.productId === productId
          ? { ...med, planId: newPlanId ? parseInt(newPlanId) : null }
          : med
      )
    );
  };

  // --- Save/Submit Handlers --- (Need to call passed mutation hooks)
  const handleSave = () => {
    const saveData = {
      consultationId: consultationId, // Pass ID if editing
      patientId: patient?.id,
      patientInfo: { hpi, pmh, contraindications },
      medicationOrder: {
        serviceId: selectedServiceId,
        treatmentApproach,
        selectedMedications: selectedMedications,
      },
      // Include expanded text in save data
      communication: { messageToPatient, assessmentPlan, followUpPlan, expandedMessage, expandedAssessment },
    };
    // console.log('Saving note with data:', saveData); // Removed log
    // if (onSaveNote) {
    //   onSaveNote(saveData); // Call the mutation hook passed via props
    // } else {
    //   alert('Save function not implemented!');
    // }
    toast.success('Note saved successfully! (Placeholder)'); // Use toast for save feedback too
    if (onClose) onClose(); // Close modal after save attempt
  };

  // Updated handleSubmit to trigger backend invoicing instead of direct creation
  const handleSubmit = async () => { // Make async for API call
     const currentConsultationId = consultationData?.id || consultationId; // Ensure we have the ID

     const submissionPayload = {
        patientId: patient?.id,
        patientInfo: { hpi, pmh, contraindications },
        medicationOrder: {
          serviceId: selectedServiceId,
          treatmentApproach,
          selectedMedications: selectedMedications, // Array of { productId, doseId, planId }
        },
         // Include expanded text in submission payload
         communication: { messageToPatient, assessmentPlan, followUpPlan, expandedMessage, expandedAssessment },
       };

     // console.log("Submitting consultation for approval and invoicing:", submissionPayload); // Removed log

     if (!currentConsultationId) {
        // Try to get ID from prop if not in consultationData (for new notes)
        // This part might need adjustment based on how new consultation IDs are handled
        toast.error("Error: Consultation ID is missing. Cannot submit.");
        console.error("Consultation ID missing.");
        return;
     }

     try {
        // Call the new backend endpoint to handle approval and invoicing
        const response = await fetch(`/api/consultations/${currentConsultationId}/approve-and-invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization headers if needed
            },
            body: JSON.stringify(submissionPayload),
        });

        if (!response.ok) {
            // Handle API errors (e.g., display error message)
            const errorData = await response.json().catch(() => ({ message: 'Failed to approve consultation and send invoice.' }));
            throw new Error(errorData.message || 'API request failed');
        }

        // If successful:
        toast.success("Consultation approved successfully! An invoice will be sent to the patient.");
        // TODO: Potentially update the consultation status locally or refetch data
        if (onClose) onClose();

     } catch (error) {
        console.error("Error submitting consultation for invoicing:", error);
        toast.error(`Error: ${error.message || 'Could not submit consultation.'}`);
        // Handle fetch errors or API errors shown to the user
     }
  };

  const handleEdit = () => {
    if (!updateStatusMutation || !consultationId) {
      toast.error("Cannot enable editing. Please contact support.");
      console.error("updateStatusMutation or consultationId not available in handleEdit");
      return;
    }
    // Call the mutation to set status back to 'pending'
    updateStatusMutation.mutate(
      { consultationId: consultationId, status: 'pending' },
      {
        onSuccess: () => {
          toast.info("Consultation unlocked for editing.");
          // The component should re-render with readOnly=false due to parent state change/refetch
          // No need to manually set readOnly state here
        },
        onError: (error) => {
          toast.error(`Failed to unlock for editing: ${error.message}`);
        }
      }
    );
  };


  // --- Styles & Render ---
  const fullScreenStyles = {
    /* ... styles ... */
  };
  const getPlanName = (planId) =>
    allPlans.find((p) => p.id === planId)?.name || `Plan ID ${planId}`;

  // Handle combined loading state
  // Use original hooks for loading/error state, even if using mock data for display
  if (isLoadingServices || isLoadingPlans || isLoadingProducts) {
    return (
      <div
        // style={fullScreenStyles} // Removed style
        className="bg-white flex items-center justify-center h-full" // Added h-full for loading state
      >
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle combined error state
  if (errorServices || errorPlans || errorProducts) {
    return (
      <div
        // style={fullScreenStyles} // Removed style
        className="bg-white flex flex-col items-center justify-center text-red-600 p-8 h-full" // Added h-full
      >
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading necessary data for consultation notes.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    // Make this the main flex container, fill height, hide its own overflow
    // Attempting scroll fix: Use flex-col, h-full, overflow-hidden on root
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-700 px-6 py-4 text-white flex-shrink-0">
        {/* ... Header content ... */}
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {patient?.name || 'Patient Name'} - Initial Consultation
            </h2>
            <div className="text-sm opacity-80">
              DOB: {patient?.dob || 'YYYY-MM-DD'}
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper - Apply scrolling directly here */}
      {/* Attempting scroll fix: Use flex-grow and overflow-y-auto here */}
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col md:flex-row"> {/* This inner div just handles layout */}
          {/* Left Panel - Patient Information */}
          {/* Attempting scroll fix: Removed inner overflow-y-auto */}
          <div className="md:w-2/5 p-6 border-r border-gray-200">
            {/* ... Patient Info form fields (HPI, PMH, Contraindications) ... */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between">
                <h3 className="font-medium">Patient Information</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Patient-reported
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HPI
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={4}
                    value={hpi}
                    onChange={(e) => setHpi(e.target.value)}
                    disabled={readOnly}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PMH
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={3}
                    value={pmh}
                    onChange={(e) => setPmh(e.target.value)}
                    disabled={readOnly}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contra-indications{' '}
                    <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                      Important
                    </span>
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={3}
                    value={contraindications}
                    onChange={(e) => setContraindications(e.target.value)}
                    disabled={readOnly}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Service & Medication Order */}
           {/* Attempting scroll fix: Removed inner overflow-y-auto */}
          <div className="md:w-3/5 p-4">
            {/* Service & Order Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-medium">
                  Service & Medication Order
                </h3>
                <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                  Provider only
                </span>
              </div>
              <div className="p-4 space-y-4">
                {/* Service Type, Treatment Approach */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      value={selectedServiceId}
                      onChange={handleServiceChange}
                      disabled={readOnly}
                    >
                      {allServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment Approach
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      value={treatmentApproach}
                      onChange={(e) => setTreatmentApproach(e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Escalation">Escalation</option>
                    </select>
                  </div>
                </div>

                {/* Medication Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Medications for Order
                  </label>
                  <div className="border border-gray-200 rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                    {availableMedications.map((product) => (
                      <div key={product.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`med-${product.id}`}
                          checked={selectedMedications.some(
                            (m) => m.productId === product.id
                          )}
                          onChange={() =>
                            handleMedicationSelectionChange(product)
                          }
                          disabled={readOnly}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`med-${product.id}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {product.name}
                        </label>
                      </div>
                    ))}
                    {availableMedications.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No medications available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Dosage & Plan Configuration */}
                {selectedMedications.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Configure Selected Medications
                    </label>
                    <div className="border border-gray-200 rounded-md p-3 space-y-3">
                      {selectedMedications.map((selectedMed) => {
                        const productDetail = availableMedications.find(
                          (p) => p.id === selectedMed.productId
                        );
                        if (!productDetail) return null;

                        return (
                          <div
                            key={selectedMed.productId}
                            className="grid grid-cols-3 gap-2 items-end border-t pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0" // Added styling for separation
                          >
                            {/* Display Medication Name and Selected Dose */}
                            <span className="text-sm font-medium text-gray-800 col-span-3 mb-1">
                              {productDetail.name}:
                              <span className="ml-2 text-indigo-700 font-semibold">
                                {productDetail.doses.find(d => d.id === selectedMed.doseId)?.value || 'Select Dose'}
                              </span>
                            </span>
                            <div className="col-span-1">
                              <label
                                htmlFor={`dosage-${selectedMed.productId}`}
                                className="block text-xs font-medium text-gray-600 mb-0.5"
                              >
                                Dosage
                              </label>
                              <select
                                id={`dosage-${selectedMed.productId}`}
                                value={selectedMed.doseId}
                                onChange={(e) =>
                                  handleDosageChange(
                                    selectedMed.productId,
                                    e.target.value
                                  )
                                }
                                disabled={readOnly}
                                className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white"
                              >
                                {productDetail.doses.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label
                                htmlFor={`plan-${selectedMed.productId}`}
                                className="block text-xs font-medium text-gray-600 mb-0.5"
                              >
                                Plan
                              </label>
                              <select
                                id={`plan-${selectedMed.productId}`}
                                value={selectedMed.planId || ''}
                                onChange={(e) =>
                                  handlePlanChangeForMedication(
                                    selectedMed.productId,
                                    e.target.value
                                  )
                                }
                                disabled={
                                  readOnly ||
                                  plansForSelectedService.length === 0
                                }
                                className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white"
                              >
                                <option value="">One-Time Purchase</option>
                                {plansForSelectedService.map((planConfig) => {
                                  // --- DEBUG LOG ---
                                  // console.log(`Rendering plan option: ID=${planConfig.planId}, Name=${getPlanName(planConfig.planId)}, Selected=${selectedMed.planId}`); // Removed log
                                  // --- END DEBUG LOG ---
                                  return (
                                    <option
                                      key={planConfig.planId}
                                      value={planConfig.planId}
                                    >
                                      {getPlanName(planConfig.planId)} (
                                      {planConfig.duration || 'N/A'})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message to Patient Section */}
            <div className="border border-blue-200 rounded-xl overflow-hidden mb-4 bg-blue-50">
              {/* ... Message fields ... */}
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 flex justify-between items-center">
                <h3 className="text-base font-medium text-blue-800">
                  Message to Patient
                </h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Communication
                </span>
              </div>
              <div className="p-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 border border-blue-300 rounded-l-md p-2 text-sm"
                    value={messageToPatient}
                    onChange={(e) => setMessageToPatient(e.target.value)}
                    disabled={readOnly}
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-r-md text-xs font-medium"
                    disabled={readOnly}
                  >
                    Expand
                  </button>
                </div>
                 {/* Conditionally render template buttons for testing */}
                 {showPatientMessageTemplates && !readOnly && (
                  <div className="mt-2 space-x-2">
                    <span className="text-xs font-medium text-gray-600">Templates:</span>
                    {messageTemplates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        // Update both messageToPatient and expandedMessage
                        onClick={() => {
                          setMessageToPatient(template.text);
                          setExpandedMessage(template.text); // Also update the textarea
                        }}
                        className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  className="w-full bg-white p-3 border border-blue-300 rounded-md text-sm italic min-h-32 mt-2" // Added margin top
                  value={expandedMessage}
                  onChange={(e) => setExpandedMessage(e.target.value)}
                  disabled={readOnly}
                ></textarea>
              </div>
            </div>

            {/* Assessment & Plan Section */}
            <div className="border border-green-200 rounded-xl overflow-hidden mb-4 bg-green-50">
              {/* ... Assessment fields ... */}
              <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex justify-between items-center">
                <h3 className="text-base font-medium text-green-800">
                  Assessment & Plan
                </h3>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  Clinical Notes
                </span>
              </div>
              <div className="p-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 border border-green-300 rounded-l-md p-2 text-sm"
                    value={assessmentPlan}
                    onChange={(e) => setAssessmentPlan(e.target.value)}
                    placeholder="Enter brief assessment and plan..."
                    disabled={readOnly}
                  />
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-r-md text-xs font-medium"
                    disabled={readOnly}
                  >
                    Expand
                  </button>
                </div>
                {/* Conditionally render template buttons for testing */}
                {showAssessmentTemplates && !readOnly && (
                  <div className="mt-2 space-x-2">
                    <span className="text-xs font-medium text-gray-600">Templates:</span>
                    {assessmentTemplates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                         // Update both assessmentPlan and expandedAssessment
                        onClick={() => {
                          setAssessmentPlan(template.text);
                          setExpandedAssessment(template.text); // Also update the textarea
                        }}
                        className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  className="w-full bg-white p-3 border border-green-300 rounded-md text-sm italic min-h-32 mt-2" // Added margin top
                  value={expandedAssessment}
                  onChange={(e) => setExpandedAssessment(e.target.value)}
                  disabled={readOnly}
                ></textarea>
              </div>
            </div>

            {/* Follow-up Plan Section */}
            <div className="border border-purple-200 rounded-xl overflow-hidden mb-4 bg-purple-50">
              {/* ... Follow-up field ... */}
              <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
                <h3 className="text-base font-medium text-purple-800">
                  Follow-up Plan
                </h3>
              </div>
              <div className="p-4">
                <select
                  className="w-full border border-purple-300 rounded-md p-2 text-sm"
                  value={followUpPlan}
                  onChange={(e) => setFollowUpPlan(e.target.value)}
                  disabled={readOnly}
                >
                  <option value="2_weeks">2 weeks</option>
                  <option value="4_weeks">4 weeks</option>
                  <option value="Monthly">Monthly</option>
                  <option value="8_weeks">8 weeks</option>
                  <option value="12_weeks">12 weeks</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-white flex-shrink-0">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          {readOnly ? 'Close' : 'Cancel'}
        </button>
        {/* Show Edit button only if readOnly and not archived */}
        {readOnly && consultationData?.status !== 'archived' && (
           <button
             className="px-4 py-2 rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
             onClick={handleEdit}
             disabled={updateStatusMutation?.isLoading} // Disable while mutation is running
           >
             {updateStatusMutation?.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
             Edit
           </button>
        )}
        {/* Show Save/Submit only if not readOnly */}
        {!readOnly && (
          <>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              // disabled={isSaving} // Disable if save mutation is loading
            >
              {/* {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} */}
              Save Note
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSubmit}
              // disabled={isSubmitting} // Disable if submit mutation is loading
            >
              {/* {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} */}
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InitialConsultationNotes;
