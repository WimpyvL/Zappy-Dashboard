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
// Removed useAppContext import
import { usePatientById } from '../../apis/patients/hooks'; // Import the correct hook
// TODO: Import usePatientForms hook when created (e.g., import { usePatientForms } from '../../apis/forms/hooks';)

const PatientDetail = () => {
  const { patientId } = useParams();
  // Fetch patient data using the hook
  const { data: patient, isLoading: isLoadingPatient, error: patientError } = usePatientById(patientId);
  // TODO: Use the actual forms hook when created
  // const { data: patientFormsData, isLoading: isLoadingForms, error: formsError } = usePatientForms(patientId);
  // Placeholder data until hook is implemented:
  const patientFormsData = { data: [] }; // Default to empty array
  const isLoadingForms = false; // Default to false
  const formsError = null; // Default to null

  // Loading states for different data types (keep for related data for now)
  const [loading] = useState({ // Removed unused setLoading
    // patient: true, // Handled by isLoadingPatient from hook
    sessions: false,
    orders: false,
    notes: true, // Assume we might load these later
    // documents: true, // Removed, handled by PatientDocuments component
    forms: true,
    invoices: true,
  });

  // Data states
  // const [patient, setPatient] = useState(null); // Removed useState for patient, now comes from usePatientById hook
  // Initialize related data as empty arrays, fetch logic can be added later if needed
  // TODO: Remove these states if data is fetched within child components
  const [patientSessions] = useState([]); // Removed setPatientSessions
  const [patientOrders] = useState([]); // Removed setPatientOrders
  const [patientNotes] = useState([]); // Removed setPatientNotes
  // const [patientDocuments, setPatientDocuments] = useState([]); // Removed, handled by PatientDocuments component
  const [patientForms] = useState([]); // Removed setPatientForms
  const [patientInvoices] = useState([]); // Removed setPatientInvoices

  // UI states
  const [activeTab, setActiveTab] = useState('info');
  const [showFollowupNotes, setShowFollowupNotes] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Define refreshPatient using useCallback to stabilize its reference
  const refreshPatient = useCallback(async () => {
    // This function currently does nothing as it relies on mock data/context
    // In a real scenario, it would likely trigger a refetch of the patient data
    // e.g., queryClient.invalidateQueries(['patient', patientId]);
    console.warn("Refresh patient called. Adapt for actual data fetching if needed.");
    // Since usePatientById handles fetching, maybe this isn't needed,
    // or should trigger an invalidation via queryClient if using React Query fully.
  }, []); // Empty dependency array means the function reference is stable

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
        // Pass related data (currently empty, fetched in fetchRelatedData)
        patientSessions={patientSessions}
        patientOrders={patientOrders}
        patientNotes={patientNotes}
        // patientDocuments={patientDocuments} // Removed, handled by PatientDocuments component
        patientForms={patientForms}
      />

      {/* Content based on active tab */}
      {/* Pass the found patient object */}
      {activeTab === 'info' && <PatientInfo patient={patient} />}

      {activeTab === 'sessions' && (
        <PatientSessions
          patientId={patientId}
          sessions={patientSessions} // Pass related data
          loading={loading.sessions}
          onOpenFollowupNotes={handleOpenFollowupNotes}
        />
      )}

      {activeTab === 'orders' && (
        <PatientOrders
          patientId={patientId}
          orders={patientOrders} // Pass related data
          loading={loading.orders}
        />
      )}

      {activeTab === 'notes' && (
        <PatientNotes
          patientId={patientId}
          notes={patientNotes} // Pass related data
          loading={loading.notes}
          onOpenFollowupNotes={handleOpenFollowupNotes}
        />
      )}

      {activeTab === 'documents' && (
        <PatientDocuments
          patientId={patientId}
          // documents={patientDocuments} // Removed, handled by PatientDocuments component
          // loading={loading.documents} // Removed, handled by PatientDocuments component
          // fetchDocuments={() => fetchPatientDocuments(patientId)} // Removed, handled by PatientDocuments component
        />
      )}

      {activeTab === 'forms' && (
        <PatientForms
          patientId={patientId}
          // Pass data and loading state from the (placeholder) forms hook
          forms={patientFormsData?.data || []} // Use data from placeholder hook
          loading={isLoadingForms} // Use loading state from placeholder hook
        />
      )}

      {activeTab === 'billing' && (
        <PatientBilling
          patient={patient} // Pass the found patient object
          invoices={patientInvoices} // Pass related data
          loading={loading.invoices}
          refreshPatient={refreshPatient} // Pass the stable useCallback version
        />
      )}

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
