import React, { useState, useEffect } from 'react';
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
  // TODO: Pass mutation hooks for saving/submitting if this component handles it
  // onSaveNote, // Example: function to call mutation hook
  // onSubmitConsultation, // Example: function to call mutation hook
}) => {
  console.log('Refining product/dose selection state');

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

  // Process fetched data
  const allServices = servicesData?.data || servicesData || [];
  const allPlans = plansData?.data || plansData || [];
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

  // Filter available medication products
  const availableMedications = allProducts.filter(
    (p) =>
      p.type === 'medication' && Array.isArray(p.doses) && p.doses.length > 0
    // TODO: Add filtering based on selectedServiceId if needed
  );

  useEffect(() => {
    // Populate initial patient info
    if (patient) {
      setHpi(patient.hpi || 'Patient reports...');
      setPmh(patient.pmh || 'No significant past medical history reported.');
      // setPreferredMedication(patient.preferredMedication || ''); // Keep if needed for display
    }
    // Populate from existing consultation data if provided
    if (consultationData) {
      setHpi(consultationData.notes?.hpi || hpi);
      setPmh(consultationData.notes?.pmh || pmh);
      setContraindications(
        consultationData.notes?.contraindications || contraindications
      );
      setSelectedServiceId(
        consultationData.medicationOrder?.serviceId || selectedServiceId
      );
      setTreatmentApproach(
        consultationData.medicationOrder?.treatmentApproach || treatmentApproach
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
        consultationData.communication?.messageToPatient || messageToPatient
      );
      setAssessmentPlan(
        consultationData.communication?.assessmentPlan || assessmentPlan
      );
      setFollowUpPlan(
        consultationData.communication?.followUpPlan || followUpPlan
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, consultationData]); // Dependencies are intentionally limited for initialization

  // --- Event Handlers --- (Remain largely the same, but rely on fetched data)
  const handleServiceChange = (e) => {
    setSelectedServiceId(parseInt(e.target.value));
    setSelectedMedications([]); // Reset selected meds when service changes
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
        const defaultDoseId = product.doses[0].id;
        const defaultPlanId =
          plansForSelectedService.length > 0
            ? plansForSelectedService[0].planId
            : null;
        return [
          ...prevSelected,
          {
            productId: product.id,
            doseId: defaultDoseId,
            planId: defaultPlanId,
          },
        ];
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
      communication: { messageToPatient, assessmentPlan, followUpPlan },
    };
    console.log('Saving note with data:', saveData);
    // if (onSaveNote) {
    //   onSaveNote(saveData); // Call the mutation hook passed via props
    // } else {
    //   alert('Save function not implemented!');
    // }
    alert('Note saved successfully! (Placeholder)');
    if (onClose) onClose(); // Close modal after save attempt
  };

  // Updated handleSubmit to trigger backend invoicing instead of direct creation
  const handleSubmit = async () => { // Make async for API call
     const consultationId = consultationData?.id; // Assuming consultationData prop includes the ID

     const submissionPayload = {
        patientId: patient?.id,
        patientInfo: { hpi, pmh, contraindications },
      medicationOrder: {
        serviceId: selectedServiceId,
        treatmentApproach,
        selectedMedications: selectedMedications,
      },
        medicationOrder: {
          serviceId: selectedServiceId,
          treatmentApproach,
          selectedMedications: selectedMedications, // Array of { productId, doseId, planId }
        },
        communication: { messageToPatient, assessmentPlan, followUpPlan },
      };

     console.log("Submitting consultation for approval and invoicing:", submissionPayload);

     if (!consultationId) {
        alert("Error: Consultation ID is missing. Cannot submit.");
        console.error("Consultation ID missing from consultationData prop.");
        return;
     }

     try {
        // Call the new backend endpoint to handle approval and invoicing
        const response = await fetch(`/api/consultations/${consultationId}/approve-and-invoice`, {
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
        alert("Consultation approved successfully! An invoice will be sent to the patient.");
        // TODO: Potentially update the consultation status locally or refetch data
        if (onClose) onClose();

     } catch (error) {
        console.error("Error submitting consultation for invoicing:", error);
        alert(`Error: ${error.message || 'Could not submit consultation.'}`);
        // Handle fetch errors or API errors shown to the user
     }
  };

  // --- Styles & Render ---
  const fullScreenStyles = {
    /* ... styles ... */
  };
  const getPlanName = (planId) =>
    allPlans.find((p) => p.id === planId)?.name || `Plan ID ${planId}`;

  // Handle combined loading state
  if (isLoadingServices || isLoadingPlans || isLoadingProducts) {
    return (
      <div
        style={fullScreenStyles}
        className="bg-white flex items-center justify-center"
      >
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle combined error state
  if (errorServices || errorPlans || errorProducts) {
    return (
      <div
        style={fullScreenStyles}
        className="bg-white flex flex-col items-center justify-center text-red-600 p-8"
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
    <div style={fullScreenStyles} className="bg-white">
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

      {/* Main content */}
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel - Patient Information */}
          <div className="md:w-2/5 p-6 border-r border-gray-200 overflow-y-auto">
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
          <div className="md:w-3/5 p-4 overflow-y-auto">
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
                            className="grid grid-cols-3 gap-2 items-end"
                          >
                            <span className="text-sm font-medium text-gray-800 col-span-3">
                              {productDetail.name}:
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
                                {plansForSelectedService.map((planConfig) => (
                                  <option
                                    key={planConfig.planId}
                                    value={planConfig.planId}
                                  >
                                    {getPlanName(planConfig.planId)} (
                                    {planConfig.duration || 'N/A'})
                                  </option>
                                ))}
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
                <textarea
                  className="w-full bg-white p-3 border border-blue-300 rounded-md text-sm italic min-h-32"
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
                <textarea
                  className="w-full bg-white p-3 border border-green-300 rounded-md text-sm italic min-h-32"
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
