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
 * Extended database interface for testing that combines the core DatabaseClient
 * interface with additional test helper methods. This allows us to both interact
 * with the database through its standard interface while also providing ways to
 * inspect the state for test assertions.
 * 
 * @interface MockDatabase
 * @extends {DatabaseClient}
 */
export interface MockDatabase extends DatabaseClient {
  /** Storage map for processed webhook events, keyed by event ID */
  readonly events: Map<string, StripeEvent>;
  
  /** Storage map for payment status updates, keyed by payment intent ID */
  readonly paymentStatuses: Map<string, string>;
  
  /** Storage map for subscription status changes, keyed by subscription ID */
  readonly subscriptionStatuses: Map<string, string>;
  
  /** Storage map for processed refunds, keyed by refund ID */
  readonly refunds: Map<string, Refund>;
  
  /** Storage map for handled disputes, keyed by dispute ID */
  readonly disputes: Map<string, Dispute>;
  
  /** Storage map for created support tickets, keyed by ticket ID */
  readonly supportTickets: Map<string, SupportTicket>;

  // Core DatabaseClient methods are inherited

  /** Methods for inspecting mock database state during tests */
  /** Returns the stored webhook events for test assertions */
  getEvents(): Map<string, StripeEvent>;
  
  /** Retrieves the current payment status map for test assertions */
  getPaymentStatuses(): Map<string, string>;
  
  /** Retrieves the current subscription status map for test assertions */
  getSubscriptionStatuses(): Map<string, string>;
  
  /** Retrieves all processed refunds for test assertions */
  getRefunds(): Map<string, Refund>;
  
  /** Retrieves all handled disputes for test assertions */
  getDisputes(): Map<string, Dispute>;
  
  /** Retrieves all created support tickets for test assertions */
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
 * @example
 * ```ts
 * const mockDb = createMockDb();
 * await mockDb.insertEvent(event);
 * const events = mockDb.getEvents();
 * assertEquals(events.has(event.id), true);
 * ```
 */
export function createMockDb(): DatabaseClient & MockDatabase {
  // Initialize storage maps for each data type
  const events = new Map<string, StripeEvent>();
  const paymentStatuses = new Map<string, string>();
  const subscriptionStatuses = new Map<string, string>();
  const refunds = new Map<string, Refund>();
  const disputes = new Map<string, Dispute>();
  const supportTickets = new Map<string, SupportTicket>();

  // Create the mock database implementation
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