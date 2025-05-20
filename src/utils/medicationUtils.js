/**
 * Utility functions for standardizing medication data structures
 * between different components in the application
 */

/**
 * Converts medication data from object format to array format
 * for use with standard MedicationsCard component
 * 
 * @param {Object} medicationData - Object with medication IDs as keys
 * @param {Object} medicationDosages - Object mapping medication IDs to selected dosages
 * @returns {Array} Array of medication objects in standard format
 */
export const standardizeMedicationData = (medicationData, medicationDosages) => {
  // Convert from object format to array format for standard MedicationsCard
  return Object.entries(medicationData)
    .filter(([_, med]) => med.selected)
    .map(([id, med]) => ({
      id,
      name: med.name,
      brandName: med.brandName,
      dosage: medicationDosages[id],
      frequency: med.frequency,
      doses: med.dosageOptions.map(option => ({
        id: option.value,
        value: option.label
      })),
      approach: med.approach || 'Maintenance',
      instructions: med.instructions
    }));
};

/**
 * Converts medication data from array format to object format
 * for use with consultation-notes MedicationsCard component
 * 
 * @param {Array} medicationsArray - Array of medication objects
 * @returns {Object} Object with medication IDs as keys
 */
export const convertToMedicationObject = (medicationsArray) => {
  return medicationsArray.reduce((acc, med) => {
    acc[med.id] = {
      name: med.name,
      brandName: med.brandName,
      category: med.category || 'other',
      frequency: med.frequency || 'daily',
      dosageOptions: med.doses.map(dose => ({
        value: dose.id,
        label: dose.value
      })),
      instructions: med.instructions || ['• Take as directed.'],
      selected: med.selected || true,
      approach: med.approach || 'Maintenance'
    };
    return acc;
  }, {});
};