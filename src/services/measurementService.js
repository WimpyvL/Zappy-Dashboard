/**
 * Measurement Service
 * 
 * This service handles reading and writing patient measurements for different service types.
 * It leverages the JSONB settings field in the patient_service_enrollments table.
 */

import { supabase } from '../lib/supabase';
import { SERVICE_MEASUREMENTS, isValidMeasurement } from '../constants/serviceTypes';

export const MeasurementService = {
  /**
   * Get all measurements for a patient's service enrollment
   * @param {string} enrollmentId - The patient service enrollment ID
   * @returns {Object} The measurements data
   */
  async getMeasurements(enrollmentId) {
    if (!enrollmentId) {
      throw new Error('Enrollment ID is required');
    }
    
    const { data, error } = await supabase
      .from('patient_service_enrollments')
      .select('settings, service_id, services(service_type)')
      .eq('id', enrollmentId)
      .single();
      
    if (error) {
      console.error('Error fetching measurements:', error);
      throw error;
    }
    
    return data?.settings || {};
  },
  
  /**
   * Add a new measurement
   * @param {string} enrollmentId - The patient service enrollment ID
   * @param {string} measurementType - The type of measurement (e.g., 'weight', 'symptomIntensity')
   * @param {any} value - The measurement value
   * @param {string} notes - Optional notes about the measurement
   * @returns {Object} The updated enrollment data
   */
  async addMeasurement(enrollmentId, measurementType, value, notes = '') {
    if (!enrollmentId) {
      throw new Error('Enrollment ID is required');
    }
    
    if (!measurementType) {
      throw new Error('Measurement type is required');
    }
    
    // Get current enrollment data
    const { data: enrollment, error } = await supabase
      .from('patient_service_enrollments')
      .select('settings, service_id, services(service_type)')
      .eq('id', enrollmentId)
      .single();
      
    if (error) {
      console.error('Error fetching enrollment:', error);
      throw error;
    }
    
    const settings = enrollment.settings || {};
    const serviceType = enrollment.services?.service_type;
    
    // Validate measurement type for this service
    if (serviceType && !isValidMeasurement(serviceType, measurementType)) {
      throw new Error(`Invalid measurement type "${measurementType}" for service type "${serviceType}"`);
    }
    
    // Create measurement object
    const measurement = {
      date: new Date().toISOString(),
      value,
      notes: notes || undefined
    };
    
    // Initialize structure if needed
    if (!settings.measurements) {
      settings.measurements = {};
    }
    
    // Get metadata for this measurement type
    const metadata = serviceType && 
      SERVICE_MEASUREMENTS[serviceType]?.metadata?.[measurementType];
    
    // Handle different measurement types based on metadata
    if (metadata && metadata.type === 'single') {
      // Single value measurements (like height)
      settings.measurements[measurementType] = value;
    } else {
      // Time series measurements (like weight)
      if (!settings.measurements[measurementType]) {
        settings.measurements[measurementType] = [];
      }
      
      settings.measurements[measurementType].push(measurement);
    }
    
    // Update the database
    const { data, updateError } = await supabase
      .from('patient_service_enrollments')
      .update({ settings })
      .eq('id', enrollmentId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating measurements:', updateError);
      throw updateError;
    }
    
    return data;
  },
  
  /**
   * Set a goal for a patient
   * @param {string} enrollmentId - The patient service enrollment ID
   * @param {string} goalType - The type of goal (e.g., 'targetWeight')
   * @param {any} value - The goal value
   * @returns {Object} The updated enrollment data
   */
  async setGoal(enrollmentId, goalType, value) {
    if (!enrollmentId) {
      throw new Error('Enrollment ID is required');
    }
    
    if (!goalType) {
      throw new Error('Goal type is required');
    }
    
    // Get current enrollment data
    const { data: enrollment, error } = await supabase
      .from('patient_service_enrollments')
      .select('settings, service_id, services(service_type)')
      .eq('id', enrollmentId)
      .single();
      
    if (error) {
      console.error('Error fetching enrollment:', error);
      throw error;
    }
    
    const settings = enrollment.settings || {};
    const serviceType = enrollment.services?.service_type;
    
    // Validate goal type for this service
    if (serviceType && 
        SERVICE_MEASUREMENTS[serviceType]?.goals && 
        !SERVICE_MEASUREMENTS[serviceType].goals.includes(goalType)) {
      throw new Error(`Invalid goal type "${goalType}" for service type "${serviceType}"`);
    }
    
    // Initialize structure if needed
    if (!settings.goals) {
      settings.goals = {};
    }
    
    // Set the goal
    settings.goals[goalType] = value;
    
    // Update the database
    const { data, updateError } = await supabase
      .from('patient_service_enrollments')
      .update({ settings })
      .eq('id', enrollmentId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating goals:', updateError);
      throw updateError;
    }
    
    return data;
  },
  
  /**
   * Get the latest measurement of a specific type
   * @param {string} enrollmentId - The patient service enrollment ID
   * @param {string} measurementType - The type of measurement
   * @returns {Object|null} The latest measurement or null if not found
   */
  async getLatestMeasurement(enrollmentId, measurementType) {
    const settings = await this.getMeasurements(enrollmentId);
    
    if (!settings.measurements || !settings.measurements[measurementType]) {
      return null;
    }
    
    // Handle single value measurements
    if (!Array.isArray(settings.measurements[measurementType])) {
      return {
        date: settings.updated_at || new Date().toISOString(),
        value: settings.measurements[measurementType]
      };
    }
    
    // Handle time series measurements
    const measurements = settings.measurements[measurementType];
    if (measurements.length === 0) {
      return null;
    }
    
    // Sort by date descending and return the most recent
    return [...measurements].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )[0];
  },
  
  /**
   * Calculate progress towards a goal
   * @param {string} enrollmentId - The patient service enrollment ID
   * @param {string} goalType - The type of goal (e.g., 'targetWeight')
   * @param {string} measurementType - The type of measurement to track (e.g., 'weight')
   * @returns {Object} Progress information
   */
  async calculateProgress(enrollmentId, goalType, measurementType) {
    const settings = await this.getMeasurements(enrollmentId);
    
    if (!settings.goals || !settings.goals[goalType]) {
      return { percentage: 0, hasGoal: false };
    }
    
    const goalValue = settings.goals[goalType];
    
    // Get initial and latest measurements
    const measurements = settings.measurements?.[measurementType];
    if (!measurements) {
      return { percentage: 0, hasGoal: true, goalValue };
    }
    
    // Handle single value measurements
    if (!Array.isArray(measurements)) {
      const currentValue = measurements;
      // Simple percentage calculation (may need to be adjusted based on goal type)
      const percentage = Math.min(100, Math.max(0, (currentValue / goalValue) * 100));
      
      return {
        percentage,
        hasGoal: true,
        goalValue,
        currentValue
      };
    }
    
    // Handle time series measurements
    if (measurements.length === 0) {
      return { percentage: 0, hasGoal: true, goalValue };
    }
    
    // Sort by date
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const initialValue = sortedMeasurements[0].value;
    const currentValue = sortedMeasurements[sortedMeasurements.length - 1].value;
    
    // Calculate progress (example for weight loss)
    let percentage = 0;
    
    // For weight loss goals
    if (measurementType === 'weight' && initialValue > goalValue) {
      const totalNeededLoss = initialValue - goalValue;
      const actualLoss = initialValue - currentValue;
      percentage = Math.min(100, Math.max(0, (actualLoss / totalNeededLoss) * 100));
    }
    // For other types of goals, implement appropriate calculations
    
    return {
      percentage,
      hasGoal: true,
      goalValue,
      initialValue,
      currentValue
    };
  }
};

export default MeasurementService;
