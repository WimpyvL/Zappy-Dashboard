import { toast } from 'react-toastify';
import { useSendFormReminder, useResendForm, useSendFormToPatient } from '../apis/forms/hooks';

const usePatientFormActions = (patientId, onFormSelectSuccess) => {
  const sendReminderMutation = useSendFormReminder();
  const resendFormMutation = useResendForm();
  const sendFormToPatientMutation = useSendFormToPatient({
    onSuccess: () => {
      if (onFormSelectSuccess) {
        onFormSelectSuccess();
      }
      // Optionally refetch forms list here if needed
    }
  });

  // Send form reminder
  const handleSendFormReminder = (formId) => {
    sendReminderMutation.mutate({ patientId, formId });
  };

  // Resend form
  const handleResendForm = (formId) => {
    resendFormMutation.mutate({ patientId, formId });
  };

  // Handle form selection from modal
  const handleFormSelect = (formId) => {
    if (!formId) return;

    sendFormToPatientMutation.mutate({
      patientId,
      formId
    });
  };

  return {
    handleSendFormReminder,
    handleResendForm,
    handleFormSelect,
    sendReminderLoading: sendReminderMutation.isLoading,
    resendFormLoading: resendFormMutation.isLoading,
    sendFormLoading: sendFormToPatientMutation.isLoading,
    sendReminderVariables: sendReminderMutation.variables,
    resendFormVariables: resendFormMutation.variables,
    sendFormVariables: sendFormToPatientMutation.variables,
  };
};

export default usePatientFormActions;
