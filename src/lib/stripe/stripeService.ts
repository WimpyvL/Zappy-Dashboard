import Stripe from 'stripe';
import { supabase } from '../supabase';
import { STRIPE_CONFIG, WEBHOOK_EVENTS, RECOVERY_STATUS } from './config';
import type { WebhookEventType, RecoveryStatusType } from './config';

// Initialize Stripe
const stripe = new Stripe(STRIPE_CONFIG.API_KEY!, {
  apiVersion: '2023-10-16', // Use latest stable API version
  typescript: true
});

export class StripeService {
  /**
   * Create or retrieve a Stripe customer for a patient
   */
  async getOrCreateCustomer(patientId: string, email: string): Promise<string> {
    // Check if patient already has a Stripe customer ID
    const { data: subscription } = await supabase
      .from('patient_subscriptions')
      .select('stripe_customer_id')
      .eq('patient_id', patientId)
      .single();

    if (subscription?.stripe_customer_id) {
      return subscription.stripe_customer_id;
    }

    // Create new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      metadata: {
        patientId
      }
    });

    return customer.id;
  }

  /**
   * Create a Checkout Session for subscription purchase
   */
  async createCheckoutSession({
    customerId,
    priceId,
    successUrl = STRIPE_CONFIG.SUCCESS_URL,
    cancelUrl = STRIPE_CONFIG.CANCEL_URL
  }: {
    customerId: string;
    priceId: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: STRIPE_CONFIG.PAYMENT_METHODS,
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return session.url!;
  }

  /**
   * Create a Customer Portal session
   */
  async createCustomerPortalSession(customerId: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: STRIPE_CONFIG.CUSTOMER_PORTAL.RETURN_URL,
      configuration: {
        features: STRIPE_CONFIG.CUSTOMER_PORTAL.FEATURES
      }
    });

    return session.url;
  }

  /**
   * Handle a webhook event
   */
  async handleWebhookEvent(
    eventId: string,
    eventType: WebhookEventType,
    data: any
  ): Promise<void> {
    // Record the event
    const { error: insertError } = await supabase
      .from('stripe_events')
      .insert({
        event_id: eventId,
        event_type: eventType,
        data: data
      });

    if (insertError) {
      console.error('Error recording webhook event:', insertError);
      return;
    }

    // Handle different event types
    switch (eventType) {
      case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await this.handlePaymentSuccess(data.object);
        break;

      case WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
        await this.handlePaymentFailure(data.object);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await this.handleInvoicePaymentFailure(data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await this.handleSubscriptionUpdate(data.object);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Mark event as processed
    await supabase
      .from('stripe_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('event_id', eventId);
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { customer, invoice } = paymentIntent;
    if (!customer || !invoice) return;

    // Update invoice status
    await supabase
      .from('patient_invoices')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('stripe_invoice_id', invoice);

    // Clear any recovery attempts
    await supabase
      .from('payment_recovery_attempts')
      .update({
        status: RECOVERY_STATUS.SUCCESS,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);
  }

  /**
   * Handle payment failure
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Update invoice status
    if (paymentIntent.invoice) {
      await supabase
        .from('patient_invoices')
        .update({
          status: 'failed',
          stripe_payment_intent_id: paymentIntent.id
        })
        .eq('stripe_invoice_id', paymentIntent.invoice);
    }

    // Create recovery attempt if needed
    const { data: existingAttempts } = await supabase
      .from('payment_recovery_attempts')
      .select('attempt_number')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .order('attempt_number', { ascending: false })
      .limit(1);

    const attemptNumber = (existingAttempts?.[0]?.attempt_number || 0) + 1;

    if (attemptNumber <= STRIPE_CONFIG.MAX_PAYMENT_RETRIES) {
      const nextAttemptDays = STRIPE_CONFIG.RETRY_INTERVALS[attemptNumber - 1];
      const nextAttemptDate = new Date();
      nextAttemptDate.setDate(nextAttemptDate.getDate() + nextAttemptDays);

      await supabase
        .from('payment_recovery_attempts')
        .insert({
          stripe_payment_intent_id: paymentIntent.id,
          subscription_id: paymentIntent.metadata.subscription_id,
          attempt_number: attemptNumber,
          status: RECOVERY_STATUS.PENDING,
          amount: paymentIntent.amount / 100, // Convert from cents to dollars
          next_attempt_at: nextAttemptDate.toISOString(),
          error_message: paymentIntent.last_payment_error?.message
        });
    }
  }

  /**
   * Handle invoice payment failure
   */
  private async handleInvoicePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
    await this.handlePaymentFailure(invoice.payment_intent as Stripe.PaymentIntent);
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const { customer, id: stripeSubscriptionId, status } = subscription;

    // Update subscription status
    await supabase
      .from('patient_subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customer)
      .eq('stripe_subscription_id', stripeSubscriptionId);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_CONFIG.WEBHOOK_SECRET!
      );
      return true;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return false;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();