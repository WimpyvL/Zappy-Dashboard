import React, { useState } from 'react'; // Removed unused useEffect
import { toast } from 'react-toastify';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';

// Import API Hooks
// import { usePatients } from '../../apis/patients/hooks'; // Removed unused import
import {
  useConsultations,
  useUpdateConsultationStatus,
  // useArchiveConsultation, // Assuming archive mutation exists
} from '../../apis/consultations/hooks';
import { useServices } from '../../apis/services/hooks';
import { useGetUsers } from '../../apis/users/hooks';

// Import Sub-components
import ConsultationListTable from './components/ConsultationListTable';
import ConsultationFilters from './components/ConsultationFilters';
import PatientSelectionModal from './components/PatientSelectionModal';
import EmailPatientModal from './components/EmailPatientModal';
import InitialConsultationNotes from './InitialConsultationNotes'; // Still used fullscreen/modal
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';

const InitialConsultations = () => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  const [showConsultationNotesModal, setShowConsultationNotesModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [selectedPatientForNew, setSelectedPatientForNew] = useState(null); // Patient selected for NEW consult
  const [selectedConsultation, setSelectedConsultation] = useState(null); // Consultation being viewed/edited/emailed

  // --- Data Fetching ---
  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: errorConsultations,
    refetch: refetchConsultations, // Get refetch function
  } = useConsultations({
    searchTerm,
    providerId: providerFilter !== 'all' ? providerFilter : undefined,
    // Add other filters if useConsultations hook supports them (status, service, date)
    // status: statusFilter !== 'all' ? statusFilter : undefined,
    // service: serviceFilter !== 'all' ? serviceFilter : undefined,
    // startDate: dateRange?.[0]?.toISOString(),
    // endDate: dateRange?.[1]?.toISOString(),
  });

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices();

  const {
    data: providersData,
    isLoading: isLoadingProviders,
    error: errorProviders,
  } = useGetUsers({ role: 'practitioner' });

  // --- Mutations ---
  const updateStatusMutation = useUpdateConsultationStatus({
    onSuccess: () => {
      toast.success('Consultation status updated.');
      refetchConsultations(); // Refetch list after status update
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // --- Process Data ---
  const allConsultations = consultationsData?.data || [];
  const allServices = servicesData?.data || [];
  const allProviders = providersData || [];

  // Client-side filtering (can be removed if hooks handle all filtering)
  const filteredConsultations = allConsultations.filter((consultation) => {
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    const matchesService = serviceFilter === 'all' || consultation.service === serviceFilter;
    let matchesDate = true;
    if (dateRange && (dateRange[0] || dateRange[1])) {
      try {
        const submittedDate = new Date(consultation.submitted_at);
        const start = dateRange[0]?.startOf('day').toDate();
        const end = dateRange[1]?.endOf('day').toDate();
        if (start && end) matchesDate = submittedDate >= start && submittedDate <= end;
        else if (start) matchesDate = submittedDate >= start;
        else if (end) matchesDate = submittedDate <= end;
      } catch (e) { matchesDate = false; }
    }
    return matchesStatus && matchesService && matchesDate;
  });

  // --- Handlers ---
  const handleOpenNewConsultation = () => {
    setShowPatientSelectionModal(true);
  };

  const handlePatientSelected = (patient) => {
    setSelectedPatientForNew(patient);
    setShowPatientSelectionModal(false);
    setShowConsultationNotesModal(true); // Open notes modal immediately after selection
  };

  const handleViewConsultation = (consultation) => {
    // Need patient data for the notes modal, find it (assuming consultations join patient data)
    // This might need adjustment based on actual data structure from useConsultations
    const patientData = {
        id: consultation.patient_id,
        name: consultation.patientName || 'Patient', // Use joined name if available
        email: consultation.email,
        dob: consultation.patients?.date_of_birth, // Example of accessing joined data
        // Add other necessary fields
    };
    setSelectedPatientForNew(patientData); // Set patient context for the notes modal
    setSelectedConsultation(consultation); // Set the consultation being viewed/edited
    setShowConsultationNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowConsultationNotesModal(false);
    setSelectedPatientForNew(null);
    setSelectedConsultation(null);
    refetchConsultations(); // Refetch list when notes modal closes
  };

  const handleSendEmail = (consultation) => {
    setSelectedConsultation(consultation); // Set consultation for email modal
    setShowEmailModal(true);
  };

  const handleArchive = (consultation) => {
    if (window.confirm('Are you sure you want to archive this consultation?')) {
      updateStatusMutation.mutate({ consultationId: consultation.id, status: 'archived' });
    }
  };

  const handleUpdateStatus = (consultation, status) => {
     updateStatusMutation.mutate({ consultationId: consultation.id, status });
  };

  // --- Loading & Error States ---
  const isLoading = isLoadingConsultations || isLoadingServices || isLoadingProviders; // Removed isLoadingPatients
  const error = errorConsultations || errorServices || errorProviders; // Removed errorPatients

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
      />

      <ConsultationListTable
        consultations={filteredConsultations}
        isLoading={isLoadingConsultations} // Pass specific loading state
        onViewConsultation={handleViewConsultation}
        onSendEmail={handleSendEmail}
        onArchive={handleArchive}
        onUpdateStatus={handleUpdateStatus}
        isMutatingStatus={updateStatusMutation.isLoading}
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
              consultationData={selectedConsultation?.consultationData} // Pass existing data if editing
              consultationId={selectedConsultation?.id} // Pass ID if editing
              readOnly={selectedConsultation?.status === 'reviewed' || selectedConsultation?.status === 'archived'}
              onClose={handleCloseNotesModal}
              updateStatusMutation={updateStatusMutation} // Pass mutation for edit unlock
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
