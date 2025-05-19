import React from 'react';
import PropTypes from 'prop-types';

/**
 * MedicationsCard
 * Progressive refactor: Implements the new streamlined medication selection UI as a React component.
 * - All state and event handling should be managed via React props/state.
 * - Styles use Tailwind CSS for consistency with the codebase.
 */
const MedicationsCard = ({
  medications,
  selectedMedications,
  onMedicationToggle,
  onDosageChange,
  onDurationChange,
  onApproachChange,
  readOnly,
}) => {
  return (
    <div className="card bg-white rounded-lg shadow mb-4">
      <div className="card-header flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <span className="font-semibold text-sm">Select Medications</span>
        {/* Add search/filter controls here if needed */}
      </div>
      <div className="card-body p-4">
        {/* Medication list */}
        <div className="space-y-2">
          {medications.map((med) => {
            const isSelected = selectedMedications.some((m) => m.productId === med.id);
            return (
              <div
                key={med.id}
                className={`flex items-center justify-between p-2 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200'} cursor-pointer`}
                onClick={() => !readOnly && onMedicationToggle(med)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="mr-2"
                  />
                  <span className="font-medium text-sm">{med.name}</span>
                  {/* Add coverage dot, etc. */}
                </div>
                {/* Dosage, duration, approach controls (shown if selected) */}
                {isSelected && (
                  <div className="flex items-center space-x-2">
                    <select
                      className="text-xs border rounded px-1 py-0.5"
                      value={selectedMedications.find((m) => m.productId === med.id)?.doseId || ''}
                      onChange={(e) => onDosageChange(med.id, e.target.value)}
                      disabled={readOnly}
                    >
                      {med.doses.map((dose) => (
                        <option key={dose.id} value={dose.id}>{dose.value}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="text-xs border rounded px-1 py-0.5 w-16"
                      placeholder="Duration"
                      value={selectedMedications.find((m) => m.productId === med.id)?.duration || ''}
                      onChange={(e) => onDurationChange(med.id, e.target.value)}
                      disabled={readOnly}
                    />
                    <select
                      className="text-xs border rounded px-1 py-0.5"
                      value={selectedMedications.find((m) => m.productId === med.id)?.approach || 'Maintenance'}
                      onChange={(e) => onApproachChange(med.id, e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="Maintenance">Maint.</option>
                      <option value="Escalation">Escal.</option>
                      <option value="Short">Short</option>
                      <option value="PRN">PRN</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {medications.length === 0 && (
          <div className="text-xs text-gray-500">No medications available.</div>
        )}
      </div>
    </div>
  );
};

MedicationsCard.propTypes = {
  medications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      doses: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          value: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedMedications: PropTypes.arrayOf(
    PropTypes.shape({
      productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      doseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      planId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      duration: PropTypes.string,
      approach: PropTypes.string,
    })
  ).isRequired,
  onMedicationToggle: PropTypes.func.isRequired,
  onDosageChange: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onApproachChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default MedicationsCard;
