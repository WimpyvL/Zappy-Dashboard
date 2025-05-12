import React from 'react';
import GenericMeasurementModal from './GenericMeasurementModal';
import { getMeasurementMetadata } from '../../constants/serviceTypes';

/**
 * MeasurementEntryFactory - Factory component for creating measurement entry modals
 * 
 * This component returns the appropriate measurement modal based on the measurement type
 * and service type. It uses the metadata from serviceTypes.js to configure the modal.
 */
const MeasurementEntryFactory = ({
  isOpen,
  onClose,
  onSave,
  measurementType,
  serviceType
}) => {
  // Get metadata for this measurement type
  const metadata = getMeasurementMetadata(serviceType, measurementType);
  
  if (!metadata) {
    console.error(`No metadata found for measurement type "${measurementType}" in service "${serviceType}"`);
    return null;
  }
  
  // Return the appropriate modal based on the measurement type
  return (
    <GenericMeasurementModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={metadata.label}
      description={metadata.description}
      type={metadata.type}
      unit={metadata.unit}
      min={metadata.min}
      max={metadata.max}
      step={metadata.step}
      options={metadata.options}
      showScale={metadata.type === 'scale'}
      serviceType={serviceType}
    />
  );
};

export default MeasurementEntryFactory;
