import React, { useState } from 'react';
import Modal from '../ui/Modal';

/**
 * GenericMeasurementModal - A reusable modal for entering various types of measurements
 * 
 * This component provides a flexible interface for entering different types of
 * measurements based on the provided metadata.
 */
const GenericMeasurementModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  description,
  type = 'number',
  unit = '',
  min,
  max,
  step = 1,
  options = [],
  showScale = false,
  serviceType
}) => {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  
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
  
  const handleSave = () => {
    // Convert value to appropriate type based on input type
    let processedValue = value;
    
    if (type === 'number' || type === 'scale') {
      processedValue = parseFloat(value);
    } else if (type === 'boolean') {
      processedValue = value === 'true';
    }
    
    onSave(processedValue, notes);
    onClose();
  };
  
  // Render different input types based on the measurement type
  const renderInput = () => {
    switch (type) {
      case 'number':
        return (
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );
        
      case 'enum':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="booleanValue"
                value="true"
                checked={value === 'true'}
                onChange={() => setValue('true')}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="booleanValue"
                value="false"
                checked={value === 'false'}
                onChange={() => setValue('false')}
                className="mr-2"
              />
              No
            </label>
          </div>
        );
        
      case 'scale':
        return (
          <div>
            <input
              type="range"
              min={min || 1}
              max={max || 10}
              step={step || 1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
            />
            {showScale && (
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{min || 1}</span>
                {max > min + 2 && <span>{Math.floor((max + min) / 2)}</span>}
                <span>{max || 10}</span>
              </div>
            )}
            <div className="text-center mt-2 font-medium">
              {value || '–'}
            </div>
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Record Measurement'}
      size="sm"
    >
      <div className="p-4 space-y-4">
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {title || 'Value'} {unit && `(${unit})`}
          </label>
          {renderInput()}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white rounded-lg text-sm font-medium"
            style={{ backgroundColor: colors.primary }}
            disabled={value === ''}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GenericMeasurementModal;
