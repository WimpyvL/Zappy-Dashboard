import { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const usePatientFollowUpNotes = (patientId, selectedSessionId, onSaveSuccess) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (noteData) => {
    try {
      setLoading(true);

      // Send note to API
      await apiService.post(`/api/v1/admin/patients/${patientId}/notes`, {
        ...noteData,
        patientId,
        sessionId: selectedSessionId,
        category: 'follow-up', // Ensure category is always follow-up for this hook
      });

      // If follow-up is needed and date is set, also schedule a session
      if (noteData.followUpNeeded && noteData.followUpDate) {
        const sessionData = {
          patientId: patientId,
          type: noteData.followUpType,
          scheduledDate: noteData.followUpDate,
          status: 'scheduled',
          notes: `Follow-up session scheduled based on ${selectedSessionId ? 'previous' : 'general'} notes.`,
        };

        await apiService.post('/api/v1/admin/sessions', sessionData);
        toast.success('Follow-up session scheduled successfully');
      }

      toast.success('Follow-up note saved successfully');
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Failed to save follow-up note:', error);
      toast.error('Failed to save follow-up note');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading,
  };
};

export default usePatientFollowUpNotes;
