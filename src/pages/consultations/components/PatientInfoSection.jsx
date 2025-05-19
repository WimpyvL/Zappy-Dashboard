import React from 'react';
import PropTypes from 'prop-types';

/**
 * PatientInfoSection
 * Refactored to match the streamlined HTML layout.
 * Accepts vitals, allergies, medications, insurance, and chief complaint as props.
 */
const PatientInfoSection = ({
  hpi,
  pmh,
  contraindications,
  onHpiChange,
  onPmhChange,
  onContraindicationsChange,
  readOnly,
  vitals = {},
  allergies = '',
  medications = '',
  insurance = '',
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
        {/* Vitals grid */}
        <div className="patient-info-grid grid grid-cols-2 gap-2 text-xs mb-2 bg-gray-50 p-2 rounded">
          <div><span className="font-semibold">BP:</span> {vitals.bp || 'N/A'}</div>
          <div><span className="font-semibold">HR:</span> {vitals.hr || 'N/A'}</div>
          <div><span className="font-semibold">Weight:</span> {vitals.weight || 'N/A'}</div>
          <div><span className="font-semibold">A1C:</span> {vitals.a1c || 'N/A'}</div>
          <div><span className="font-semibold">Allergies:</span> {allergies || 'None'}</div>
          <div><span className="font-semibold">Meds:</span> {medications || 'None'}</div>
        </div>
        {/* Chief Complaint */}
        <div className="text-xs mb-2">
          <span className="font-semibold">Chief Complaint:</span> {chiefComplaint || 'N/A'}
        </div>
        {/* Insurance and coverage */}
        <div className="flex justify-between items-center text-xs mb-4">
          <div><span className="font-semibold">Insurance:</span> {insurance || 'N/A'}</div>
          <div className="flex gap-2">
            <span className="coverage-dot covered"></span>
            <span className="coverage-dot partial"></span>
            <span className="coverage-dot not-covered"></span>
          </div>
        </div>
        {/* Editable fields */}
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            HPI
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-primary focus:border-primary"
            rows={3}
            value={hpi}
            onChange={(e) => onHpiChange(e.target.value)}
            disabled={readOnly}
          ></textarea>
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            PMH
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-primary focus:border-primary"
            rows={2}
            value={pmh}
            onChange={(e) => onPmhChange(e.target.value)}
            disabled={readOnly}
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
  vitals: PropTypes.shape({
    bp: PropTypes.string,
    hr: PropTypes.string,
    weight: PropTypes.string,
    a1c: PropTypes.string,
  }),
  allergies: PropTypes.string,
  medications: PropTypes.string,
  insurance: PropTypes.string,
  chiefComplaint: PropTypes.string,
};

export default PatientInfoSection;
