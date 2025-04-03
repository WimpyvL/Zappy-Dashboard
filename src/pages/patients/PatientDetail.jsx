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

const PatientDetail = () => {
  const { patientId } = useParams();

  // Loading states for different data types
  const [loading, setLoading] = useState({
    patient: true,
    sessions: false,
    orders: false,
    notes: false,
    documents: false,
    forms: false,
    invoices: false,
  });

  // Data states
  const [patient, setPatient] = useState(null);
  const [patientSessions] = useState([]); // Removed unused setPatientSessions
  const [patientOrders] = useState([]); // Removed unused setPatientOrders
  const [patientNotes] = useState([]); // Removed unused setPatientNotes
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [patientForms] = useState([]); // Removed unused setPatientForms
  const [patientInvoices] = useState([]); // Removed unused setPatientInvoices

  // UI states
  const [activeTab, setActiveTab] = useState('info');
  const [showFollowupNotes, setShowFollowupNotes] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch patient data using API
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading((prev) => ({ ...prev, patient: true }));
        const patientResponse = await apiService.patients.getById(patientId);
        setPatient(patientResponse);

        // Fetch related data in parallel
        // fetchPatientSessions(patientId);
        // fetchPatientOrders(patientId);
        // fetchPatientNotes(patientId);
        // fetchPatientDocuments(patientId);
        // fetchPatientForms(patientId);
        // fetchPatientInvoices(patientId);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast.error('Failed to load patient information');
      } finally {
        setLoading((prev) => ({ ...prev, patient: false }));
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  // Data fetching functions (Removed unused fetchPatientSessions, fetchPatientOrders, fetchPatientNotes, fetchPatientForms, fetchPatientInvoices)
  // const fetchPatientSessions = async (id) => { ... };
  // const fetchPatientOrders = async (id) => { ... };
  // const fetchPatientNotes = async (id) => { ... };
  const fetchPatientDocuments = async (id) => {
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
  // const fetchPatientForms = async (id) => { ... };
  // const fetchPatientInvoices = async (id) => { ... };


  // Event handlers
  const handleOpenFollowupNotes = (session = null) => {
    setSelectedSession(session);
    setShowFollowupNotes(true);
  };

  const handleCloseFollowupNotes = () => {
    setShowFollowupNotes(false);
    setSelectedSession(null);
  };

  // Render loading state
  if (loading.patient) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  // Render not found state
  if (!patient) {
    return <PatientNotFound patientId={patientId} />;
  }

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <PatientHeader patient={patient} patientId={patientId} />

      {/* Tabs */}
      <PatientTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patientSessions={patientSessions}
        patientOrders={patientOrders}
        patientNotes={patientNotes}
        patientDocuments={patientDocuments}
        patientForms={patientForms}
      />

      {/* Content based on active tab */}
      {activeTab === 'info' && <PatientInfo patient={patient} />}

      {activeTab === 'sessions' && (
        <PatientSessions
          patientId={patientId}
          sessions={patientSessions}
          loading={loading.sessions}
          onOpenFollowupNotes={handleOpenFollowupNotes}
        />
      )}

      {activeTab === 'orders' && (
        <PatientOrders
          patientId={patientId}
          orders={patientOrders}
          loading={loading.orders}
        />
      )}

      {activeTab === 'notes' && (
        <PatientNotes
          patientId={patientId}
          notes={patientNotes}
          loading={loading.notes}
          onOpenFollowupNotes={handleOpenFollowupNotes}
        />
      )}

      {activeTab === 'documents' && (
        <PatientDocuments
          patientId={patientId}
          documents={patientDocuments}
          loading={loading.documents}
          fetchDocuments={() => fetchPatientDocuments(patientId)}
        />
      )}

      {activeTab === 'forms' && (
        <PatientForms
          patientId={patientId}
          forms={patientForms}
          loading={loading.forms}
        />
      )}

      {activeTab === 'billing' && (
        <PatientBilling
          patient={patient}
          invoices={patientInvoices}
          loading={loading.invoices}
          refreshPatient={async () => {
            try {
              const patientResponse =
                await apiService.patients.getById(patientId);
              setPatient(patientResponse.data);
            } catch (error) {
              console.error('Error refreshing patient data:', error);
            }
          }}
        />
      )}

      {/* Follow-up Notes Modal */}
      {showFollowupNotes && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <PatientFollowUpNotes
              patient={patient}
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
