/**
 * Form structure validation utilities
 */

/**
 * Validates that a form structure has the required fields
 * @param {Object|string} formStructure - The form structure to validate (JSON object or string)
 * @returns {Object} - Result of validation containing success flag and optional error message
 */
export const validateFormStructure = (formStructure) => {
  try {
    // Check if formStructure is valid JSON string
    if (typeof formStructure === 'string') {
      try {
        formStructure = JSON.parse(formStructure);
      } catch (e) {
        return {
          success: false,
          error: 'Invalid JSON structure. Please check your JSON syntax.'
        };
      }
    }
    
    // Check if formStructure is an object
    if (!formStructure || typeof formStructure !== 'object') {
      return {
        success: false,
        error: 'Invalid form structure. Expected an object.'
      };
    }

    // Check for title
    if (!formStructure.title) {
      return {
        success: false, 
        error: 'Missing required field: title'
      };
    }

    // Check for pages array
    if (!Array.isArray(formStructure.pages)) {
      return {
        success: false,
        error: 'Missing required field: pages array'
      };
    }

    // Validate pages structure
    if (formStructure.pages.length === 0) {
      return {
        success: false,
        error: 'Form must contain at least one page'
      };
    }

    // Check that each page has a title and elements array
    for (let i = 0; i < formStructure.pages.length; i++) {
      const page = formStructure.pages[i];
      if (!page.title) {
        return {
          success: false,
          error: `Page ${i + 1} is missing a title`
        };
      }
      if (!Array.isArray(page.elements)) {
        return {
          success: false,
          error: `Page ${i + 1} is missing an elements array`
        };
      }
    }

    // Make sure conditionals is an array if it exists
    if (formStructure.conditionals && !Array.isArray(formStructure.conditionals)) {
      return {
        success: false,
        error: 'Conditionals must be an array'
      };
    }

    // If all validations pass
    return { 
      success: true,
      formStructure: formStructure
    };
  } catch (error) {
    console.error('Error validating form structure:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while validating the form structure.'
    };
  }
};

/**
 * Formats and prepares a valid form structure for saving
 * @param {Object} formStructure - The validated form structure
 * @returns {Object} - The prepared form structure with database-friendly format
 */
export const prepareFormStructure = (formStructure) => {
  // Create a copy to avoid modifying the original
  const preparedForm = { ...formStructure };
  
  // Ensure required fields are set
  preparedForm.title = preparedForm.title || 'Untitled Form';
  preparedForm.description = preparedForm.description || '';
  
  // Ensure pages is an array with unique IDs
  if (!Array.isArray(preparedForm.pages)) {
    preparedForm.pages = [];
  }
  
  // Ensure each page has the required properties and generate IDs if missing
  preparedForm.pages = preparedForm.pages.map(page => ({
    ...page,
    id: page.id || `_${Math.random().toString(36).substr(2, 9)}`,
    elements: Array.isArray(page.elements) ? page.elements.map(element => ({
      ...element,
      id: element.id || `_${Math.random().toString(36).substr(2, 9)}`
    })) : []
  }));
  
  // Ensure conditionals is an array
  if (!Array.isArray(preparedForm.conditionals)) {
    preparedForm.conditionals = [];
  }
  
  return preparedForm;
};