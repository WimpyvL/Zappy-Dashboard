import React from 'react';
import PropTypes from 'prop-types';

/**
 * PatientInfoSection
 * Simplified version without vitals grid.
 * Focuses on editable patient information fields.
 */
const PatientInfoSection = ({
  hpi,
  pmh,
  contraindications,
  onHpiChange,
  onPmhChange,
  onContraindicationsChange,
  readOnly,
  chiefComplaint = '',
}) => {
  return (
    <div className="card bg-white rounded-lg shadow mb-4">
      <div className="card-header flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <span className="font-semibold text-sm">Patient Information</span>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
          Patient-reported
        </span>
      </div>
      <div className="card-body p-4">
        {/* Chief Complaint */}
        {chiefComplaint && (
          <div className="text-xs mb-4 p-2 bg-gray-50 rounded">
            <span className="font-semibold">Chief Complaint:</span> {chiefComplaint}
          </div>
        )}
        
        {/* Editable fields */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            HPI (History of Present Illness)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-primary focus:border-primary"
            rows={3}
            value={hpi}
            onChange={(e) => onHpiChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter patient's history of present illness..."
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            PMH (Past Medical History)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-primary focus:border-primary"
            rows={2}
            value={pmh}
            onChange={(e) => onPmhChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter patient's past medical history..."
          ></textarea>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Contra-indications{' '}
            <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              Important
            </span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-primary focus:border-primary"
            rows={2}
            value={contraindications}
            onChange={(e) => onContraindicationsChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter any contraindications..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

PatientInfoSection.propTypes = {
  hpi: PropTypes.string.isRequired,
  pmh: PropTypes.string.isRequired,
  contraindications: PropTypes.string.isRequired,
  onHpiChange: PropTypes.func.isRequired,
  onPmhChange: PropTypes.func.isRequired,
  onContraindicationsChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  chiefComplaint: PropTypes.string,
};

export default PatientInfoSection;
