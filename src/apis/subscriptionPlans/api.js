// API endpoint definitions for subscriptionPlans
import apiClient from '../apiClient';

/**
 * Fetch a subscription plan by its ID.
 * @param {string|number} id - The subscription plan ID
 * @returns {Promise<Object>} Subscription plan object
 */
export async function getSubscriptionPlanById(id) {
  try {
    const response = await apiClient.get(`/subscription-plans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    throw error;
  }
}

/**
 * List all available subscription plans
 * @param {Object} filters - Optional filters for the plans
 * @returns {Promise<Array>} List of subscription plans
 */
export async function listSubscriptionPlans(filters = {}) {
  try {
    const response = await apiClient.get('/subscription-plans', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error listing subscription plans:', error);
    throw error;
  }
}

/**
 * Create a Stripe checkout session for subscription
 * @param {Object} params - Parameters for checkout session
 * @returns {Promise<Object>} Checkout session details
 */
export async function createCheckoutSession(params) {
  try {
    const response = await apiClient.post('/checkout/create-session', params);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Verify payment status
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Payment status
 */
export async function verifyPaymentStatus(sessionId) {
  try {
    const response = await apiClient.get(`/checkout/verify/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Create a subscription for a patient
 * @param {string} patientId - The patient ID
 * @param {string} planId - The subscription plan ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created subscription
 */
export async function createSubscription(patientId, planId, options = {}) {
  try {
    const response = await apiClient.post('/subscriptions', {
      patientId,
      planId,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Update an existing subscription
 * @param {string} subscriptionId - The subscription ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} Updated subscription
 */
export async function updateSubscription(subscriptionId, updates) {
  try {
    const response = await apiClient.put(`/subscriptions/${subscriptionId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * @param {string} subscriptionId - The subscription ID
 * @param {Object} options - Cancellation options
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelSubscription(subscriptionId, options = {}) {
  try {
    const response = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`, options);
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Apply a discount code to a checkout session
 * @param {string} sessionId - The checkout session ID
 * @param {string} discountCode - The discount code to apply
 * @returns {Promise<Object>} Updated session with discount
 */
export async function applyDiscountCode(sessionId, discountCode) {
  try {
    const response = await apiClient.post(`/checkout/${sessionId}/discount`, {
      code: discountCode
    });
    return response.data;
  } catch (error) {
    console.error('Error applying discount code:', error);
    throw error;
  }
}

/**
 * Validate a discount code
 * @param {string} code - The discount code to validate
 * @param {number} amount - The order amount
 * @returns {Promise<Object>} Validation result
 */
export async function validateDiscountCode(code, amount) {
  try {
    const response = await apiClient.post('/discounts/validate', {
      code,
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error validating discount code:', error);
    throw error;
  }
}

/**
 * Handle payment failure recovery
 * @param {string} sessionId - The failed session ID
 * @param {string} errorType - The type of error that occurred
 * @returns {Promise<Object>} Recovery options
 */
export async function handlePaymentFailure(sessionId, errorType) {
  try {
    const response = await apiClient.post(`/checkout/${sessionId}/recover`, {
      errorType
    });
    return response.data;
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

const subscriptionPlansApi = {
  getSubscriptionPlanById,
  listSubscriptionPlans,
  createCheckoutSession,
  verifyPaymentStatus,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  applyDiscountCode,
  validateDiscountCode,
  handlePaymentFailure
};

export default subscriptionPlansApi;
