import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ArrowRight,
  Pill,
  AlertTriangle,
  Clock
} from 'lucide-react';

const ModernHealthHistoryStep = ({ 
  formData, 
  updateFormData, 
  productCategory,
  onNext,
  onPrevious
}) => {
  const { healthHistory } = formData;
  
  // State for multi-screen approach
  const [currentScreen, setCurrentScreen] = useState(0);
  const [errors, setErrors] = useState({});
  
  // Get condition list based on category
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
  
  // Get previous treatments based on category
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
  
  // Define screens based on product category
  const getScreens = () => {
    // Common screens for all categories
    const screens = [
      {
        id: 'heart_condition',
        title: 'Do you have any heart conditions?',
        description: 'This includes coronary artery disease, arrhythmias, heart failure, or previous heart attacks.',
        field: 'hasHeartCondition',
        icon: Heart,
        iconColor: 'text-red-500',
        type: 'boolean'
      },
      {
        id: 'high_blood_pressure',
        title: 'Do you have high blood pressure?',
        description: 'Also known as hypertension.',
        field: 'hasHighBloodPressure',
        icon: Activity,
        iconColor: 'text-blue-500',
        type: 'boolean'
      },
      {
        id: 'diabetes',
        title: 'Do you have diabetes?',
        description: 'Type 1 or Type 2 diabetes.',
        field: 'hasDiabetes',
        icon: Pill,
        iconColor: 'text-purple-500',
        type: 'boolean'
      },
      {
        id: 'liver_disease',
        title: 'Do you have liver disease?',
        description: 'This includes hepatitis, cirrhosis, or other liver conditions.',
        field: 'hasLiverDisease',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        type: 'boolean'
      },
      {
        id: 'medications',
        title: 'What medications are you currently taking?',
        description: 'Include prescription medications, over-the-counter medications, vitamins, and supplements.',
        field: 'medicationsText',
        icon: Pill,
        iconColor: 'text-green-500',
        type: 'text'
      },
      {
        id: 'allergies',
        title: 'Do you have any medication allergies?',
        description: 'If you have no known drug allergies, please write "None".',
        field: 'allergiesText',
        icon: AlertCircle,
        iconColor: 'text-red-500',
        type: 'text'
      }
    ];
    
    // Add category-specific screens
    if (productCategory === 'ed') {
      screens.splice(3, 0, {
        id: 'ed_duration',
        title: 'How long have you experienced erectile dysfunction?',
        description: 'This helps us determine the most appropriate treatment.',
        field: 'edDuration',
        icon: Clock,
        iconColor: 'text-blue-500',
        type: 'radio',
        options: edDurationOptions
      });
    }
    
    return screens;
  };
  
  const screens = getScreens();
  const currentScreenData = screens[currentScreen];
  
  // Handle boolean input change (Yes/No questions)
  const handleBooleanChange = (field, value) => {
    updateFormData('healthHistory', { [field]: value });
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    
    // Automatically advance to next screen after selection
    setTimeout(() => {
      if (currentScreen < screens.length - 1) {
        setCurrentScreen(currentScreen + 1);
      }
    }, 500);
  };
  
  // Handle text input change
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    updateFormData('healthHistory', { [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  // Handle radio button change
  const handleRadioChange = (field, value) => {
    updateFormData('healthHistory', { [field]: value });
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    
    // Automatically advance to next screen after selection
    setTimeout(() => {
      if (currentScreen < screens.length - 1) {
        setCurrentScreen(currentScreen + 1);
      }
    }, 500);
  };
  
  // Handle next screen
  const handleNextScreen = () => {
    // Validate current screen
    const newErrors = {};
    const field = currentScreenData.field;
    
    if (currentScreenData.type === 'boolean' && healthHistory[field] === null) {
      newErrors[field] = 'Please select an option';
    } else if (currentScreenData.type === 'text' && !healthHistory[field]) {
      newErrors[field] = 'Please provide an answer';
    } else if (currentScreenData.type === 'radio' && !healthHistory[field]) {
      newErrors[field] = 'Please select an option';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Proceed to next screen or finish
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onNext();
    }
  };
  
  // Handle previous screen
  const handlePreviousScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    } else {
      onPrevious();
    }
  };
  
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };
  
  // Render boolean input (Yes/No)
  const renderBooleanInput = (field) => {
    return (
      <div className="flex flex-col space-y-4 mt-8">
        <button
          type="button"
          onClick={() => handleBooleanChange(field, true)}
          className={`flex items-center justify-between px-6 py-4 rounded-lg border-2 transition-all ${
            healthHistory[field] === true
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-medium">Yes</span>
          {healthHistory[field] === true && (
            <CheckCircle className="h-5 w-5 text-blue-500" />
          )}
        </button>
        
        <button
          type="button"
          onClick={() => handleBooleanChange(field, false)}
          className={`flex items-center justify-between px-6 py-4 rounded-lg border-2 transition-all ${
            healthHistory[field] === false
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-medium">No</span>
          {healthHistory[field] === false && (
            <CheckCircle className="h-5 w-5 text-blue-500" />
          )}
        </button>
        
        {errors[field] && (
          <p className="text-red-500 text-sm mt-2">{errors[field]}</p>
        )}
      </div>
    );
  };
  
  // Render text input
  const renderTextInput = (field) => {
    return (
      <div className="mt-8">
        <textarea
          name={field}
          value={healthHistory[field] || ''}
          onChange={handleTextChange}
          placeholder="Type your answer here..."
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 min-h-[120px]"
        />
        {errors[field] && (
          <p className="text-red-500 text-sm mt-2">{errors[field]}</p>
        )}
      </div>
    );
  };
  
  // Render radio input
  const renderRadioInput = (field, options) => {
    return (
      <div className="flex flex-col space-y-4 mt-8">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleRadioChange(field, option.value)}
            className={`flex items-center justify-between px-6 py-4 rounded-lg border-2 transition-all ${
              healthHistory[field] === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-medium">{option.label}</span>
            {healthHistory[field] === option.value && (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            )}
          </button>
        ))}
        
        {errors[field] && (
          <p className="text-red-500 text-sm mt-2">{errors[field]}</p>
        )}
      </div>
    );
  };
  
  return (
    <div>
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {screens.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full flex-1 mx-0.5 ${
              index <= currentScreen ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      <motion.div
        key={currentScreen}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeIn}
      >
        {/* Screen icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${currentScreenData.iconColor.replace('text', 'bg').replace('500', '100')}`}>
            {React.createElement(currentScreenData.icon, {
              className: `h-8 w-8 ${currentScreenData.iconColor}`
            })}
          </div>
        </div>
        
        {/* Screen title */}
        <h2 className="text-2xl font-bold text-center mb-3">
          {currentScreenData.title}
        </h2>
        
        {/* Screen description */}
        <p className="text-gray-600 text-center mb-6">
          {currentScreenData.description}
        </p>
        
        {/* Input based on type */}
        {currentScreenData.type === 'boolean' && renderBooleanInput(currentScreenData.field)}
        {currentScreenData.type === 'text' && renderTextInput(currentScreenData.field)}
        {currentScreenData.type === 'radio' && renderRadioInput(currentScreenData.field, currentScreenData.options)}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={handlePreviousScreen}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          
          {/* Only show Next button for text inputs (others auto-advance) */}
          {currentScreenData.type === 'text' && (
            <button
              type="button"
              onClick={handleNextScreen}
              className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {currentScreen === screens.length - 1 ? 'Continue' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ModernHealthHistoryStep;
