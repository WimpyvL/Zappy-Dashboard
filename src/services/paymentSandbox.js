/**
 * Payment sandbox for testing Stripe integration
 * This module provides mock implementations for testing payment flows
 * without making actual API calls to Stripe
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Test card numbers for different scenarios
 */
export const TEST_CARDS = {
  SUCCESS: {
    number: '4242424242424242',
    expMonth: 12,
    expYear: 2030,
    cvc: '123',
    zipCode: '12345',
    description: 'Successful payment'
  },
  DECLINED: {
    number: '4000000000000002',
    expMonth: 12,
    expYear: 2030,
    cvc: '123',
    zipCode: '12345',
    description: 'Declined payment'
  },
  INSUFFICIENT_FUNDS: {
    number: '4000000000009995',
    expMonth: 12,
    expYear: 2030,
    cvc: '123',
    zipCode: '12345',
    description: 'Insufficient funds'
  },
  EXPIRED_CARD: {
    number: '4000000000000069',
    expMonth: 12,
    expYear: 2030,
    cvc: '123',
    zipCode: '12345',
    description: 'Expired card'
  },
  PROCESSING_ERROR: {
    number: '4000000000000119',
    expMonth: 12,
    expYear: 2030,
    cvc: '123',
    zipCode: '12345',
    description: 'Processing error'
  },
  AUTHENTICATION_REQUIRED: {
    number: '4000002500003155',
    expMonth: 12,
    expYear: 2030,
    cvc: '123',
    zipCode: '12345',
    description: 'Authentication required (3D Secure)'
  }
};

/**
 * Valid discount codes for testing
 */
export const TEST_DISCOUNT_CODES = {
  'WELCOME10': { type: 'percentage', value: 10, description: '10% off your order' },
  'SAVE20': { type: 'percentage', value: 20, description: '20% off your order' },
  'FREESHIP': { type: 'shipping', value: 'free', description: 'Free shipping' },
  'REFERRAL15': { type: 'percentage', value: 15, description: '15% off with referral' }
};

/**
 * Sandbox API for testing payment flows
 */
