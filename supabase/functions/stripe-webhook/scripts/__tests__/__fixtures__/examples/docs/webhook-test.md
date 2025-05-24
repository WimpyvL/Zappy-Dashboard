---
title: Testing Stripe Webhooks
description: Guide to testing Stripe webhook integration
author: Supabase
date: 2025-05-24
---

# Testing Stripe Webhooks

Learn how to effectively test your Stripe webhook integration to ensure reliable payment processing.

## Overview

When implementing Stripe webhooks, thorough testing is crucial to ensure your application handles payment events correctly. This guide covers testing strategies and best practices.

## Prerequisites

Before starting, ensure you have:

- Stripe account with test API keys
- Development environment set up
- Test database running

## Test Environment Setup

First, configure your test environment:

```typescript
import { createClient } from '@supabase/supabase-js';
import { WebhookHandler } from './webhook';

const supabase = createClient('YOUR_TEST_URL', 'YOUR_TEST_KEY');

const handler = new WebhookHandler({
  secret: process.env.STRIPE_WEBHOOK_SECRET,
  client: supabase
});
```

## Creating Test Events

Use Stripe's test events:

```typescript
const testEvent = {
  id: 'evt_test_123',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_test_123',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded'
    }
  }
};

// Test event handling
await handler.handleEvent(testEvent);
```

## Validation Testing

Always validate webhook signatures:

```typescript
import { validateWebhook } from './validation';

test('webhook validation', async () => {
  const payload = JSON.stringify(testEvent);
  const signature = generateTestSignature(payload);
  
  const isValid = await validateWebhook({
    payload,
    signature,
    secret: 'test_secret'
  });
  
  expect(isValid).toBe(true);
});
```

## Database Testing

Test database interactions:

```typescript
test('payment recording', async () => {
  // Setup test data
  const payment = {
    id: 'test_123',
    amount: 1000,
    status: 'succeeded'
  };

  // Handle webhook
  await handler.handleEvent({
    type: 'payment_intent.succeeded',
    data: { object: payment }
  });

  // Verify database state
  const { data } = await supabase
    .from('payments')
    .select()
    .match({ stripe_id: payment.id });

  expect(data).toHaveLength(1);
  expect(data[0]).toMatchObject(payment);
});
```

## Error Handling

Test error scenarios:

```typescript
test('invalid signature', async () => {
  await expect(
    handler.handleEvent(testEvent, 'invalid_signature')
  ).rejects.toThrow('Invalid signature');
});

test('missing event data', async () => {
  await expect(
    handler.handleEvent({})
  ).rejects.toThrow('Invalid event data');
});
```

## Integration Testing

Run full integration tests:

```typescript
import { setupTestServer } from './test-utils';

test('webhook endpoint', async () => {
  const server = await setupTestServer();
  
  const response = await server.post('/webhook', {
    body: testEvent,
    headers: {
      'stripe-signature': validSignature
    }
  });

  expect(response.status).toBe(200);
  
  // Verify side effects
  const payment = await getPayment(testEvent.data.object.id);
  expect(payment.status).toBe('succeeded');
});
```

## Best Practices

1. Always use test API keys
2. Test signature validation
3. Verify database state
4. Check error handling
5. Test idempotency
6. Monitor test coverage
7. Use test helpers

## Common Issues

### Invalid Signatures

If signature validation fails:
1. Check webhook secret
2. Verify payload formatting
3. Check timestamp freshness

### Missing Events

When events aren't received:
1. Check webhook URL
2. Verify Stripe configuration
3. Check server logs

## Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Test Helpers Reference](https://stripe.com/docs/webhooks/test-helpers)

## Contributing

Found an issue? Please submit:

1. Test case demonstrating the issue
2. Expected behavior
3. Actual behavior
4. Environment details

## License

MIT - feel free to use in your own projects.