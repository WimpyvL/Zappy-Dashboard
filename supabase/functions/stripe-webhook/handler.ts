import Stripe from 'stripe';
import { createLogger } from './logger.ts';
import {
  DatabaseClient,
  StripeEvent,
  WebhookError,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  RECOVERY_STATUS,
  Refund,
  Dispute,
  SupportTicket
} from './types.ts';
import { STRIPE_CONFIG } from './config.ts';

interface HandlerContext {
  db: DatabaseClient;
  logger: ReturnType<typeof createLogger>;
  stripe: Stripe;
}

/**
 * Process a Stripe webhook event with retry logic
 */
export async function handleWebhookEvent(
  event: StripeEvent,
  context: HandlerContext
): Promise<void> {
  const { db, logger, stripe } = context;
  const { id: eventId, type, data } = event;

  logger.info(`Processing webhook event: ${type}`, { eventId });

  let currentRetryCount = 0; // Declare outside try block

  try {
    // Check if event already exists and is processed
    const { data: existingEvent, error: fetchError } = await db.client
      .from('stripe_events')
      .select('id, processed, retry_count')
      .eq('event_id', eventId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw db.createError('Failed to fetch existing event', fetchError);
    }

    if (existingEvent && existingEvent.processed) {
      logger.info(`Event already processed: ${type}`, { eventId });
      return;
    }

    // Insert or update event record
    if (!existingEvent) {
      await db.insertEvent(event);
    } else {
      currentRetryCount = existingEvent.retry_count + 1;
      const nextRetryAt = currentRetryCount <= STRIPE_CONFIG.MAX_PAYMENT_RETRIES ?
        new Date(Date.now() + STRIPE_CONFIG.RETRY_INTERVALS[currentRetryCount - 1] * 24 * 60 * 60 * 1000).toISOString() : null;

      await db.client
        .from('stripe_events')
        .update({
          processing_attempts: currentRetryCount,
          next_retry_at: nextRetryAt,
          updated_at: new Date().toISOString(),
        })
        .eq('event_id', eventId);
    }

    switch (type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(data.object as Stripe.PaymentIntent, context);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(data.object as Stripe.PaymentIntent, context);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(data.object as Stripe.Invoice, context);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(data.object as Stripe.Invoice, context);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data.object as Stripe.Subscription, context);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data.object as Stripe.Subscription, context);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(data.object as Stripe.Charge, context);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(data.object as Stripe.Dispute, context);
        break;

      case 'charge.dispute.updated':
        await handleChargeDisputeUpdated(data.object as Stripe.Dispute, context);
        break;

      case 'charge.dispute.closed':
        await handleChargeDisputeClosed(data.object as Stripe.Dispute, context);
        break;

      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(data.object as Stripe.Subscription, context);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(data.object as Stripe.PaymentIntent, context);
        break;

      case 'invoice.marked_uncollectible':
        await handleInvoiceMarkedUncollectible(data.object as Stripe.Invoice, context);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(data.object as Stripe.PaymentMethod, context);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(data.object as Stripe.PaymentMethod, context);
        break;


      default:
        logger.warn(`Unhandled event type: ${type}`);
    }

    // Mark event as processed on successful handling
    await db.client
      .from('stripe_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error_message: null, // Clear any previous errors on success
        error_context: null,
      })
      .eq('event_id', eventId);

  } catch (error) {
    logger.error('Error processing webhook event', {
      eventId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'N/A',
    });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorContext = error instanceof WebhookError ? error : { message: errorMessage };

    // Update event record with error information
    await db.client
      .from('stripe_events')
      .update({
        error_message: errorMessage,
        error_context: errorContext,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);

    // Implement error recovery logic
    if (currentRetryCount >= STRIPE_CONFIG.MAX_PAYMENT_RETRIES) {
        logger.error(`Max retries exceeded for event: ${type}`, { eventId, retryCount: currentRetryCount });
        // Create support ticket
        const supportTicket: SupportTicket = {
            payment_intent_id: (data.object as any).payment_intent || null,
            subscription_id: (data.object as any).subscription || null,
            issue_type: `Webhook processing failed for ${type}`,
            status: 'open',
            priority: 'high', // Or determine priority based on event type
        };
        try {
            await db.createSupportTicket(supportTicket);
            // TODO: Update stripe_events with support_ticket_id if db.createSupportTicket returns it
            logger.info('Support ticket created for failed event', { eventId });
        } catch (ticketError) {
            logger.error('Failed to create support ticket', { eventId, ticketError: ticketError instanceof Error ? ticketError.message : 'Unknown error' });
        }
    } else {
        logger.warn(`Retrying event: ${type}`, { eventId, retryCount: currentRetryCount });
    }


    // Re-throw the error to allow the webhook endpoint to handle retries if configured
    throw createWebhookError('Failed to process webhook event', error);
  }
}

