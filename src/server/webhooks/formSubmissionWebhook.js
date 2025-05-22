/**
 * Form Submission Webhook Handler
 * 
 * This webhook is triggered when a form submission is created.
 * It automatically creates a consultation and assigns a provider.
 * This ensures consultations are created even if the frontend logic fails.
 */

const { supabase } = require('../../lib/supabase');

// Mock providers data (in production, this would come from the database)
const mockProviders = [
  { 
    id: 'prov1', 
    name: 'Dr. Smith', 
    states: ['CA', 'NY', 'TX'],
    specialties: ['weight_management', 'general']
  },
  { 
    id: 'prov2', 
    name: 'Dr. Johnson', 
    states: ['FL', 'GA', 'NC'],
    specialties: ['ed', 'hair_loss']
  },
  { 
    id: 'prov3', 
    name: 'Dr. Williams', 
    states: ['CA', 'WA', 'OR'],
    specialties: ['weight_management', 'ed', 'hair_loss']
  }
];

/**
 * Find providers licensed in the patient's state
 * @param {string} patientState - Two-letter state code
 * @param {string} categoryId - Category ID for specialty matching
 * @returns {Object} The assigned provider
 */
async function findEligibleProvider(patientState, categoryId) {
  // In production, this would query the database
  
  // Find providers licensed in the patient's state
  const eligibleProviders = mockProviders.filter(
    provider => provider.states.includes(patientState)
  );
  
  if (eligibleProviders.length === 0) {
    console.warn(`No providers available for state: ${patientState}`);
    return null;
  }
  
  // Filter by specialty if category is provided
  let specializedProviders = eligibleProviders;
  if (categoryId) {
    specializedProviders = eligibleProviders.filter(
      provider => provider.specialties.includes(categoryId)
    );
    
    // If no specialized providers, fall back to all eligible providers
    if (specializedProviders.length === 0) {
      specializedProviders = eligibleProviders;
    }
  }
  
  // Get provider workloads
  const { data: consultations, error } = await supabase
    .from('consultations')
    .select('provider_id')
    .in('provider_id', specializedProviders.map(p => p.id));
  
  if (error) {
    console.error('Error fetching provider workloads:', error);
    // Fall back to first eligible provider if there's an error
    return specializedProviders[0];
  }
  
  // Count consultations per provider
  const providerWorkloads = {};
  consultations.forEach(consultation => {
    if (consultation.provider_id) {
      providerWorkloads[consultation.provider_id] = (providerWorkloads[consultation.provider_id] || 0) + 1;
    }
  });
  
  // Find provider with least workload
  let leastBusyProvider = specializedProviders[0];
  let lowestCount = Number.MAX_SAFE_INTEGER;
  
  specializedProviders.forEach(provider => {
    const count = providerWorkloads[provider.id] || 0;
    if (count < lowestCount) {
      lowestCount = count;
      leastBusyProvider = provider;
    }
  });
  
  return leastBusyProvider;
}

/**
 * Create a consultation from a form submission
 * @param {Object} formSubmission - The form submission data
 * @returns {Object} The created consultation
 */
async function createConsultationFromSubmission(formSubmission) {
  try {
    // Extract data from form submission
    const { id, patient_id, category_id, form_data, order_id } = formSubmission;
    
    // Check if a consultation already exists for this submission
    const { data: existingConsultations, error: checkError } = await supabase
      .from('consultations')
      .select('id')
      .eq('form_submission_id', id);
    
    if (checkError) {
      console.error('Error checking for existing consultations:', checkError);
      throw new Error('Failed to check for existing consultations');
    }
    
    // If a consultation already exists, don't create another one
    if (existingConsultations && existingConsultations.length > 0) {
      console.log(`Consultation already exists for form submission ${id}`);
      return { id: existingConsultations[0].id, alreadyExists: true };
    }
    
    // Get patient's state from form data
    const patientState = form_data?.shippingAddress?.state;
    
    // Find an eligible provider
    let providerId = null;
    if (patientState) {
      const provider = await findEligibleProvider(patientState, category_id);
      if (provider) {
        providerId = provider.id;
      }
    }
    
    // Create consultation
    const consultationData = {
      patient_id,
      form_submission_id: id,
      status: 'pending_review',
      provider_id: providerId,
      order_id,
      category_id,
      notes: {
        hpi: `Patient submitted intake form for ${category_id}`,
        pmh: form_data?.healthHistory?.medicalConditions?.join(', ') || '',
        contraindications: form_data?.healthHistory?.allergiesText || 'None reported'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating consultation:', error);
      throw new Error('Failed to create consultation');
    }
    
    console.log(`Created consultation ${consultation.id} for form submission ${id}`);
    
    // If no provider was assigned, log a warning
    if (!providerId) {
      console.warn(`No provider assigned for consultation ${consultation.id}. Manual assignment needed.`);
    }
    
    return consultation;
  } catch (error) {
    console.error('Error in createConsultationFromSubmission:', error);
    throw error;
  }
}

/**
 * Webhook handler for form submissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleFormSubmissionWebhook(req, res) {
  try {
    const formSubmission = req.body;
    
    // Validate webhook payload
    if (!formSubmission || !formSubmission.id || !formSubmission.patient_id) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Create consultation from form submission
    const consultation = await createConsultationFromSubmission(formSubmission);
    
    // Return success response
    return res.status(200).json({
      success: true,
      consultation: {
        id: consultation.id,
        alreadyExists: !!consultation.alreadyExists
      }
    });
  } catch (error) {
    console.error('Error handling form submission webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  handleFormSubmissionWebhook,
  createConsultationFromSubmission,
  findEligibleProvider
};