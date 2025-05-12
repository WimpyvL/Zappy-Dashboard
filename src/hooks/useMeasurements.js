/**
 * useMeasurements Hook
 * 
 * A React hook for working with patient measurements.
 * Provides functions for fetching, adding, and analyzing measurements.
 */

import { useState, useEffect, useCallback } from 'react';
import MeasurementService from '../services/measurementService';
import { getMeasurementMetadata, getAllMeasurements } from '../constants/serviceTypes';

/**
 * Hook for working with patient measurements
 * @param {string} enrollmentId - The patient service enrollment ID
 * @param {string} serviceType - The service type
 * @returns {Object} Measurement data and functions
 */
export const useMeasurements = (enrollmentId, serviceType) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load measurements
  const loadMeasurements = useCallback(async () => {
    if (!enrollmentId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const measurementsData = await MeasurementService.getMeasurements(enrollmentId);
      setData(measurementsData);
      setError(null);
    } catch (err) {
      console.error('Error loading measurements:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);
  
  // Load measurements on mount and when enrollmentId changes
  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);
  
  // Add a new measurement
  const addMeasurement = useCallback(async (measurementType, value, notes = '') => {
    if (!enrollmentId || !measurementType) {
      return;
    }
    
    try {
      setLoading(true);
      const updatedData = await MeasurementService.addMeasurement(
        enrollmentId,
        measurementType,
        value,
        notes
      );
      setData(updatedData.settings);
      return updatedData.settings;
    } catch (err) {
      console.error('Error adding measurement:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);
  
  // Set a goal
  const setGoal = useCallback(async (goalType, value) => {
    if (!enrollmentId || !goalType) {
      return;
    }
    
    try {
      setLoading(true);
      const updatedData = await MeasurementService.setGoal(
        enrollmentId,
        goalType,
        value
      );
      setData(updatedData.settings);
      return updatedData.settings;
    } catch (err) {
      console.error('Error setting goal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);
  
  // Get the latest measurement of a specific type
  const getLatestMeasurement = useCallback(async (measurementType) => {
    if (!enrollmentId || !measurementType) {
      return null;
    }
    
    try {
      return await MeasurementService.getLatestMeasurement(enrollmentId, measurementType);
    } catch (err) {
      console.error('Error getting latest measurement:', err);
      setError(err);
      return null;
    }
  }, [enrollmentId]);
  
  // Calculate progress towards a goal
  const calculateProgress = useCallback(async (goalType, measurementType) => {
    if (!enrollmentId || !goalType || !measurementType) {
      return { percentage: 0, hasGoal: false };
    }
    
    try {
      return await MeasurementService.calculateProgress(enrollmentId, goalType, measurementType);
    } catch (err) {
      console.error('Error calculating progress:', err);
      setError(err);
      return { percentage: 0, hasGoal: false };
    }
  }, [enrollmentId]);
  
  // Get all available measurement types for this service
  const getMeasurementTypes = useCallback(() => {
    if (!serviceType) {
      return [];
    }
    
    return getAllMeasurements(serviceType);
  }, [serviceType]);
  
  // Get metadata for a specific measurement type
  const getMetadata = useCallback((measurementType) => {
    if (!serviceType || !measurementType) {
      return null;
    }
    
    return getMeasurementMetadata(serviceType, measurementType);
  }, [serviceType]);
  
  return {
    data,
    loading,
    error,
    refresh: loadMeasurements,
    addMeasurement,
    setGoal,
    getLatestMeasurement,
    calculateProgress,
    getMeasurementTypes,
    getMetadata
  };
};

export default useMeasurements;
