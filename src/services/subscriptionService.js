import { supabase } from '../lib/supabase';

/**
 * Get all subscriptions for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - The patient's subscriptions
 */
export const getPatientSubscriptions = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('patient_id', patientId);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting patient subscriptions:', error.message);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Check if a patient has an active subscription
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - Information about the patient's subscription status
 */
export const checkPatientSubscription = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }
    
    return { 
      hasActiveSubscription: !!data,
      subscription: data || null
    };
  } catch (error) {
    console.error('Error checking patient subscription:', error.message);
    return { 
      hasActiveSubscription: false,
      subscription: null,
      error: error.message
    };
  }
};
