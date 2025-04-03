import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { Check, User } from "lucide-react"; // Import Check and User icons

const InitialConsultationNotes = ({
  patient,
  onClose,
  consultationData,
  readOnly = false,
}) => {
  console.log("Refining product/dose selection state");

  // Get products as well to determine fulfillment source and doses
  const { services, getServiceById, getServicePlans, getAllPlans, products } = useAppContext();

  // --- State Hooks ---
  const [hpi, setHpi] = useState("");
  const [pmh, setPmh] = useState("");
  const [contraindications, setContraindications] = useState(
    "No known contra-indications for GLP-1 therapy..."
  );
  const [selectedServiceId, setSelectedServiceId] = useState(1); // Default or load from patient/consultation
  const [treatmentApproach, setTreatmentApproach] = useState("Maintenance");
  const [preferredMedication, setPreferredMedication] = useState(""); // Load from patient
  // *** State for multiple medications WITH specific dose and plan IDs ***
  const [selectedMedications, setSelectedMedications] = useState([]); // Array of { productId, doseId, planId }
  const [messageToPatient, setMessageToPatient] = useState(
    "Continue medication as prescribed, diet and exercise"
  );
  const [assessmentPlan, setAssessmentPlan] = useState(
    "Obesity with good response to [Medication], continue treatment" // Placeholder
  );
  const [followUpPlan, setFollowUpPlan] = useState("Monthly");
  const [expandedMessage, setExpandedMessage] = useState(`Dear Patient, ... [Your full message template]`);
  const [expandedAssessment, setExpandedAssessment] = useState(`[Patient Age/Gender]... [Your full assessment template]`);


  // --- Derived Data & Effects ---
  const selectedService = getServiceById(selectedServiceId);
  // Get plans specifically configured and available for the *selected* service
  const plansForSelectedService = selectedService ? getServicePlans(selectedServiceId) : [];
  // Get all plans to look up names if needed
  const allPlans = getAllPlans ? getAllPlans() : [];

  // Filter available medication products (assuming products are loaded from context)
  // TODO: Filter based on products associated with the selectedServiceId if applicable
  const availableMedications = Array.isArray(products)
    ? products.filter(p => p.type === 'medication' && Array.isArray(p.doses) && p.doses.length > 0)
    : [];

  useEffect(() => {
    // Populate initial patient info
    if (patient) {
      // TODO: Populate HPI/PMH from actual patient data if available
      setHpi(patient.hpi || "Patient reports...");
      setPmh(patient.pmh || "No significant past medical history reported.");
      if (patient.preferredMedication) {
        setPreferredMedication(patient.preferredMedication);
      }
       // TODO: Potentially pre-select service based on patient history or default
       // setSelectedServiceId(patient.defaultServiceId || 1);
    }
    // Populate from existing consultation data if provided
    if (consultationData) {
        setHpi(consultationData.notes?.hpi || hpi);
        setPmh(consultationData.notes?.pmh || pmh);
        setContraindications(consultationData.notes?.contraindications || contraindications);
        setSelectedServiceId(consultationData.medicationOrder?.serviceId || selectedServiceId);
        setTreatmentApproach(consultationData.medicationOrder?.treatmentApproach || treatmentApproach);
        // Ensure selectedMedications uses the correct structure
        setSelectedMedications(Array.isArray(consultationData.medicationOrder?.selectedMedications)
          ? consultationData.medicationOrder.selectedMedications.map(med => ({
              productId: med.productId || med.id, // Handle potential old format
              doseId: med.doseId,
              planId: med.planId
            }))
          : []);
        setMessageToPatient(consultationData.communication?.messageToPatient || messageToPatient);
        setAssessmentPlan(consultationData.communication?.assessmentPlan || assessmentPlan);
        setFollowUpPlan(consultationData.communication?.followUpPlan || followUpPlan);
        // TODO: Populate expanded messages if stored
    }
  }, [patient, consultationData]);


  // --- Event Handlers ---
  const handleServiceChange = (e) => {
    setSelectedServiceId(parseInt(e.target.value));
    setSelectedMedications([]); // Reset selected meds when service changes
  };

  // Handle Medication Checkbox Change - Updated for productId and default doseId
  const handleMedicationSelectionChange = (product) => {
    if (readOnly || !product || !Array.isArray(product.doses) || product.doses.length === 0) return;

    setSelectedMedications(prevSelected => {
      const isSelected = prevSelected.some(m => m.productId === product.id);
      if (isSelected) {
        return prevSelected.filter(m => m.productId !== product.id);
      } else {
        // Default to the first dose of the selected product
        const defaultDoseId = product.doses[0].id;
        // Default to the first available plan for the service, or null if none
        const defaultPlanId = plansForSelectedService.length > 0 ? plansForSelectedService[0].planId : null;
        return [...prevSelected, {
            productId: product.id, // Store actual product ID
            doseId: defaultDoseId, // Store actual dose ID
            planId: defaultPlanId
        }];
      }
    });
  };

  // Updated to handle doseId change based on productId
  const handleDosageChange = (productId, newDoseId) => {
    if (readOnly) return;
    const doseIdNumber = parseInt(newDoseId); // Ensure it's a number
    setSelectedMedications(prevSelected =>
      prevSelected.map(med =>
        med.productId === productId ? { ...med, doseId: doseIdNumber } : med
      )
    );
  };

  // Updated to handle plan change based on productId
  const handlePlanChangeForMedication = (productId, newPlanId) => {
    if (readOnly) return;
    setSelectedMedications(prevSelected =>
      prevSelected.map(med =>
        med.productId === productId ? { ...med, planId: newPlanId ? parseInt(newPlanId) : null } : med
      )
    );
  };

  const handleSave = () => {
    console.log("Saving note with data:", {
      patientId: patient?.id,
      patientInfo: { hpi, pmh, contraindications },
      medicationOrder: {
        serviceId: selectedServiceId,
        treatmentApproach,
        // preferredMedication might be less relevant now
        selectedMedications: selectedMedications, // Array of { productId, doseId, planId }
      },
      communication: { messageToPatient, assessmentPlan, followUpPlan },
    });
    alert("Note saved successfully!");
    if (onClose) onClose();
  };

  const handleSubmit = () => {
     console.log("Submitting consultation with data:", {
        patientId: patient?.id,
        patientInfo: { hpi, pmh, contraindications },
        medicationOrder: {
          serviceId: selectedServiceId,
          treatmentApproach,
          // preferredMedication might be less relevant now
          selectedMedications: selectedMedications, // Array of { productId, doseId, planId }
        },
        communication: { messageToPatient, assessmentPlan, followUpPlan },
      });

    // --- Group items by fulfillment source ---
    const retailItems = [];
    const compoundedItems = [];
    const supplementItems = []; // Assuming supplements are handled internally

    if (!Array.isArray(products)) {
        console.error("Products data is not available or not an array.");
        alert("Error: Product data not loaded. Cannot submit order.");
        return; // Prevent submission if product data is missing
    }

    let pharmacySelectionNeeded = false; // Flag to check if pharmacy selection is needed

    selectedMedications.forEach(med => {
        const productDetail = products.find(p => p.id === med.productId); // Find by productId

        if (!productDetail) {
            console.warn(`Product details not found for productId: ${med.productId}`);
            return; // Skip this medication
        }

        const doseDetail = productDetail.doses?.find(d => d.id === med.doseId);

        if (!doseDetail) {
             console.warn(`Dose details not found for productId: ${med.productId}, doseId: ${med.doseId}`);
             return; // Skip if dose isn't found
        }

        const item = {
            productId: productDetail.id,
            doseId: med.doseId,
            doseValue: doseDetail.value, // Include dose value for fulfillment
            planId: med.planId,
            quantity: 1, // Default quantity
        };

        switch (productDetail.fulfillmentSource) {
            case 'retail_pharmacy':
                retailItems.push(item);
                pharmacySelectionNeeded = true; // Mark that pharmacy selection might be needed later
                break;
            case 'compounding_pharmacy':
                compoundedItems.push(item);
                pharmacySelectionNeeded = true; // Mark that pharmacy selection might be needed later
                break;
            case 'internal_supplement': // Should not happen for medications
                supplementItems.push(item);
                break;
            default:
                console.warn(`Unknown fulfillment source for ${productDetail.name}: ${productDetail.fulfillmentSource}`);
        }
    });

     // --- Determine Billing Actions ---
     const subscriptionItems = selectedMedications.filter(med => med.planId !== null);
     const oneTimeItemsRaw = selectedMedications.filter(med => med.planId === null); // Items without a plan are one-time
     const uniquePlanIds = [...new Set(subscriptionItems.map(item => item.planId))];

     console.log("Unique Plan IDs for Subscription:", uniquePlanIds);
     console.log("Raw One-Time Purchase Items:", oneTimeItemsRaw);

     // --- Refine Billing Logic & Prepare API Payloads ---

     let subscriptionPayload = null;
     let oneTimeOrderPayloadItems = []; // Renamed for clarity

     // Handle Subscriptions
     if (uniquePlanIds.length > 1) {
        console.warn("Multiple different subscription plans selected. Handling only the first plan:", uniquePlanIds[0]);
        // TODO: Define business logic for handling multiple selected plans.
        // For now, just use the first plan ID found.
     }
     if (uniquePlanIds.length > 0) {
        const primaryPlanId = uniquePlanIds[0];
        const itemsForSubscription = subscriptionItems.filter(item => item.planId === primaryPlanId);
        subscriptionPayload = {
            patientId: patient?.id,
            planId: primaryPlanId,
            items: itemsForSubscription.map(item => ({ // Map to expected API structure
                productId: item.productId,
                doseId: item.doseId,
                quantity: item.quantity
            }))
            // Add other necessary subscription details (e.g., start date)
        };
        console.log("Subscription Payload:", subscriptionPayload);
        // Placeholder for API call: await createSubscription(subscriptionPayload);
     }

     // Handle One-Time Purchases (Check eligibility)
     oneTimeItemsRaw.forEach(item => {
        const productDetail = products.find(p => p.id === item.productId);
        const doseDetail = productDetail?.doses?.find(d => d.id === item.doseId);
        // Check the allowOneTimePurchase flag on the specific dose
        if (doseDetail?.allowOneTimePurchase) {
            oneTimeOrderPayloadItems.push({
                productId: item.productId,
                doseId: item.doseId,
                doseValue: doseDetail.value,
                quantity: item.quantity,
                // Add price? Needs oneTimePurchasePrice from productDetail
                price: productDetail?.oneTimePurchasePrice || 0 // Example price lookup
            });
        } else {
            console.warn(`Item ${productDetail?.name} ${doseDetail?.value} is not eligible for one-time purchase.`);
            // Optionally alert the user or handle this case
        }
     });

     console.log("Eligible One-Time Order Items:", oneTimeOrderPayloadItems);
     // Placeholder for API call: if (oneTimeOrderPayloadItems.length > 0) { await createOneTimeOrder({ patientId: patient.id, items: oneTimeOrderPayloadItems }); }


    // --- TODO: Implement Fulfillment API Calls ---
    // These calls might happen after subscription/order creation, potentially triggered by backend webhooks
    // Or they could be called directly here if the backend expects it.
    console.log("Grouped Retail Items for Fulfillment:", retailItems);
    // if (retailItems.length > 0) { /* call retail fulfillment API with relevant order/sub ID */ }
    console.log("Grouped Compounded Items for Fulfillment:", compoundedItems);
    // if (compoundedItems.length > 0) { /* call compounding fulfillment API with relevant order/sub ID */ }
    console.log("Grouped Supplement/Internal Items for Fulfillment:", supplementItems);
    // if (supplementItems.length > 0) { /* call internal fulfillment API with relevant order/sub ID */ }

    // Note: If pharmacySelectionNeeded is true, the fulfillment step might need to wait for pharmacy selection elsewhere.

    alert("Consultation submitted successfully! (Placeholder - Check console for grouped items)");
    if (onClose) onClose();
  };

  // --- Styles & Render ---
  const fullScreenStyles = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    width: "100vw", height: "100vh", zIndex: 50,
    display: "flex", flexDirection: "column",
  };
  const getPlanName = (planId) => allPlans.find(p => p.id === planId)?.name || `Plan ID ${planId}`;


  return (
    <div style={fullScreenStyles} className="bg-white">
      {/* Header */}
      <div className="bg-indigo-700 px-6 py-4 text-white flex-shrink-0">
         <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3"><User className="h-6 w-6 text-white" /></div>
            <div>
                <h2 className="text-xl font-bold">{patient?.name || "Patient Name"} - Initial Consultation</h2>
                <div className="text-sm opacity-80">DOB: {patient?.dob || "YYYY-MM-DD"}</div>
            </div>
         </div>
      </div>

      {/* Main content */}
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel - Patient Information */}
          <div className="md:w-2/5 p-6 border-r border-gray-200 overflow-y-auto">
             <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between"><h3 className="font-medium">Patient Information</h3><span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Patient-reported</span></div>
                <div className="p-4 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">HPI</label><textarea className="w-full border border-gray-300 rounded-md p-2 text-sm" rows={4} value={hpi} onChange={(e) => setHpi(e.target.value)} disabled={readOnly}></textarea></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">PMH</label><textarea className="w-full border border-gray-300 rounded-md p-2 text-sm" rows={3} value={pmh} onChange={(e) => setPmh(e.target.value)} disabled={readOnly}></textarea></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Contra-indications <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Important</span></label><textarea className="w-full border border-gray-300 rounded-md p-2 text-sm" rows={3} value={contraindications} onChange={(e) => setContraindications(e.target.value)} disabled={readOnly}></textarea></div>
                </div>
             </div>
          </div>

          {/* Right Panel - Service & Medication Order */}
          <div className="md:w-3/5 p-4 overflow-y-auto">
            {/* Service & Order Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-medium">Service & Medication Order</h3>
                <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">Provider only</span>
              </div>
              <div className="p-4 space-y-4">
                 {/* Service Type, Treatment Approach, Preferred Med */}
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <select className="w-full border border-gray-300 rounded-md p-2 text-sm" value={selectedServiceId} onChange={handleServiceChange} disabled={readOnly}>
                        {/* Ensure services is an array before mapping */}
                        {Array.isArray(services) && services.map((service) => (<option key={service.id} value={service.id}>{service.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Approach</label>
                      <select className="w-full border border-gray-300 rounded-md p-2 text-sm" value={treatmentApproach} onChange={(e) => setTreatmentApproach(e.target.value)} disabled={readOnly}>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Escalation">Escalation</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    <div style={{ gridColumn: "span 3" }}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Medication (Patient)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-100" value={preferredMedication} readOnly disabled/>
                    </div>
                  </div>

                {/* Medication Selection (Checkboxes) - Updated to use productId */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Medications for Order</label>
                  <div className="border border-gray-200 rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                    {availableMedications.map((product) => (
                      <div key={product.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`med-${product.id}`}
                          checked={selectedMedications.some(m => m.productId === product.id)}
                          onChange={() => handleMedicationSelectionChange(product)} // Pass the whole product object
                          disabled={readOnly}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`med-${product.id}`} className="ml-2 text-sm text-gray-700">{product.name}</label>
                      </div>
                    ))}
                     {availableMedications.length === 0 && <p className="text-xs text-gray-500">No medications available for this service.</p>}
                  </div>
                </div>

                {/* Dosage & Plan Configuration for Selected Meds - Updated */}
                {selectedMedications.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Configure Selected Medications</label>
                    <div className="border border-gray-200 rounded-md p-3 space-y-3">
                      {selectedMedications.map((selectedMed) => {
                        // Find the full product details for the selected medication
                        const productDetail = availableMedications.find(p => p.id === selectedMed.productId);
                        if (!productDetail) return null; // Should not happen if state is managed correctly

                        return (
                          <div key={selectedMed.productId} className="grid grid-cols-3 gap-2 items-end">
                            {/* Medication Name */}
                            <span className="text-sm font-medium text-gray-800 col-span-3">{productDetail.name}:</span>
                            {/* Dosage Dropdown */}
                            <div className="col-span-1">
                               <label htmlFor={`dosage-${selectedMed.productId}`} className="block text-xs font-medium text-gray-600 mb-0.5">Dosage</label>
                               <select
                                 id={`dosage-${selectedMed.productId}`}
                                 value={selectedMed.doseId} // Use doseId
                                 onChange={(e) => handleDosageChange(selectedMed.productId, e.target.value)}
                                 disabled={readOnly}
                                 className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white"
                               >
                                 {/* Populate with actual doses for this product */}
                                 {productDetail.doses.map(d => (<option key={d.id} value={d.id}>{d.value}</option>))}
                               </select>
                            </div>
                            {/* Per-Medication Plan Dropdown */}
                            <div className="col-span-2">
                               <label htmlFor={`plan-${selectedMed.productId}`} className="block text-xs font-medium text-gray-600 mb-0.5">Plan</label>
                               <select
                                 id={`plan-${selectedMed.productId}`}
                                 value={selectedMed.planId || ''}
                                 onChange={(e) => handlePlanChangeForMedication(selectedMed.productId, e.target.value)}
                                 disabled={readOnly || plansForSelectedService.length === 0}
                                 className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white"
                               >
                                 <option value="">One-Time Purchase</option> {/* Allow selecting no plan */}
                                 {/* Populate with plans configured for the service */}
                                 {plansForSelectedService.map(planConfig => (
                                   <option key={planConfig.planId} value={planConfig.planId}>
                                     {getPlanName(planConfig.planId)} ({planConfig.duration || 'N/A'})
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
                 {/* Pharmacy Selection Dropdowns Removed */}
              </div>
            </div>

            {/* Message to Patient Section */}
            <div className="border border-blue-200 rounded-xl overflow-hidden mb-4 bg-blue-50">
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 flex justify-between items-center"><h3 className="text-base font-medium text-blue-800">Message to Patient</h3><span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Communication</span></div>
              <div className="p-4"><div className="flex mb-2"><input type="text" className="flex-1 border border-blue-300 rounded-l-md p-2 text-sm" value={messageToPatient} onChange={(e) => setMessageToPatient(e.target.value)} disabled={readOnly}/><button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-r-md text-xs font-medium" disabled={readOnly}>Expand</button></div><textarea className="w-full bg-white p-3 border border-blue-300 rounded-md text-sm italic min-h-32" value={expandedMessage} onChange={(e) => setExpandedMessage(e.target.value)} disabled={readOnly}></textarea></div>
            </div>

            {/* Assessment & Plan Section */}
            <div className="border border-green-200 rounded-xl overflow-hidden mb-4 bg-green-50">
              <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex justify-between items-center"><h3 className="text-base font-medium text-green-800">Assessment & Plan</h3><span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Clinical Notes</span></div>
              <div className="p-4"><div className="flex mb-2"><input type="text" className="flex-1 border border-green-300 rounded-l-md p-2 text-sm" value={assessmentPlan} onChange={(e) => setAssessmentPlan(e.target.value)} placeholder="Enter brief assessment and plan..." disabled={readOnly}/><button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-r-md text-xs font-medium" disabled={readOnly}>Expand</button></div><textarea className="w-full bg-white p-3 border border-green-300 rounded-md text-sm italic min-h-32" value={expandedAssessment} onChange={(e) => setExpandedAssessment(e.target.value)} disabled={readOnly}></textarea></div>
            </div>

            {/* Follow-up Plan Section */}
            <div className="border border-purple-200 rounded-xl overflow-hidden mb-4 bg-purple-50">
              <div className="bg-purple-100 px-4 py-3 border-b border-purple-200"><h3 className="text-base font-medium text-purple-800">Follow-up Plan</h3></div>
              <div className="p-4"><select className="w-full border border-purple-300 rounded-md p-2 text-sm" value={followUpPlan} onChange={(e) => setFollowUpPlan(e.target.value)} disabled={readOnly}><option value="2_weeks">2 weeks</option><option value="4_weeks">4 weeks</option><option value="Monthly">Monthly</option><option value="8_weeks">8 weeks</option><option value="12_weeks">12 weeks</option></select></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-white flex-shrink-0">
         <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={onClose}>
           {readOnly ? "Close" : "Cancel"}
         </button>
         {!readOnly && (
           <>
             <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700" onClick={handleSave}>
               Save Note
             </button>
             <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit}>
               Submit
             </button>
           </>
         )}
      </div>
    </div>
  );
};

export default InitialConsultationNotes;
