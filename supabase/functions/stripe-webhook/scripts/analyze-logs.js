#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Configuration
const config = {
  logFile: process.env.LOG_FILE || '../.logs/webhook.log',
  timeRange: {
    start: process.env.START_TIME || '1h', // Time range to analyze (e.g., 1h, 24h, 7d)
    end: process.env.END_TIME || 'now',
  },
  alertThresholds: {
    errorRate: 0.05, // 5% error rate threshold
    responseTime: 1000, // 1 second response time threshold
    concurrentRequests: 50,
  },
};

// Metrics storage
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  statusCodes: new Map(),
  errorTypes: new Map(),
  eventTypes: new Map(),
  concurrentRequests: new Map(), // timestamp -> count
  uniqueCustomers: new Set(),
};

// Time parsing
function parseTimeRange(range) {
  if (range === 'now') return Date.now();
  
  const match = range.match(/^(\d+)([hdw])$/);
  if (!match) throw new Error(`Invalid time range: ${range}`);
  
  const [, value, unit] = match;
  const multipliers = { h: 3600000, d: 86400000, w: 604800000 };
  return Date.now() - (parseInt(value) * multipliers[unit]);
}

// Log parsing
function parseLogLine(line) {
  try {
    const logEntry = JSON.parse(line);
    return {
      timestamp: new Date(logEntry.timestamp).getTime(),
      level: logEntry.level,
      message: logEntry.message,
      requestId: logEntry.requestId,
      eventId: logEntry.context?.eventId,
      eventType: logEntry.context?.eventType,
      customerId: logEntry.context?.customerId,
      responseTime: logEntry.context?.responseTime,
      statusCode: logEntry.context?.statusCode,
      error: logEntry.context?.error,
    };
  } catch (error) {
    return null;
  }
}

// Analysis functions
function updateMetrics(entry) {
  metrics.totalRequests++;
  
  // Track status codes
  if (entry.statusCode) {
    const count = metrics.statusCodes.get(entry.statusCode) || 0;
    metrics.statusCodes.set(entry.statusCode, count + 1);
    
    if (entry.statusCode >= 200 && entry.statusCode < 300) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
  }
  
  // Track response times
  if (entry.responseTime) {
    metrics.responseTimes.push(entry.responseTime);
  }
  
  // Track event types
  if (entry.eventType) {
    const count = metrics.eventTypes.get(entry.eventType) || 0;
    metrics.eventTypes.set(entry.eventType, count + 1);
  }
  
  // Track errors
  if (entry.error) {
    const count = metrics.errorTypes.get(entry.error) || 0;
    metrics.errorTypes.set(entry.error, count + 1);
  }
  
  // Track unique customers
  if (entry.customerId) {
    metrics.uniqueCustomers.add(entry.customerId);
  }
  
  // Track concurrency
  const minute = Math.floor(entry.timestamp / 60000);
  const count = metrics.concurrentRequests.get(minute) || 0;
  metrics.concurrentRequests.set(minute, count + 1);
}

function generateReport() {
  const avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  const errorRate = metrics.failedRequests / metrics.totalRequests;
  const peakConcurrency = Math.max(...metrics.concurrentRequests.values());

  console.log('\nWebhook Analysis Report');
  console.log('=====================\n');

  console.log('General Statistics:');
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Success Rate: ${((1 - errorRate) * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Unique Customers: ${metrics.uniqueCustomers.size}`);
  console.log(`Peak Requests/Minute: ${peakConcurrency}`);

  console.log('\nStatus Code Distribution:');
  for (const [code, count] of metrics.statusCodes) {
    const percentage = (count / metrics.totalRequests * 100).toFixed(2);
    console.log(`  ${code}: ${count} (${percentage}%)`);
  }

  console.log('\nEvent Type Distribution:');
  for (const [type, count] of metrics.eventTypes) {
    const percentage = (count / metrics.totalRequests * 100).toFixed(2);
    console.log(`  ${type}: ${count} (${percentage}%)`);
  }

  if (metrics.errorTypes.size > 0) {
    console.log('\nError Distribution:');
    for (const [error, count] of metrics.errorTypes) {
      const percentage = (count / metrics.failedRequests * 100).toFixed(2);
      console.log(`  ${error}: ${count} (${percentage}%)`);
    }
  }

  // Alert on concerning metrics
  console.log('\nAlerts:');
  if (errorRate > config.alertThresholds.errorRate) {
    console.log(`⚠️ High error rate: ${(errorRate * 100).toFixed(2)}%`);
  }
  if (avgResponseTime > config.alertThresholds.responseTime) {
    console.log(`⚠️ High average response time: ${avgResponseTime.toFixed(2)}ms`);
  }
  if (peakConcurrency > config.alertThresholds.concurrentRequests) {
    console.log(`⚠️ High concurrency: ${peakConcurrency} requests/minute`);
  }
}

// Main execution
async function analyzeLogs() {
  const startTime = parseTimeRange(config.timeRange.start);
  const endTime = parseTimeRange(config.timeRange.end);

  const fileStream = fs.createReadStream(path.resolve(__dirname, config.logFile));
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log(`Analyzing logs from ${new Date(startTime)} to ${new Date(endTime)}...\n`);

  for await (const line of rl) {
    const entry = parseLogLine(line);
    if (entry && entry.timestamp >= startTime && entry.timestamp <= endTime) {
      updateMetrics(entry);
    }
  }

  generateReport();
}

if (require.main === module) {
  analyzeLogs().catch(console.error);
}

module.exports = {
  analyzeLogs,
  metrics,
  config,
};