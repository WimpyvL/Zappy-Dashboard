import { assertEquals, assertRejects } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import type { Stripe } from "https://esm.sh/stripe@13.4.0";
import {
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
} from "../types.ts";
import { createLogger } from "../logger.ts";
import { handleWebhookEvent } from "../handler.ts";
import {
  createMockDb,
  createMockEvent,
  createMockStripe
} from "./utils.ts";

Deno.test('Webhook Handler Tests', async (t) => {
  const mockDb = createMockDb();
  const mockStripe: Stripe = createMockStripe();
  const logger = createLogger();

  const context = {
    db: mockDb,
    stripe: mockStripe,
    logger,
  };

  await t.step('payment processing', async (t) => {
    await t.step('should process successful payment', async () => {
      const event = createMockEvent('payment_intent.succeeded', {
        id: 'pi_123',
        status: 'succeeded',
      });

      await handleWebhookEvent(event, context);

      assertEquals(mockDb.getEvents().has(event.id), true);
      assertEquals(mockDb.getPaymentStatuses().get('pi_123'), PAYMENT_STATUS.SUCCEEDED);
    });

    await t.step('should process failed payment', async () => {
      const event = createMockEvent('payment_intent.payment_failed', {
        id: 'pi_456',
        status: 'failed',
      });

      await handleWebhookEvent(event, context);

      assertEquals(mockDb.getEvents().has(event.id), true);
      assertEquals(mockDb.getPaymentStatuses().get('pi_456'), PAYMENT_STATUS.FAILED);
    });
  });

  await t.step('subscription management', async (t) => {
    await t.step('should process subscription cancellation', async () => {
      const event = createMockEvent('customer.subscription.updated', {
        id: 'sub_123',
        status: SUBSCRIPTION_STATUS.CANCELED,
      });

      await handleWebhookEvent(event, context);

      assertEquals(mockDb.getEvents().has(event.id), true);
      assertEquals(
        mockDb.getSubscriptionStatuses().get('sub_123'),
        SUBSCRIPTION_STATUS.CANCELED
      );
    });
  });

  await t.step('error handling', async (t) => {
    await t.step('should handle database errors gracefully', async () => {
      const event = createMockEvent('payment_intent.succeeded', {
        id: 'pi_789',
        status: 'succeeded',
      });

      const errorContext = {
        ...context,
        db: {
          ...mockDb,
          // Explicitly type the error function to match DatabaseClient
          insertEvent: (): Promise<never> => Promise.reject(new Error('Database error')),
        },
      };

      await assertRejects(
        () => handleWebhookEvent(event, errorContext),
        Error,
        'Failed to process webhook event'
      );
    });
  });
});