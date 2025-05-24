#!/usr/bin/env node

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { program } = require('commander');

// Configuration
const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    apiVersion: '2023-10-16',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  batchSize: 100,
  maxConcurrency: 5,
  timeoutMs: 30000,
};

// Initialize clients
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion,
});

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// Helper functions
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchStripePayment(paymentIntentId) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

async function fetchStripeSubscription(subscriptionId) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

// Reconciliation functions
async function reconcilePayments(options = {}) {
  console.log('Reconciling payments...');

  const { data: payments, error } = await supabase
    .from('patient_invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit || config.batchSize);

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  const results = {
    processed: 0,
    matched: 0,
    mismatched: 0,
    missing: 0,
    errors: 0,
  };

  const batches = [];
  for (let i = 0; i < payments.length; i += config.maxConcurrency) {
    batches.push(payments.slice(i, i + config.maxConcurrency));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(async (payment) => {
      try {
        results.processed++;
        const stripePayment = await fetchStripePayment(payment.stripe_payment_intent_id);

        if (!stripePayment) {
          results.missing++;
          console.log(`Payment not found in Stripe: ${payment.stripe_payment_intent_id}`);
          return;
        }

        if (stripePayment.status !== payment.status) {
          results.mismatched++;
          console.log(`Status mismatch for ${payment.stripe_payment_intent_id}:`);
          console.log(`  Local: ${payment.status}`);
          console.log(`  Stripe: ${stripePayment.status}`);

          // Update local status
          await supabase.rpc('reconcile_payment_status', {
            p_payment_intent_id: payment.stripe_payment_intent_id,
            p_stripe_status: stripePayment.status,
            p_amount: stripePayment.amount,
            p_created_at: new Date(stripePayment.created * 1000),
          });
        } else {
          results.matched++;
        }
      } catch (error) {
        results.errors++;
        console.error(`Error processing ${payment.stripe_payment_intent_id}:`, error);
      }
    }));

    // Rate limiting pause
    await sleep(1000);
  }

  return results;
}

async function reconcileSubscriptions(options = {}) {
  console.log('Reconciling subscriptions...');

  const { data: subscriptions, error } = await supabase
    .from('patient_subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit || config.batchSize);

  if (error) {
    throw new Error(`Failed to fetch subscriptions: ${error.message}`);
  }

  const results = {
    processed: 0,
    matched: 0,
    mismatched: 0,
    missing: 0,
    errors: 0,
  };

  const batches = [];
  for (let i = 0; i < subscriptions.length; i += config.maxConcurrency) {
    batches.push(subscriptions.slice(i, i + config.maxConcurrency));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(async (subscription) => {
      try {
        results.processed++;
        const stripeSub = await fetchStripeSubscription(subscription.stripe_subscription_id);

        if (!stripeSub) {
          results.missing++;
          console.log(`Subscription not found in Stripe: ${subscription.stripe_subscription_id}`);
          return;
        }

        if (stripeSub.status !== subscription.status) {
          results.mismatched++;
          console.log(`Status mismatch for ${subscription.stripe_subscription_id}:`);
          console.log(`  Local: ${subscription.status}`);
          console.log(`  Stripe: ${stripeSub.status}`);

          // Update local status
          await supabase.rpc('reconcile_subscription_status', {
            p_subscription_id: subscription.stripe_subscription_id,
            p_stripe_status: stripeSub.status,
            p_current_period_end: new Date(stripeSub.current_period_end * 1000),
            p_created_at: new Date(stripeSub.created * 1000),
          });
        } else {
          results.matched++;
        }
      } catch (error) {
        results.errors++;
        console.error(`Error processing ${subscription.stripe_subscription_id}:`, error);
      }
    }));

    // Rate limiting pause
    await sleep(1000);
  }

  return results;
}

// CLI setup
program
  .name('reconcile')
  .description('Reconcile local database with Stripe data');

program
  .command('payments')
  .description('Reconcile payment records')
  .option('-l, --limit <number>', 'Number of records to process')
  .action(async (options) => {
    try {
      const results = await reconcilePayments(options);
      console.log('\nPayment Reconciliation Results:');
      console.table(results);
    } catch (error) {
      console.error('Failed to reconcile payments:', error);
      process.exit(1);
    }
  });

program
  .command('subscriptions')
  .description('Reconcile subscription records')
  .option('-l, --limit <number>', 'Number of records to process')
  .action(async (options) => {
    try {
      const results = await reconcileSubscriptions(options);
      console.log('\nSubscription Reconciliation Results:');
      console.table(results);
    } catch (error) {
      console.error('Failed to reconcile subscriptions:', error);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Reconcile all records')
  .option('-l, --limit <number>', 'Number of records to process per type')
  .action(async (options) => {
    try {
      const paymentResults = await reconcilePayments(options);
      const subscriptionResults = await reconcileSubscriptions(options);

      console.log('\nReconciliation Results:');
      console.log('\nPayments:');
      console.table(paymentResults);
      console.log('\nSubscriptions:');
      console.table(subscriptionResults);
    } catch (error) {
      console.error('Failed to reconcile records:', error);
      process.exit(1);
    }
  });

// Execute CLI
program.parse();