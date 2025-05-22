import apiClient from '../apiClient';

/**
 * Fetch all recommendation rules
 * @returns {Promise<Array>} Array of recommendation rules
 */
export const fetchRecommendationRules = async () => {
  const response = await apiClient.get('/api/product-recommendation-rules');
  return response.data;
};

/**
 * Create a new recommendation rule
 * @param {Object} rule - The rule to create
 * @returns {Promise<Object>} The created rule
 */
export const createRecommendationRule = async (rule) => {
  const response = await apiClient.post('/api/product-recommendation-rules', rule);
  return response.data;
};

/**
 * Update an existing recommendation rule
 * @param {Object} rule - The rule to update
 * @returns {Promise<Object>} The updated rule
 */
export const updateRecommendationRule = async (rule) => {
  const response = await apiClient.put(`/api/product-recommendation-rules/${rule.id}`, rule);
  return response.data;
};

/**
 * Delete a recommendation rule
 * @param {string} id - The ID of the rule to delete
 * @returns {Promise<void>}
 */
export const deleteRecommendationRule = async (id) => {
  await apiClient.delete(`/api/product-recommendation-rules/${id}`);
};
