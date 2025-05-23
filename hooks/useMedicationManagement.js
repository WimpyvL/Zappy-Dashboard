import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

const DEFAULT_MEDICATION_DATA = {
  semaglutide: {
    name: 'Semaglutide',
    brandName: 'Wegovy',
    category: 'wm',
    frequency: 'wkly',
    dosageOptions: [
      { value: '0.25mg', label: '0.25' },
      { value: '0.5mg', label: '0.5' },
      { value: '1mg', label: '1.0' },
      { value: '1.7mg', label: '1.7' },
      { value: '2.4mg', label: '2.4mg' }
    ],
    instructions: ['• Inject SC once wkly.', '• Rotate sites.'],
    supportedApproaches: ['Maint.', 'Escalation'],
    defaultApproach: 'Escalation',
    defaultDosage: '0.25mg'
  },
  metformin: {
    name: 'Metformin',
    category: 'wm',
    frequency: 'daily',
    dosageOptions: [
      { value: '500mg', label: '500' },
      { value: '850mg', label: '850' },
      { value: '1g', label: '1g' }
    ],
    instructions: ['• Take with food.'],
    supportedApproaches: ['Maint.'],
    defaultApproach: 'Maint.',
    defaultDosage: '500mg'
  },
  sildenafil: {
    name: 'Sildenafil',
    brandName: 'Viagra',
    category: 'ed',
    frequency: 'PRN',
    dosageOptions: [
      { value: '25mg', label: '25' },
      { value: '50mg', label: '50' },
      { value: '100mg', label: '100mg' }
    ],
    instructions: ['• Take 30-60 min pre-activity.'],
    supportedApproaches: ['PRN'],
    defaultApproach: 'PRN',
    defaultDosage: '50mg'
  }
};

export const useMedicationManagement = (initialMedications = {}) => {
  // Merge initial medications with defaults
  const [medications, setMedications] = useState(() => ({
    ...DEFAULT_MEDICATION_DATA,
    ...initialMedications
  }));
  
  // Track selected medications and their configurations
  const [selectedMedications, setSelectedMedications] = useState({});
  
  // Track medication instructions (editable)
  const [medicationInstructions, setMedicationInstructions] = useState({});

  // Toggle medication selection
  const toggleMedication = useCallback((medId) => {
    setSelectedMedications(prev => {
      const isCurrentlySelected = !!prev[medId];
      const medication = medications[medId];
      
      if (!medication) {
        console.error(`Medication ${medId} not found`);
        return prev;
      }
      
      if (isCurrentlySelected) {
        // Remove medication
        const { [medId]: removed, ...rest } = prev;
        return rest;
      } else {
        // Add medication with defaults
        return {
          ...prev,
          [medId]: {
            selected: true,
            dosage: medication.defaultDosage || medication.dosageOptions[0]?.value,
            frequency: medication.frequency,
            approach: medication.defaultApproach || medication.supportedApproaches[0],
            instructions: medication.instructions,
            isPatientPreference: medication.isPatientPreference || false
          }
        };
      }
    });
  }, [medications]);

  // Update medication dosage
  const updateDosage = useCallback((medId, dosage) => {
    setSelectedMedications(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        dosage
      }
    }));
  }, []);

  // Update medication approach
  const updateApproach = useCallback((medId, approach) => {
    const medication = medications[medId];
    if (!medication?.supportedApproaches?.includes(approach)) {
      console.error(`Approach ${approach} not supported for ${medId}`);
      return;
    }
    
    setSelectedMedications(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        approach
      }
    }));
  }, [medications]);

  // Update medication frequency
  const updateFrequency = useCallback((medId, frequency) => {
    setSelectedMedications(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        frequency
      }
    }));
  }, []);

  // Update medication instructions
  const updateInstructions = useCallback((medId, instructions) => {
    setMedicationInstructions(prev => ({
      ...prev,
      [medId]: instructions
    }));
    
    setSelectedMedications(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        instructions: Array.isArray(instructions) ? instructions : instructions.split('\n')
      }
    }));
  }, []);

  // Add custom medication
  const addCustomMedication = useCallback((medication) => {
    const medId = medication.id || medication.name.toLowerCase().replace(/\s+/g, '_');
    
    setMedications(prev => ({
      ...prev,
      [medId]: {
        ...medication,
        selected: true,
        supportedApproaches: medication.supportedApproaches || ['Maint.'],
        defaultApproach: medication.defaultApproach || 'Maint.',
        defaultDosage: medication.defaultDosage || medication.dosageOptions?.[0]?.value || '10mg'
      }
    }));
    
    // Auto-select the new medication
    toggleMedication(medId);
    
    toast.info(`Added ${medication.name}`);
  }, [toggleMedication]);

  // Get formatted medications for submission
  const getFormattedMedications = useCallback(() => {
    return Object.entries(selectedMedications)
      .filter(([_, config]) => config.selected !== false)
      .map(([medId, config]) => {
        const medication = medications[medId];
        return {
          id: medId,
          name: medication.name,
          dosage: config.dosage,
          frequency: config.frequency,
          approach: config.approach,
          instructions: config.instructions || medication.instructions,
          category: medication.category
        };
      });
  }, [selectedMedications, medications]);

  // Group medications by category
  const medicationsByCategory = useMemo(() => {
    const grouped = {};
    
    Object.entries(medications).forEach(([medId, medication]) => {
      if (!grouped[medication.category]) {
        grouped[medication.category] = [];
      }
      
      grouped[medication.category].push({
        id: medId,
        ...medication,
        ...selectedMedications[medId]
      });
    });
    
    return grouped;
  }, [medications, selectedMedications]);

  // Check if medication is selected
  const isMedicationSelected = useCallback((medId) => {
    return !!selectedMedications[medId];
  }, [selectedMedications]);

  // Get medication configuration
  const getMedicationConfig = useCallback((medId) => {
    return selectedMedications[medId] || null;
  }, [selectedMedications]);

  return {
    medications,
    selectedMedications,
    medicationInstructions,
    medicationsByCategory,
    toggleMedication,
    updateDosage,
    updateApproach,
    updateFrequency,
    updateInstructions,
    addCustomMedication,
    getFormattedMedications,
    isMedicationSelected,
    getMedicationConfig
  };
};
