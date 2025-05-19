import React, { useState } from 'react';

const HealthHistoryStep = ({ 
  formData, 
  updateFormData, 
  productCategory,
  onNext,
  onPrevious
}) => {
  const { healthHistory } = formData;
  
  // Local state for form validation
  const [errors, setErrors] = useState({});
  
  // Common medical conditions based on category
  const getMedicalConditions = () => {
    const commonConditions = [
      'Hypertension (High Blood Pressure)',
      'Diabetes',
      'Heart Disease',
      'Stroke',
      'Liver Disease',
      'Kidney Disease',
      'Thyroid Disorder',
      'Cancer',
      'Depression',
      'Anxiety'
    ];
    
    // Add category-specific conditions
    switch (productCategory) {
      case 'weight_management':
        return [
          ...commonConditions,
          'Obesity',
          'Polycystic Ovary Syndrome (PCOS)',
          'Sleep Apnea',
          'Gallbladder Disease',
          'Eating Disorder'
        ];
      case 'ed':
        return [
          ...commonConditions,
          'Prostate Issues',
          'Low Testosterone',
          'Peyronie\'s Disease',
          'Multiple Sclerosis',
          'Spinal Cord Injury'
        ];
      case 'hair_loss':
        return [
          ...commonConditions,
          'Alopecia Areata',
          'Scalp Infection',
          'Hormonal Imbalance',
          'Autoimmune Disease',
          'Skin Disorder'
        ];
      default:
        return commonConditions;
    }
  };
  
  // Previous treatments based on category
  const getPreviousTreatments = () => {
    switch (productCategory) {
      case 'weight_management':
        return [
          'Diet Modification',
          'Exercise Program',
          'Weight Loss Medication',
          'Weight Loss Surgery',
          'Meal Replacement',
          'Weight Loss Program (e.g., Weight Watchers)',
          'Nutritionist/Dietitian Consultation'
        ];
      case 'ed':
        return [
          'Oral ED Medication (e.g., Viagra, Cialis)',
          'Penile Injections',
          'Vacuum Devices',
          'Testosterone Therapy',
          'Psychological Counseling',
          'Lifestyle Changes'
        ];
      case 'hair_loss':
        return [
          'Minoxidil (Rogaine)',
          'Finasteride (Propecia)',
          'Hair Transplant',
          'Laser Therapy',
          'Scalp Micropigmentation',
          'Nutritional Supplements',
          'Platelet-Rich Plasma (PRP) Therapy'
        ];
      default:
        return [
          'Prescription Medication',
          'Over-the-Counter Medication',
          'Physical Therapy',
          'Surgery',
          'Lifestyle Changes',
          'Alternative Medicine'
        ];
    }
  };
  
  // ED duration options
  const edDurationOptions = [
    { value: 'less_than_6_months', label: 'Less than 6 months' },
    { value: '6_months_to_1_year', label: '6 months to 1 year' },
    { value: '1_to_3_years', label: '1 to 3 years' },
    { value: 'more_than_3_years', label: 'More than 3 years' }
  ];
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    // Category-specific validation
    if (productCategory === 'ed' && !healthHistory.edDuration) {
      newErrors.edDuration = 'Please select how long you have experienced ED';
    }
    
    // Always proceed to next step - remove validation for now
    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors);
    //   return;
    // }
    
    // Proceed to next step
    onNext();
  };
  
  // Handle checkbox change for medical conditions
  const handleConditionChange = (condition) => {
    const updatedConditions = healthHistory.medicalConditions?.includes(condition)
      ? healthHistory.medicalConditions.filter(c => c !== condition)
      : [...(healthHistory.medicalConditions || []), condition];
    
    updateFormData('healthHistory', { medicalConditions: updatedConditions });
  };
  
  // Handle checkbox change for previous treatments
  const handleTreatmentChange = (treatment) => {
    const updatedTreatments = healthHistory.previousTreatments?.includes(treatment)
      ? healthHistory.previousTreatments.filter(t => t !== treatment)
      : [...(healthHistory.previousTreatments || []), treatment];
    
    updateFormData('healthHistory', { previousTreatments: updatedTreatments });
  };
  
  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('healthHistory', { [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  // Handle radio button change
  const handleRadioChange = (name, value) => {
    updateFormData('healthHistory', { [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Health History</h2>
      <p className="text-gray-600 mb-6">
        Please provide information about your health history to help us determine the most appropriate treatment options.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Medical Conditions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any of the following medical conditions? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 p-3 rounded-md">
            {getMedicalConditions().map((condition, index) => (
              <div key={index} className="flex items-start">
                <input
                  type="checkbox"
                  id={`condition-${index}`}
                  checked={healthHistory.medicalConditions?.includes(condition) || false}
                  onChange={() => handleConditionChange(condition)}
                  className="mt-1 mr-2"
                />
                <label htmlFor={`condition-${index}`} className="text-sm">
                  {condition}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Previous Treatments (category-specific) */}
        {(productCategory === 'weight_management' || productCategory === 'ed' || productCategory === 'hair_loss') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {productCategory === 'weight_management' 
                ? 'Have you tried any of the following weight loss methods?' 
                : productCategory === 'ed'
                ? 'Have you tried any of the following ED treatments?'
                : 'Have you tried any of the following hair loss treatments?'}
              (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getPreviousTreatments().map((treatment, index) => (
                <div key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`treatment-${index}`}
                    checked={healthHistory.previousTreatments?.includes(treatment) || false}
                    onChange={() => handleTreatmentChange(treatment)}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor={`treatment-${index}`} className="text-sm">
                    {treatment}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ED Duration (ED-specific) */}
        {productCategory === 'ed' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How long have you experienced erectile dysfunction?
            </label>
            <div className="space-y-2">
              {edDurationOptions.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`duration-${option.value}`}
                    name="edDuration"
                    value={option.value}
                    checked={healthHistory.edDuration === option.value}
                    onChange={() => handleRadioChange('edDuration', option.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`duration-${option.value}`} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.edDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.edDuration}</p>
            )}
          </div>
        )}
        
        {/* Current Medications */}
        <div className="mb-6">
          <label htmlFor="medicationsText" className="block text-sm font-medium text-gray-700 mb-2">
            List any medications you are currently taking:
          </label>
          <textarea
            id="medicationsText"
            name="medicationsText"
            rows="3"
            placeholder="Enter medications, dosages, and frequency (e.g., Lisinopril 10mg daily)"
            value={healthHistory.medicationsText || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            Include prescription medications, over-the-counter medications, vitamins, and supplements.
          </p>
        </div>
        
        {/* Allergies */}
        <div className="mb-6">
          <label htmlFor="allergiesText" className="block text-sm font-medium text-gray-700 mb-2">
            List any allergies to medications:
          </label>
          <textarea
            id="allergiesText"
            name="allergiesText"
            rows="2"
            placeholder="Enter medication allergies and reactions (e.g., Penicillin - rash)"
            value={healthHistory.allergiesText || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            If you have no known drug allergies, please write "None".
          </p>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthHistoryStep;