export const paymentSandbox = {
  /**
   * Create a test checkout session
   * @param {Array} items - Cart items
   * @param {Object} customerInfo - Customer information
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Checkout session
   */
  createCheckoutSession: async (items, customerInfo, options = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a unique session ID
    const sessionId = `test_session_${uuidv4()}`;
    
    // Calculate total amount
    const amount = items.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
    
    // Apply discount if provided
    let discountedAmount = amount;
    let appliedDiscount = null;
    
    if (options.discountCode) {
      // Validate discount code
      const discount = TEST_DISCOUNT_CODES[options.discountCode.toUpperCase()];
      
      if (discount) {
        if (discount.type === 'percentage') {
          discountedAmount = amount * (1 - (discount.value / 100));
          appliedDiscount = {
            code: options.discountCode.toUpperCase(),
            description: discount.description,
            amount: amount - discountedAmount
          };
        } else if (discount.type === 'shipping') {
          appliedDiscount = {
            code: options.discountCode.toUpperCase(),
            description: discount.description,
            amount: options.shippingCost || 0
          };
        }
      }
    }
    
    return {
      sessionId,
      amount: discountedAmount.toFixed(2),
      originalAmount: amount.toFixed(2),
      currency: 'usd',
      discount: appliedDiscount,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price
      })),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      status: 'created'
    };
  },
  
  /**
   * Process a test payment
   * @param {string} sessionId - Checkout session ID
   * @param {Object} paymentDetails - Payment details
   * @returns {Promise<Object>} Payment result
   */
  processPayment: async (sessionId, paymentDetails) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simulate different payment outcomes based on the card number
    if (paymentDetails.cardNumber === TEST_CARDS.DECLINED.number) {
      throw {
        type: 'card_declined',
        message: 'Your card was declined.',
        code: 'card_declined'
      };
    }
    
    if (paymentDetails.cardNumber === TEST_CARDS.INSUFFICIENT_FUNDS.number) {
      throw {
        type: 'card_declined',
        message: 'Your card has insufficient funds.',
        code: 'insufficient_funds'
      };
    }
    
    if (paymentDetails.cardNumber === TEST_CARDS.EXPIRED_CARD.number) {
      throw {
        type: 'card_declined',
        message: 'Your card has expired.',
        code: 'expired_card'
      };
    }
    
    if (paymentDetails.cardNumber === TEST_CARDS.PROCESSING_ERROR.number) {
      throw {
        type: 'processing_error',
        message: 'An error occurred while processing your card.',
        code: 'processing_error'
      };
    }
    
    if (paymentDetails.cardNumber === TEST_CARDS.AUTHENTICATION_REQUIRED.number) {
      return {
        status: 'requires_action',
        paymentIntentId: `pi_${uuidv4()}`,
        clientSecret: `seti_${uuidv4()}_secret_${uuidv4()}`,
        nextAction: 'redirect_to_url',
        redirectUrl: '/sandbox/3d-secure-simulation'
      };
    }
    
    // Successful payment
    return {
      status: 'succeeded',
      paymentIntentId: `pi_${uuidv4()}`,
      paymentMethodId: paymentDetails.paymentMethodId || `pm_${uuidv4()}`,
      receiptUrl: '/sandbox/receipt',
      createdAt: new Date().toISOString()
    };
  },
  
  /**
   * Verify payment status
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<Object>} Payment status
   */
  verifyPaymentStatus: async (sessionId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Randomly determine if the payment succeeded (for testing recovery flows)
    const succeeded = Math.random() > 0.3;
    
    if (succeeded) {
      return {
        status: 'succeeded',
        paymentIntentId: `pi_${uuidv4()}`,
        paymentMethodId: `pm_${uuidv4()}`,
        receiptUrl: '/sandbox/receipt',
        createdAt: new Date().toISOString()
      };
    } else {
      throw {
        type: 'payment_intent_unexpected_state',
        message: 'The payment was not completed successfully.',
        code: 'payment_failed'
      };
    }
  },
  
  /**
   * Handle payment failure recovery
   * @param {string} sessionId - Failed session ID
   * @param {string} errorType - Error type
   * @returns {Promise<Object>} Recovery options
   */
  handlePaymentFailure: async (sessionId, errorType) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      recoveryUrl: '#',
      recoveryOptions: ['retry', 'new_payment_method'],
      newSessionId: `test_session_${uuidv4()}`
    };
  },
  
  /**
   * Validate a discount code
   * @param {string} code - Discount code
   * @param {number} amount - Order amount
   * @returns {Promise<Object>} Validation result
   */
  validateDiscountCode: async (code, amount) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Validate discount code
    const discount = TEST_DISCOUNT_CODES[code.toUpperCase()];
    
    if (!discount) {
      return { 
        valid: false, 
        message: 'Invalid discount code' 
      };
    }
    
    // Calculate discount amount
    let discountAmount = 0;
    
    if (discount.type === 'percentage') {
      discountAmount = amount * (discount.value / 100);
    } else if (discount.type === 'shipping') {
      discountAmount = 0; // Shipping is already free in our example
    }
    
    return {
      valid: true,
      code: code.toUpperCase(),
      description: discount.description,
      type: discount.type,
      value: discount.value,
      amount: discountAmount
    };
  },
  
  /**
   * Get available payment methods
   * @returns {Promise<Array>} Available payment methods
   */
  getAvailablePaymentMethods: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { id: 'pm_1', last4: '4242', brand: 'visa', expMonth: 12, expYear: 2028 },
      { id: 'pm_2', last4: '5555', brand: 'mastercard', expMonth: 10, expYear: 2026 }
    ];
  }
};

/**
 * Determine if we're in sandbox mode
 * @returns {boolean} True if in sandbox mode
 */
export const isSandboxMode = () => {
  return process.env.REACT_APP_PAYMENT_MODE === 'sandbox' || 
         process.env.NODE_ENV === 'development';
};

/**
 * Get the appropriate payment service
 * @returns {Object} Payment service
 */
export const getPaymentService = () => {
  if (isSandboxMode()) {
    return paymentSandbox;
  }
  
  // In production, use the real payment service
  // This will be replaced with the actual implementation when the API is available
  return paymentSandbox; // Temporarily use sandbox even in production
};

export default paymentSandbox;
