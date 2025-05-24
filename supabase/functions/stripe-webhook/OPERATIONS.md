# Operations Guide - Stripe Webhook Handler

## Monitoring and Operations

This guide covers day-to-day operations, monitoring, and maintenance of the Stripe webhook handler.

## Key Metrics

### 1. Performance Metrics

```typescript
interface PerformanceMetrics {
  responseTime: {
    p50: number;  // milliseconds
    p90: number;
    p99: number;
  };
  throughput: {
    requestsPerMinute: number;
    eventsProcessed: number;
  };
  concurrency: {
    activeRequests: number;
    queueLength: number;
  };
}
```

#### Target Values
- Response Time: p99 < 1000ms
- Throughput: < 1000 req/min
- Error Rate: < 0.1%
- Queue Length: < 100

### 2. System Health

```typescript
interface SystemHealth {
  database: {
    connections: number;
    queryLatency: number;
    deadlocks: number;
  };
  memory: {
    usage: number;
    available: number;
  };
  disk: {
    usage: number;
    iops: number;
  };
}
```

#### Thresholds
- Database Connections: < 80%
- Memory Usage: < 85%
- Disk Usage: < 80%
- IOPS: < 80%

## Monitoring Setup

### 1. Log Monitoring

```bash
# View real-time logs
tail -f /opt/supabase/functions/stripe-webhook/.logs/webhook.log

# Search for errors
grep -i error /opt/supabase/functions/stripe-webhook/.logs/webhook.log

# Monitor failed events
node scripts/analyze-logs.js --type error --last-hours 24
```

### 2. Metric Collection

```bash
# Collect current metrics
node scripts/monitor-db.js --metrics

# Generate performance report
node scripts/manage.js report --type performance

# Check system health
node scripts/manage.js health
```

### 3. Alerting

#### Critical Alerts
- Webhook processing failures
- High error rates
- Database issues
- Resource exhaustion
- Security violations

#### Warning Alerts
- High latency
- Increased error rates
- Resource usage warnings
- Queue buildup

## Routine Operations

### 1. Daily Checks

```bash
#!/bin/bash
# daily-checks.sh

# Check system health
node scripts/manage.js health

# Analyze logs
node scripts/analyze-logs.js --last-hours 24

# Monitor database
node scripts/monitor-db.js --check

# Verify metrics
node scripts/manage.js report
```

### 2. Weekly Maintenance

```bash
#!/bin/bash
# weekly-maintenance.sh

# Run full maintenance
node scripts/manage.js maintain

# Analyze performance
node scripts/analyze-logs.js --last-days 7 --type performance

# Check data consistency
node scripts/reconcile.js all

# Rotate logs
node scripts/manage.js maintain --rotate-logs
```

### 3. Monthly Tasks

```bash
#!/bin/bash
# monthly-tasks.sh

# Full system audit
node scripts/manage.js audit

# Clean old data
node scripts/manage.js maintain --clean-old-data

# Generate monthly report
node scripts/manage.js report --type monthly

# Review security logs
node scripts/analyze-logs.js --type security --last-days 30
```

## Troubleshooting

### 1. Common Issues

#### High Error Rate
```bash
# Check recent errors
node scripts/analyze-logs.js --type error --last-hours 1

# View error distribution
node scripts/analyze-logs.js --type error --group-by type

# Check system health
node scripts/manage.js health
```

#### Performance Issues
```bash
# Monitor response times
node scripts/analyze-logs.js --type performance --last-minutes 30

# Check database performance
node scripts/monitor-db.js --performance

# View resource usage
node scripts/manage.js report --type resources
```

#### Data Inconsistencies
```bash
# Run reconciliation
node scripts/reconcile.js all

# Check specific payment
node scripts/reconcile.js payment <payment-id>

# Verify database state
node scripts/monitor-db.js --verify
```

### 2. Recovery Procedures

#### Event Recovery
```bash
# Identify missing events
node scripts/manage.js recover --find-missing

# Replay failed events
node scripts/manage.js recover --replay-failed

# Verify recovery
node scripts/manage.js recover --verify
```

#### Database Recovery
```bash
# Check data consistency
node scripts/monitor-db.js --check-consistency

# Fix inconsistencies
node scripts/recover-db.js --fix

# Verify fixes
node scripts/monitor-db.js --verify
```

## Backup and Recovery

### 1. Backup Procedures

```bash
#!/bin/bash
# backup.sh

# Backup database
pg_dump -F custom -f backup.dump

# Backup logs
tar -czf logs-backup.tar.gz .logs/

# Backup metrics
tar -czf metrics-backup.tar.gz .metrics/

# Upload to secure storage
aws s3 cp backup.dump s3://backups/
```

### 2. Recovery Procedures

```bash
#!/bin/bash
# recover.sh

# Restore database
pg_restore -F custom -d database backup.dump

# Restore logs
tar -xzf logs-backup.tar.gz

# Verify restoration
node scripts/monitor-db.js --verify
```

## Performance Tuning

### 1. Database Optimization

```sql
-- Analyze tables
ANALYZE stripe_events;
ANALYZE payment_recovery_attempts;

-- Update statistics
VACUUM ANALYZE;

-- Reindex if needed
REINDEX TABLE stripe_events;
```

### 2. Resource Management

```bash
# Monitor resource usage
node scripts/monitor-db.js --resources

# Optimize memory usage
node scripts/manage.js optimize --memory

# Clear caches
node scripts/manage.js optimize --cache
```

## Capacity Planning

### 1. Resource Requirements

#### Minimum Requirements
- CPU: 2 cores
- Memory: 4GB
- Disk: 50GB
- Network: 100Mbps

#### Recommended
- CPU: 4 cores
- Memory: 8GB
- Disk: 200GB
- Network: 1Gbps

### 2. Scaling Guidelines

```typescript
interface ScalingMetrics {
  requestRate: number;
  responseTime: number;
  errorRate: number;
  resourceUsage: number;
}

const SCALING_THRESHOLDS = {
  requestRate: 1000,    // requests per minute
  responseTime: 500,    // milliseconds
  errorRate: 0.01,      // 1%
  resourceUsage: 0.80,  // 80%
};
```

## Documentation

### 1. Runbooks

- [Error Response Guide](./docs/runbooks/error-response.md)
- [Performance Issues](./docs/runbooks/performance.md)
- [Data Recovery](./docs/runbooks/recovery.md)
- [Security Incidents](./docs/runbooks/security.md)

### 2. Architecture

- [System Overview](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)
- [Monitoring Setup](./docs/monitoring.md)
- [Maintenance Procedures](./docs/maintenance.md)

## Contact Information

### On-Call Support
- Primary: +1-XXX-XXX-XXXX
- Secondary: +1-XXX-XXX-XXXX
- Email: oncall@company.com

### Escalation Path
1. On-Call Engineer
2. System Administrator
3. Database Administrator
4. Security Team
5. Management

## Reference

### Useful Commands

```bash
# Quick health check
node scripts/manage.js health

# View current metrics
node scripts/monitor-db.js --metrics

# Check logs
node scripts/analyze-logs.js --last-hours 1

# Run maintenance
node scripts/manage.js maintain
```

### Important Paths

```
/opt/supabase/functions/stripe-webhook/
├── .logs/           # Log files
├── .metrics/        # Metrics data
├── scripts/         # Operations scripts
└── docs/           # Documentation