/**
 * Service for evaluating health profiles against recommendation rules
 */

/**
 * Evaluates a health profile against a set of recommendation rules
 * and returns the matching recommendation
 * 
 * @param {Object} healthProfile - The patient's health profile
 * @param {Array} rules - The recommendation rules to evaluate
 * @returns {Object|null} The matching recommendation or null if no match
 */
export const evaluateHealthProfile = (healthProfile, rules) => {
  if (!rules || rules.length === 0) {
    return null;
  }
  
  // Sort rules by priority (higher number = higher priority)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
  
  // Find the first matching rule
  for (const rule of sortedRules) {
    if (matchesRule(healthProfile, rule)) {
      return {
        title: rule.product_title,
        description: rule.product_description,
        reason: rule.reason_text
      };
    }
  }
  
  // Return default recommendation if no match
  return {
    title: 'General Health Bundle',
    description: 'Our most popular bundle for overall health and wellness.',
    reason: 'Recommended for new patients'
  };
};

/**
 * Checks if a health profile matches a rule
 * 
 * @param {Object} healthProfile - The patient's health profile
 * @param {Object} rule - The rule to check
 * @returns {boolean} Whether the health profile matches the rule
 */
const matchesRule = (healthProfile, rule) => {
  switch (rule.condition_type) {
    case 'bmi':
      return matchesBMIRule(healthProfile.bmi, rule.condition_value);
    case 'goal':
      return matchesGoalRule(healthProfile.goals, rule.condition_value);
    case 'condition':
      return matchesConditionRule(healthProfile.conditions, rule.condition_value);
    case 'age':
      return matchesAgeRule(healthProfile.age, rule.condition_value);
    case 'combination':
      return matchesCombinationRule(healthProfile, rule.condition_value);
    default:
      return false;
  }
};

/**
 * Checks if a BMI value matches a BMI rule
 * 
 * @param {number} bmi - The patient's BMI
 * @param {Object} conditionValue - The rule's condition value
 * @returns {boolean} Whether the BMI matches the rule
 */
const matchesBMIRule = (bmi, conditionValue) => {
  if (bmi === undefined || bmi === null) {
    return false;
  }
  
  const { operator, value, min, max } = conditionValue;
  
  switch (operator) {
    case 'gt':
      return bmi > value;
    case 'gte':
      return bmi >= value;
    case 'lt':
      return bmi < value;
    case 'lte':
      return bmi <= value;
    case 'eq':
      return bmi === value;
    case 'between':
      return bmi >= min && bmi <= max;
    default:
      return false;
  }
};

/**
 * Checks if a patient's goals match a goal rule
 * 
 * @param {Array} goals - The patient's health goals
 * @param {Object} conditionValue - The rule's condition value
 * @returns {boolean} Whether the goals match the rule
 */
const matchesGoalRule = (goals, conditionValue) => {
  if (!goals || goals.length === 0) {
    return false;
  }
  
  const { operator, value } = conditionValue;
  
  switch (operator) {
    case 'includes':
      return goals.includes(value);
    case 'excludes':
      return !goals.includes(value);
    case 'includesAny':
      return value.some(v => goals.includes(v));
    case 'includesAll':
      return value.every(v => goals.includes(v));
    default:
      return false;
  }
};

/**
 * Checks if a patient's conditions match a condition rule
 * 
 * @param {Array} conditions - The patient's medical conditions
 * @param {Object} conditionValue - The rule's condition value
 * @returns {boolean} Whether the conditions match the rule
 */
const matchesConditionRule = (conditions, conditionValue) => {
  if (!conditions || conditions.length === 0) {
    return false;
  }
  
  const { operator, value } = conditionValue;
  
  switch (operator) {
    case 'includes':
      return conditions.includes(value);
    case 'excludes':
      return !conditions.includes(value);
    case 'includesAny':
      return value.some(v => conditions.includes(v));
    case 'includesAll':
      return value.every(v => conditions.includes(v));
    default:
      return false;
  }
};

/**
 * Checks if a patient's age matches an age rule
 * 
 * @param {number} age - The patient's age
 * @param {Object} conditionValue - The rule's condition value
 * @returns {boolean} Whether the age matches the rule
 */
const matchesAgeRule = (age, conditionValue) => {
  if (age === undefined || age === null) {
    return false;
  }
  
  const { operator, value, min, max } = conditionValue;
  
  switch (operator) {
    case 'gt':
      return age > value;
    case 'gte':
      return age >= value;
    case 'lt':
      return age < value;
    case 'lte':
      return age <= value;
    case 'eq':
      return age === value;
    case 'between':
      return age >= min && age <= max;
    default:
      return false;
  }
};

/**
 * Checks if a health profile matches a combination rule
 * 
 * @param {Object} healthProfile - The patient's health profile
 * @param {Object} conditionValue - The rule's condition value
 * @returns {boolean} Whether the health profile matches the rule
 */
const matchesCombinationRule = (healthProfile, conditionValue) => {
  const { operator, conditions } = conditionValue;
  
  if (operator === 'and') {
    return conditions.every(condition => {
      const subRule = {
        condition_type: condition.type,
        condition_value: condition.value
      };
      return matchesRule(healthProfile, subRule);
    });
  } else if (operator === 'or') {
    return conditions.some(condition => {
      const subRule = {
        condition_type: condition.type,
        condition_value: condition.value
      };
      return matchesRule(healthProfile, subRule);
    });
  }
  
  return false;
};
