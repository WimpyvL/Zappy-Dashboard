import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import * as mf from 'https://deno.land/x/mock_fetch@0.3.0/mod.ts';
import Stripe from 'stripe';
import { config } from '../config.ts';
import { PAYMENT_STATUS } from '../types.ts';

// Mock Stripe class
const mockStripe = {
  webhooks: {
    constructEvent: (_body: string, _signature: string, _secret: string) => ({
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          status: 'succeeded',
        },
      },
    }),
  },
  getApiField: (field: string) => field === 'version' ? '2023-10-16' : undefined,
} as unknown as Stripe;

// Mock createDatabaseClient function
const mockDb = {
  insertEvent: async () => {},
  updatePaymentStatus: async () => {},
  updateSubscriptionStatus: async () => {},
};

// Mock environment variables
const mockEnv = {
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_123',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

Deno.test('Stripe Webhook Handler', async (t) => {
  await t.step('request validation', async (t) => {
    // Setup environment and mocks
    const originalEnv = Deno.env.toObject();
    Object.entries(mockEnv).forEach(([key, value]) => {
      Deno.env.set(key, value);
    });

    await t.step('should reject non-POST requests', async () => {
      const req = new Request('http://localhost', {
        method: 'GET',
      });

      const res = await fetch(req);
      assertEquals(res.status, 405);
    });

    await t.step('should require signature header', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ type: 'test' }),
      });

      const res = await fetch(req);
      assertEquals(res.status, 401);

      const body = await res.json();
      assertEquals(body.error, 'No signature found');
    });

    // Restore environment
    Deno.env.delete('STRIPE_SECRET_KEY');
    Object.entries(originalEnv).forEach(([key, value]) => {
      Deno.env.set(key, value);
    });
  });

  await t.step('webhook processing', async (t) => {
    // Setup environment and mocks
    const originalEnv = Deno.env.toObject();
    Object.entries(mockEnv).forEach(([key, value]) => {
      Deno.env.set(key, value);
    });

    await t.step('should handle successful payment', async () => {
      let updatedPaymentId: string | undefined;
      let updatedStatus: string | undefined;

      const testDb = {
        ...mockDb,
        updatePaymentStatus: async (id: string, status: string) => {
          updatedPaymentId = id;
          updatedStatus = status;
        },
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_sig',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: 'evt_123',
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_123',
              status: 'succeeded',
            },
          },
        }),
      });

      const res = await fetch(req);
      assertEquals(res.status, 200);

      const body = await res.json();
      assertEquals(body.success, true);
      assertEquals(updatedPaymentId, 'pi_123');
      assertEquals(updatedStatus, PAYMENT_STATUS.SUCCEEDED);
    });

    await t.step('should handle invalid signatures', async () => {
      // Mock Stripe to throw on signature verification
      const errorStripe = {
        ...mockStripe,
        webhooks: {
          constructEvent: () => {
            throw new Error('Invalid signature');
          },
        },
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_sig',
          'content-type': 'application/json',
        },
        body: 'test_body',
      });

      const res = await fetch(req);
      assertEquals(res.status, 401);

      const body = await res.json();
      assertEquals(body.error, 'Invalid signature');
    });

    // Restore environment
    Deno.env.delete('STRIPE_SECRET_KEY');
    Object.entries(originalEnv).forEach(([key, value]) => {
      Deno.env.set(key, value);
    });
  });

  await t.step('error handling', async (t) => {
    await t.step('should handle database errors', async () => {
      const errorDb = {
        ...mockDb,
        insertEvent: () => Promise.reject(new Error('Database error')),
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_sig',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: 'evt_123',
          type: 'payment_intent.succeeded',
          data: { object: { id: 'pi_123' } },
        }),
      });

      const res = await fetch(req);
      assertEquals(res.status, 500);

      const body = await res.json();
      assertEquals(body.error, 'Failed to process webhook event');
      assertEquals(body.detail, 'Database error');
    });
  });
});