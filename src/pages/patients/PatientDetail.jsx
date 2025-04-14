// PatientDetail.jsx
import React, { useState, useCallback } from 'react'; // Removed unused useEffect, Added useCallback
import { useParams } from 'react-router-dom'; // Removed unused Link import
import { toast } from 'react-toastify';
// Removed unused ArrowLeft, Calendar, Plus imports
// import apiService from '../../utils/apiService'; // Removed unused import
import LoadingSpinner from './patientDetails/common/LoadingSpinner';
import PatientNotFound from './patientDetails/common/PatientNotFound';
import PatientHeader from './patientDetails/PatientHeader';
import PatientTabs from './patientDetails/PatientTabs';
import PatientInfo from './patientDetails/PatientInfo';
import PatientSessions from './patientDetails/PatientSessions';
import PatientOrders from './patientDetails/PatientOrders';
import PatientNotes from './patientDetails/PatientNotes';
import PatientForms from './patientDetails/PatientForms';
import PatientBilling from './patientDetails/PatientBilling';
import PatientFollowUpNotes from './patientDetails/PatientFollowUpNotes';
import PatientDocuments from './patientDetails/PatientDocuments';
import { usePatientById } from '../../apis/patients/hooks'; // Import the correct hook
// Removed placeholder form hook import

const PatientDetail = () => {
  const { patientId } = useParams();
  // Fetch patient data using the hook
  const { data: patient, isLoading: isLoadingPatient, error: patientError, refetch: refetchPatient } = usePatientById(patientId);
  // Removed placeholder form data/loading/error states
  // Removed placeholder loading states for other tabs
  // Removed placeholder data states for other tabs

  // UI states
  const [activeTab, setActiveTab] = useState('info');
  const [showFollowupNotes, setShowFollowupNotes] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Define refreshPatient using the refetch function from usePatientById hook
  const refreshPatientData = useCallback(() => {
    refetchPatient();
  }, [refetchPatient]);

  // Removed useEffect that relied on contextPatients

  // Placeholder for fetching related data (sessions, orders, etc.)
  // TODO: This should ideally be handled by hooks within the specific tab components
  // Removed unused fetchRelatedData function and the stray setLoading call within it

  // Removed fetchPatientDocuments function - now handled within PatientDocuments component

  // Event handlers (remain the same)
  const handleOpenFollowupNotes = (session = null) => {
    setSelectedSession(session);
    setShowFollowupNotes(true);
  };

  const handleCloseFollowupNotes = () => {
    setShowFollowupNotes(false);
    setSelectedSession(null);
  };

  // Render loading state from the hook
  if (isLoadingPatient) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  // Render error state from the hook
  if (patientError) {
     // Optionally provide more specific error feedback
     toast.error(`Error loading patient: ${patientError.message}`);
     return <PatientNotFound patientId={patientId} message={`Error: ${patientError.message}`} />;
  }

  // Render not found state if hook finished loading but found no patient
  if (!patient) {
    return <PatientNotFound patientId={patientId} />;
  }

  // Render patient details once data is available
  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      {/* Pass the found patient object */}
      <PatientHeader patient={patient} patientId={patientId} />

      {/* Tabs */}
      <PatientTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        // Removed props passing placeholder data
      />

      {/* Content based on active tab */}
      {/* Pass the found patient object */}
      {activeTab === 'info' && <PatientInfo patient={patient} />}

      {activeTab === 'sessions' && <PatientSessions patientId={patientId} onOpenFollowupNotes={handleOpenFollowupNotes} />}
      {activeTab === 'orders' && <PatientOrders patientId={patientId} />}
      {activeTab === 'notes' && <PatientNotes patientId={patientId} onOpenFollowupNotes={handleOpenFollowupNotes} />}
      {activeTab === 'documents' && <PatientDocuments patientId={patientId} />}
      {activeTab === 'forms' && <PatientForms patientId={patientId} />}
      {activeTab === 'billing' && <PatientBilling patient={patient} refreshPatient={refreshPatientData} />} 
      {/* Pass patient and refreshPatientData to Billing */}

      {/* Follow-up Notes Modal */}
      {showFollowupNotes && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <PatientFollowUpNotes
              patient={patient} // Pass the found patient object
              selectedSession={selectedSession}
              onClose={handleCloseFollowupNotes}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
