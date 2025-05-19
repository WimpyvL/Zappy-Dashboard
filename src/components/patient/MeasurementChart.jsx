import React, { useMemo } from 'react';
import { getMeasurementMetadata } from '../../constants/serviceTypes';

/**
 * MeasurementChart - Component for displaying measurement history
 * 
 * This component visualizes measurement history over time.
 * Note: In a real implementation, you would use a charting library like Chart.js,
 * Recharts, or Victory. This is a simplified version for demonstration purposes.
 */
const MeasurementChart = ({
  measurements,
  measurementType,
  serviceType,
  limit = 10
}) => {
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Process measurements for display
  const processedData = useMemo(() => {
    if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
      return [];
    }
    
    // Sort by date
    const sortedData = [...measurements].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Limit to the most recent measurements
    return sortedData.slice(-limit);
  }, [measurements, limit]);
  
  // Find min and max values for scaling
  const { minValue, maxValue } = useMemo(() => {
    if (processedData.length === 0) {
      return { minValue: 0, maxValue: 100 };
    }
    
    const values = processedData.map(m => m.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Add some padding
    const padding = (max - min) * 0.1;
    return { 
      minValue: Math.max(0, min - padding), 
      maxValue: max + padding 
    };
  }, [processedData]);
  
  // Calculate chart height
  const chartHeight = 200;
  const chartWidth = '100%';
  
  if (processedData.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No measurement data available
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">
        {metadata.label} History
      </h3>
      
      {/* Simple Chart Visualization */}
      <div 
        className="relative"
        style={{ height: `${chartHeight}px`, width: chartWidth }}
      >
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
          <div>{maxValue.toFixed(1)}</div>
          <div>{((maxValue + minValue) / 2).toFixed(1)}</div>
          <div>{minValue.toFixed(1)}</div>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-0 border-l border-b border-gray-300">
          {/* Data points */}
          {processedData.map((measurement, index) => {
            const x = `${(index / (processedData.length - 1)) * 100}%`;
            const y = `${100 - ((measurement.value - minValue) / (maxValue - minValue)) * 100}%`;
            
            return (
              <div 
                key={index}
                className="absolute w-3 h-3 rounded-full -ml-1.5 -mt-1.5"
                style={{ 
                  left: x, 
                  top: y,
                  backgroundColor: colors.primary
                }}
                title={`${formatDate(measurement.date)}: ${measurement.value} ${metadata.unit}`}
              />
            );
          })}
          
          {/* Connect points with lines */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            style={{ overflow: 'visible' }}
          >
            <polyline
              points={processedData.map((measurement, index) => {
                const x = (index / (processedData.length - 1)) * 100;
                const y = 100 - ((measurement.value - minValue) / (maxValue - minValue)) * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-gray-500 -mb-5">
          {processedData.map((measurement, index) => (
            <div key={index} className="text-center" style={{ width: `${100 / processedData.length}%` }}>
              {formatDate(measurement.date)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div>
          <span className="font-medium">Latest:</span> {processedData[processedData.length - 1].value} {metadata.unit}
        </div>
        <div>
          <span className="font-medium">Average:</span> {
            (processedData.reduce((sum, m) => sum + m.value, 0) / processedData.length).toFixed(1)
          } {metadata.unit}
        </div>
      </div>
    </div>
  );
};

export default MeasurementChart;
