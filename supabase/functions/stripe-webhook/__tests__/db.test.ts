import { assertEquals, assertRejects } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { SupabaseClient } from '@supabase/supabase-js';
import { createDatabaseClient } from '../db.ts';
import type { StripeEvent, WebhookError } from '../types.ts';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from '../types.ts';

// Mock event data
const mockEvent: StripeEvent = {
  id: 'evt_123',
  type: 'payment_intent.succeeded',
  data: {
    object: { id: 'pi_123' }
  },
  created: 1622000000,
  livemode: false,
  pending_webhooks: 0,
  request: {
    id: 'req_123',
    idempotency_key: 'ikey_123'
  }
};

interface MockFunction<T> {
  (this: any, ...args: any[]): T;
  calls: { args: any[]; result: T }[];
}

function createMockFunction<T>(defaultResult: T): MockFunction<T> {
  const calls: { args: any[]; result: T }[] = [];
  const mockFn = function(this: any, ...args: any[]): T {
    const result = defaultResult;
    calls.push({ args, result });
    return result;
  };
  (mockFn as MockFunction<T>).calls = calls;
  return mockFn as MockFunction<T>;
}

// Mock Supabase client
function createMockSupabaseClient() {
  return {
    from: (_table: string) => ({
      insert: createMockFunction(Promise.resolve({ error: null })),
      update: createMockFunction(Promise.resolve({ error: null })),
      select: () => ({
        eq: createMockFunction(Promise.resolve({ error: null })),
        order: createMockFunction(Promise.resolve({ error: null })),
        limit: createMockFunction(Promise.resolve({ error: null })),
        single: createMockFunction(Promise.resolve({
          data: { amount: 1000, subscription_id: 'sub_123' },
          error: null
        })),
      }),
      eq: createMockFunction(Promise.resolve({ error: null })),
    }),
  };
}

Deno.test('SupabaseAdapter', async (t) => {
  await t.step('insertEvent', async (t) => {
    await t.step('should successfully insert an event', async () => {
      const mockClient = createMockSupabaseClient();
      const db = createDatabaseClient('test_url', 'test_key');
      
      // @ts-ignore - Mock implementation
      db['client'] = mockClient;
      await db.insertEvent(mockEvent);
      
      const insertFn = mockClient.from('stripe_events').insert as MockFunction<any>;
      assertEquals(insertFn.calls.length, 1);
      assertEquals(insertFn.calls[0].args[0].event_id, mockEvent.id);
    });

    await t.step('should throw error on failed insert', async () => {
      const mockClient = createMockSupabaseClient();
      const db = createDatabaseClient('test_url', 'test_key');
      
      // @ts-ignore - Mock implementation
      db['client'] = {
        from: () => ({
          insert: () => Promise.resolve({ 
            error: new Error('Database error') 
          }),
        }),
      };

      await assertRejects(
        () => db.insertEvent(mockEvent),
        Error,
        'Failed to insert event'
      );
    });
  });

  await t.step('updatePaymentStatus', async (t) => {
    await t.step('should update payment status', async () => {
      const mockClient = createMockSupabaseClient();
      const db = createDatabaseClient('test_url', 'test_key');
      
      // @ts-ignore - Mock implementation
      db['client'] = mockClient;
      await db.updatePaymentStatus('pi_123', PAYMENT_STATUS.SUCCEEDED);

      const updateFn = mockClient.from('patient_invoices').update as MockFunction<any>;
      assertEquals(updateFn.calls.length, 1);
      assertEquals(updateFn.calls[0].args[0].status, PAYMENT_STATUS.SUCCEEDED);
    });
  });

  await t.step('updateSubscriptionStatus', async (t) => {
    await t.step('should update subscription status', async () => {
      const mockClient = createMockSupabaseClient();
      const db = createDatabaseClient('test_url', 'test_key');
      
      // @ts-ignore - Mock implementation
      db['client'] = mockClient;
      await db.updateSubscriptionStatus('sub_123', SUBSCRIPTION_STATUS.ACTIVE);

      const updateFn = mockClient.from('patient_subscriptions').update as MockFunction<any>;
      assertEquals(updateFn.calls.length, 1);
      assertEquals(updateFn.calls[0].args[0].status, SUBSCRIPTION_STATUS.ACTIVE);
    });

    await t.step('should include cancelled_at when cancelled', async () => {
      const mockClient = createMockSupabaseClient();
      const db = createDatabaseClient('test_url', 'test_key');
      
      // @ts-ignore - Mock implementation
      db['client'] = mockClient;
      await db.updateSubscriptionStatus('sub_123', SUBSCRIPTION_STATUS.CANCELED);

      const updateFn = mockClient.from('patient_subscriptions').update as MockFunction<any>;
      assertEquals(updateFn.calls.length, 1);
      assertEquals(typeof updateFn.calls[0].args[0].cancelled_at, 'string');
    });
  });

  await t.step('error handling', async (t) => {
    await t.step('should include error details', async () => {
      const mockClient = createMockSupabaseClient();
      const db = createDatabaseClient('test_url', 'test_key');
      
      const dbError = {
        message: 'Unique constraint violation',
        code: '23505',
        statusCode: 409,
      };

      // @ts-ignore - Mock implementation
      db['client'] = {
        from: () => ({
          insert: () => Promise.resolve({ error: dbError }),
        }),
      };

      try {
        await db.insertEvent(mockEvent);
        throw new Error('Should have thrown');
      } catch (error) {
        const webhookError = error as Error & { 
          type?: string;
          code?: string;
          statusCode?: number;
          detail?: string;
        };
        assertEquals(webhookError.type, 'DatabaseError');
        assertEquals(webhookError.detail, dbError.message);
        assertEquals(webhookError.code, dbError.code);
        assertEquals(webhookError.statusCode, dbError.statusCode);
      }
    });
  });
});