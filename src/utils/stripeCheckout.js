// utils/stripeCheckout.js

/**
 * Redirects to Stripe Checkout page to start a new subscription.
 *
 * @param {string} patientId - The ID of the patient
 * @param {string} stripeSubscriptionPriceId - The Stripe Price ID for the subscription plan/dose.
 * @returns {Promise<boolean>} - Promise that resolves after redirect is initiated
 */
export const redirectToCheckout = async (patientId, stripeSubscriptionPriceId) => {
  try {
    // Call your backend to create a Checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
       body: JSON.stringify({
         mode: 'subscription', // Explicitly set mode
         patientId,
         priceId: stripeSubscriptionPriceId // Send the Price ID
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = url;

    return true;
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

/**
 * Redirects to Stripe Checkout page for a one-time payment
 *
 * @param {Array<object>} cartItems - Array of items in the cart
 * @param {string} cartItems[].productId - ID of the product
 * @param {string} cartItems[].doseId - ID of the specific dose
 * @param {number} cartItems[].price - Price of the dose
 * @param {number} cartItems[].quantity - Quantity of the dose
 * @param {string} [patientId] - Optional ID of the patient making the purchase
 * @returns {Promise<boolean>} - Promise that resolves after redirect is initiated
 */
export const redirectToPaymentCheckout = async (
  cartItems,
  patientId = null
) => {
  try {
    // Prepare line items for the backend
     // The backend will need to translate these into Stripe's line_items format
     // Now sending the stripePriceId (for one-time purchase) instead of raw price
     const lineItems = cartItems.map(item => ({
       priceId: item.stripePriceId, // Send the one-time purchase Price ID
       quantity: item.quantity,
       // Optionally keep internal IDs for backend reference if needed
       productId: item.productId,
       doseId: item.doseId,
       name: `${item.productName} ${item.doseValue}` // Keep name for display on Stripe page
     }));

    // Call your backend to create a Checkout session in payment mode
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'payment', // Specify one-time payment mode
        lineItems: lineItems,
        patientId: patientId, // Include patientId if available
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(
        errorData.message || 'Failed to create payment checkout session'
      );
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = url;

    return true;
  } catch (error) {
    console.error('Error redirecting to payment checkout:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

/**
 * Handles the return from Stripe Checkout
 *
 * @param {string} sessionId - The Stripe checkout session ID
 * @returns {Promise<object>} - Promise that resolves with checkout session details
 */
export const handleCheckoutReturn = async (sessionId) => {
  try {
    // Fetch session details from your backend
    const response = await fetch(`/api/checkout-sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error handling checkout return:', error);
    throw error;
  }
};

/**
 * Redirects the user to the Stripe Customer Portal.
 * Assumes a backend endpoint exists to create the portal session.
 *
 * @param {string} patientId - The ID of the patient (used by backend to find Stripe Customer ID)
 * @returns {Promise<boolean>} - Promise that resolves after redirect is initiated
 */
export const redirectToCustomerPortal = async (patientId) => {
  try {
    // Call your backend to create a Customer Portal session
    const response = await fetch('/api/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId }), // Send patientId to backend
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || 'Failed to create customer portal session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Customer Portal
    window.location.href = url;

    return true;
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

/**
 * Creates a subscription without redirecting to Stripe
 * This is useful for backend operations or when you already have a payment method
 *
 * @param {string} patientId - The ID of the patient
 * @param {string} paymentMethodId - The ID of the payment method to use
 * @param {string} stripeSubscriptionPriceId - The Stripe Price ID for the subscription plan/dose.
 * @returns {Promise<object>} - Promise that resolves with subscription details
 */
 export const createSubscription = async (patientId, paymentMethodId, stripeSubscriptionPriceId) => {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId,
        paymentMethodId,
        priceId: stripeSubscriptionPriceId // Send the Price ID
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Updates an existing subscription
 *
 * @param {string} subscriptionId - The ID of the subscription to update
 * @param {object} updateData - The data to update
 * @returns {Promise<object>} - Promise that resolves with updated subscription details
 */
export const updateSubscription = async (subscriptionId, updateData) => {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

/**
 * Cancels an existing subscription
 *
 * @param {string} subscriptionId - The ID of the subscription to cancel
 * @param {boolean} cancelImmediately - Whether to cancel immediately or at period end
 * @returns {Promise<object>} - Promise that resolves with cancelled subscription details
 */
export const cancelSubscription = async (
  subscriptionId,
  cancelImmediately = false
) => {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelImmediately,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};
