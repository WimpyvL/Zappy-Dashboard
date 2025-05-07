import React from 'react';

const PatientInfoSection = ({
  hpi,
  pmh,
  contraindications,
  onHpiChange,
  onPmhChange,
  onContraindicationsChange,
  readOnly,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between">
        <h3 className="font-medium">Patient Information</h3>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
          Patient-reported
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HPI
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            rows={4}
            value={hpi}
            onChange={(e) => onHpiChange(e.target.value)}
            disabled={readOnly}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PMH
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            rows={3}
            value={pmh}
            onChange={(e) => onPmhChange(e.target.value)}
            disabled={readOnly}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contra-indications{' '}
            <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              Important
            </span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            rows={3}
            value={contraindications}
            onChange={(e) => onContraindicationsChange(e.target.value)}
            disabled={readOnly}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoSection;
