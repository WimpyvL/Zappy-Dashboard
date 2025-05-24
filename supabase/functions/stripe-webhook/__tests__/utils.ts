// External dependencies
import type { Stripe } from "https://esm.sh/stripe@13.4.0";

// Core type imports
import type {
  DatabaseClient,
  StripeEvent,
  WebhookEventType,
  Refund,
  Dispute,
  SupportTicket,
} from "../types.ts";

/**
 * Extended database interface for testing purposes.
 * Combines the core DatabaseClient interface with additional methods
 * for test verification and state inspection.
 */
export interface MockDatabase {
  // Internal storage
  readonly events: Map<string, StripeEvent>;
  readonly paymentStatuses: Map<string, string>;
  readonly subscriptionStatuses: Map<string, string>;
  readonly refunds: Map<string, Refund>;
  readonly disputes: Map<string, Dispute>;
  readonly supportTickets: Map<string, SupportTicket>;

  /** Core DatabaseClient methods */
  insertEvent(event: StripeEvent): Promise<void>;
  updatePaymentStatus(paymentId: string, status: string): Promise<void>;
  updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void>;
  insertRefund(refund: Refund): Promise<void>;
  insertDispute(dispute: Dispute): Promise<void>;
  updateDispute(dispute: Dispute): Promise<void>;
  createSupportTicket(ticket: SupportTicket): Promise<string>;

  /** Test helper methods for state inspection */
  getEvents(): Map<string, StripeEvent>;
  getPaymentStatuses(): Map<string, string>;
  getSubscriptionStatuses(): Map<string, string>;
  getRefunds(): Map<string, Refund>;
  getDisputes(): Map<string, Dispute>;
  getSupportTickets(): Map<string, SupportTicket>;
}

/**
 * Creates a mock Stripe client for testing
 * Contains minimal implementation of required methods
 * @returns A mock Stripe client instance
 */
export function createMockStripe(): Stripe {
  return {
    paymentIntents: {
      retrieve: async (id: string) => ({
        id,
        status: 'succeeded',
      }),
    },
    refunds: {
      create: async (params: Stripe.RefundCreateParams) => ({
        id: `re_${Math.random().toString(36).slice(2)}`,
        amount: params.amount,
        charge: params.charge,
        status: 'succeeded',
      }),
    },
    customers: {
      update: async (id: string, params: Stripe.CustomerUpdateParams) => ({
        id,
        ...params,
      }),
    },
  } as unknown as Stripe;
}

/**
 * Creates a mock database client for testing
 * Implements both DatabaseClient interface and test helper methods
 * @returns A mock database client that can be used to verify test outcomes
 */
export function createMockDb(): DatabaseClient & MockDatabase {
  const events = new Map<string, StripeEvent>();
  const paymentStatuses = new Map<string, string>();
  const subscriptionStatuses = new Map<string, string>();
  const refunds = new Map<string, Refund>();
  const disputes = new Map<string, Dispute>();
  const supportTickets = new Map<string, SupportTicket>();

  return {
    events,
    paymentStatuses,
    subscriptionStatuses,
    refunds,
    disputes,
    supportTickets,
    
    insertEvent: async (event: StripeEvent) => {
      events.set(event.id, event);
    },
    updatePaymentStatus: async (paymentId: string, status: string) => {
      paymentStatuses.set(paymentId, status);
    },
    updateSubscriptionStatus: async (subscriptionId: string, status: string) => {
      subscriptionStatuses.set(subscriptionId, status);
    },
    insertRefund: async (refund: Refund) => {
      refunds.set(refund.id, refund);
    },
    insertDispute: async (dispute: Dispute) => {
      disputes.set(dispute.id, dispute);
    },
    updateDispute: async (dispute: Dispute) => {
      disputes.set(dispute.id, dispute);
    },
    createSupportTicket: async (ticket: SupportTicket) => {
      const id = `st_${Math.random().toString(36).slice(2)}`;
      supportTickets.set(id, { ...ticket, id });
      return id;
    },

    getEvents: () => events,
    getPaymentStatuses: () => paymentStatuses,
    getSubscriptionStatuses: () => subscriptionStatuses,
    getRefunds: () => refunds,
    getDisputes: () => disputes,
    getSupportTickets: () => supportTickets,
  };
}

/**
 * Creates a mock Stripe webhook event for testing
 * @param type - The type of webhook event to create
 * @param data - The data object to include in the event
 * @returns A mock Stripe event with the specified type and data
 */
export function createMockEvent(
  type: WebhookEventType,
  data: Record<string, unknown>
): StripeEvent {
  return {
    id: `evt_${Math.random().toString(36).slice(2)}`,
    type,
    data: { object: data },
    created: Date.now(),
    livemode: false,
    pending_webhooks: 0,
  };
}