#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const process = require('process');

// Configuration
const METRICS_DIR = path.join(__dirname, '../.metrics');
const METRICS_FILE = path.join(METRICS_DIR, 'webhook.prom');
const LOG_FILE = path.join(__dirname, '../.logs/metrics.log');

// Ensure directories exist
if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Logging
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(message);
};

// Class to manage webhook metrics
class WebhookMetrics {
    constructor() {
        this.metrics = {
            requests_total: 0,
            errors_total: 0,
            events_processed_total: 0,
            processing_duration_seconds: [],
            concurrent_requests: 0,
            queue_size: 0,
            cache_hits_total: 0,
            cache_misses_total: 0,
            rate_limited_total: 0,
            signature_failures_total: 0
        };
        
        this.loadMetrics();
    }
    
    // Load existing metrics
    loadMetrics() {
        try {
            if (fs.existsSync(METRICS_FILE)) {
                const data = fs.readFileSync(METRICS_FILE, 'utf8');
                data.split('\n').forEach(line => {
                    if (line && !line.startsWith('#')) {
                        const [name, value] = line.split(' ');
                        const metricName = name.split('{')[0].replace('webhook_', '');
                        if (this.metrics.hasOwnProperty(metricName)) {
                            this.metrics[metricName] = Number(value);
                        }
                    }
                });
                log('Loaded existing metrics');
            }
        } catch (error) {
            log(`Error loading metrics: ${error.message}`);
        }
    }
    
    // Save metrics to file
    saveMetrics() {
        try {
            let output = '';
            
            // Counter metrics
            const counters = [
                'requests_total',
                'errors_total',
                'events_processed_total',
                'cache_hits_total',
                'cache_misses_total',
                'rate_limited_total',
                'signature_failures_total'
            ];
            
            counters.forEach(name => {
                output += `# HELP webhook_${name} Total number of ${name.replace(/_/g, ' ')}\n`;
                output += `# TYPE webhook_${name} counter\n`;
                output += `webhook_${name} ${this.metrics[name]}\n`;
            });
            
            // Gauge metrics
            const gauges = [
                'concurrent_requests',
                'queue_size'
            ];
            
            gauges.forEach(name => {
                output += `# HELP webhook_${name} Current ${name.replace(/_/g, ' ')}\n`;
                output += `# TYPE webhook_${name} gauge\n`;
                output += `webhook_${name} ${this.metrics[name]}\n`;
            });
            
            // Histogram metrics
            if (this.metrics.processing_duration_seconds.length > 0) {
                const durations = this.metrics.processing_duration_seconds;
                const buckets = [0.1, 0.5, 1, 2.5, 5, 10];
                
                output += '# HELP webhook_processing_duration_seconds Event processing duration in seconds\n';
                output += '# TYPE webhook_processing_duration_seconds histogram\n';
                
                // Calculate bucket values
                buckets.forEach(bucket => {
                    const count = durations.filter(d => d <= bucket).length;
                    output += `webhook_processing_duration_seconds_bucket{le="${bucket}"} ${count}\n`;
                });
                
                output += `webhook_processing_duration_seconds_bucket{le="+Inf"} ${durations.length}\n`;
                output += `webhook_processing_duration_seconds_count ${durations.length}\n`;
                output += `webhook_processing_duration_seconds_sum ${durations.reduce((a, b) => a + b, 0)}\n`;
            }
            
            fs.writeFileSync(METRICS_FILE, output);
            log('Metrics saved successfully');
            
        } catch (error) {
            log(`Error saving metrics: ${error.message}`);
        }
    }
    
    // Update metrics based on incoming webhook data
    updateMetrics(data) {
        // Update counters
        this.metrics.requests_total++;
        if (data.error) this.metrics.errors_total++;
        if (data.events) this.metrics.events_processed_total += data.events;
        if (data.cacheHit) this.metrics.cache_hits_total++;
        if (data.cacheMiss) this.metrics.cache_misses_total++;
        if (data.rateLimited) this.metrics.rate_limited_total++;
        if (data.signatureInvalid) this.metrics.signature_failures_total++;
        
        // Update gauges
        this.metrics.concurrent_requests = data.concurrentRequests || 0;
        this.metrics.queue_size = data.queueSize || 0;
        
        // Update histogram
        if (data.processingTime) {
            this.metrics.processing_duration_seconds.push(data.processingTime);
            // Keep only last 1000 values
            if (this.metrics.processing_duration_seconds.length > 1000) {
                this.metrics.processing_duration_seconds.shift();
            }
        }
        
        this.saveMetrics();
    }
}

// Create metrics instance
const metrics = new WebhookMetrics();

// Example usage:
const updateData = {
    error: false,
    events: 1,
    cacheHit: true,
    cacheMiss: false,
    rateLimited: false,
    signatureInvalid: false,
    concurrentRequests: 5,
    queueSize: 2,
    processingTime: 0.234
};

metrics.updateMetrics(updateData);

// Export metrics instance for external use
module.exports = metrics;