/**
 * Shared types for the Stripe webhook handler
 */

import type { Stripe } from 'stripe';
import type { Logger } from './logger.ts';

export interface PaymentIntent {
  id: string;
  invoice?: string;
  customer?: string;
  metadata: {
    subscription_id?: string;
  };
  amount: number;
  last_payment_error?: {
    message: string;
  };
  status: PaymentIntentStatus;
}

export interface StripeEvent {
  id: string;
  type: WebhookEventType;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key?: string;
  };
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export type WebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.requires_action'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'invoice.marked_uncollectible'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'charge.refunded'
  | 'charge.dispute.created'
  | 'charge.dispute.updated'
  | 'charge.dispute.closed'
  | 'payment_method.attached'
  | 'payment_method.detached';

export interface Refund {
  id: string;
  amount: number;
  charge: string;
  status: 'succeeded' | 'failed' | 'pending' | 'canceled';
  created: number;
  metadata?: Record<string, string>;
}

export interface Dispute {
  id: string;
  payment_intent?: string;
  charge?: string;
  amount: number;
  status: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'won' | 'lost';
  created: number;
  evidence?: Record<string, unknown>;
}

export interface SupportTicket {
  id?: string;
  payment_intent_id?: string | null;
  subscription_id?: string | null;
  issue_type: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseClient {
  insertEvent(event: StripeEvent): Promise<void>;
  updatePaymentStatus(paymentId: string, status: string): Promise<void>;
  updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void>;
  insertRefund(refund: Refund): Promise<void>;
  insertDispute(dispute: Dispute): Promise<void>;
  updateDispute(dispute: Dispute): Promise<void>;
  createSupportTicket(ticket: SupportTicket): Promise<string>;
}

export interface HandlerContext {
  db: DatabaseClient;
  stripe: Stripe;
  logger: Logger;
}

export interface WebhookHandlerConfig {
  db: DatabaseClient;
  webhookSecret: string;
}

export type WebhookHandlerResult = {
  success: boolean;
  message?: string;
  error?: Error;
};

export interface RecoveryAttempt {
  id: string;
  stripe_payment_intent_id: string;
  subscription_id: string;
  attempt_number: number;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  amount: number;
  next_attempt_at: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookError extends Error {
  type: string;
  code?: string;
  param?: string;
  docUrl?: string;
  detail?: string;
  statusCode?: number;
  requestId?: string;
}

// Constants
export const PAYMENT_STATUS = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  PROCESSING: 'processing',
  PENDING: 'pending',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  PAUSED: 'paused',
} as const;

export const RECOVERY_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;