import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DatabaseClient,
  StripeEvent,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  RECOVERY_STATUS,
  RecoveryAttempt,
  WebhookError,
  Refund,
  Dispute,
  SupportTicket
} from './types.ts';

export class SupabaseAdapter implements DatabaseClient {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey);
  }

  /**
   * Insert a webhook event into the database
   */
  async insertEvent(event: StripeEvent): Promise<void> {
    const { error } = await this.client
      .from('stripe_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        data: event.data,
        created: event.created,
        livemode: event.livemode,
        pending_webhooks: event.pending_webhooks,
        request_id: event.request?.id,
        idempotency_key: event.request?.idempotency_key,
      });

    if (error) {
      throw this.createError('Failed to insert event', error);
    }
  }

  /**
   * Update payment status in the database
   */
  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    const { error } = await this.client
      .from('patient_invoices')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentId);

    if (error) {
      throw this.createError('Failed to update payment status', error);
    }

    // If payment failed, create recovery attempt
    if (status === PAYMENT_STATUS.FAILED) {
      await this.createRecoveryAttempt(paymentId);
    }

    // If payment succeeded, update any recovery attempts
    if (status === PAYMENT_STATUS.SUCCEEDED) {
      await this.updateRecoveryAttempts(paymentId, RECOVERY_STATUS.SUCCESS);
    }
  }

  /**
   * Update subscription status in the database
   */
  async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    const { error } = await this.client
      .from('patient_subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === SUBSCRIPTION_STATUS.CANCELED && {
          cancelled_at: new Date().toISOString(),
        }),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      throw this.createError('Failed to update subscription status', error);
    }
  }

  /**
   * Create a payment recovery attempt
   */
  private async createRecoveryAttempt(paymentId: string): Promise<void> {
    // Get existing attempts
    const { data: attempts, error: fetchError } = await this.client
      .from('payment_recovery_attempts')
      .select('attempt_number')
      .eq('stripe_payment_intent_id', paymentId)
      .order('attempt_number', { ascending: false })
      .limit(1);

    if (fetchError) {
      throw this.createError('Failed to fetch recovery attempts', fetchError);
    }

    const attemptNumber = (attempts?.[0]?.attempt_number || 0) + 1;
    const nextAttemptDate = new Date();
    nextAttemptDate.setDate(nextAttemptDate.getDate() + [1, 3, 7][attemptNumber - 1] || 7);

    // Get payment details
    const { data: payment, error: paymentError } = await this.client
      .from('patient_invoices')
      .select('amount, subscription_id')
      .eq('stripe_payment_intent_id', paymentId)
      .single();

    if (paymentError) {
      throw this.createError('Failed to fetch payment details', paymentError);
    }

    // Create recovery attempt
    const { error: insertError } = await this.client
      .from('payment_recovery_attempts')
      .insert({
        stripe_payment_intent_id: paymentId,
        subscription_id: payment.subscription_id,
        attempt_number: attemptNumber,
        status: RECOVERY_STATUS.PENDING,
        amount: payment.amount,
        next_attempt_at: nextAttemptDate.toISOString(),
        recovery_strategy: 'exponential_backoff', // Default strategy
      });

    if (insertError) {
      throw this.createError('Failed to create recovery attempt', insertError);
    }
  }

  /**
   * Update the status of all recovery attempts for a payment
   */
  private async updateRecoveryAttempts(
    paymentId: string,
    status: string,
    errorType?: string
  ): Promise<void> {
    const { error } = await this.client
      .from('payment_recovery_attempts')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(errorType && { last_error_type: errorType }),
      })
      .eq('stripe_payment_intent_id', paymentId);

    if (error) {
      throw this.createError('Failed to update recovery attempts', error);
    }
  }

  /**
   * Insert a refund record
   */
  async insertRefund(refund: Refund): Promise<void> {
    const { error } = await this.client
      .from('stripe_refunds')
      .insert({
        stripe_refund_id: refund.id,
        payment_intent_id: refund.payment_intent,
        amount: refund.amount / 100, // Convert from cents
        status: refund.status,
        reason: refund.reason,
      });

    if (error) {
      throw this.createError('Failed to insert refund', error);
    }
  }

  /**
   * Insert a dispute record
   */
  async insertDispute(dispute: Dispute): Promise<void> {
    const { error } = await this.client
      .from('stripe_disputes')
      .insert({
        stripe_dispute_id: dispute.id,
        payment_intent_id: dispute.payment_intent,
        amount: dispute.amount / 100, // Convert from cents
        status: dispute.status,
        reason: dispute.reason,
        evidence: dispute.evidence,
        due_by: dispute.evidence_details?.due_by,
      });

    if (error) {
      throw this.createError('Failed to insert dispute', error);
    }
  }

  /**
   * Update a dispute record
   */
  async updateDispute(dispute: Dispute): Promise<void> {
    const { error } = await this.client
      .from('stripe_disputes')
      .update({
        status: dispute.status,
        evidence: dispute.evidence,
        due_by: dispute.evidence_details?.due_by,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_dispute_id', dispute.id);

    if (error) {
      throw this.createError('Failed to update dispute', error);
    }
  }

  /**
   * Create a support ticket
   */
  async createSupportTicket(ticket: SupportTicket): Promise<void> {
    const { error } = await this.client
      .from('payment_support_tickets')
      .insert({
        payment_intent_id: ticket.payment_intent_id,
        subscription_id: ticket.subscription_id,
        issue_type: ticket.issue_type,
        status: ticket.status,
        priority: ticket.priority,
      });

    if (error) {
      throw this.createError('Failed to create support ticket', error);
    }
  }

  /**
   * Create a standardized error object
   */
  private createError(message: string, error: any): WebhookError {
    const webhookError = new Error(message) as WebhookError;
    webhookError.type = 'DatabaseError';
    webhookError.detail = error.message;
    webhookError.code = error.code;
    webhookError.statusCode = error.statusCode || 500;
    return webhookError;
  }
}

// Export factory function
export function createDatabaseClient(url: string, serviceRoleKey: string): DatabaseClient {
  return new SupabaseAdapter(url, serviceRoleKey);
}