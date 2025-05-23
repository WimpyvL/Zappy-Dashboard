import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import step components
import ModernIntroductionStep from './modern-steps/ModernIntroductionStep';
import ModernHealthHistoryStep from './modern-steps/ModernHealthHistoryStep';

// Define steps
const STEPS = {
  INTRODUCTION: 'introduction',
  HEALTH_HISTORY: 'health_history',
  BASIC_INFO: 'basic_info',
  ID_VERIFICATION: 'id_verification',
  TREATMENT_PREFERENCES: 'treatment_preferences',
  REVIEW: 'review',
  SHIPPING_ADDRESS: 'shipping_address',
  CHECKOUT: 'checkout',
  ORDER_CONFIRMATION: 'order_confirmation'
};

const ModernIntakeFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize state from location or defaults
  const [currentStep, setCurrentStep] = useState(
    location.state?.step || STEPS.INTRODUCTION
  );
  
  const [formData, setFormData] = useState({
    basicInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      gender: ''
    },
    healthHistory: {
      hasHeartCondition: null,
      hasHighBloodPressure: null,
      hasDiabetes: null,
      hasLiverDisease: null,
      edDuration: '',
      medicationsText: '',
      allergiesText: ''
    },
    treatmentPreferences: {
      preferredMedication: '',
      preferredFrequency: '',
      previousTreatments: []
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    idVerification: {
      idType: '',
      idNumber: '',
      idImage: null
    },
    prescriptionItems: location.state?.prescriptionItems || []
  });
  
  // Get product category from location state or default to general
  const [productCategory, setProductCategory] = useState(
    location.state?.productCategory || 'general'
  );
  
  // Update form data
  const updateFormData = (section, data) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        ...data
      }
    }));
  };
  
  // Navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
      case STEPS.INTRODUCTION:
        setCurrentStep(STEPS.HEALTH_HISTORY);
        break;
      case STEPS.HEALTH_HISTORY:
        setCurrentStep(STEPS.BASIC_INFO);
        break;
      case STEPS.BASIC_INFO:
        setCurrentStep(STEPS.ID_VERIFICATION);
        break;
      case STEPS.ID_VERIFICATION:
        setCurrentStep(STEPS.TREATMENT_PREFERENCES);
        break;
      case STEPS.TREATMENT_PREFERENCES:
        setCurrentStep(STEPS.REVIEW);
        break;
      case STEPS.REVIEW:
        setCurrentStep(STEPS.SHIPPING_ADDRESS);
        break;
      case STEPS.SHIPPING_ADDRESS:
        setCurrentStep(STEPS.CHECKOUT);
        break;
      case STEPS.CHECKOUT:
        setCurrentStep(STEPS.ORDER_CONFIRMATION);
        break;
      default:
        // Handle completion
        navigate('/patient-home-v2', { 
          state: { 
            formCompleted: true,
            formData 
          } 
        });
    }
  };
  
  const goToPreviousStep = () => {
    switch (currentStep) {
      case STEPS.HEALTH_HISTORY:
        setCurrentStep(STEPS.INTRODUCTION);
        break;
      case STEPS.BASIC_INFO:
        setCurrentStep(STEPS.HEALTH_HISTORY);
        break;
      case STEPS.ID_VERIFICATION:
        setCurrentStep(STEPS.BASIC_INFO);
        break;
      case STEPS.TREATMENT_PREFERENCES:
        setCurrentStep(STEPS.ID_VERIFICATION);
        break;
      case STEPS.REVIEW:
        setCurrentStep(STEPS.TREATMENT_PREFERENCES);
        break;
      case STEPS.SHIPPING_ADDRESS:
        setCurrentStep(STEPS.REVIEW);
        break;
      case STEPS.CHECKOUT:
        setCurrentStep(STEPS.SHIPPING_ADDRESS);
        break;
      default:
        // Handle edge case
        navigate(-1);
    }
  };
  
  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.INTRODUCTION:
        return (
          <ModernIntroductionStep
            productCategory={productCategory}
            onNext={goToNextStep}
          />
        );
      case STEPS.HEALTH_HISTORY:
        return (
          <ModernHealthHistoryStep
            formData={formData}
            updateFormData={updateFormData}
            productCategory={productCategory}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        );
      // Placeholder for other steps
      case STEPS.BASIC_INFO:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
            <p className="text-gray-600 mb-8">This step will be implemented soon.</p>
            <div className="flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={goToNextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case STEPS.ID_VERIFICATION:
      case STEPS.TREATMENT_PREFERENCES:
      case STEPS.REVIEW:
      case STEPS.SHIPPING_ADDRESS:
      case STEPS.CHECKOUT:
      case STEPS.ORDER_CONFIRMATION:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">{currentStep.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <p className="text-gray-600 mb-8">This step will be implemented soon.</p>
            <div className="flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={goToNextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ModernIntakeFormPage;
