// PatientDetail.jsx - Refactored main data fetch
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
// import apiService from "../../utils/apiService"; // Removed
import { usePatientById } from "../../apis/patients/hooks"; // Import the hook
import LoadingSpinner from "./patientDetails/common/LoadingSpinner";
import PatientNotFound from "./patientDetails/common/PatientNotFound";
import PatientHeader from "./patientDetails/PatientHeader";
import PatientTabs from "./patientDetails/PatientTabs";
import PatientInfo from "./patientDetails/PatientInfo";
import PatientSessions from "./patientDetails/PatientSessions";
import PatientOrders from "./patientDetails/PatientOrders";
import PatientNotes from "./patientDetails/PatientNotes";
import PatientForms from "./patientDetails/PatientForms";
import PatientBilling from "./patientDetails/PatientBilling";
import PatientFollowUpNotes from "./patientDetails/PatientFollowUpNotes";
import PatientDocuments from "./patientDetails/PatientDocuments";

// Removed apiService import


const PatientDetail = () => {
  const { patientId } = useParams();

  // Fetch patient data using the hook
  const {
    data: patient, // Rename data to patient
    isLoading: patientLoading, // Use isLoading from the hook
    error: patientError, // Use error from the hook
  } = usePatientById(patientId); // Pass patientId to the hook

  // Remove loading/data states for related data - managed by child components now
  // const [loading, setLoading] = useState({...});
  // const [patientSessions, setPatientSessions] = useState([]);
  // const [patientOrders, setPatientOrders] = useState([]);
  // const [patientNotes, setPatientNotes] = useState([]);
  // const [patientDocuments, setPatientDocuments] = useState([]);
  // const [patientForms, setPatientForms] = useState([]);
  // const [patientInvoices, setPatientInvoices] = useState([]);

  // UI states
  const [activeTab, setActiveTab] = useState("info"); // Default to info tab
  const [showFollowupNotes, setShowFollowupNotes] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Removed useEffect for fetching main patient data
  // Removed related data fetching functions (fetchPatientSessions, etc.) - handled by child components


  // Event handlers
  const handleOpenFollowupNotes = (session = null) => {
    setSelectedSession(session);
    setShowFollowupNotes(true);
  };

  const handleCloseFollowupNotes = () => {
    setShowFollowupNotes(false);
    setSelectedSession(null);
  };

  // Render loading state using patientLoading from hook
  if (patientLoading) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  // Handle error state from hook
  if (patientError) {
      console.error("Error fetching patient data:", patientError);
      toast.error(`Failed to load patient information: ${patientError.message}`);
      // Optionally render an error component or message
      return <div className="text-red-600 p-4">Error loading patient data. Please try again later.</div>;
  }


  // Render not found state (if hook returns null/undefined data without error)
  if (!patient) {
    return <PatientNotFound patientId={patientId} />;
  }

  // Removed refreshPatient function - invalidation handled by mutation hooks


  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <PatientHeader patient={patient} patientId={patientId} />

      {/* Tabs */}
      <PatientTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        // Remove related data props - child components fetch their own data
        // patientSessions={patientSessions}
        // patientOrders={patientOrders}
        // patientNotes={patientNotes}
        // patientDocuments={patientDocuments}
        // patientForms={patientForms}
      />

      {/* Content based on active tab */}
      {/* Pass patientId and patient object where needed */}
      {activeTab === "info" && <PatientInfo patient={patient} />}

      {activeTab === "sessions" && (
        <PatientSessions
          patientId={patientId}
          // Remove sessions and loading props
          onOpenFollowupNotes={handleOpenFollowupNotes}
        />
      )}

      {activeTab === "orders" && (
        <PatientOrders
          patientId={patientId}
          // Remove orders and loading props
        />
      )}

      {activeTab === "notes" && (
        <PatientNotes
          patientId={patientId}
           // Remove notes and loading props
          onOpenFollowupNotes={handleOpenFollowupNotes}
        />
      )}

      {activeTab === "documents" && (
        <PatientDocuments
          patientId={patientId}
           // Remove documents, loading, and fetchDocuments props
        />
      )}

      {activeTab === "forms" && (
        <PatientForms
          patientId={patientId}
           // Remove forms and loading props
        />
      )}

      {activeTab === "billing" && (
        <PatientBilling
          patient={patient} // Pass patient data for display
           // Remove invoices, loading, and refreshPatient props
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
