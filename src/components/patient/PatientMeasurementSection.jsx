import React, { useState, useEffect, useCallback } from 'react';
import MeasurementEntryFactory from './MeasurementEntryFactory';
import MeasurementProgress from './MeasurementProgress';
import MeasurementChart from './MeasurementChart';
import useMeasurements from '../../hooks/useMeasurements';
import { getAllMeasurements, getMeasurementMetadata } from '../../constants/serviceTypes';

/**
 * PatientMeasurementSection - Component for displaying and managing patient measurements
 * 
 * This component provides a complete interface for tracking and visualizing
 * patient measurements for a specific service.
 */
const PatientMeasurementSection = ({
  enrollmentId,
  serviceType
}) => {
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressData, setProgressData] = useState({});
  
  // Use the measurements hook
  const {
    data,
    loading,
    error,
    addMeasurement,
    setGoal,
    calculateProgress,
    getMeasurementTypes,
    getMetadata,
    getLatestMeasurement,
    refresh
  } = useMeasurements(enrollmentId, serviceType);
  
  // Get all available measurement types for this service
  const measurementTypes = getMeasurementTypes();
  
  // Load progress data for each measurement type
  const loadProgressData = useCallback(async () => {
    if (!data || !enrollmentId) return;
    
    const progressPromises = measurementTypes.map(async (type) => {
      const metadata = getMetadata(type);
      if (!metadata) return null;
      
      // Only calculate progress for measurements that have goals
      if (metadata.type === 'number' || metadata.type === 'timeseries') {
        // Find the corresponding goal type (if any)
        const goalType = `target${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        try {
          const progress = await calculateProgress(goalType, type);
          return { type, progress };
        } catch (err) {
          console.error(`Error calculating progress for ${type}:`, err);
          return null;
        }
      }
      
      return null;
    });
    
    const progressResults = await Promise.all(progressPromises);
    const newProgressData = {};
    
    progressResults.forEach(result => {
      if (result) {
        newProgressData[result.type] = result.progress;
      }
    });
    
    setProgressData(newProgressData);
  }, [data, enrollmentId, measurementTypes, calculateProgress, getMetadata]);
  
  // Load progress data when data changes
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);
  
  // Handle measurement entry
  const handleMeasurementEntry = (type) => {
    setCurrentMeasurement(type);
    setModalOpen(true);
  };
  
  // Handle measurement save
  const handleSaveMeasurement = async (value, notes) => {
    if (!currentMeasurement) return;
    
    try {
      await addMeasurement(currentMeasurement, value, notes);
      refresh();
      loadProgressData();
    } catch (err) {
      console.error(`Error saving measurement:`, err);
    }
  };
  
  // Get color scheme based on service type
  const getColorScheme = () => {
    const serviceConfig = {
      'weight-management': { primary: '#F85C5C', secondary: '#FF8080' },
      'womens-health': { primary: '#8B5CF6', secondary: '#A78BFA' },
      'mens-health': { primary: '#3B82F6', secondary: '#60A5FA' },
      'hair-loss': { primary: '#4F46E5', secondary: '#818CF8' }
    };
    
    return serviceConfig[serviceType] || { primary: '#4F46E5', secondary: '#818CF8' };
  };
  
  const colors = getColorScheme();
  
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-red-500">
          Error loading measurement data: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Track Your Progress
      </h2>
      
      {/* Measurement Entry Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {measurementTypes.map(type => {
            const metadata = getMetadata(type);
            if (!metadata) return null;
            
            return (
              <button
                key={type}
                className="px-3 py-1.5 text-sm font-medium rounded-full"
                style={{ 
                  backgroundColor: `${colors.primary}15`, // 15% opacity
                  color: colors.primary
                }}
                onClick={() => handleMeasurementEntry(type)}
              >
                Record {metadata.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Measurement Progress */}
      <div className="space-y-8">
        {measurementTypes.map(type => {
          const metadata = getMetadata(type);
          if (!metadata) return null;
          
          // Only show progress for measurements that have data
          const hasProgress = progressData[type] && progressData[type].hasGoal;
          const measurements = data?.measurements?.[type];
          const hasData = measurements && (
            Array.isArray(measurements) ? measurements.length > 0 : true
          );
          
          if (!hasData && !hasProgress) return null;
          
          return (
            <div key={type} className="border-t pt-6">
              {hasProgress && (
                <MeasurementProgress
                  progress={progressData[type]}
                  measurementType={type}
                  serviceType={serviceType}
                />
              )}
              
              {hasData && Array.isArray(measurements) && (
                <div className="mt-6">
                  <MeasurementChart
                    measurements={measurements}
                    measurementType={type}
                    serviceType={serviceType}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Measurement Entry Modal */}
      {modalOpen && currentMeasurement && (
        <MeasurementEntryFactory
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveMeasurement}
          measurementType={currentMeasurement}
          serviceType={serviceType}
        />
      )}
    </div>
  );
};

export default PatientMeasurementSection;
