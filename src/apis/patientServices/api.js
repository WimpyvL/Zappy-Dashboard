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

  // In a real implementation, this would fetch from a medications table
  // For now, we'll return mock data based on the service type
  const mockMedications = {
    'hair-loss': [
      {
        id: 'fin-1mg',
        name: 'Finasteride 1mg',
        instructions: 'Take 1 tablet daily',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        refillStatus: 'available',
        lastRefill: '2025-04-15',
        nextRefill: '2025-05-15'
      },
      {
        id: 'min-5',
        name: 'Minoxidil 5% Solution',
        instructions: 'Apply 1ml to affected areas twice daily',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        refillStatus: 'available',
        lastRefill: '2025-04-15',
        nextRefill: '2025-05-15'
      }
    ],
    'weight-management': [
      {
        id: 'sem-025',
        name: 'Semaglutide Injection',
        instructions: 'Inject 0.25mg once weekly',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        refillStatus: 'available',
        lastRefill: '2025-04-20',
        nextRefill: '2025-05-20'
      },
      {
        id: 'multi-1',
        name: 'Multivitamin',
        instructions: 'Take 1 tablet daily with food',
        imageUrl: 'https://images.unsplash.com/photo-1576186726115-4d51596775d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        refillStatus: 'available',
        lastRefill: '2025-04-10',
        nextRefill: '2025-05-10'
      }
    ],
    'ed-treatment': [
      {
        id: 'sild-50',
        name: 'Sildenafil 50mg',
        instructions: 'Take 1 tablet as needed, 1 hour before activity',
        imageUrl: 'https://images.unsplash.com/photo-1626015435409-b6b2b479c291?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        refillStatus: 'available',
        lastRefill: '2025-04-05',
        nextRefill: '2025-05-05'
      }
    ]
  };

  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMedications[serviceType] || []);
    }, 500);
  });
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

  // In a real implementation, this would fetch from an action items table
  // For now, we'll return mock data based on the service type
  const mockActionItems = {
    'hair-loss': [
      {
        id: 'scalp-checkin',
        title: 'Scalp Check-in',
        description: 'Take photos of your scalp to track progress',
        icon: 'camera',
        buttonText: 'Start',
        dueDate: '2025-05-10',
        status: 'pending'
      },
      {
        id: 'monthly-assessment',
        title: 'Monthly Assessment',
        description: 'Complete your monthly hair loss questionnaire',
        icon: 'assessment',
        buttonText: 'Complete',
        dueDate: '2025-05-15',
        status: 'pending'
      }
    ],
    'weight-management': [
      {
        id: 'weekly-weighin',
        title: 'Weekly Weigh-in',
        description: 'Record your weight to track progress',
        icon: 'weight',
        buttonText: 'Log Weight',
        dueDate: '2025-05-05',
        status: 'pending'
      },
      {
        id: 'food-journal',
        title: 'Food Journal',
        description: 'Log your meals for the day',
        icon: 'food',
        buttonText: 'Start',
        dueDate: '2025-05-02',
        status: 'pending'
      }
    ],
    'ed-treatment': [
      {
        id: 'treatment-effectiveness',
        title: 'Treatment Effectiveness',
        description: 'Complete a brief survey about your experience',
        icon: 'assessment',
        buttonText: 'Complete',
        dueDate: '2025-05-20',
        status: 'pending'
      },
      {
        id: 'bp-check',
        title: 'Blood Pressure Check',
        description: 'Record your blood pressure readings',
        icon: 'health',
        buttonText: 'Log BP',
        dueDate: '2025-05-12',
        status: 'pending'
      }
    ]
  };

  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockActionItems[serviceType] || []);
    }, 500);
  });
};
