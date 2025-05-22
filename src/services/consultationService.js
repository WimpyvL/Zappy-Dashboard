/**
 * Consultation Service
 * 
 * This service handles the creation of consultations from intake form data,
 * including AI summarization and provider assignment.
 */

import { supabase } from '../lib/supabase';
import { generateIntakeSummary } from '../apis/ai/summaryService';

// Mock providers for round-robin assignment
const mockProviders = [
  { id: 'prov1', name: 'Dr. Smith', specialties: ['weight_management', 'general'] },
  { id: 'prov2', name: 'Dr. Johnson', specialties: ['ed', 'hair_loss'] },
  { id: 'prov3', name: 'Dr. Williams', specialties: ['weight_management', 'ed', 'hair_loss'] }
];

// Keep track of the last assigned provider index for round-robin
let lastAssignedProviderIndex = -1;

/**
 * Transform intake form data to consultation format
 * @param {Object} formData - The intake form data
 * @param {string} categoryId - The category ID
 * @param {string} productName - The selected product name
 * @returns {Object} The transformed consultation data
 */
export const transformFormDataToConsultation = (formData, categoryId, productName) => {
  // Extract relevant data from form
  const { basicInfo, healthHistory } = formData;
  
  // Create HPI (History of Present Illness)
  let hpi = `Patient submitted intake form for ${productName || 'treatment'}.\n\n`;
  
  // Add basic info
  if (basicInfo) {
    hpi += 'BASIC INFO:\n';
    if (basicInfo.height) hpi += `Height: ${basicInfo.height}\n`;
    if (basicInfo.weight) hpi += `Weight: ${basicInfo.weight} ${basicInfo.weightUnit || 'lbs'}\n`;
    if (basicInfo.bmi) hpi += `BMI: ${basicInfo.bmi}\n`;
    if (basicInfo.goalWeight) hpi += `Goal Weight: ${basicInfo.goalWeight} ${basicInfo.weightUnit || 'lbs'}\n`;
    if (basicInfo.hairLossPattern) hpi += `Hair Loss Pattern: ${basicInfo.hairLossPattern}\n`;
    hpi += '\n';
  }
  
  // Add health history
  if (healthHistory) {
    hpi += 'HEALTH HISTORY:\n';
    if (healthHistory.medicalConditions && healthHistory.medicalConditions.length > 0) {
      hpi += `Medical Conditions: ${healthHistory.medicalConditions.join(', ')}\n`;
    }
    if (healthHistory.previousTreatments && healthHistory.previousTreatments.length > 0) {
      hpi += `Previous Treatments: ${healthHistory.previousTreatments.join(', ')}\n`;
    }
    if (healthHistory.medicationsText) hpi += `Current Medications: ${healthHistory.medicationsText}\n`;
    if (healthHistory.allergiesText) hpi += `Allergies: ${healthHistory.allergiesText}\n`;
    if (healthHistory.edDuration) hpi += `ED Duration: ${healthHistory.edDuration}\n`;
    hpi += '\n';
  }
  
  // Create consultation data
  return {
    hpi,
    pmh: healthHistory?.medicalConditions?.join(', ') || '',
    contraindications: healthHistory?.allergiesText || 'None reported'
  };
};

/**
 * Assign a provider to a consultation using round-robin
 * @param {string} categoryId - The category ID
 * @returns {Object} The assigned provider
 */
export const assignProviderRoundRobin = async (categoryId) => {
  try {
    // Get all active providers
    // In a real implementation, this would be a database query
    let eligibleProviders = [...mockProviders];
    
    // Filter by specialty if category is provided
    if (categoryId) {
      const specializedProviders = eligibleProviders.filter(
        provider => provider.specialties.includes(categoryId)
      );
      
      // If there are specialized providers, use them
      if (specializedProviders.length > 0) {
        eligibleProviders = specializedProviders;
      }
    }
    
    if (eligibleProviders.length === 0) {
      throw new Error('No eligible providers found');
    }
    
    // Implement round-robin selection
    lastAssignedProviderIndex = (lastAssignedProviderIndex + 1) % eligibleProviders.length;
    const selectedProvider = eligibleProviders[lastAssignedProviderIndex];
    
    return selectedProvider;
  } catch (error) {
    console.error('Error assigning provider:', error);
    throw error;
  }
};

/**
 * Create a consultation from intake form data
 * @param {Object} params - The parameters
 * @param {string} params.patientId - The patient ID
 * @param {string} params.formSubmissionId - The form submission ID
 * @param {Object} params.formData - The form data
 * @param {string} params.categoryId - The category ID
 * @param {string} params.orderId - The order ID
 * @param {string} params.productName - The product name
 * @returns {Promise<Object>} The created consultation
 */
export const createConsultationFromIntake = async ({
  patientId,
  formSubmissionId,
  formData,
  categoryId,
  orderId,
  productName
}) => {
  try {
    // 1. Transform form data to consultation format
    const consultationData = transformFormDataToConsultation(formData, categoryId, productName);
    
    // 2. Generate AI summary
    let aiSummary = null;
    try {
      aiSummary = await generateIntakeSummary(formData, categoryId, 'initial');
    } catch (aiError) {
      console.error('Error generating AI summary:', aiError);
      // Continue without AI summary if it fails
    }
    
    // 3. Assign provider using round-robin
    const provider = await assignProviderRoundRobin(categoryId);
    
    // 4. Create consultation
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: patientId,
        form_submission_id: formSubmissionId,
        status: 'pending_review',
        order_id: orderId,
        category_id: categoryId,
        provider_id: provider.id,
        notes: consultationData,
        ai_summary: aiSummary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating consultation:', error);
      throw new Error(error.message);
    }
    
    // 5. Save AI summary if it was generated
    if (aiSummary && data.id) {
      try {
        await supabase
          .from('ai_summaries')
          .insert({
            consultation_id: data.id,
            recommendations: aiSummary.recommendations,
            reasoning: aiSummary.reasoning,
            category_id: categoryId,
            prompt_id: aiSummary.promptId,
            created_at: new Date().toISOString()
          });
      } catch (summaryError) {
        console.error('Error saving AI summary:', summaryError);
        // Continue even if saving the summary fails
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in createConsultationFromIntake:', error);
    throw error;
  }
};