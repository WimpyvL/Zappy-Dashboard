// Utility functions for forms
// Created by reorganization script

/**
 * Formats form data from database to frontend format
 * @param {Object} dbForm - Form data from database
 * @returns {Object} - Formatted form data for frontend
 */
export const formatFormData = (dbForm) => {
  if (!dbForm) return null;

  return {
    ...dbForm,
    title: dbForm.name,
    status: dbForm.is_active ? 'active' : 'inactive',
    serviceId: dbForm.service_id,
  };
};

/**
 * Formats form data from frontend to database format
 * @param {Object} frontendForm - Form data from frontend
 * @returns {Object} - Formatted form data for database
 */
export const formatFormDataForDb = (frontendForm) => {
  const dbForm = {
    name: frontendForm.title,
    description: frontendForm.description,
    structure: frontendForm.structure,
    is_active: frontendForm.status === 'active',
    form_type: frontendForm.form_type,
    slug:
      frontendForm.slug ||
      frontendForm.title?.toLowerCase().replace(/\s+/g, '-'),
    service_id: frontendForm.serviceId || frontendForm.service_id,
  };

  return dbForm;
};

/**
 * Formats form request data from database to frontend format
 * @param {Object} dbRequest - Form request data from database
 * @returns {Object} - Formatted form request data for frontend
 */
export const formatFormRequestData = (dbRequest) => {
  if (!dbRequest) return null;

  return {
    ...dbRequest,
    name: dbRequest.questionnaire?.name || 'Unknown Form',
    formType: dbRequest.questionnaire?.form_type,
    description: dbRequest.questionnaire?.description,
    patientId: dbRequest.patient_id,
    formId: dbRequest.questionnaire_id,
    sentDate: dbRequest.sent_date,
    deadlineDate: dbRequest.deadline_date,
    completedDate: dbRequest.completed_date,
    responseData: dbRequest.response_data,
    createdBy: dbRequest.created_by,
  };
};

/**
 * Generates a unique ID for form elements
 * @returns {string} - Random ID
 */
export const generateFormElementId = () => {
  return `_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates a form structure
 * @param {Object} structure - Form structure to validate
 * @returns {Object} - Validation result with success flag and optional error
 */
export const validateFormStructure = (structure) => {
  try {
    // Parse if string
    const formStructure =
      typeof structure === 'string' ? JSON.parse(structure) : structure;

    // Basic validation
    if (!formStructure || typeof formStructure !== 'object') {
      return { success: false, error: 'Invalid form structure' };
    }

    if (!Array.isArray(formStructure.pages)) {
      return { success: false, error: 'Form must have pages array' };
    }

    // Validate pages
    for (const page of formStructure.pages) {
      if (!page.title) {
        return { success: false, error: 'Each page must have a title' };
      }

      if (!Array.isArray(page.elements)) {
        return { success: false, error: 'Each page must have elements array' };
      }

      // Validate elements
      for (const element of page.elements) {
        if (!element.type || !element.label) {
          return {
            success: false,
            error: 'Each element must have type and label',
          };
        }
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