async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing successful payment', { paymentIntentId: paymentIntent.id });

  if (!paymentIntent.invoice) {
    logger.warn('Payment intent has no associated invoice', { paymentIntentId: paymentIntent.id });
    return;
  }

  await db.updatePaymentStatus(paymentIntent.id, PAYMENT_STATUS.SUCCEEDED);
}

async function handlePaymentFailure(
  paymentIntent: Stripe.PaymentIntent,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.warn('Processing failed payment', {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message,
  });

  await db.updatePaymentStatus(paymentIntent.id, PAYMENT_STATUS.FAILED);
  // The createRecoveryAttempt is now handled within updatePaymentStatus in db.ts
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  { stripe, db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing paid invoice', { invoiceId: invoice.id });

  if (typeof invoice.payment_intent === 'string') {
    const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
    await handlePaymentSuccess(paymentIntent, { stripe, db, logger });
  } else if (invoice.payment_intent) {
    await handlePaymentSuccess(invoice.payment_intent, { stripe, db, logger });
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  { stripe, db, logger }: HandlerContext
): Promise<void> {
  logger.warn('Processing failed invoice payment', { invoiceId: invoice.id });

  if (typeof invoice.payment_intent === 'string') {
    const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
    await handlePaymentFailure(paymentIntent, { stripe, db, logger });
  } else if (invoice.payment_intent) {
    await handlePaymentFailure(invoice.payment_intent, { stripe, db, logger });
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing subscription update', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });

  await db.updateSubscriptionStatus(subscription.id, subscription.status);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing subscription deletion', { subscriptionId: subscription.id });

  await db.updateSubscriptionStatus(subscription.id, SUBSCRIPTION_STATUS.CANCELED);
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing charge refunded', { chargeId: charge.id, refundId: charge.refunds.data[0]?.id });
  const refund = charge.refunds.data[0];
  if (refund) {
    await db.insertRefund(refund as Refund);
    // TODO: Update related invoice/payment status if necessary
  }
}

async function handleChargeDisputeCreated(
  dispute: Stripe.Dispute,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.warn('Processing charge dispute created', { disputeId: dispute.id, paymentIntentId: dispute.payment_intent });
  await db.insertDispute(dispute as Dispute);
  // TODO: Potentially create a support ticket or notification
}

async function handleChargeDisputeUpdated(
  dispute: Stripe.Dispute,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing charge dispute updated', { disputeId: dispute.id, status: dispute.status });
  await db.updateDispute(dispute as Dispute);
  // TODO: Update support ticket or notification based on status change
}

async function handleChargeDisputeClosed(
  dispute: Stripe.Dispute,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing charge dispute closed', { disputeId: dispute.id, status: dispute.status });
  await db.updateDispute(dispute as Dispute);
  // TODO: Close related support ticket or notification
}

async function handleSubscriptionTrialWillEnd(
  subscription: Stripe.Subscription,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing subscription trial will end', { subscriptionId: subscription.id, trialEnd: subscription.trial_end });
  // TODO: Implement logic to notify user about trial ending
}

async function handlePaymentIntentRequiresAction(
  paymentIntent: Stripe.PaymentIntent,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.warn('Processing payment intent requires action', { paymentIntentId: paymentIntent.id, nextActionType: paymentIntent.next_action?.type });
  // TODO: Implement logic to notify user about required action (e.g., 3D Secure)
}

async function handleInvoiceMarkedUncollectible(
  invoice: Stripe.Invoice,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.warn('Processing invoice marked uncollectible', { invoiceId: invoice.id });
  // TODO: Implement logic to handle uncollectible invoices (e.g., update invoice status, notify user)
}

async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing payment method attached', { paymentMethodId: paymentMethod.id, customerId: paymentMethod.customer });
  // TODO: Implement logic to update customer's default payment method if necessary
}

async function handlePaymentMethodDetached(
  paymentMethod: Stripe.PaymentMethod,
  { db, logger }: HandlerContext
): Promise<void> {
  logger.info('Processing payment method detached', { paymentMethodId: paymentMethod.id, customerId: paymentMethod.customer });
  // TODO: Implement logic to handle detached payment methods (e.g., remove from user's profile)
}


function createWebhookError(message: string, cause: unknown): WebhookError {
  const webhookError = new Error(message) as WebhookError;
  webhookError.type = 'WebhookError';
  webhookError.code = cause instanceof Error ? cause.name : 'UNKNOWN_ERROR';
  webhookError.statusCode = 500;
  webhookError.detail = cause instanceof Error ? cause.message : 'Unknown error occurred';
  return webhookError;
}