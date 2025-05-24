import { StripeEvent } from '../types.ts';

export interface TestPaymentIntent {
  id: string;
  invoice?: string;
  customer?: string;
  metadata?: {
    subscription_id?: string;
  };
  amount?: number;
  last_payment_error?: {
    message: string;
  };
}

export interface TestEvent {
  id: string;
  type: string;
  data: {
    object: TestPaymentIntent;
  };
}

export function createTestEvent(
  type: string,
  data: Partial<TestPaymentIntent> = {}
): TestEvent {
  return {
    id: `evt_${Math.random().toString(36).slice(2)}`,
    type,
    data: {
      object: {
        id: `pi_${Math.random().toString(36).slice(2)}`,
        metadata: {},
        ...data,
      },
    },
  };
}

export function createTestRequest(
  payload: unknown,
  signature = 'test_sig'
): Request {
  return new Request('https://test.com/webhook', {
    method: 'POST',
    headers: {
      'stripe-signature': signature,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export interface TestDBClient {
  events: Map<string, TestEvent>;
  paymentStatuses: Map<string, string>;

  insertEvent(event: TestEvent): Promise<void>;
  updatePaymentStatus(paymentId: string, status: string): Promise<void>;
  getEvent(eventId: string): TestEvent | undefined;
  getPaymentStatus(paymentId: string): string | undefined;
  clear(): void;
}

export function createTestDBClient(): TestDBClient {
  const events = new Map<string, TestEvent>();
  const paymentStatuses = new Map<string, string>();

  return {
    events,
    paymentStatuses,

    async insertEvent(event: TestEvent): Promise<void> {
      events.set(event.id, event);
    },

    async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
      paymentStatuses.set(paymentId, status);
    },

    getEvent(eventId: string): TestEvent | undefined {
      return events.get(eventId);
    },

    getPaymentStatus(paymentId: string): string | undefined {
      return paymentStatuses.get(paymentId);
    },

    clear(): void {
      events.clear();
      paymentStatuses.clear();
    },
  };
}

export function createTestSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  // In a real implementation, this would use crypto to create a real signature
  return `t=${timestamp},v1=mock_signature`;
}

export const MOCK_WEBHOOK_SECRET = 'whsec_test_secret';

export function createSuccessfulPaymentEvent(): TestEvent {
  return createTestEvent('payment_intent.succeeded', {
    id: 'pi_success',
    invoice: 'inv_123',
    customer: 'cus_123',
    amount: 1000,
  });
}

export function createFailedPaymentEvent(): TestEvent {
  return createTestEvent('payment_intent.payment_failed', {
    id: 'pi_failed',
    invoice: 'inv_456',
    customer: 'cus_456',
    amount: 1000,
    last_payment_error: {
      message: 'Card declined',
    },
  });
}

export function createSubscriptionEvent(
  type: 'updated' | 'deleted',
  data: Partial<TestPaymentIntent> = {}
): TestEvent {
  return createTestEvent(`customer.subscription.${type}`, {
    id: `sub_${Math.random().toString(36).slice(2)}`,
    ...data,
  });
}