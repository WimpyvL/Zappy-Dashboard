#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');

// Configuration
const config = {
  endpointUrl: 'http://localhost:54321/functions/v1/stripe-webhook',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test',
  events: {
    paymentSuccess: {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_' + randomId(),
          status: 'succeeded',
          amount: 1000,
          currency: 'usd',
          customer: 'cus_' + randomId(),
          invoice: 'in_' + randomId(),
        },
      },
    },
    paymentFailed: {
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_' + randomId(),
          status: 'failed',
          amount: 1000,
          currency: 'usd',
          customer: 'cus_' + randomId(),
          invoice: 'in_' + randomId(),
          last_payment_error: {
            message: 'Card declined',
          },
        },
      },
    },
    subscriptionUpdated: {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_' + randomId(),
          customer: 'cus_' + randomId(),
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        },
      },
    },
  },
};

// Helper functions
function randomId(length = 24) {
  return crypto.randomBytes(length).toString('hex');
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function constructEvent(eventType) {
  const event = {
    id: 'evt_' + randomId(),
    object: 'event',
    api_version: '2023-10-16',
    created: generateTimestamp(),
    data: config.events[eventType].data,
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_' + randomId(),
    },
    type: config.events[eventType].type,
  };
  return event;
}

function generateSignature(payload, secret) {
  const timestamp = generateTimestamp();
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

async function sendWebhook(eventType) {
  const event = constructEvent(eventType);
  const payload = JSON.stringify(event);
  const signature = generateSignature(payload, config.webhookSecret);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'Stripe-Signature': signature,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(config.endpointUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`Response ${res.statusCode}:`, data);
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// CLI interface
async function main() {
  const eventType = process.argv[2];
  if (!eventType || !config.events[eventType]) {
    console.error(`
Usage: node test-webhook.js <eventType>

Available event types:
${Object.keys(config.events)
  .map((type) => `  - ${type}`)
  .join('\n')}
    `);
    process.exit(1);
  }

  try {
    console.log(`Sending ${eventType} webhook...`);
    await sendWebhook(eventType);
  } catch (error) {
    console.error('Failed to send webhook:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  sendWebhook,
  config,
};