import React, { useState, useEffect } from 'react'; // Import useEffect
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { Plus, Loader2, AlertTriangle } from 'lucide-react';

// Import Hook
import { useConsultationListManagement } from '../../hooks/useConsultationListManagement';

// Import Sub-components
import ConsultationListTable from './components/ConsultationListTable';
import ConsultationFilters from './components/ConsultationFilters';
import PatientSelectionModal from './components/PatientSelectionModal';
import EmailPatientModal from './components/EmailPatientModal';
import InitialConsultationNotes from './InitialConsultationNotes'; // Still used fullscreen/modal
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';

const InitialConsultations = () => {
  // --- Use Custom Hook ---
  const {
    // State from hook
    searchTerm,
    statusFilter,
    providerFilter,
    serviceFilter,
    dateRange,
    isLoading,
    error,
    consultations, // Use filtered consultations from hook
    allServices,
    allProviders,
    isMutatingStatus,

    // Setters & Handlers from hook
    setSearchTerm,
    setStatusFilter,
    setProviderFilter,
    setServiceFilter,
    setDateRange,
    handleUpdateStatus, // Use handler from hook
    handleArchive,      // Use handler from hook
    refetchConsultations,
  } = useConsultationListManagement('pending'); // Initialize with 'pending' filter

  // --- Component State (Modals, Selection for Modals) ---
  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  const [showConsultationNotesModal, setShowConsultationNotesModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [selectedPatientForNew, setSelectedPatientForNew] = useState(null); // Patient selected for NEW consult
  const [selectedConsultation, setSelectedConsultation] = useState(null); // Consultation being viewed/edited/emailed

  const location = useLocation(); // Hook to access location object (query params)
  const navigate = useNavigate(); // Hook for navigation (to clear query params)

  // Effect to check for 'review' query parameter and open modal
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const reviewId = queryParams.get('review');

    // Only proceed if reviewId exists, consultations are loaded, and modal isn't already open for this ID
    if (reviewId && !isLoading && consultations.length > 0 && selectedConsultation?.id !== reviewId) {
      const consultationToReview = consultations.find(c => c.id === reviewId);
      if (consultationToReview) {
        console.log(`Opening consultation ${reviewId} for review from URL parameter.`);
        handleViewConsultation(consultationToReview);

        // Clear the query parameter from the URL after opening
        queryParams.delete('review');
        navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
      } else {
         console.warn(`Consultation with ID ${reviewId} not found in the current list.`);
         // Optionally clear the param even if not found
         queryParams.delete('review');
         navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, isLoading, consultations, selectedConsultation?.id, navigate]); // Dependencies


  // --- Modal Handlers ---
  const handleOpenNewConsultation = () => {
    setShowPatientSelectionModal(true);
  };

  const handlePatientSelected = (patient) => {
    setSelectedPatientForNew(patient);
    setShowPatientSelectionModal(false);
    setSelectedConsultation(null); // Ensure no existing consultation is selected
    setShowConsultationNotesModal(true); // Open notes modal for new consultation
  };

  const handleViewConsultation = (consultation) => {
    // Prepare patient data needed by the notes modal
    // This assumes the consultation object fetched by the hook includes necessary patient details
    // Adjust based on the actual structure of the 'consultation' object
    const patientData = {
      id: consultation.patient_id,
      // Prefer specific fields if available, otherwise construct name
      first_name: consultation.patients?.first_name || consultation.patientFirstName || '',
      last_name: consultation.patients?.last_name || consultation.patientLastName || '',
      name: `${consultation.patients?.first_name || consultation.patientFirstName || ''} ${consultation.patients?.last_name || consultation.patientLastName || ''}`.trim() || 'Patient',
      email: consultation.patients?.email || consultation.email || '', // Prefer patient table email
      dob: consultation.patients?.date_of_birth,
      // Add other necessary fields from consultation.patients or consultation itself
    };
    setSelectedPatientForNew(patientData); // Set patient context for the notes modal
    setSelectedConsultation(consultation); // Set the consultation being viewed/edited
    setShowConsultationNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowConsultationNotesModal(false);
    setSelectedPatientForNew(null);
    setSelectedConsultation(null);
    refetchConsultations(); // Refetch list when notes modal closes (in case status changed)
  };

  const handleSendEmail = (consultation) => {
    setSelectedConsultation(consultation); // Set consultation for email modal
    setShowEmailModal(true);
  };

  // Confirmation for archive is now handled within the hook's handleArchive if desired,
  // or can be added here before calling handleArchive.
  const confirmAndArchive = (consultation) => {
     if (window.confirm('Are you sure you want to archive this consultation?')) {
       handleArchive(consultation); // Call hook's archive handler
     }
  };


  // --- Loading & Error States (Directly from Hook) ---

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading page data: {error.message}</p>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="relative overflow-hidden pb-10">
      <ChildishDrawingElement type="watercolor" color="accent2" position="top-right" size={120} rotation={-10} opacity={0.1} />
      <ChildishDrawingElement type="doodle" color="accent4" position="bottom-left" size={100} rotation={15} opacity={0.1} />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-2xl font-bold text-gray-800">Initial Consultations</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
          onClick={handleOpenNewConsultation}
        >
          <Plus className="h-5 w-5 mr-2" /> New Consultation
        </button>
      </div>

      <ConsultationFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        providerFilter={providerFilter}
        serviceFilter={serviceFilter}
        dateRange={dateRange}
        providers={allProviders}
        services={allServices}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onProviderFilterChange={setProviderFilter}
        onServiceFilterChange={setServiceFilter}
        onDateRangeChange={setDateRange}
        // Add reset handler if needed in filters component
      />

      <ConsultationListTable
        consultations={consultations} // Use consultations from hook
        isLoading={isLoading} // Use combined loading state from hook
        onViewConsultation={handleViewConsultation}
        onSendEmail={handleSendEmail}
        onArchive={confirmAndArchive} // Use confirmation wrapper
        onUpdateStatus={handleUpdateStatus} // Use handler from hook
        isMutatingStatus={isMutatingStatus} // Use mutation state from hook
      />

      {/* Modals */}
      <PatientSelectionModal
        isOpen={showPatientSelectionModal}
        onClose={() => setShowPatientSelectionModal(false)}
        onSelectPatient={handlePatientSelected}
      />

      {showConsultationNotesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center z-50">
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            <InitialConsultationNotes
              patient={selectedPatientForNew} // Pass selected patient
              // Pass consultation data directly if needed by notes component
              consultationData={selectedConsultation} // Pass the whole selected consultation object
              consultationId={selectedConsultation?.id} // Pass ID if editing
              readOnly={selectedConsultation?.status === 'reviewed' || selectedConsultation?.status === 'archived'}
              onClose={handleCloseNotesModal}
              // Removed updateStatusMutation prop, not needed directly
            />
          </div>
        </div>
      )}

      <EmailPatientModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        consultation={selectedConsultation}
      />
    </div>
  );
};

export default InitialConsultations;
