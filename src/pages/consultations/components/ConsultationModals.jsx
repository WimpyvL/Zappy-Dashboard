import React, { memo } from 'react';
import PropTypes from 'prop-types';
import PatientSelectionModal from './PatientSelectionModal';
import EmailPatientModal from './EmailPatientModal';
import InitialConsultationNotes from '../InitialConsultationNotes';

/**
 * Component that manages all consultation-related modals
 */
const ConsultationModals = ({
  showPatientSelectionModal,
  showConsultationNotesModal,
  showEmailModal,
  selectedPatientForNew,
  selectedConsultation,
  onClosePatientSelectionModal,
  onPatientSelected,
  onCloseNotesModal,
  onCloseEmailModal,
  updateStatusMutation,
}) => {
  return (
    <>
      {/* Patient Selection Modal */}
      <PatientSelectionModal
        isOpen={showPatientSelectionModal}
        onClose={onClosePatientSelectionModal}
        onSelectPatient={onPatientSelected}
      />

      {/* Consultation Notes Modal */}
      {showConsultationNotesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center z-50">
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            <InitialConsultationNotes
              patient={selectedPatientForNew}
              consultationData={selectedConsultation?.consultationData}
              consultationId={selectedConsultation?.id}
              readOnly={
                selectedConsultation?.status === 'reviewed' || 
                selectedConsultation?.status === 'archived'
              }
              onClose={onCloseNotesModal}
              updateStatusMutation={updateStatusMutation}
            />
          </div>
        </div>
      )}

      {/* Email Patient Modal */}
      <EmailPatientModal
        isOpen={showEmailModal}
        onClose={onCloseEmailModal}
        consultation={selectedConsultation}
      />
    </>
  );
};

ConsultationModals.propTypes = {
  showPatientSelectionModal: PropTypes.bool.isRequired,
  showConsultationNotesModal: PropTypes.bool.isRequired,
  showEmailModal: PropTypes.bool.isRequired,
  selectedPatientForNew: PropTypes.object,
  selectedConsultation: PropTypes.object,
  onClosePatientSelectionModal: PropTypes.func.isRequired,
  onPatientSelected: PropTypes.func.isRequired,
  onCloseNotesModal: PropTypes.func.isRequired,
  onCloseEmailModal: PropTypes.func.isRequired,
  updateStatusMutation: PropTypes.object,
};

export default memo(ConsultationModals);