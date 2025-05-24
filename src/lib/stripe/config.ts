export const STRIPE_CONFIG = {
  // Number of automatic payment retry attempts before escalating to support
  MAX_PAYMENT_RETRIES: 3,
  
  // Retry intervals in days
  RETRY_INTERVALS: [1, 3, 7],
  
  // Webhook signing secret (to be set from environment variable)
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Stripe API key (to be set from environment variable)
  API_KEY: process.env.STRIPE_SECRET_KEY,
  
  // Public key for frontend Stripe Elements (to be set from environment variable)
  PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  
  // Customer portal configuration
  CUSTOMER_PORTAL: {
    // Return URL after exiting the customer portal
    RETURN_URL: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
    
    // Allowed features in customer portal
    FEATURES: {
      payment_methods: {
        enabled: true
      },
      billing_history: {
        enabled: true
      },
      subscription_cancel: {
        enabled: false
      },
      subscription_pause: {
        enabled: false
      }
    }
  },
  
  // Payment method types to accept
  PAYMENT_METHODS: ['card'],
  
  // Currency to use for payments
  CURRENCY: 'usd',
  
  // URL for handling successful payments
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  
  // URL for handling cancelled payments
  CANCEL_URL: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
};

// Webhook event types we want to handle
export const WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted'
} as const;

// Payment recovery status types
export const RECOVERY_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const;

// Export types
export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];
export type RecoveryStatusType = typeof RECOVERY_STATUS[keyof typeof RECOVERY_STATUS];