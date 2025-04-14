import React, { useState } from 'react';
import PatientModal from './PatientModal';
import PatientListHeader from './components/PatientListHeader';
import PatientListFilters from './components/PatientListFilters';
import PatientTable from './components/PatientTable';
import PaginationControls from '../../components/common/PaginationControls'; // Adjusted path
import { usePatientListManagement } from '../../hooks/usePatientListManagement';

const Patients = () => {
  const {
    // State from hook
    searchTerm,
    statusFilter,
    tagFilter,
    subscriptionPlanFilter,
    searchType,
    selectedPatients,
    loading,
    error,
    patients,
    paginationMeta,
    paginationLinks,
    tags,
    uniquePlanNames,
    allSelected,
    showBulkActions,

    // Setters & Handlers from hook
    setSearchTerm,
    setStatusFilter,
    setTagFilter,
    setSubscriptionPlanFilter,
    setSearchType,
    handlePageChange,
    goToLink,
    handlePatientSelection,
    toggleSelectAll,
    clearSelection,
    resetFilters,
    refetchPatients,
  } = usePatientListManagement(); // Use the custom hook

  // Modal State (remains in the component)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Modal Handlers
  const handleOpenAddModal = () => setShowAddModal(true);

  const handleOpenEditModal = (patient) => {
    setEditingPatientId(patient.id);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingPatientId(null);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    refetchPatients(); // Refetch data after add/edit success
  };

  return (
    <div>
      {/* Header */}
      <PatientListHeader
        showBulkActions={showBulkActions}
        selectedCount={selectedPatients.length}
        onAddPatientClick={handleOpenAddModal}
        onClearSelection={clearSelection}
        // Pass bulk action handlers here if implemented
      />

      {/* Filters */}
      <PatientListFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        subscriptionPlanFilter={subscriptionPlanFilter}
        setSubscriptionPlanFilter={setSubscriptionPlanFilter}
        tags={tags}
        uniquePlanNames={uniquePlanNames}
        onResetFilters={resetFilters}
      />

      {/* Table and Pagination Container */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <PatientTable
          patients={patients}
          tags={tags}
          selectedPatients={selectedPatients}
          allSelected={allSelected}
          onSelectPatient={handlePatientSelection}
          onSelectAll={toggleSelectAll}
          onEditPatient={handleOpenEditModal}
          loading={loading}
          error={error}
        />
        <PaginationControls
          paginationMeta={paginationMeta}
          paginationLinks={paginationLinks}
          onPageChange={handlePageChange}
          onGoToLink={goToLink}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <PatientModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
        />
      )}
      {showEditModal && editingPatientId && (
        <PatientModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          editingPatientId={editingPatientId}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Patients;
