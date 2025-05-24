import { assertEquals, assertThrows } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { loadConfig, validateStripeVersion, validateSuccessUrl, validateCancelUrl, validateRetryAttempt, getRetryInterval } from '../config.ts';

Deno.test('Configuration', async (t) => {
  await t.step('environment validation', async (t) => {
    const originalEnv = { ...Deno.env.toObject() };

    await t.step('should throw if missing required variables', () => {
      // Clear environment
      for (const key of Object.keys(originalEnv)) {
        Deno.env.delete(key);
      }

      assertThrows(
        () => loadConfig(),
        Error,
        'Missing required environment variables'
      );
    });

    await t.step('should load valid configuration', () => {
      // Set required environment variables
      Deno.env.set('STRIPE_SECRET_KEY', 'sk_test_123');
      Deno.env.set('STRIPE_WEBHOOK_SECRET', 'whsec_123');
      Deno.env.set('SUPABASE_URL', 'https://test.supabase.co');
      Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'sbkey_123');

      const config = loadConfig();
      assertEquals(config.stripeSecretKey, 'sk_test_123');
      assertEquals(config.stripeWebhookSecret, 'whsec_123');
      assertEquals(config.supabaseUrl, 'https://test.supabase.co');
      assertEquals(config.supabaseServiceKey, 'sbkey_123');

      // Restore original environment
      for (const key of Object.keys(originalEnv)) {
        Deno.env.set(key, originalEnv[key]);
      }
    });
  });

  await t.step('stripe version validation', async (t) => {
    await t.step('should validate allowed versions', () => {
      assertEquals(validateStripeVersion('2023-10-16'), true);
    });

    await t.step('should reject invalid versions', () => {
      assertEquals(validateStripeVersion('2022-01-01'), false);
      assertEquals(validateStripeVersion('invalid'), false);
    });
  });

  await t.step('URL validation', async (t) => {
    await t.step('should validate success URL', () => {
      assertEquals(
        validateSuccessUrl('https://custom.com/success'),
        'https://custom.com/success'
      );
      assertEquals(
        validateSuccessUrl('invalid-url'),
        'https://app.example.com/payment/success'
      );
      assertEquals(
        validateSuccessUrl(undefined),
        'https://app.example.com/payment/success'
      );
    });

    await t.step('should validate cancel URL', () => {
      assertEquals(
        validateCancelUrl('https://custom.com/cancel'),
        'https://custom.com/cancel'
      );
      assertEquals(
        validateCancelUrl('invalid-url'),
        'https://app.example.com/payment/cancel'
      );
      assertEquals(
        validateCancelUrl(undefined),
        'https://app.example.com/payment/cancel'
      );
    });
  });

  await t.step('retry attempt validation', async (t) => {
    await t.step('should validate attempt numbers', () => {
      assertEquals(validateRetryAttempt(1), true);
      assertEquals(validateRetryAttempt(2), true);
      assertEquals(validateRetryAttempt(3), true);
      assertEquals(validateRetryAttempt(0), false);
      assertEquals(validateRetryAttempt(4), false);
    });

    await t.step('should return correct retry intervals', () => {
      assertEquals(getRetryInterval(1), 1); // 1 day
      assertEquals(getRetryInterval(2), 3); // 3 days
      assertEquals(getRetryInterval(3), 7); // 7 days
      assertEquals(getRetryInterval(4), 7); // Fallback to last interval
    });
  });
});