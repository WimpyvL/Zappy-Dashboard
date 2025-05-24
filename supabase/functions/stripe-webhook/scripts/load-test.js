#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');

// Configuration
const config = {
  concurrentRequests: 10,
  totalRequests: 100,
  requestIntervalMs: 100,
  timeoutMs: 5000,
  webhookUrl: 'http://localhost:54321/functions/v1/stripe-webhook',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test',
};

// Metrics
const metrics = {
  successful: 0,
  failed: 0,
  totalTime: 0,
  minTime: Number.MAX_VALUE,
  maxTime: 0,
  responseTimes: [],
  statusCodes: new Map(),
  errors: new Map(),
};

// Helper functions
function generateSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

function randomId(length = 24) {
  return crypto.randomBytes(length).toString('hex');
}

function createMockEvent() {
  return {
    id: `evt_${randomId()}`,
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: `pi_${randomId()}`,
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        customer: `cus_${randomId()}`,
        invoice: `in_${randomId()}`,
      },
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  };
}

function sendWebhook() {
  return new Promise((resolve) => {
    const event = createMockEvent();
    const payload = JSON.stringify(event);
    const signature = generateSignature(payload, config.webhookSecret);
    const startTime = Date.now();

    const req = https.request(
      config.webhookUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
          'Stripe-Signature': signature,
        },
        timeout: config.timeoutMs,
      },
      (res) => {
        const duration = Date.now() - startTime;
        
        // Update status code metrics
        const count = metrics.statusCodes.get(res.statusCode) || 0;
        metrics.statusCodes.set(res.statusCode, count + 1);

        // Update timing metrics
        metrics.totalTime += duration;
        metrics.minTime = Math.min(metrics.minTime, duration);
        metrics.maxTime = Math.max(metrics.maxTime, duration);
        metrics.responseTimes.push(duration);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          metrics.successful++;
        } else {
          metrics.failed++;
        }

        resolve();
      }
    );

    req.on('error', (error) => {
      const count = metrics.errors.get(error.code) || 0;
      metrics.errors.set(error.code, count + 1);
      metrics.failed++;
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function runLoadTest() {
  console.log('\nStarting load test...\n');
  const startTime = Date.now();

  // Create request batches
  const batches = [];
  for (let i = 0; i < config.totalRequests; i += config.concurrentRequests) {
    const batchSize = Math.min(
      config.concurrentRequests,
      config.totalRequests - i
    );
    batches.push(Array(batchSize).fill(null));
  }

  // Process batches with delay
  for (const [index, batch] of batches.entries()) {
    await Promise.all(batch.map(() => sendWebhook()));
    
    // Progress update
    const completed = Math.min(
      (index + 1) * config.concurrentRequests,
      config.totalRequests
    );
    const percent = ((completed / config.totalRequests) * 100).toFixed(1);
    process.stdout.write(
      `\rProgress: ${completed}/${config.totalRequests} (${percent}%)`
    );

    if (index < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, config.requestIntervalMs));
    }
  }

  // Calculate final metrics
  const totalTime = Date.now() - startTime;
  const avgResponseTime =
    metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  
  // Print results
  console.log('\n\nLoad Test Results:');
  console.log('=================');
  console.log(`Total Requests: ${config.totalRequests}`);
  console.log(`Concurrent Requests: ${config.concurrentRequests}`);
  console.log(`Total Time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Requests/Second: ${(config.totalRequests / (totalTime / 1000)).toFixed(2)}`);
  console.log(`Success Rate: ${((metrics.successful / config.totalRequests) * 100).toFixed(1)}%`);
  console.log('\nResponse Times:');
  console.log(`  Min: ${metrics.minTime}ms`);
  console.log(`  Max: ${metrics.maxTime}ms`);
  console.log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
  
  console.log('\nStatus Codes:');
  for (const [code, count] of metrics.statusCodes) {
    console.log(`  ${code}: ${count}`);
  }

  if (metrics.errors.size > 0) {
    console.log('\nErrors:');
    for (const [code, count] of metrics.errors) {
      console.log(`  ${code}: ${count}`);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const concurrency = parseInt(args[0], 10);
  if (!isNaN(concurrency)) {
    config.concurrentRequests = concurrency;
  }
}
if (args.length > 1) {
  const total = parseInt(args[1], 10);
  if (!isNaN(total)) {
    config.totalRequests = total;
  }
}

// Run the load test
runLoadTest().catch(console.error);