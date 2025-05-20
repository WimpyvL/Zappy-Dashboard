import { useState } from 'react';

/**
 * Custom hook to manage consultation-related modals
 * @returns {Object} - Modal states and handler functions
 */
export const useConsultationModals = () => {
  // Modal visibility states
  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  const [showConsultationNotesModal, setShowConsultationNotesModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Selected data states
  const [selectedPatientForNew, setSelectedPatientForNew] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Handler functions
  const handleOpenNewConsultation = () => {
    setShowPatientSelectionModal(true);
  };

  const handlePatientSelected = (patient) => {
    setSelectedPatientForNew(patient);
    setShowPatientSelectionModal(false);
    setShowConsultationNotesModal(true);
  };

  const handleViewConsultation = (consultation) => {
    // Extract patient data from consultation
    const patientData = {
      id: consultation.patient_id,
      name: consultation.patientName || 'Patient',
      email: consultation.email,
      dob: consultation.patients?.date_of_birth,
    };
    setSelectedPatientForNew(patientData);
    setSelectedConsultation(consultation);
    setShowConsultationNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowConsultationNotesModal(false);
    setSelectedPatientForNew(null);
    setSelectedConsultation(null);
  };

  const handleSendEmail = (consultation) => {
    setSelectedConsultation(consultation);
    setShowEmailModal(true);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setSelectedConsultation(null);
  };

  const handleClosePatientSelectionModal = () => {
    setShowPatientSelectionModal(false);
  };

  return {
    // Modal states
    showPatientSelectionModal,
    showConsultationNotesModal,
    showEmailModal,
    
    // Selected data
    selectedPatientForNew,
    selectedConsultation,
    
    // Handler functions
    handleOpenNewConsultation,
    handlePatientSelected,
    handleViewConsultation,
    handleCloseNotesModal,
    handleSendEmail,
    handleCloseEmailModal,
    handleClosePatientSelectionModal,
  };
};