import React, { useState, useEffect } from 'react';

const BasicInfoStep = ({ 
  formData, 
  updateFormData, 
  productCategory,
  onNext,
  onPrevious
}) => {
  const { basicInfo } = formData;
  
  // Local state for form validation
  const [errors, setErrors] = useState({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (basicInfo.height && basicInfo.weight) {
      try {
        // Extract feet and inches from height string (e.g., "5'10")
        const heightMatch = basicInfo.height.match(/(\d+)'(\d+)/);
        if (heightMatch) {
          const feet = parseInt(heightMatch[1]);
          const inches = parseInt(heightMatch[2]);
          const totalInches = feet * 12 + inches;
          
          // Convert weight to kg if needed
          const weightInPounds = basicInfo.weightUnit === 'kg' 
            ? basicInfo.weight * 2.20462 
            : parseFloat(basicInfo.weight);
          
          // BMI formula: (weight in pounds * 703) / (height in inches)^2
          const bmi = (weightInPounds * 703) / (totalInches * totalInches);
          
          if (!isNaN(bmi)) {
            updateFormData('basicInfo', { bmi: bmi.toFixed(1) });
          }
        }
      } catch (error) {
        console.error('Error calculating BMI:', error);
      }
    }
  }, [basicInfo.height, basicInfo.weight, basicInfo.weightUnit, updateFormData]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    // Email validation
    if (!basicInfo.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(basicInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!basicInfo.height) {
      newErrors.height = 'Height is required';
    }
    if (!basicInfo.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(basicInfo.weight) || parseFloat(basicInfo.weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    
    // Category-specific validation
    if (productCategory === 'weight_management' && !basicInfo.goalWeight) {
      newErrors.goalWeight = 'Goal weight is required';
    } else if (
      productCategory === 'weight_management' && 
      (isNaN(basicInfo.goalWeight) || parseFloat(basicInfo.goalWeight) <= 0)
    ) {
      newErrors.goalWeight = 'Please enter a valid goal weight';
    }
    
    if (productCategory === 'hair_loss' && !basicInfo.hairLossPattern) {
      newErrors.hairLossPattern = 'Please select a hair loss pattern';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create account if email is provided
    if (basicInfo.email && !isCreatingAccount) {
      try {
        setIsCreatingAccount(true);
        
        // In a real implementation, this would be an API call to create an account
        // For now, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store the account creation status
        updateFormData('basicInfo', { accountCreated: true });
        
        // Send verification email (simulated)
        console.log(`Verification email sent to ${basicInfo.email}`);
        
      } catch (error) {
        console.error('Error creating account:', error);
        setErrors({ email: 'Failed to create account. Please try again.' });
        setIsCreatingAccount(false);
        return;
      }
      
      setIsCreatingAccount(false);
    }
    
    // Proceed to next step
    onNext();
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('basicInfo', { [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <p className="text-gray-600 mb-6">
        Please provide your basic physical information to help us determine the most appropriate treatment options.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            value={basicInfo.email || ''}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">We'll use this to create your account and send important updates</p>
        </div>
        
        {/* Height Field */}
        <div className="mb-4">
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            type="text"
            id="height"
            name="height"
            placeholder="e.g., 5'10"
            value={basicInfo.height}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.height ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.height && (
            <p className="mt-1 text-sm text-red-600">{errors.height}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Format: feet'inches (e.g., 5'10)</p>
        </div>
        
        {/* Weight Field */}
        <div className="mb-4">
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
            Current Weight
          </label>
          <div className="flex">
            <input
              type="text"
              id="weight"
              name="weight"
              placeholder="e.g., 180"
              value={basicInfo.weight}
              onChange={handleChange}
              className={`flex-grow p-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-l-md`}
            />
            <select
              name="weightUnit"
              value={basicInfo.weightUnit}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-r-md bg-gray-50"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
          )}
        </div>
        
        {/* Goal Weight Field (for weight management) */}
        {productCategory === 'weight_management' && (
          <div className="mb-4">
            <label htmlFor="goalWeight" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Weight
            </label>
            <div className="flex">
              <input
                type="text"
                id="goalWeight"
                name="goalWeight"
                placeholder="e.g., 160"
                value={basicInfo.goalWeight}
                onChange={handleChange}
                className={`flex-grow p-2 border ${errors.goalWeight ? 'border-red-500' : 'border-gray-300'} rounded-l-md`}
              />
              <div className="p-2 border border-gray-300 rounded-r-md bg-gray-50">
                {basicInfo.weightUnit}
              </div>
            </div>
            {errors.goalWeight && (
              <p className="mt-1 text-sm text-red-600">{errors.goalWeight}</p>
            )}
          </div>
        )}
        
        {/* BMI Display */}
        {basicInfo.bmi && (
          <div className="mb-6 p-3 bg-blue-50 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Your BMI:</span> {basicInfo.bmi}
              {parseFloat(basicInfo.bmi) < 18.5 && (
                <span className="ml-2 text-blue-700">(Underweight)</span>
              )}
              {parseFloat(basicInfo.bmi) >= 18.5 && parseFloat(basicInfo.bmi) < 25 && (
                <span className="ml-2 text-green-700">(Normal weight)</span>
              )}
              {parseFloat(basicInfo.bmi) >= 25 && parseFloat(basicInfo.bmi) < 30 && (
                <span className="ml-2 text-yellow-700">(Overweight)</span>
              )}
              {parseFloat(basicInfo.bmi) >= 30 && (
                <span className="ml-2 text-red-700">(Obese)</span>
              )}
            </p>
          </div>
        )}
        
        {/* Hair Loss Pattern (for hair loss) */}
        {productCategory === 'hair_loss' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hair Loss Pattern
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                className={`border p-3 rounded-md cursor-pointer ${
                  basicInfo.hairLossPattern === 'receding_hairline' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handleChange({ target: { name: 'hairLossPattern', value: 'receding_hairline' } })}
              >
                <div className="font-medium">Receding Hairline</div>
                <div className="text-sm text-gray-600">Hair loss at the temples and forehead</div>
              </div>
              
              <div 
                className={`border p-3 rounded-md cursor-pointer ${
                  basicInfo.hairLossPattern === 'crown_thinning' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handleChange({ target: { name: 'hairLossPattern', value: 'crown_thinning' } })}
              >
                <div className="font-medium">Crown Thinning</div>
                <div className="text-sm text-gray-600">Hair loss at the top of the head</div>
              </div>
              
              <div 
                className={`border p-3 rounded-md cursor-pointer ${
                  basicInfo.hairLossPattern === 'diffuse_thinning' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handleChange({ target: { name: 'hairLossPattern', value: 'diffuse_thinning' } })}
              >
                <div className="font-medium">Diffuse Thinning</div>
                <div className="text-sm text-gray-600">Overall thinning across the scalp</div>
              </div>
              
              <div 
                className={`border p-3 rounded-md cursor-pointer ${
                  basicInfo.hairLossPattern === 'other' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handleChange({ target: { name: 'hairLossPattern', value: 'other' } })}
              >
                <div className="font-medium">Other</div>
                <div className="text-sm text-gray-600">Different pattern or unsure</div>
              </div>
            </div>
            {errors.hairLossPattern && (
              <p className="mt-1 text-sm text-red-600">{errors.hairLossPattern}</p>
            )}
          </div>
        )}
        
        {/* Account Creation Success Message */}
        {basicInfo.accountCreated && (
          <div className="mb-6 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Account created successfully! A verification email has been sent to {basicInfo.email}.
            </p>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isCreatingAccount}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={isCreatingAccount}
          >
            {isCreatingAccount ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoStep;
