# Payment System Implementation

This document outlines the implementation of the payment system in the Telehealth application, focusing on the Stripe integration for checkout processes.

## Overview

The payment system is designed to handle subscription and one-time payments through Stripe Checkout. It includes:

1. Payment processing with Stripe
2. Discount code application
3. Error handling and recovery
4. Sandbox mode for testing

## Architecture

The payment system consists of the following components:

### Services

- **paymentService.js**: Main service that handles payment operations
- **paymentSandbox.js**: Sandbox implementation for testing without real API calls
- **subscriptionPlans/api.js**: API endpoints for subscription plans and checkout

### Components

- **PaymentMethodSelector**: UI component for selecting payment methods
- **DiscountCodeInput**: UI component for applying discount codes
- **PaymentErrorRecovery**: UI component for handling payment errors

### Hooks

- **usePaymentErrorHandler**: Hook for handling payment errors and recovery

## Stripe Integration

The application uses Stripe Checkout for payment processing. In production, it will redirect users to Stripe's hosted checkout page. In development, it uses a sandbox implementation to simulate the payment flow.

### Implementation Details

1. **Checkout Session Creation**:
   - When a user initiates checkout, a session is created with Stripe
   - The session includes product details, pricing, and customer information
   - Discount codes can be applied at this stage

2. **Payment Processing**:
   - After the user completes payment on Stripe's checkout page, they are redirected back to the application
   - The application verifies the payment status with Stripe
   - On successful payment, the order is processed

3. **Error Handling**:
   - Various payment errors are handled (card declined, insufficient funds, etc.)
   - Recovery options are provided based on the error type
   - Users can retry payment or choose a different payment method

## Testing with Sandbox Mode

The application includes a sandbox mode for testing payment flows without making real API calls to Stripe.

### Enabling Sandbox Mode

Sandbox mode is automatically enabled in development environments. You can also explicitly enable it by setting the environment variable:

```
REACT_APP_PAYMENT_MODE=sandbox
```

### Test Cards

The sandbox includes test cards for simulating different payment scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4242424242424242 | Successful payment |
| 4000000000000002 | Card declined |
| 4000000000009995 | Insufficient funds |
| 4000000000000069 | Expired card |
| 4000000000000119 | Processing error |
| 4000002500003155 | Authentication required (3D Secure) |

### Test Discount Codes

The following discount codes can be used for testing:

| Code | Description |
|------|-------------|
| WELCOME10 | 10% off your order |
| SAVE20 | 20% off your order |
| FREESHIP | Free shipping |
| REFERRAL15 | 15% off with referral |

## Implementation TODOs

The current implementation includes some TODOs that need to be addressed:

1. ✅ Complete Stripe integration in `subscriptionPlans/api.js`
2. ✅ Add robust error recovery for payment failures
3. ✅ Set up API sandbox for testing Stripe integration
4. ✅ Add discount code functionality
5. ✅ Review and test order summary calculations

## Future Enhancements

Potential future enhancements to the payment system:

1. Add support for saved payment methods
2. Implement subscription management (pause, cancel, upgrade)
3. Add support for alternative payment methods through Stripe
4. Implement automatic retries for failed payments
5. Add analytics for payment conversion rates

## Testing Guidelines

When testing the payment system:

1. Use sandbox mode to test different payment scenarios
2. Test error handling by using the test cards that trigger specific errors
3. Verify that discount codes are applied correctly
4. Test the checkout flow end-to-end, from cart to order confirmation
5. Verify that order calculations are correct, including discounts and taxes

## API Reference

### Payment Service

```javascript
// Create a checkout session
paymentService.createCheckoutSession(cartItems, customerInfo, options);

// Process a payment
paymentService.processPayment(sessionId, paymentDetails);

// Verify payment status
paymentService.verifyPaymentStatus(sessionId);

// Handle payment failure
paymentService.handlePaymentFailure(sessionId, errorType);

// Validate discount code
paymentService.validateDiscountCode(code, amount);

// Get available payment methods
paymentService.getAvailablePaymentMethods();
```

### Subscription Plans API

```javascript
// Create a checkout session for subscription
subscriptionPlansApi.createCheckoutSession(params);

// Verify payment status
subscriptionPlansApi.verifyPaymentStatus(sessionId);

// Create a subscription
subscriptionPlansApi.createSubscription(patientId, planId, options);

// Update a subscription
subscriptionPlansApi.updateSubscription(subscriptionId, updates);

// Cancel a subscription
subscriptionPlansApi.cancelSubscription(subscriptionId, options);

// Apply a discount code
subscriptionPlansApi.applyDiscountCode(sessionId, discountCode);

// Validate a discount code
subscriptionPlansApi.validateDiscountCode(code, amount);

// Handle payment failure
subscriptionPlansApi.handlePaymentFailure(sessionId, errorType);
