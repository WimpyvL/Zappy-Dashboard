// API endpoint definitions for forms
import { supabase } from '../../lib/supabase';

const formsApi = {
  /**
   * Get all forms (questionnaires)
   * @param {Object} params - Query parameters
   * @returns {Promise} - Supabase query result
   */
  getForms: async (params = {}) => {
    let query = supabase
      .from('questionnaire')
      .select('*')
      .order('name', { ascending: true });

    // Add filters if provided
    if (params.status !== undefined) {
      query = query.eq('is_active', params.status);
    }
    if (params.formType) {
      query = query.eq('form_type', params.formType);
    }
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    return await query;
  },

  /**
   * Get a specific form by ID
   * @param {string} id - Form ID
   * @returns {Promise} - Supabase query result
   */
  getFormById: async (id) => {
    return await supabase
      .from('questionnaire')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * Create a new form
   * @param {Object} formData - Form data
   * @returns {Promise} - Supabase query result
   */
  createForm: async (formData) => {
    const questionnaireData = {
      name: formData.title,
      description: formData.description,
      structure: formData.structure,
      is_active: formData.status ?? true,
      form_type: formData.form_type,
      slug: formData.slug || formData.title?.toLowerCase().replace(/\s+/g, '-'),
      service_id: formData.service_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await supabase
      .from('questionnaire')
      .insert(questionnaireData)
      .select()
      .single();
  },

  /**
   * Update an existing form
   * @param {string} id - Form ID
   * @param {Object} formData - Updated form data
   * @returns {Promise} - Supabase query result
   */
  updateForm: async (id, formData) => {
    const dataToUpdate = {
      name: formData.title,
      description: formData.description,
      structure: formData.structure,
      is_active: formData.status,
      form_type: formData.form_type,
      slug: formData.slug,
      service_id: formData.service_id,
      updated_at: new Date().toISOString(),
    };

    return await supabase
      .from('questionnaire')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete a form
   * @param {string} id - Form ID
   * @returns {Promise} - Supabase query result
   */
  deleteForm: async (id) => {
    return await supabase.from('questionnaire').delete().eq('id', id);
  },

  /**
   * Get forms assigned to a patient
   * @param {string} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Supabase query result
   */
  getPatientForms: async (patientId, params = {}) => {
    let query = supabase
      .from('form_requests')
      .select(
        `
        *,
        questionnaire (id, name, description, form_type)
      `
      )
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    return await query;
  },

  /**
   * Send a form to a patient
   * @param {string} patientId - Patient ID
   * @param {string} formId - Form ID
   * @param {Object} options - Additional options
   * @returns {Promise} - Supabase query result
   */
  sendFormToPatient: async (patientId, formId, options = {}) => {
    const { deadlineDays = 7, createdBy } = options;

    const formRequestData = {
      patient_id: patientId,
      questionnaire_id: formId,
      status: 'pending',
      sent_date: new Date().toISOString(),
      deadline_date: new Date(
        Date.now() + deadlineDays * 24 * 60 * 60 * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy,
    };

    return await supabase
      .from('form_requests')
      .insert(formRequestData)
      .select()
      .single();
  },

  /**
   * Update a form request status
   * @param {string} requestId - Form request ID
   * @param {string} status - New status
   * @param {Object} responseData - Form response data (if completed)
   * @returns {Promise} - Supabase query result
   */
  updateFormRequestStatus: async (requestId, status, responseData = null) => {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
      if (responseData) {
        updateData.response_data = responseData;
      }
    }

    return await supabase
      .from('form_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();
  },
};

export default formsApi;
