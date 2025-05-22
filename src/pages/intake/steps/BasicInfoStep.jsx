import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import { FormError } from '../../../components/common/FormError';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import useFormValidation from '../../../hooks/useFormValidation';
import useAccountCreation from '../../../hooks/useAccountCreation';
import { calculateBMIFromInputs, getBMICategory } from '../../../utils/healthCalculations';
import { isValidEmail, isValidHeight, isPositiveNumber } from '../../../utils/validation';

/**
 * BasicInfoStep component - Collects basic patient information
 */
const BasicInfoStep = ({ 
  formData, 
  updateFormData, 
  productCategory,
  onNext,
  onPrevious
}) => {
  const { basicInfo = {} } = formData;
  
  // Define validation rules
  const validationRules = {
    'email': [
      { 
        required: true, 
        message: 'Email address is required' 
      },
      { 
        validator: isValidEmail, 
        message: 'Please enter a valid email address' 
      }
    ],
    'height': [
      { 
        required: true, 
        message: 'Height is required' 
      },
      { 
        validator: isValidHeight, 
        message: 'Please enter height in format feet\'inches (e.g., 5\'10)' 
      }
    ],
    'weight': [
      { 
        required: true, 
        message: 'Weight is required' 
      },
      { 
        validator: isPositiveNumber, 
        message: 'Please enter a valid weight' 
      }
    ]
  };
  
  // Add category-specific validation rules
  if (productCategory === 'weight_management') {
    validationRules['goalWeight'] = [
      { 
        required: true, 
        message: 'Goal weight is required' 
      },
      { 
        validator: isPositiveNumber, 
        message: 'Please enter a valid goal weight' 
      }
    ];
  }
  
  if (productCategory === 'hair_loss') {
    validationRules['hairLossPattern'] = [
      { 
        required: true, 
        message: 'Please select a hair loss pattern' 
      }
    ];
  }
  
  // Initialize form validation hook
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useFormValidation(
    basicInfo,
    validationRules,
    async (values) => {
      // If account creation is needed, create it
      if (values.email && !values.accountCreated) {
        const success = await createAccount(values.email);
        if (!success) return;
      }
      
      // Proceed to next step
      onNext();
    }
  );
  
  // Initialize account creation hook
  const {
    isCreating,
    error: accountError,
    accountCreated,
    createAccount
  } = useAccountCreation(
    // On success
    (data) => {
      updateFormData('basicInfo', { 
        ...values, 
        accountCreated: true 
      });
    },
    // On error
    (error) => {
      console.error('Account creation error:', error);
    }
  );
  
  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (values.height && values.weight) {
      try {
        const bmiData = calculateBMIFromInputs(
          values.height, 
          values.weight, 
          values.weightUnit || 'lbs'
        );
        
        if (bmiData) {
          updateFormData('basicInfo', { bmi: bmiData.value });
        }
      } catch (error) {
        console.error('Error calculating BMI:', error);
      }
    }
  }, [values.height, values.weight, values.weightUnit, updateFormData]);
  
  // Handle input change and update parent form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
    updateFormData('basicInfo', { [name]: value });
  };
  
  // Handle hair loss pattern selection
  const handleHairLossPatternSelect = (pattern) => {
    handleChange('hairLossPattern', pattern);
    updateFormData('basicInfo', { hairLossPattern: pattern });
  };
  
  // Get BMI category and color for display
  const getBMIDisplay = () => {
    if (!values.bmi) return null;
    
    const bmiValue = parseFloat(values.bmi);
    const { category, color } = getBMICategory(bmiValue);
    
    return {
      value: values.bmi,
      category,
      colorClass: `text-${color}-700`
    };
  };
  
  const bmiDisplay = getBMIDisplay();
  
  return (
    <ErrorBoundary>
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <p className="text-gray-600 mb-6">
          Please provide your basic physical information to help us determine the most appropriate treatment options.
        </p>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="mb-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={values.email || ''}
              placeholder="your@email.com"
              helpText="We'll use this to create your account and send important updates"
              error={errors.email || accountError}
              required
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              aria-describedby="email-help"
              autoComplete="email"
            />
          </div>
          
          {/* Height Field */}
          <div className="mb-4">
            <FormInput
              id="height"
              name="height"
              label="Height"
              value={values.height || ''}
              placeholder="e.g., 5'10"
              helpText="Format: feet'inches (e.g., 5'10)"
              error={errors.height}
              required
              onChange={handleInputChange}
              onBlur={() => handleBlur('height')}
              aria-describedby="height-help"
            />
          </div>
          
          {/* Weight Field */}
          <div className="mb-4">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Current Weight
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                id="weight"
                name="weight"
                placeholder="e.g., 180"
                value={values.weight || ''}
                onChange={handleInputChange}
                onBlur={() => handleBlur('weight')}
                className={`flex-grow p-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-l-md`}
                required
                aria-invalid={errors.weight ? 'true' : 'false'}
                aria-describedby={errors.weight ? 'weight-error' : undefined}
              />
              <select
                name="weightUnit"
                value={values.weightUnit || 'lbs'}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-r-md bg-gray-50"
                aria-label="Weight unit"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
            {errors.weight && (
              <FormError id="weight-error" error={errors.weight} />
            )}
          </div>
          
          {/* Goal Weight Field (for weight management) */}
          {productCategory === 'weight_management' && (
            <div className="mb-4">
              <label htmlFor="goalWeight" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Weight
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="goalWeight"
                  name="goalWeight"
                  placeholder="e.g., 160"
                  value={values.goalWeight || ''}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('goalWeight')}
                  className={`flex-grow p-2 border ${errors.goalWeight ? 'border-red-500' : 'border-gray-300'} rounded-l-md`}
                  required
                  aria-invalid={errors.goalWeight ? 'true' : 'false'}
                  aria-describedby={errors.goalWeight ? 'goalWeight-error' : undefined}
                />
                <div className="p-2 border border-gray-300 rounded-r-md bg-gray-50">
                  {values.weightUnit || 'lbs'}
                </div>
              </div>
              {errors.goalWeight && (
                <FormError id="goalWeight-error" error={errors.goalWeight} />
              )}
            </div>
          )}
          
          {/* BMI Display */}
          {bmiDisplay && (
            <div className="mb-6 p-3 bg-blue-50 rounded-md" aria-live="polite">
              <p className="text-sm">
                <span className="font-medium">Your BMI:</span> {bmiDisplay.value}
                <span className={`ml-2 ${bmiDisplay.colorClass}`}>({bmiDisplay.category})</span>
              </p>
            </div>
          )}
          
          {/* Hair Loss Pattern (for hair loss) */}
          {productCategory === 'hair_loss' && (
            <div className="mb-6">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Hair Loss Pattern
                  <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    className={`border p-3 rounded-md cursor-pointer ${
                      values.hairLossPattern === 'receding_hairline' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handleHairLossPatternSelect('receding_hairline')}
                    role="radio"
                    aria-checked={values.hairLossPattern === 'receding_hairline'}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleHairLossPatternSelect('receding_hairline');
                      }
                    }}
                  >
                    <div className="font-medium">Receding Hairline</div>
                    <div className="text-sm text-gray-600">Hair loss at the temples and forehead</div>
                  </div>
                  
                  <div 
                    className={`border p-3 rounded-md cursor-pointer ${
                      values.hairLossPattern === 'crown_thinning' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handleHairLossPatternSelect('crown_thinning')}
                    role="radio"
                    aria-checked={values.hairLossPattern === 'crown_thinning'}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleHairLossPatternSelect('crown_thinning');
                      }
                    }}
                  >
                    <div className="font-medium">Crown Thinning</div>
                    <div className="text-sm text-gray-600">Hair loss at the top of the head</div>
                  </div>
                  
                  <div 
                    className={`border p-3 rounded-md cursor-pointer ${
                      values.hairLossPattern === 'diffuse_thinning' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handleHairLossPatternSelect('diffuse_thinning')}
                    role="radio"
                    aria-checked={values.hairLossPattern === 'diffuse_thinning'}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleHairLossPatternSelect('diffuse_thinning');
                      }
                    }}
                  >
                    <div className="font-medium">Diffuse Thinning</div>
                    <div className="text-sm text-gray-600">Overall thinning across the scalp</div>
                  </div>
                  
                  <div 
                    className={`border p-3 rounded-md cursor-pointer ${
                      values.hairLossPattern === 'other' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handleHairLossPatternSelect('other')}
                    role="radio"
                    aria-checked={values.hairLossPattern === 'other'}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleHairLossPatternSelect('other');
                      }
                    }}
                  >
                    <div className="font-medium">Other</div>
                    <div className="text-sm text-gray-600">Different pattern or unsure</div>
                  </div>
                </div>
                {errors.hairLossPattern && (
                  <FormError error={errors.hairLossPattern} className="mt-2" />
                )}
              </fieldset>
            </div>
          )}
          
          {/* Account Creation Success Message */}
          {accountCreated && (
            <div className="mb-6 p-3 bg-green-50 rounded-md" role="status" aria-live="polite">
              <p className="text-sm text-green-800 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Account created successfully! A verification email has been sent to {values.email}.
              </p>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting || isCreating}
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isSubmitting || isCreating}
              aria-busy={isSubmitting || isCreating}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : isSubmitting ? (
                'Processing...'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

BasicInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  productCategory: PropTypes.string,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired
};

export default BasicInfoStep;
