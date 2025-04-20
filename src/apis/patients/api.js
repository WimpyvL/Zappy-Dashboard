import { supabase, supabaseHelper } from '../../lib/supabase';
import { getErrorMessage } from '../../utils/errorHandling';
import { SupabaseQueryResult } from '../../types/supabase';

/**
 * Standardized API for patient operations with Supabase
 */
const patientsApi = {
  /**
   * Fetches patients with consistent query pattern
   * @param {object} params - Query parameters
   * @returns {Promise<SupabaseQueryResult>} Standardized query result
   */
  getAll: async (params = {}) => {
    try {
      const fetchOptions = {
        select: '*',
        order: { column: 'created_at', ascending: false },
        filters: params.filters || [],
      };

      // Add pagination if provided
      if (params.page && params.pageSize) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        fetchOptions.range = { from, to };
      }

      const { data, error, count } = await supabaseHelper.fetch('patients', fetchOptions);

      if (error) {
        throw error;
      }

      return {
        data,
        error: null,
        count,
        status: 200,
        statusText: 'OK'
      };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        count: null,
        status: error.status || 500,
        statusText: error.message || 'Internal Server Error'
      };
    }
  },

  /**
   * Gets patient by ID with standardized response
   * @param {string} id - Patient ID
   * @returns {Promise<SupabaseQueryResult>} Standardized query result
   */
  getById: async (id) => {
    try {
      const fetchOptions = {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: id }],
        single: true,
      };
      const { data, error } = await supabaseHelper.fetch('patients', fetchOptions);

      if (error) {
        throw error;
      }

      return {
        data,
        error: null,
        count: data ? 1 : 0,
        status: data ? 200 : 404,
        statusText: data ? 'OK' : 'Not Found'
      };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        count: null,
        status: error.status || 500,
        statusText: error.message || 'Internal Server Error'
      };
    }
  },

  /**
   * Creates a new patient with standardized response
   * @param {object} patientData - Patient data
   * @returns {Promise<SupabaseQueryResult>} Standardized query result
   */
  create: async (patientData) => {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/patients/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({ data: patientData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create patient');
      }

      return {
        data: result.data || null,
        error: null,
        count: result.data ? 1 : 0,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        count: null,
        status: error.status || 500,
        statusText: error.message || 'Internal Server Error'
      };
    }
  },

  /**
   * Updates a patient with standardized response
   * @param {string} id - Patient ID
   * @param {object} patientData - Updated patient data
   * @returns {Promise<SupabaseQueryResult>} Standardized query result
   */
  update: async (id, patientData) => {
    try {
      const { data, error } = await supabaseHelper.update('patients', id, patientData);

      if (error) {
        throw error;
      }

      return {
        data: data ? data[0] : null, // supabaseHelper.update returns an array, so take the first element
        error: null,
        count: data ? 1 : 0,
        status: data ? 200 : 500,
        statusText: data ? 'OK' : 'Internal Server Error'
      };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        count: null,
        status: error.status || 500,
        statusText: error.message || 'Internal Server Error'
      };
    }
  },

  /**
   * Deletes a patient with standardized response
   * @param {string} id - Patient ID
   * @returns {Promise<SupabaseQueryResult>} Standardized query result
   */
  delete: async (id) => {
    try {
      const { data, error } = await supabaseHelper.delete('patients', id);

      if (error) {
        throw error;
      }

      return {
        data: { id },
        error: null,
        count: 1,
        status: 204,
        statusText: 'No Content'
      };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        count: null,
        status: error.status || 500,
        statusText: error.message || 'Internal Server Error'
      };
    }
  },
};

export default patientsApi;

// --- Considerations ---
// 1. Hook Integration: The main challenge is integrating React Query mutation hooks (`useCreate...`, `useUpdate...`)
//    into this static adapter object, as hooks need to run within a React component context.
// 2. Solution: The `CrudModal` component itself will likely need to:
//    - Accept the *hooks* themselves as props (e.g., `useCreateHook`, `useUpdateHook`).
//    - Instantiate these hooks internally.
//    - Call the `mutateAsync` functions returned by the hooks during submission.
// 3. Adapter Purpose: This `patientsApi` object might be more useful for non-mutation actions (`getById`, `getAll`)
//    or if the hooks were structured differently (e.g., returning static functions, though less common for mutations).
// 4. Refined Plan: Let's adjust the plan. The `CrudModal` will accept the mutation *hooks* directly,
//    and potentially a simpler `fetchById` function for loading data in edit mode. The `useCrud` hook
//    will still be used in the parent for list management.
