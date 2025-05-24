# Migration Guide - Stripe Webhook Handler

This document provides instructions for upgrading between versions of the webhook handler and handling data migrations.

## Version Migration Paths

### 1.0.0 → 1.1.0

#### Database Changes

```sql
-- Add new columns to stripe_events
ALTER TABLE stripe_events
ADD COLUMN metadata jsonb,
ADD COLUMN processed_at timestamptz,
ADD COLUMN processing_attempts integer DEFAULT 0;

-- Create index for performance
CREATE INDEX idx_stripe_events_processed 
ON stripe_events(processed_at) 
WHERE processed_at IS NULL;

-- Add event tracking improvements
CREATE TABLE stripe_event_processing (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id text REFERENCES stripe_events(event_id),
    attempt_number integer NOT NULL,
    status text NOT NULL,
    error_message text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### Configuration Updates

```diff
# .env changes
- STRIPE_API_VERSION=2023-10-16
+ STRIPE_API_VERSION=2024-01-01

+ EVENT_PROCESSING_MAX_ATTEMPTS=3
+ EVENT_PROCESSING_RETRY_DELAY=300
```

#### Code Migration

```typescript
// Before
async function handleWebhookEvent(event: StripeEvent) {
  await processEvent(event);
}

// After
async function handleWebhookEvent(event: StripeEvent) {
  const processing = await startEventProcessing(event);
  try {
    await processEvent(event);
    await completeEventProcessing(processing, 'success');
  } catch (error) {
    await completeEventProcessing(processing, 'error', error);
    throw error;
  }
}
```

### 1.1.0 → 1.2.0

#### Database Changes

```sql
-- Add support for event batching
CREATE TABLE stripe_event_batches (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id text NOT NULL UNIQUE,
    status text NOT NULL,
    event_count integer NOT NULL,
    processed_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add batch relationship to events
ALTER TABLE stripe_events
ADD COLUMN batch_id uuid REFERENCES stripe_event_batches(id);

-- Add performance improvements
CREATE INDEX idx_stripe_events_batch 
ON stripe_events(batch_id) 
WHERE batch_id IS NOT NULL;

-- Add archival support
CREATE TABLE stripe_events_archive
(LIKE stripe_events INCLUDING ALL);

-- Create archival function
CREATE OR REPLACE FUNCTION archive_old_events(
    older_than interval,
    batch_size integer DEFAULT 1000
) RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    archived_count integer;
BEGIN
    WITH moved_rows AS (
        DELETE FROM stripe_events
        WHERE created_at < (now() - older_than)
        RETURNING *
    )
    INSERT INTO stripe_events_archive
    SELECT * FROM moved_rows;

    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$;
```

#### Configuration Updates

```diff
# config.toml changes
[storage]
- retention_days = 90
+ retention_days = 180
+ archive_enabled = true

[processing]
+ batch_size = 100
+ max_concurrent_batches = 5
```

#### Service Updates

```bash
# Stop current service
sudo systemctl stop stripe-webhook-maintenance

# Install new service configuration
sudo bash scripts/install-service.sh upgrade

# Start updated service
sudo systemctl start stripe-webhook-maintenance
```

## Data Migration

### Backup Current Data

```bash
#!/bin/bash
# backup-data.sh

# Set backup directory
BACKUP_DIR="/opt/supabase/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup database tables
pg_dump -t stripe_events -t payment_recovery_attempts \
  -F custom -f "$BACKUP_DIR/webhook_data.dump"

# Backup logs
tar -czf "$BACKUP_DIR/logs.tar.gz" .logs/

# Backup metrics
tar -czf "$BACKUP_DIR/metrics.tar.gz" .metrics/

echo "Backup completed: $BACKUP_DIR"
```

### Perform Migration

```bash
#!/bin/bash
# migrate-data.sh

# Stop services
sudo systemctl stop stripe-webhook-maintenance

# Run database migrations
psql -f migrations/upgrade.sql

# Verify data integrity
node scripts/verify-data.js

# Update configuration
cp config.toml.new config.toml

# Start services
sudo systemctl start stripe-webhook-maintenance

echo "Migration completed"
```

### Verify Migration

```bash
#!/bin/bash
# verify-migration.sh

# Check database
node scripts/monitor-db.js --verify

# Test webhook handling
node scripts/test-webhook.js all

# Verify metrics
node scripts/analyze-logs.js --verify

echo "Verification completed"
```

## Rollback Procedures

### Quick Rollback

```bash
#!/bin/bash
# rollback.sh

# Stop services
sudo systemctl stop stripe-webhook-maintenance

# Restore database
pg_restore -c -F custom -d database webhook_data.dump

# Restore configuration
cp config.toml.bak config.toml

# Start previous version
sudo systemctl start stripe-webhook-maintenance.bak

echo "Rollback completed"
```

### Full Rollback

```bash
#!/bin/bash
# full-rollback.sh

# Stop all services
sudo systemctl stop stripe-webhook-maintenance

# Restore database from backup
pg_restore -c -F custom -d database "$BACKUP_DIR/webhook_data.dump"

# Restore logs
tar -xzf "$BACKUP_DIR/logs.tar.gz"

# Restore metrics
tar -xzf "$BACKUP_DIR/metrics.tar.gz"

# Restore previous version
git checkout v1.1.0

# Reinstall previous version
bash scripts/setup.sh

echo "Full rollback completed"
```

## Troubleshooting

### Common Issues

1. **Database Migration Failures**
```bash
# Check migration status
psql -c "SELECT * FROM schema_migrations ORDER BY executed_at DESC LIMIT 5;"

# Retry failed migration
psql -f migrations/retry.sql
```

2. **Data Inconsistencies**
```bash
# Run data verification
node scripts/verify-data.js

# Fix inconsistencies
node scripts/reconcile.js all
```

3. **Service Issues**
```bash
# Check service status
sudo systemctl status stripe-webhook-maintenance

# View service logs
journalctl -u stripe-webhook-maintenance -n 100
```

## Version History

### 1.2.0
- Added event batching
- Improved performance
- Added archival support
- Enhanced monitoring

### 1.1.0
- Added event tracking
- Improved error handling
- Enhanced retry logic
- Updated Stripe API version

### 1.0.0
- Initial release
- Basic webhook handling
- Event processing
- Error recovery