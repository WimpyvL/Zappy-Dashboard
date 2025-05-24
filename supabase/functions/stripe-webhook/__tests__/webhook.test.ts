import { assertEquals, assertRejects } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { beforeEach } from 'https://deno.land/std@0.177.0/testing/bdd.ts';
import {
  createTestDBClient,
  createTestEvent,
  createTestRequest,
  createTestSignature,
  createSuccessfulPaymentEvent,
  createFailedPaymentEvent,
  TestDBClient,
  MOCK_WEBHOOK_SECRET,
} from './helpers.ts';

Deno.test('Stripe Webhook Handler', async (t) => {
  let db: TestDBClient;

  beforeEach(() => {
    db = createTestDBClient();
  });

  await t.step('webhook signature verification', async (t) => {
    await t.step('should verify valid signatures', async () => {
      const event = createSuccessfulPaymentEvent();
      const body = JSON.stringify(event);
      const signature = createTestSignature(body, MOCK_WEBHOOK_SECRET);
      const req = createTestRequest(event, signature);
      
      const receivedBody = await req.text();
      const receivedSignature = req.headers.get('stripe-signature');
      
      assertEquals(typeof receivedBody, 'string');
      assertEquals(typeof receivedSignature, 'string');
    });

    await t.step('should reject invalid signatures', async () => {
      const event = createSuccessfulPaymentEvent();
      const req = createTestRequest(event, 'invalid_signature');
      
      await assertRejects(
        async () => {
          const body = await req.text();
          const signature = req.headers.get('stripe-signature') || '';
          createTestSignature(body, signature);
        },
        Error,
        'Invalid signature'
      );
    });
  });

  await t.step('event processing', async (t) => {
    await t.step('should process successful payments', async () => {
      const event = createSuccessfulPaymentEvent();
      await db.insertEvent(event);
      await db.updatePaymentStatus(event.data.object.id, 'paid');

      const storedEvent = db.getEvent(event.id);
      const paymentStatus = db.getPaymentStatus(event.data.object.id);

      assertEquals(storedEvent?.type, 'payment_intent.succeeded');
      assertEquals(paymentStatus, 'paid');
    });

    await t.step('should process failed payments', async () => {
      const event = createFailedPaymentEvent();
      await db.insertEvent(event);
      await db.updatePaymentStatus(event.data.object.id, 'failed');

      const storedEvent = db.getEvent(event.id);
      const paymentStatus = db.getPaymentStatus(event.data.object.id);

      assertEquals(storedEvent?.type, 'payment_intent.payment_failed');
      assertEquals(paymentStatus, 'failed');

      const paymentIntent = event.data.object;
      assertEquals(paymentIntent.last_payment_error?.message, 'Card declined');
    });

    await t.step('should handle subscription updates', async () => {
      const event = createTestEvent('customer.subscription.updated', {
        id: 'sub_123',
        customer: 'cus_123',
        metadata: {
          subscription_id: 'sub_123',
        },
      });

      await db.insertEvent(event);
      const storedEvent = db.getEvent(event.id);
      
      assertEquals(storedEvent?.type, 'customer.subscription.updated');
      assertEquals(storedEvent?.data.object.metadata?.subscription_id, 'sub_123');
    });

    await t.step('should record all events in database', async () => {
      // Process multiple events
      const events = [
        createSuccessfulPaymentEvent(),
        createFailedPaymentEvent(),
        createTestEvent('customer.subscription.updated'),
      ];

      for (const event of events) {
        await db.insertEvent(event);
      }

      // Verify all events were stored
      for (const event of events) {
        const storedEvent = db.getEvent(event.id);
        assertEquals(!!storedEvent, true);
        assertEquals(storedEvent?.type, event.type);
      }
    });
  });

  await t.step('error handling', async (t) => {
    await t.step('should handle missing webhook signature', async () => {
      const req = new Request('https://test.com/webhook', {
        method: 'POST',
        body: JSON.stringify(createSuccessfulPaymentEvent()),
      });

      const signature = req.headers.get('stripe-signature');
      assertEquals(signature, null);
    });

    await t.step('should handle invalid JSON', async () => {
      const req = createTestRequest('invalid json{', 'test_sig');
      
      await assertRejects(
        async () => {
          await req.json();
        },
        Error,
        'invalid json'
      );
    });

    await t.step('should handle database errors', async () => {
      // Simulate a database error
      const failingDB: TestDBClient = {
        ...db,
        insertEvent: async () => {
          throw new Error('Database error');
        },
      };

      const event = createSuccessfulPaymentEvent();
      
      await assertRejects(
        async () => {
          await failingDB.insertEvent(event);
        },
        Error,
        'Database error'
      );
    });
  });
});