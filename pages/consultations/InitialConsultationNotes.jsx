import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/auth/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

// Custom hooks
import { useConsultationSubmission } from '../../hooks/useConsultationSubmission';
import { useMedicationManagement } from '../../hooks/useMedicationManagement';
import { useServiceManagement } from '../../hooks/useServiceManagement';
import { usePatientFormSubmissions } from '../../apis/formSubmissions/hooks';
import { useFollowUpTemplatesByCategoryAndPeriod } from '../../apis/followUps/hooks';

// Import components
import {
  ServiceTagsHeader,
  ServicePanel,
  AlertCenterCard,
  PatientInfoCard,
  MedicationsCard,
  CommunicationCard,
  AssessmentPlanCard,
  ConsultationFooter,
  AIPanel,
  IntakeFormPanel
} from './components/consultation-notes';

// Import CSS
import './InitialConsultationNotes.css';

const InitialConsultationNotes = ({
  patient,
  onClose,
  consultationData,
  consultationId,
  readOnly = false,
  updateStatusMutation,
}) => {
  // Auth context
  const { currentUser } = useAuth();
  
  // Custom hooks
  const { submitConsultation, isSubmitting, validationErrors } = useConsultationSubmission();
  const medicationManager = useMedicationManagement(consultationData?.medications);
  const { activeServices, addService, removeService } = useServiceManagement(
    consultationData?.services || { 'wm': { name: 'Weight Management', dotClass: 'wm-dot' } }
  );

  // Form state - simplified
  const [formState, setFormState] = useState({
    hpi: consultationData?.notes?.hpi || '',
    pmh: consultationData?.notes?.pmh || '',
    contraindications: consultationData?.notes?.contraindications || 'No known contra-indications...',
    assessmentPlan: consultationData?.communication?.assessmentPlan || 'Obesity with good response to treatment',
    patientHistory: consultationData?.notes?.patientHistory || patient?.healthHistory || '',
    followUp: {
      period: consultationData?.follow_up?.period || '2w',
      displayText: consultationData?.follow_up?.displayText || '2 weeks',
      templateId: consultationData?.follow_up?.templateId || null
    },
    selectedResources: consultationData?.resources || []
  });

  // UI state
  const [uiState, setUiState] = useState({
    showServicePanel: false,
    showAIPanel: false,
    showIntakeForm: false,
    adjustFollowUp: true
  });

  // Patient form submissions
  const { data: formSubmissions } = usePatientFormSubmissions(patient?.id);
  
  // Get primary service category
  const primaryServiceCategory = useMemo(() => {
    const serviceKeys = Object.keys(activeServices);
    return serviceKeys.length > 0 ? serviceKeys[0] : 'weight_management';
  }, [activeServices]);
  
  // Fetch follow-up templates
  const { data: followUpTemplates } = useFollowUpTemplatesByCategoryAndPeriod(
    primaryServiceCategory,
    formState.followUp.period
  );

  // Update follow-up template when templates load
  useEffect(() => {
    if (followUpTemplates?.length > 0 && !formState.followUp.templateId) {
      setFormState(prev => ({
        ...prev,
        followUp: {
          ...prev.followUp,
          templateId: followUpTemplates[0].id
        }
      }));
    }
  }, [followUpTemplates, formState.followUp.templateId]);

  // Pre-select medications based on patient preferences
  useEffect(() => {
    if (!formSubmissions) return;
    
    const latestSubmissions = {};
    formSubmissions.forEach(submission => {
      const categoryId = submission.category_id;
      if (!latestSubmissions[categoryId] || 
          new Date(submission.submitted_at) > new Date(latestSubmissions[categoryId].submitted_at)) {
        latestSubmissions[categoryId] = submission;
      }
    });
    
    Object.values(latestSubmissions).forEach(submission => {
      if (submission.preferred_product_id) {
        const medicationId = submission.preferred_product_id.replace('_product', '');
        if (medicationManager.medications[medicationId] && !medicationManager.isMedicationSelected(medicationId)) {
          medicationManager.toggleMedication(medicationId);
          toast.info(`Pre-selected ${medicationManager.medications[medicationId].name} based on patient preference`);
        }
      }
    });
  }, [formSubmissions, medicationManager]);

  // Update form field
  const updateFormField = useCallback((field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Update follow-up
  const updateFollowUp = useCallback((period, displayText) => {
    setFormState(prev => ({
      ...prev,
      followUp: {
        ...prev.followUp,
        period,
        displayText
      }
    }));
    
    if (period === '2w') {
      setUiState(prev => ({ ...prev, adjustFollowUp: true }));
    }
  }, []);

  // Toggle UI panels
  const toggleUIPanel = useCallback((panel) => {
    setUiState(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  }, []);

  // Handle patient history save
  const handleSavePatientHistory = useCallback(async (history) => {
    updateFormField('patientHistory', history);
    
    if (!consultationId && patient?.id) {
      try {
        const { updatePatientHistory } = await import('../../services/patientService');
        await updatePatientHistory(patient.id, history);
        toast.success('Patient history updated');
      } catch (error) {
        console.error('Error updating patient history:', error);
        toast.error('Failed to update patient history');
      }
    }
  }, [consultationId, patient?.id, updateFormField]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const consultationData = {
      patient_id: patient?.id,
      provider_id: currentUser?.id,
      service_id: Object.keys(activeServices)[0], // Primary service
      service_name: Object.values(activeServices)[0]?.name,
      status: 'completed',
      notes: {
        hpi: formState.hpi,
        pmh: formState.pmh,
        contraindications: formState.contraindications,
        assessmentPlan: formState.assessmentPlan,
        patientHistory: formState.patientHistory
      },
      medication_order: {
        medications: medicationManager.getFormattedMedications()
      },
      follow_up: formState.followUp,
      resources: formState.selectedResources,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const result = await submitConsultation(consultationData);
    
    if (result.success) {
      onClose();
    }
  }, [
    patient,
    currentUser,
    activeServices,
    formState,
    medicationManager,
    submitConsultation,
    onClose
  ]);

  // Handle save draft
  const handleSave = useCallback(() => {
    // TODO: Implement draft saving
    toast.success('Draft saved successfully!');
    onClose();
  }, [onClose]);

  // Loading state
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="consultation-notes-container">
      {/* Header */}
      <ServiceTagsHeader 
        patientName={patient?.name}
        activeServices={activeServices}
        toggleServicePanel={() => toggleUIPanel('showServicePanel')}
        removeServiceTag={removeService}
        toggleAIPanel={() => toggleUIPanel('showAIPanel')}
      />

      {/* Service Panel */}
      {uiState.showServicePanel && (
        <ServicePanel 
          showServicePanel={uiState.showServicePanel}
          toggleServicePanel={() => toggleUIPanel('showServicePanel')}
          serviceOptions={[
            { id: 'wm', name: 'Weight Management', dotClass: 'wm-dot' },
            { id: 'ed', name: 'ED', dotClass: 'ed-dot' },
            { id: 'pc', name: 'Primary Care', dotClass: 'pc-dot' },
            { id: 'mh', name: 'Mental Health', dotClass: 'mh-dot' }
          ]}
          activeServices={activeServices}
          addServiceTag={addService}
        />
      )}

      {/* Main Content */}
      <div className="container">
        <div className="main-grid">
          {/* Left Column */}
          <div>
            <PatientInfoCard 
              patient={patient}
              patientHistory={formState.patientHistory}
              onSaveHistory={handleSavePatientHistory}
              toggleIntakeForm={() => toggleUIPanel('showIntakeForm')}
            />

            <AlertCenterCard 
              adjustFollowUp={uiState.adjustFollowUp}
              setAdjustFollowUp={(value) => setUiState(prev => ({ ...prev, adjustFollowUp: value }))}
            />

            <MedicationsCard
              medicationData={medicationManager.medications}
              medicationDosages={medicationManager.selectedMedications}
              toggleMedication={medicationManager.toggleMedication}
              selectDosage={medicationManager.updateDosage}
              updateApproach={medicationManager.updateApproach}
              updateFrequency={medicationManager.updateFrequency}
              updateInstructions={medicationManager.updateInstructions}
              addCustomMedication={medicationManager.addCustomMedication}
              isMedicationSelected={medicationManager.isMedicationSelected}
              getMedicationConfig={medicationManager.getMedicationConfig}
            />
          </div>

          {/* Right Column */}
          <div>
            <CommunicationCard
              selectedFollowUpPeriod={formState.followUp.period}
              followUpDisplayText={formState.followUp.displayText}
              selectFollowupPeriod={updateFollowUp}
              resourceOptions={[
                { id: 'glp1', name: 'GLP-1 Guide', category: 'wm', dotClass: 'wm-dot' },
                { id: 'ed', name: 'ED Guide', category: 'ed', dotClass: 'ed-dot' },
                { id: 'diet', name: 'Diet Plan', category: '', dotClass: '' },
                { id: 'exercise', name: 'Exercise Plan', category: '', dotClass: '' },
                { id: 'safety', name: 'Safety Info', category: '', dotClass: '' }
              ]}
              selectedResources={formState.selectedResources}
              toggleResource={(resourceId) => {
                setFormState(prev => ({
                  ...prev,
                  selectedResources: prev.selectedResources.includes(resourceId)
                    ? prev.selectedResources.filter(r => r !== resourceId)
                    : [...prev.selectedResources, resourceId]
                }));
              }}
              serviceCategory={primaryServiceCategory}
              medicationData={medicationManager.medications}
              medicationDosages={medicationManager.selectedMedications}
            />
            
            <AssessmentPlanCard 
              assessmentPlan={formState.assessmentPlan}
              setAssessmentPlan={(value) => updateFormField('assessmentPlan', value)}
              selectedMedications={medicationManager.getFormattedMedications()}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <ConsultationFooter 
        onClose={onClose}
        handleSave={handleSave}
        handleSubmit={handleSubmit}
        readOnly={readOnly}
        isSubmitting={isSubmitting}
      />

      {/* Modals */}
      {uiState.showAIPanel && (
        <AIPanel 
          showAIPanel={uiState.showAIPanel}
          toggleAIPanel={() => toggleUIPanel('showAIPanel')}
          patient={patient}
          medications={medicationManager.getFormattedMedications()}
          activeServices={activeServices}
        />
      )}

      {uiState.showIntakeForm && (
        <IntakeFormPanel 
          patientId={patient?.id}
          showIntakeForm={uiState.showIntakeForm}
          toggleIntakeForm={() => toggleUIPanel('showIntakeForm')}
        />
      )}
    </div>
  );
};

export default InitialConsultationNotes;
