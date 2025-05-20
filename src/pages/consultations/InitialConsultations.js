import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

// Import custom hooks
import { useConsultationData, useConsultationStatusUpdate } from '../../hooks/useConsultationData';
import { useConsultationModals } from '../../hooks/useConsultationModals';

// Import components
import ConsultationHeader from './components/ConsultationHeader';
import ConsultationFilters from './components/ConsultationFilters';
import ConsultationListTable from './components/ConsultationListTable';
import ConsultationLoading from './components/ConsultationLoading';
import ConsultationError from './components/ConsultationError';
import ConsultationModals from './components/ConsultationModals';

/**
 * Initial Consultations page component
 * Manages consultations listing, filtering, and actions
 */
const InitialConsultations = () => {
  // Use custom hooks for data fetching and state management
  const {
    consultations: filteredConsultations,
    services: allServices,
    providers: allProviders,
    filters: {
      searchTerm,
      statusFilter,
      providerFilter,
      serviceFilter,
      dateRange,
    },
    setSearchTerm,
    setStatusFilter,
    setProviderFilter,
    setServiceFilter,
    setDateRange,
    isLoading,
    error,
    refetchConsultations,
  } = useConsultationData();

  // Use custom hook for modal management
  const {
    showPatientSelectionModal,
    showConsultationNotesModal,
    showEmailModal,
    selectedPatientForNew,
    selectedConsultation,
    handleOpenNewConsultation,
    handlePatientSelected,
    handleViewConsultation,
    handleCloseNotesModal,
    handleSendEmail,
    handleCloseEmailModal,
    handleClosePatientSelectionModal,
  } = useConsultationModals();

  // Status update mutation
  const updateStatusMutation = useConsultationStatusUpdate(() => {
    toast.success('Consultation status updated.');
    refetchConsultations();
  });

  // Handler for archiving a consultation
  const handleArchive = useCallback((consultation) => {
    if (window.confirm('Are you sure you want to archive this consultation?')) {
      updateStatusMutation.mutate({ 
        consultationId: consultation.id, 
        status: 'archived' 
      });
    }
  }, [updateStatusMutation]);

  // Handler for updating consultation status
  const handleUpdateStatus = useCallback((consultation, status) => {
    updateStatusMutation.mutate({ 
      consultationId: consultation.id, 
      status 
    });
  }, [updateStatusMutation]);

  // If loading, show loading state
  if (isLoading) {
    return <ConsultationLoading />;
  }

  // If error, show error state
  if (error) {
    return <ConsultationError error={error} onRetry={refetchConsultations} />;
  }

  return (
    <div className="relative overflow-hidden pb-10">
      {/* Header with title and new consultation button */}
      <ConsultationHeader onNewConsultation={handleOpenNewConsultation} />

      {/* Filters section */}
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

      {/* Consultations table */}
      <ConsultationListTable
        consultations={filteredConsultations}
        isLoading={isLoading}
        onViewConsultation={handleViewConsultation}
        onSendEmail={handleSendEmail}
        onArchive={handleArchive}
        onUpdateStatus={handleUpdateStatus}
        isMutatingStatus={updateStatusMutation.isLoading}
      />

      {/* Modals */}
      <ConsultationModals
        showPatientSelectionModal={showPatientSelectionModal}
        showConsultationNotesModal={showConsultationNotesModal}
        showEmailModal={showEmailModal}
        selectedPatientForNew={selectedPatientForNew}
        selectedConsultation={selectedConsultation}
        onClosePatientSelectionModal={handleClosePatientSelectionModal}
        onPatientSelected={handlePatientSelected}
        onCloseNotesModal={handleCloseNotesModal}
        onCloseEmailModal={handleCloseEmailModal}
        updateStatusMutation={updateStatusMutation}
      />
    </div>
  );
};

export default InitialConsultations;
