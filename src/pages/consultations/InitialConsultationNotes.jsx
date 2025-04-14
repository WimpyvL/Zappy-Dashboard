import React from 'react'; // Removed useState, useEffect, useMemo
// Removed toast import
// Removed API hook imports
import { User, Loader2, AlertTriangle } from 'lucide-react';

// Import the hook
import { useConsultationNotesForm } from '../../hooks/useConsultationNotesForm';

// Import the new section components
import PatientInfoSection from './components/PatientInfoSection';
import ServiceMedicationOrderSection from './components/ServiceMedicationOrderSection';
import CommunicationSection from './components/CommunicationSection';

// Template data can remain here or be moved to constants if used elsewhere
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

const InitialConsultationNotes = ({
  patient,
  onClose,
  consultationData, // Pass the full consultation object
  // consultationId is now derived within the hook from consultationData
  // readOnly prop is also derived within the hook
  // updateStatusMutation is no longer needed as prop
}) => {

  const {
    // State Values from hook
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
    isReadOnly, // Use internal read-only state from hook

    // Setters from hook
    setHpi,
    setPmh,
    setContraindications,
    setTreatmentApproach,
    setMessageToPatient,
    setAssessmentPlan,
    setFollowUpPlan,
    setExpandedMessage,
    setExpandedAssessment,

    // Handlers from hook
    handleServiceChange,
    handleMedicationSelectionChange,
    handleDosageChange,
    handlePlanChangeForMedication,
    handleSave,
    handleSubmit,
    handleEnableEditing, // Handler for unlocking

    // Processed Data from hook
    allServices,
    allProducts,
    allPlans,
    plansForSelectedService,
    availableMedications,

    // Loading/Error/Mutation States from hook
    isLoading,
    error,
    isSubmitting,
    isUnlocking, // Loading state for unlock action
  } = useConsultationNotesForm(patient, consultationData, consultationData?.id, onClose); // Pass consultationData?.id as consultationId


  // --- Loading & Error States --- (Handled by hook)
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
              readOnly={isReadOnly} // Use state from hook
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
              onServiceChange={handleServiceChange} // Pass handler from hook
              onTreatmentApproachChange={setTreatmentApproach}
              onMedicationSelectionChange={handleMedicationSelectionChange} // Pass handler from hook
              onDosageChange={handleDosageChange} // Pass handler from hook
              onPlanChangeForMedication={handlePlanChangeForMedication} // Pass handler from hook
              readOnly={isReadOnly} // Use state from hook
            />
            <CommunicationSection
              messageToPatient={messageToPatient}
              assessmentPlan={assessmentPlan}
              followUpPlan={followUpPlan}
              expandedMessage={expandedMessage}
              expandedAssessment={expandedAssessment}
              messageTemplates={messageTemplates} // Keep template data here
              assessmentTemplates={assessmentTemplates} // Keep template data here
              onMessageChange={setMessageToPatient}
              onAssessmentChange={setAssessmentPlan}
              onFollowUpChange={setFollowUpPlan}
              onExpandedMessageChange={setExpandedMessage}
              onExpandedAssessmentChange={setExpandedAssessment}
              readOnly={isReadOnly} // Use state from hook
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-white flex-shrink-0">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={onClose}>
          {isReadOnly ? 'Close' : 'Cancel'}
        </button>
        {isReadOnly && consultationData?.status !== 'archived' && (
           <button
             className="px-4 py-2 rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center disabled:opacity-50"
             onClick={handleEnableEditing} // Use handler from hook
             disabled={isUnlocking} // Use loading state from hook
           >
             {isUnlocking ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} Edit
           </button>
        )}
        {!isReadOnly && (
          <>
            {/* Conditionally render Save Note only if it's an existing consultation */}
            {consultationData?.id && (
              <button
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
                onClick={handleSave} // Use handler from hook
                disabled={isSubmitting} // Use loading state from hook
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} Save Note
              </button>
            )}
            <button
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
              onClick={handleSubmit} // Use handler from hook
              disabled={isSubmitting} // Use loading state from hook
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InitialConsultationNotes;
