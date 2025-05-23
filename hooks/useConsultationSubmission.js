import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateConsultation } from '../../apis/consultations/hooks';
import { useScheduleFollowUp } from '../../apis/followUps/hooks';
import { useCreateInvoice } from '../../apis/invoices/hooks';
import { useAuth } from '../../contexts/auth/AuthContext';

export const useConsultationSubmission = () => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const createConsultationMutation = useCreateConsultation();
  const scheduleFollowUpMutation = useScheduleFollowUp();
  const createInvoiceMutation = useCreateInvoice();

  const validateConsultationData = useCallback((data) => {
    const errors = {};
    
    // Required fields
    if (!data.patient_id) errors.patient = 'Patient ID is required';
    if (!data.provider_id) errors.provider = 'Provider ID is required';
    if (!data.notes?.hpi) errors.hpi = 'History of Present Illness is required';
    if (!data.medication_order?.medications?.length) {
      errors.medications = 'At least one medication must be selected';
    }
    
    // Validate medications
    data.medication_order?.medications?.forEach((med, index) => {
      if (!med.dosage) {
        errors[`medication_${index}_dosage`] = `Dosage required for ${med.name}`;
      }
      if (!med.frequency) {
        errors[`medication_${index}_frequency`] = `Frequency required for ${med.name}`;
      }
      if (!med.approach) {
        errors[`medication_${index}_approach`] = `Approach required for ${med.name}`;
      }
    });
    
    // Validate follow-up
    if (!data.follow_up?.period) {
      errors.followUp = 'Follow-up period is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const checkDrugInteractions = useCallback(async (medications, patientAllergies) => {
    // This would typically call an API for drug interaction checking
    const interactions = [];
    
    // Example check for Sildenafil + Nitrates
    const hasSildenafil = medications.some(med => 
      med.name.toLowerCase().includes('sildenafil') || 
      med.name.toLowerCase().includes('viagra')
    );
    
    if (hasSildenafil && patientAllergies?.toLowerCase().includes('nitrate')) {
      interactions.push({
        severity: 'high',
        message: 'Sildenafil is contraindicated with nitrates'
      });
    }
    
    return interactions;
  }, []);

  const getFollowUpPricing = useCallback((period) => {
    const pricing = {
      '2w': 49.99,
      '4w': 39.99,
      '6w': 29.99,
      'custom': 59.99
    };
    return pricing[period] || 59.99;
  }, []);

  const submitConsultation = useCallback(async (consultationData) => {
    try {
      setIsSubmitting(true);
      setValidationErrors({});
      
      // Add provider ID
      const dataWithProvider = {
        ...consultationData,
        provider_id: currentUser?.id || null
      };
      
      // Validate data
      const { isValid, errors } = validateConsultationData(dataWithProvider);
      if (!isValid) {
        setValidationErrors(errors);
        Object.values(errors).forEach(error => toast.error(error));
        return { success: false, errors };
      }
      
      // Check drug interactions
      const interactions = await checkDrugInteractions(
        dataWithProvider.medication_order.medications,
        dataWithProvider.notes.contraindications
      );
      
      if (interactions.some(i => i.severity === 'high')) {
        const error = 'High-risk drug interaction detected. Please review medications.';
        toast.error(error);
        return { success: false, error };
      }
      
      // Submit consultation
      const consultation = await createConsultationMutation.mutateAsync(dataWithProvider);
      
      // Create invoice if needed
      let invoiceId = null;
      if (consultation && consultationData.patient_id) {
        const followUpPrice = getFollowUpPricing(consultationData.follow_up.period);
        
        const invoice = await createInvoiceMutation.mutateAsync({
          patient_id: consultationData.patient_id,
          consultation_id: consultation.id,
          items: [{
            description: `Follow-up consultation (${consultationData.follow_up.display_text})`,
            amount: followUpPrice,
            quantity: 1
          }],
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        if (invoice) {
          invoiceId = invoice.id;
          toast.info(`Invoice created: $${followUpPrice}`);
        }
      }
      
      // Schedule follow-up
      if (consultation && consultationData.follow_up.template_id) {
        await scheduleFollowUpMutation.mutateAsync({
          patientId: consultationData.patient_id,
          consultationId: consultation.id,
          templateId: consultationData.follow_up.template_id,
          period: consultationData.follow_up.period,
          paymentStatus: 'pending',
          invoiceId
        });
        
        toast.info(`Follow-up scheduled for ${consultationData.follow_up.display_text}`);
      }
      
      // Notify patient (moved to separate service)
      await notifyPatient(consultation.id, consultationData);
      
      toast.success('Consultation submitted successfully!');
      return { success: true, consultationId: consultation.id };
      
    } catch (error) {
      console.error('Error submitting consultation:', error);
      const errorMessage = error.message || 'Error submitting consultation';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentUser,
    createConsultationMutation,
    createInvoiceMutation,
    scheduleFollowUpMutation,
    validateConsultationData,
    checkDrugInteractions,
    getFollowUpPricing
  ]);

  const notifyPatient = async (consultationId, consultationData) => {
    try {
      const { notifyPatientOfNewNote } = await import('../../services/notificationService');
      const template = getNotificationTemplate(consultationData);
      
      const result = await notifyPatientOfNewNote({
        patientId: consultationData.patient_id,
        noteId: consultationId,
        templateId: template
      });
      
      if (result.success) {
        const channels = Object.keys(result.channels || {})
          .filter(channel => result.channels[channel].success)
          .join(', ');
        
        if (channels) {
          toast.success(`Patient notified via: ${channels}`);
        }
      }
    } catch (error) {
      console.error('Failed to notify patient:', error);
    }
  };

  const getNotificationTemplate = (consultationData) => {
    const templates = {
      1: 'tpl_weight_management',
      2: 'tpl_ed',
      3: 'tpl_hair_loss'
    };
    
    return templates[consultationData.service_id] || 'tpl_standard';
  };

  return {
    submitConsultation,
    isSubmitting,
    validationErrors,
    setValidationErrors
  };
};
