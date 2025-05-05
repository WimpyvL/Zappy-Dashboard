import { supabase } from '../../lib/supabase';

/**
 * Fetch all services a patient is enrolled in
 * @param {string} patientId - The ID of the patient
 * @returns {Promise} Promise resolving to the patient's services
 */
export const fetchPatientServices = async (patientId) => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  const { data, error } = await supabase
    .from('patient_service_enrollments')
    .select(`
      id,
      status,
      enrolled_at,
      last_activity_at,
      settings,
      services:service_id (
        id,
        name,
        description,
        service_type,
        features,
        resource_categories,
        product_categories
      )
    `)
    .eq('patient_id', patientId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch a single patient service enrollment by ID
 * @param {string} enrollmentId - The ID of the enrollment to fetch
 * @param {string} patientId - The ID of the patient
 * @returns {Promise} Promise resolving to the service enrollment
 */
export const fetchServiceDetails = async (enrollmentId, patientId) => {
  if (!enrollmentId || !patientId) {
    throw new Error('Enrollment ID and Patient ID are required');
  }

  const { data, error } = await supabase
    .from('patient_service_enrollments')
    .select(`
      id,
      status,
      enrolled_at,
      last_activity_at,
      settings,
      services:service_id (
        id,
        name,
        description,
        service_type,
        features,
        resource_categories,
        product_categories
      )
    `)
    .eq('id', enrollmentId)
    .eq('patient_id', patientId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Update a patient service enrollment status
 * @param {string} enrollmentId - The ID of the enrollment to update
 * @param {string} patientId - The ID of the patient
 * @param {string} newStatus - The new status to set
 * @returns {Promise} Promise resolving to the updated service enrollment
 */
export const updateServiceStatus = async (enrollmentId, patientId, newStatus) => {
  if (!enrollmentId || !patientId || !newStatus) {
    throw new Error('Enrollment ID, Patient ID, and new status are required');
  }

  // Verify the enrollment belongs to the user
  const { data: enrollment, error: verifyError } = await supabase
    .from('patient_service_enrollments')
    .select('id')
    .eq('id', enrollmentId)
    .eq('patient_id', patientId)
    .single();

  if (verifyError) {
    throw verifyError;
  }

  if (!enrollment) {
    throw new Error('Service enrollment not found');
  }

  // Update the status
  const { data, error: updateError } = await supabase
    .from('patient_service_enrollments')
    .update({ 
      status: newStatus,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', enrollmentId)
    .select();

  if (updateError) {
    throw updateError;
  }

  return data;
};

/**
 * Update patient service settings
 * @param {string} enrollmentId - The ID of the enrollment to update
 * @param {string} patientId - The ID of the patient
 * @param {Object} newSettings - The new settings to merge with existing settings
 * @returns {Promise} Promise resolving to the updated service enrollment
 */
export const updateServiceSettings = async (enrollmentId, patientId, newSettings) => {
  if (!enrollmentId || !patientId || !newSettings) {
    throw new Error('Enrollment ID, Patient ID, and new settings are required');
  }

  // Fetch current settings
  const { data: enrollment, error: fetchError } = await supabase
    .from('patient_service_enrollments')
    .select('settings')
    .eq('id', enrollmentId)
    .eq('patient_id', patientId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  if (!enrollment) {
    throw new Error('Service enrollment not found');
  }

  // Merge current settings with new settings
  const mergedSettings = { ...enrollment.settings, ...newSettings };

  // Update the settings
  const { data, error: updateError } = await supabase
    .from('patient_service_enrollments')
    .update({ 
      settings: mergedSettings,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', enrollmentId)
    .select();

  if (updateError) {
    throw updateError;
  }

  return data;
};

/**
 * Enroll a patient in a service
 * @param {string} patientId - The ID of the patient
 * @param {string} serviceId - The ID of the service
 * @param {string} subscriptionId - Optional ID of the subscription
 * @returns {Promise} Promise resolving to the new service enrollment
 */
export const enrollPatientInService = async (patientId, serviceId, subscriptionId = null) => {
  if (!patientId || !serviceId) {
    throw new Error('Patient ID and Service ID are required');
  }

  // Check if patient is already enrolled in this service
  const { data: existingEnrollment, error: checkError } = await supabase
    .from('patient_service_enrollments')
    .select('id, status')
    .eq('patient_id', patientId)
    .eq('service_id', serviceId)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  // If already enrolled but paused, reactivate
  if (existingEnrollment && existingEnrollment.status === 'paused') {
    const { data, error } = await supabase
      .from('patient_service_enrollments')
      .update({ 
        status: 'active',
        last_activity_at: new Date().toISOString(),
        subscription_id: subscriptionId || existingEnrollment.subscription_id
      })
      .eq('id', existingEnrollment.id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

  // If already enrolled and active, just update subscription if needed
  if (existingEnrollment && existingEnrollment.status === 'active') {
    if (subscriptionId) {
      const { data, error } = await supabase
        .from('patient_service_enrollments')
        .update({ 
          subscription_id: subscriptionId,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', existingEnrollment.id)
        .select();

      if (error) {
        throw error;
      }

      return data;
    }
    
    return existingEnrollment;
  }

  // Create new enrollment
  const { data, error } = await supabase
    .from('patient_service_enrollments')
    .insert({
      patient_id: patientId,
      service_id: serviceId,
      subscription_id: subscriptionId,
      status: 'active',
      enrolled_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      settings: {}
    })
    .select();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch all available services that a patient can enroll in
 * @returns {Promise} Promise resolving to all available services
 */
export const fetchAvailableServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch medications for a patient's service
 * @param {string} patientId - The ID of the patient
 * @param {string} serviceType - The type of service
 * @returns {Promise} Promise resolving to the medications
 */
export const fetchServiceMedications = async (patientId, serviceType) => {
  if (!patientId || !serviceType) {
    throw new Error('Patient ID and Service Type are required');
  }

  // First, find the service ID for the given service type
  const { data: services, error: serviceError } = await supabase
    .from('services')
    .select('id')
    .eq('service_type', serviceType)
    .single();

  if (serviceError) {
    throw serviceError;
  }

  if (!services) {
    throw new Error(`Service with type ${serviceType} not found`);
  }

  // Find the patient's enrollment for this service
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('patient_service_enrollments')
    .select('id')
    .eq('patient_id', patientId)
    .eq('service_id', services.id)
    .eq('status', 'active')
    .single();

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    throw enrollmentError;
  }

  // If patient is not enrolled, return empty array
  if (!enrollment) {
    return [];
  }

  // Fetch medications for this enrollment
  const { data: medications, error: medicationsError } = await supabase
    .from('patient_medications')
    .select(`
      id,
      name,
      instructions,
      image_url,
      refill_status,
      last_refill,
      next_refill,
      dosage,
      frequency,
      side_effects,
      warnings,
      provider_notes,
      is_eligible_for_refill,
      refill_eligibility_reason
    `)
    .eq('patient_id', patientId)
    .eq('service_enrollment_id', enrollment.id)
    .order('name');

  if (medicationsError) {
    throw medicationsError;
  }

  // Transform the data to match the expected format
  return (medications || []).map(med => ({
    id: med.id,
    name: med.name,
    instructions: med.instructions,
    imageUrl: med.image_url,
    refillStatus: med.refill_status,
    lastRefill: med.last_refill,
    nextRefill: med.next_refill,
    dosage: med.dosage,
    frequency: med.frequency,
    sideEffects: med.side_effects,
    warnings: med.warnings,
    providerNotes: med.provider_notes,
    isEligibleForRefill: med.is_eligible_for_refill,
    refillEligibilityReason: med.refill_eligibility_reason
  }));
};

/**
 * Fetch action items for a patient's service
 * @param {string} patientId - The ID of the patient
 * @param {string} serviceType - The type of service
 * @returns {Promise} Promise resolving to the action items
 */
export const fetchServiceActionItems = async (patientId, serviceType) => {
  if (!patientId || !serviceType) {
    throw new Error('Patient ID and Service Type are required');
  }

  // First, find the service ID for the given service type
  const { data: services, error: serviceError } = await supabase
    .from('services')
    .select('id')
    .eq('service_type', serviceType)
    .single();

  if (serviceError) {
    throw serviceError;
  }

  if (!services) {
    throw new Error(`Service with type ${serviceType} not found`);
  }

  // Find the patient's enrollment for this service
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('patient_service_enrollments')
    .select('id')
    .eq('patient_id', patientId)
    .eq('service_id', services.id)
    .eq('status', 'active')
    .single();

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    throw enrollmentError;
  }

  // If patient is not enrolled, return empty array
  if (!enrollment) {
    return [];
  }

  // Fetch action items for this enrollment
  const { data: actionItems, error: actionItemsError } = await supabase
    .from('patient_action_items')
    .select(`
      id,
      title,
      description,
      icon,
      button_text,
      due_date,
      status,
      last_completed,
      frequency,
      priority,
      provider_notes
    `)
    .eq('patient_id', patientId)
    .eq('service_enrollment_id', enrollment.id)
    .order('due_date');

  if (actionItemsError) {
    throw actionItemsError;
  }

  // Transform the data to match the expected format
  return (actionItems || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon,
    buttonText: item.button_text,
    dueDate: item.due_date,
    status: item.status,
    lastCompleted: item.last_completed,
    frequency: item.frequency,
    priority: item.priority,
    providerNotes: item.provider_notes
  }));
};
