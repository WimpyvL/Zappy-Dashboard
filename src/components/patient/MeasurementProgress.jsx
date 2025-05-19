import React from 'react';
import { getMeasurementMetadata } from '../../constants/serviceTypes';

/**
 * MeasurementProgress - Component for displaying measurement progress
 * 
 * This component visualizes progress towards goals and measurement history.
 */
const MeasurementProgress = ({
  progress,
  measurementType,
  serviceType
}) => {
  if (!progress || !progress.hasGoal) {
    return null;
  }
  
  // Get metadata for this measurement type
  const metadata = getMeasurementMetadata(serviceType, measurementType);
  
  if (!metadata) {
    console.error(`No metadata found for measurement type "${measurementType}" in service "${serviceType}"`);
    return null;
  }
  
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
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          {metadata.label} Progress
        </h3>
        <div className="text-sm font-medium">
          {progress.percentage.toFixed(0)}% Complete
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ 
            width: `${progress.percentage}%`,
            backgroundColor: colors.primary
          }}
        ></div>
      </div>
      
      {/* Goal Information */}
      <div className="flex justify-between text-sm text-gray-600">
        <div>
          <span className="font-medium">Current:</span> {progress.currentValue} {metadata.unit}
        </div>
        <div>
          <span className="font-medium">Goal:</span> {progress.goalValue} {metadata.unit}
        </div>
      </div>
      
      {/* Initial Value (if available) */}
      {progress.initialValue && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Starting:</span> {progress.initialValue} {metadata.unit}
          {progress.initialValue !== progress.currentValue && (
            <span className="ml-2">
              ({progress.initialValue > progress.currentValue ? '↓' : '↑'} 
              {Math.abs(progress.initialValue - progress.currentValue).toFixed(1)} {metadata.unit})
            </span>
          )}
        </div>
      )}
      
      {/* Encouragement Message */}
      <div 
        className="p-3 rounded-md text-sm"
        style={{ 
          backgroundColor: `${colors.primary}15`, // 15% opacity
          color: colors.primary
        }}
      >
        {progress.percentage >= 100 ? (
          <p>Congratulations! You've reached your goal!</p>
        ) : progress.percentage >= 75 ? (
          <p>You're almost there! Keep up the great work!</p>
        ) : progress.percentage >= 50 ? (
          <p>You're making excellent progress toward your goal!</p>
        ) : progress.percentage >= 25 ? (
          <p>You're on the right track. Keep going!</p>
        ) : (
          <p>You've taken the first step toward your goal. Keep it up!</p>
        )}
      </div>
    </div>
  );
};

export default MeasurementProgress;
