import { assertEquals, assertRejects } from "asserts";
import type { Stripe } from "stripe";
import type { HandlerContext } from "@types";
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from "@types";
import { createLogger } from "@logger";
import { handleWebhookEvent } from "@handler";
import { createMockDb, createMockEvent, createMockStripe } from "@test/utils";

Deno.test("Stripe Webhook Handler Integration Tests", async (t) => {
  // Set up test dependencies
  const mockDb = createMockDb();
  const mockStripe: Stripe = createMockStripe();
  const logger = createLogger();

  // Create handler context with all required services
  const context: HandlerContext = {
    db: mockDb,
    stripe: mockStripe,
    logger,
  };

  await t.step("payment processing", async (t) => {
    await t.step("should process successful payment", async () => {
      const event = createMockEvent('payment_intent.succeeded', {
        id: 'pi_123',
        status: 'succeeded',
      });

      await handleWebhookEvent(event, context);

      assertEquals(mockDb.getEvents().has(event.id), true);
      assertEquals(
        mockDb.getPaymentStatuses().get('pi_123'),
        PAYMENT_STATUS.SUCCEEDED
      );
    });

    await t.step("should handle failed payment", async () => {
      const event = createMockEvent('payment_intent.payment_failed', {
        id: 'pi_456',
        status: 'failed',
      });

      await handleWebhookEvent(event, context);

      assertEquals(mockDb.getEvents().has(event.id), true);
      assertEquals(
        mockDb.getPaymentStatuses().get('pi_456'),
        PAYMENT_STATUS.FAILED
      );
    });
  });

  await t.step("subscription management", async (t) => {
    await t.step("should process subscription updates", async () => {
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

  await t.step("error handling", async (t) => {
    await t.step("should handle database failures appropriately", async () => {
      const event = createMockEvent('payment_intent.succeeded', {
        id: 'pi_789',
        status: 'succeeded',
      });

      const errorContext: HandlerContext = {
        ...context,
        db: {
          ...mockDb,
          insertEvent: async (): Promise<never> => {
            throw new Error('Database error');
          },
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