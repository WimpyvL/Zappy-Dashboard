import { apiClient } from '../apis/apiClient';
import { paymentSandbox, isSandboxMode } from './paymentSandbox';

/**
 * Payment service for handling Stripe payment integration
 * Uses sandbox in development mode and real API in production
 */
export const paymentService = isSandboxMode() ? paymentSandbox : {
  /**
   * Create a checkout session for processing payment
   * @param {Array} cartItems - Array of items in the cart
   * @param {Object} customerInfo - Customer information including payment method
   * @param {Object} options - Additional options like discount codes
   * @returns {Promise<Object>} Checkout session details
   */
  createCheckoutSession: async (cartItems, customerInfo, options = {}) => {
    try {
      // This will call the API endpoint when available
      // For now, return a structured mock response
      
      // Calculate total amount
      const subtotal = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      
      // Apply discount if provided
      let total = subtotal;
      let appliedDiscount = null;
      
      if (options.discountCode) {
        // In the real implementation, this would validate the discount code with the API
        // For now, simulate a 10% discount
        const discountAmount = subtotal * 0.1;
        total = subtotal - discountAmount;
        
        appliedDiscount = {
          code: options.discountCode,
          description: '10% off',
          amount: discountAmount
        };
      }
      
      return {
        sessionId: 'mock_session_id_' + Date.now(),
        url: '#', // Stripe will provide a checkout URL
        status: 'created',
        amount: total,
        currency: 'usd',
        discount: appliedDiscount,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
  
  /**
   * Process a payment with the selected payment method
   * @param {string} sessionId - The checkout session ID
   * @param {Object} paymentDetails - Payment details including method
   * @returns {Promise<Object>} Payment result
   */
  processPayment: async (sessionId, paymentDetails) => {
    try {
      // This will call the API endpoint when available
      // For now, return a structured mock response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would process the payment through Stripe
      return {
        status: 'succeeded',
        paymentIntentId: 'mock_payment_intent_' + Date.now(),
        paymentMethodId: paymentDetails.paymentMethodId,
        receiptUrl: '#',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
  
  /**
   * Verify the status of a payment
   * @param {string} sessionId - The checkout session ID
   * @returns {Promise<Object>} Payment status
   */
  verifyPaymentStatus: async (sessionId) => {
    try {
      // This will call the API endpoint when available
      // For now, return a structured mock response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        status: 'succeeded',
        paymentIntentId: 'mock_payment_intent_id',
        paymentMethodId: 'mock_payment_method_id',
        receiptUrl: '#',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verifying payment status:', error);
      throw error;
    }
  },
  
  /**
   * Handle payment failure recovery
   * @param {string} sessionId - The checkout session ID
   * @param {string} errorType - The type of error that occurred
   * @returns {Promise<Object>} Recovery options
   */
  handlePaymentFailure: async (sessionId, errorType) => {
    try {
      // This will call the API endpoint when available
      // For now, return a structured mock response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        recoveryUrl: '#',
        recoveryOptions: ['retry', 'new_payment_method'],
        newSessionId: 'mock_session_id_' + Date.now()
      };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  },
  
  /**
   * Validate a discount or referral code
   * @param {string} code - The discount or referral code
   * @param {number} amount - The order amount before discount
   * @returns {Promise<Object>} Validation result
   */
  validateDiscountCode: async (code, amount) => {
    try {
      // This will call the API endpoint when available
      // For now, return a structured mock response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock discount validation
      const validDiscounts = {
        'WELCOME10': { valid: true, type: 'percentage', value: 10, description: '10% off your order' },
        'SAVE20': { valid: true, type: 'percentage', value: 20, description: '20% off your order' },
        'FREESHIP': { valid: true, type: 'shipping', value: 'free', description: 'Free shipping' },
        'REFERRAL15': { valid: true, type: 'percentage', value: 15, description: '15% off with referral' }
      };
      
      const discount = validDiscounts[code.toUpperCase()];
      
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
    } catch (error) {
      console.error('Error validating discount code:', error);
      throw error;
    }
  },
  
  /**
   * Get available payment methods for the current user
   * @returns {Promise<Array>} Available payment methods
   */
  getAvailablePaymentMethods: async () => {
    try {
      // This will call the API endpoint when available
      // For now, return structured mock data
      
      return [
        { id: 'pm_1', last4: '4242', brand: 'visa', expMonth: 12, expYear: 2028 },
        { id: 'pm_2', last4: '5555', brand: 'mastercard', expMonth: 10, expYear: 2026 },
      ];
    } catch (error) {
      console.error('Error getting available payment methods:', error);
      throw error;
    }
  }
};

export default paymentService;
