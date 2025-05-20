import { supabase } from '../lib/supabase';

/**
 * Update a patient's health history
 * @param {string} patientId - The ID of the patient
 * @param {string} history - The health history text
 * @returns {Promise<Object>} - The result of the update operation
 */
export const updatePatientHistory = async (patientId, history) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({ health_history: history })
      .eq('id', patientId);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating patient history:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get a patient's health history
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - The patient's health history
 */
export const getPatientHistory = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('health_history')
      .eq('id', patientId)
      .single();
    
    if (error) throw error;
    
    return { success: true, history: data?.health_history || '' };
  } catch (error) {
    console.error('Error getting patient history:', error.message);
    return { success: false, error: error.message, history: '' };
  }
};
