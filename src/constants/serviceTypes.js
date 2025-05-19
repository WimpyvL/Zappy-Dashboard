/**
 * Service Types Constants
 * 
 * This file defines the service types available in the system and their
 * associated measurement requirements. This allows for a flexible approach
 * to tracking patient variables without requiring database categories.
 */

// Service type identifiers
export const SERVICE_TYPES = {
  WEIGHT_MANAGEMENT: 'weight-management',
  WOMENS_HEALTH: 'womens-health',
  MENS_HEALTH: 'mens-health',
  HAIR_LOSS: 'hair-loss'
};

// Map service types to their measurement requirements
export const SERVICE_MEASUREMENTS = {
  // Weight Management Service
  [SERVICE_TYPES.WEIGHT_MANAGEMENT]: {
    required: ['weight', 'height'],
    optional: ['waistCircumference', 'activityLevel', 'dietAdherence'],
    goals: ['targetWeight'],
    // Measurement metadata
    metadata: {
      weight: {
        label: 'Weight',
        description: 'Current body weight',
        unit: 'lbs',
        type: 'timeseries',
        min: 50,
        max: 500,
        step: 0.1,
        icon: 'weight'
      },
      height: {
        label: 'Height',
        description: 'Body height',
        unit: 'in',
        type: 'single',
        min: 36,
        max: 96,
        step: 0.1,
        icon: 'ruler'
      },
      waistCircumference: {
        label: 'Waist Circumference',
        description: 'Measurement around waist at navel level',
        unit: 'in',
        type: 'timeseries',
        min: 20,
        max: 80,
        step: 0.1,
        icon: 'health'
      },
      activityLevel: {
        label: 'Activity Level',
        description: 'Daily physical activity level',
        type: 'enum',
        options: ['Low', 'Medium', 'High'],
        icon: 'activity'
      },
      dietAdherence: {
        label: 'Diet Adherence',
        description: 'How well you followed your diet plan',
        type: 'scale',
        min: 1,
        max: 5,
        icon: 'food'
      },
      targetWeight: {
        label: 'Target Weight',
        description: 'Goal weight to achieve',
        unit: 'lbs',
        type: 'single',
        min: 50,
        max: 500,
        step: 0.1,
        icon: 'target'
      }
    }
  },
  
  // Women's Health Service
  [SERVICE_TYPES.WOMENS_HEALTH]: {
    required: [],
    optional: ['menstrualCycle', 'symptomIntensity', 'symptomFrequency', 'pregnancyStatus', 'menopauseStatus'],
    goals: [],
    // Measurement metadata
    metadata: {
      menstrualCycle: {
        label: 'Menstrual Cycle',
        description: 'Track your period start date',
        type: 'date',
        icon: 'calendar'
      },
      symptomIntensity: {
        label: 'Symptom Intensity',
        description: 'Rate the intensity of your primary symptom',
        type: 'scale',
        min: 1,
        max: 10,
        icon: 'health'
      },
      symptomFrequency: {
        label: 'Symptom Frequency',
        description: 'How often symptoms occur',
        type: 'enum',
        options: ['Daily', 'Weekly', 'Monthly'],
        icon: 'clock'
      },
      pregnancyStatus: {
        label: 'Pregnancy Status',
        description: 'Current pregnancy status',
        type: 'boolean',
        icon: 'baby'
      },
      menopauseStatus: {
        label: 'Menopause Status',
        description: 'Current menopause stage',
        type: 'enum',
        options: ['Pre', 'Peri', 'Post'],
        icon: 'health'
      }
    }
  },
  
  // Men's Health Service
  [SERVICE_TYPES.MENS_HEALTH]: {
    required: [],
    optional: ['symptomIntensity', 'symptomFrequency', 'urinarySymptoms', 'sexualHealthConcerns'],
    goals: [],
    // Measurement metadata
    metadata: {
      symptomIntensity: {
        label: 'Symptom Intensity',
        description: 'Rate the intensity of your primary symptom',
        type: 'scale',
        min: 1,
        max: 10,
        icon: 'health'
      },
      symptomFrequency: {
        label: 'Symptom Frequency',
        description: 'How often symptoms occur',
        type: 'enum',
        options: ['Daily', 'Weekly', 'Monthly'],
        icon: 'clock'
      },
      urinarySymptoms: {
        label: 'Urinary Symptoms',
        description: 'Presence of urinary symptoms',
        type: 'boolean',
        icon: 'health'
      },
      sexualHealthConcerns: {
        label: 'Sexual Health Concerns',
        description: 'Presence of sexual health concerns',
        type: 'boolean',
        icon: 'health'
      }
    }
  },
  
  // Hair Loss Service
  [SERVICE_TYPES.HAIR_LOSS]: {
    required: [],
    optional: ['hairLossPattern', 'treatmentAdherence', 'selfAssessment', 'shedding'],
    goals: [],
    // Measurement metadata
    metadata: {
      hairLossPattern: {
        label: 'Hair Loss Pattern',
        description: 'Pattern of hair loss',
        type: 'enum',
        options: ['Crown', 'Frontal', 'Diffuse'],
        icon: 'scissors'
      },
      treatmentAdherence: {
        label: 'Treatment Adherence',
        description: 'How consistently you followed the treatment',
        type: 'boolean',
        icon: 'check'
      },
      selfAssessment: {
        label: 'Self Assessment',
        description: 'Your assessment of improvement',
        type: 'scale',
        min: 1,
        max: 5,
        icon: 'star'
      },
      shedding: {
        label: 'Hair Shedding',
        description: 'Current level of hair shedding',
        type: 'enum',
        options: ['Increased', 'Same', 'Decreased'],
        icon: 'scissors'
      }
    }
  }
};

// Helper function to get all measurements for a service type
export const getAllMeasurements = (serviceType) => {
  if (!SERVICE_MEASUREMENTS[serviceType]) {
    return [];
  }
  
  const { required, optional } = SERVICE_MEASUREMENTS[serviceType];
  return [...required, ...optional];
};

// Helper function to get measurement metadata
export const getMeasurementMetadata = (serviceType, measurementType) => {
  if (!SERVICE_MEASUREMENTS[serviceType] || !SERVICE_MEASUREMENTS[serviceType].metadata) {
    return null;
  }
  
  return SERVICE_MEASUREMENTS[serviceType].metadata[measurementType] || null;
};

// Helper function to check if a measurement is valid for a service type
export const isValidMeasurement = (serviceType, measurementType) => {
  if (!SERVICE_MEASUREMENTS[serviceType]) {
    return false;
  }
  
  const { required, optional } = SERVICE_MEASUREMENTS[serviceType];
  return required.includes(measurementType) || optional.includes(measurementType);
};
