/**
 * Utility functions for health-related calculations
 */

/**
 * Parses a height string in the format of feet'inches (e.g., 5'10)
 * @param {string} heightStr - The height string to parse
 * @returns {Object|null} - Object containing feet, inches, and totalInches, or null if invalid
 */
export const parseHeight = (heightStr) => {
  if (!heightStr) return null;
  
  const heightMatch = heightStr.match(/(\d+)'(\d+)/);
  if (!heightMatch) return null;
  
  const feet = parseInt(heightMatch[1], 10);
  const inches = parseInt(heightMatch[2], 10);
  const totalInches = feet * 12 + inches;
  
  return { feet, inches, totalInches };
};

/**
 * Converts weight between pounds and kilograms
 * @param {number} weight - The weight value to convert
 * @param {string} fromUnit - The unit to convert from ('lbs' or 'kg')
 * @param {string} toUnit - The unit to convert to ('lbs' or 'kg')
 * @returns {number} - The converted weight value
 */
export const convertWeight = (weight, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return weight;
  
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum)) return 0;
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return weightNum * 2.20462;
  } else if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weightNum / 2.20462;
  }
  
  return weightNum;
};

/**
 * Calculates BMI based on height in inches and weight in pounds
 * @param {number} heightInches - Height in inches
 * @param {number} weightPounds - Weight in pounds
 * @returns {number|null} - The calculated BMI or null if inputs are invalid
 */
export const calculateBMI = (heightInches, weightPounds) => {
  if (!heightInches || !weightPounds) return null;
  
  const heightNum = parseFloat(heightInches);
  const weightNum = parseFloat(weightPounds);
  
  if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
    return null;
  }
  
  // BMI formula: (weight in pounds * 703) / (height in inches)^2
  const bmi = (weightNum * 703) / (heightNum * heightNum);
  return bmi;
};

/**
 * Gets the BMI category based on the BMI value
 * @param {number} bmi - The BMI value
 * @returns {Object} - Object containing category and color for UI display
 */
export const getBMICategory = (bmi) => {
  if (bmi === null || isNaN(bmi)) {
    return { category: 'Unknown', color: 'gray' };
  }
  
  if (bmi < 18.5) {
    return { category: 'Underweight', color: 'blue' };
  } else if (bmi >= 18.5 && bmi < 25) {
    return { category: 'Normal weight', color: 'green' };
  } else if (bmi >= 25 && bmi < 30) {
    return { category: 'Overweight', color: 'yellow' };
  } else {
    return { category: 'Obese', color: 'red' };
  }
};

/**
 * Calculates BMI from height string and weight with unit
 * @param {string} heightStr - Height string in format feet'inches
 * @param {number|string} weight - Weight value
 * @param {string} weightUnit - Weight unit ('lbs' or 'kg')
 * @returns {Object|null} - Object with bmi value and category, or null if inputs are invalid
 */
export const calculateBMIFromInputs = (heightStr, weight, weightUnit = 'lbs') => {
  const heightData = parseHeight(heightStr);
  if (!heightData) return null;
  
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) return null;
  
  // Convert weight to pounds if needed
  const weightInPounds = weightUnit === 'kg' 
    ? convertWeight(weightNum, 'kg', 'lbs')
    : weightNum;
  
  const bmiValue = calculateBMI(heightData.totalInches, weightInPounds);
  if (bmiValue === null) return null;
  
  const bmiFormatted = bmiValue.toFixed(1);
  const bmiCategory = getBMICategory(bmiValue);
  
  return {
    value: bmiFormatted,
    category: bmiCategory.category,
    color: bmiCategory.color
  };
};