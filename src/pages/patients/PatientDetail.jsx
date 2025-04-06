// PatientDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Removed unused Link import
import { toast } from 'react-toastify';
// Removed unused ArrowLeft, Calendar, Plus imports
import apiService from '../../utils/apiService';
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
import { useAppContext } from '../../context/AppContext'; // Import context hook

const PatientDetail = () => {
  const { patientId } = useParams();
  const { patients: contextPatients } = useAppContext(); // Get patients from context

  // Loading states for different data types
  const [loading, setLoading] = useState({
    patient: true,
    sessions: false,
    orders: false,
    notes: true, // Assume we might load these later
    documents: true,
    forms: true,
    invoices: true,
  });

  // Data states
  const [patient, setPatient] = useState(null);
  // Initialize related data as empty arrays, fetch logic can be added later if needed
  const [patientSessions, setPatientSessions] = useState([]);
  const [patientOrders, setPatientOrders] = useState([]);
  const [patientNotes, setPatientNotes] = useState([]);
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [patientForms, setPatientForms] = useState([]);
  const [patientInvoices, setPatientInvoices] = useState([]);

  // UI states
  const [activeTab, setActiveTab] = useState('info');
  const [showFollowupNotes, setShowFollowupNotes] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Removed hardcoded mockPatientData object

  // Fetch patient data from context based on patientId
  useEffect(() => {
    setLoading((prev) => ({ ...prev, patient: true }));
    setPatient(null); // Reset patient data on ID change

    if (patientId && contextPatients.length > 0) {
      console.log(`Finding patient ${patientId} in context...`);
      const foundPatient = contextPatients.find(p => p.id === patientId);

      if (foundPatient) {
        // Simulate loading for context data as well for consistency
        setTimeout(() => {
          console.log("Found patient in context:", foundPatient);
          setPatient(foundPatient);
          setLoading((prev) => ({ ...prev, patient: false }));
          // TODO: Fetch related data (sessions, orders, etc.) for this patient if needed
          // fetchRelatedData(patientId);
        }, 150); // Short delay
      } else {
        console.warn(`Patient with ID ${patientId} not found in context.`);
        setLoading((prev) => ({ ...prev, patient: false }));
        // Keep patient as null, the component will render PatientNotFound
      }
    } else if (!patientId) {
       console.error("No patientId provided in URL.");
       setLoading((prev) => ({ ...prev, patient: false }));
    } else {
       // Context patients might not be loaded yet, wait for context update
       console.log("Waiting for context patients to load...");
       // setLoading will remain true until contextPatients has data
    }
  }, [patientId, contextPatients]); // Depend on patientId and contextPatients

  // Placeholder for fetching related data (sessions, orders, etc.)
  // This would likely involve filtering the corresponding arrays from AppContext
  const fetchRelatedData = (id) => {
    console.log(`Fetching related mock data for patient ${id}...`);
    // Example: Filter sessions from context
    // const sessions = contextSessions.filter(s => s.patientId === id);
    // setPatientSessions(sessions);
    // setLoading(prev => ({ ...prev, sessions: false }));
    // Similarly for orders, notes, documents, forms, invoices...
    // For now, just set loading to false for related data
    setLoading(prev => ({
      ...prev,
      sessions: false,
      orders: false,
      notes: false,
      documents: false,
      forms: false,
      invoices: false,
    }));
  };

  // Fetch related data when patient is loaded
  useEffect(() => {
    if (patient) {
      fetchRelatedData(patient.id);
    }
  }, [patient]);


  // Data fetching function for documents (can be adapted for mock data later)
  const fetchPatientDocuments = async (id) => {
    // TODO: Adapt this to use mock data from context if needed
    try {
      setLoading((prev) => ({ ...prev, documents: true }));
      const response = await apiService.get(
        `/api/v1/admin/patients/${id}/documents`
      );
      setPatientDocuments(response.data || []);
    } catch (error) {
      console.error('Error fetching patient documents:', error);
    } finally {
      setLoading((prev) => ({ ...prev, documents: false }));
    }
  };


  // Event handlers (remain the same)
  const handleOpenFollowupNotes = (session = null) => {
    setSelectedSession(session);
    setShowFollowupNotes(true);
  };

  const handleCloseFollowupNotes = () => {
    setShowFollowupNotes(false);
    setSelectedSession(null);
  };

  // Render loading state while finding patient in context
  if (loading.patient) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  // Render not found state if patient not found in context
  if (!patient) {
    return <PatientNotFound patientId={patientId} />;
  }

  // Render patient details once found
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
        patientDocuments={patientDocuments}
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
          documents={patientDocuments} // Pass related data
          loading={loading.documents}
          fetchDocuments={() => fetchPatientDocuments(patientId)} // Keep API call for now, or adapt
        />
      )}

      {activeTab === 'forms' && (
        <PatientForms
          patientId={patientId}
          forms={patientForms} // Pass related data
          loading={loading.forms}
        />
      )}

      {activeTab === 'billing' && (
        <PatientBilling
          patient={patient} // Pass the found patient object
          invoices={patientInvoices} // Pass related data
          loading={loading.invoices}
          // Adapt refreshPatient if needed for mock data, or disable/remove
          refreshPatient={async () => {
             console.warn("Refresh patient called, but using mock data. No API call made.");
             // Optionally re-find from context if needed, though unlikely necessary
             // const refreshedPatient = contextPatients.find(p => p.id === patientId);
             // if (refreshedPatient) setPatient(refreshedPatient);
          }}
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
