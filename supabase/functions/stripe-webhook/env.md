# Environment Variables Documentation

This document describes all environment variables used in the Stripe webhook handler.

## Core Configuration

### Node Environment
- `NODE_ENV`: Environment mode (development, test, staging, production)
- `DEBUG`: Enable debug mode (true/false)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

### Stripe Configuration
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe
- `STRIPE_API_VERSION`: Stripe API version to use

### Supabase Configuration
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase
- `SUPABASE_DB_URL`: Direct database connection URL

## Performance Settings

### Request Handling
- `MAX_CONCURRENT_REQUESTS`: Maximum concurrent webhook requests
- `REQUEST_TIMEOUT_MS`: Request timeout in milliseconds
- `RATE_LIMIT_REQUESTS`: Rate limit requests per window
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds

### Database Pool
- `DB_POOL_SIZE`: Database connection pool size
- `DB_IDLE_TIMEOUT`: Database idle connection timeout
- `DB_CONNECT_TIMEOUT`: Database connection timeout
- `DB_SSL_MODE`: SSL mode for database connection

### Caching
- `ENABLE_CACHING`: Enable response caching
- `CACHE_TTL`: Cache time-to-live in seconds
- `CACHE_MAX_ITEMS`: Maximum items in cache
- `CACHE_PRUNE_INTERVAL`: Cache cleanup interval

## Monitoring Configuration

### Metrics
- `METRICS_PORT`: Port for metrics server
- `METRICS_INTERVAL`: Metrics collection interval
- `METRICS_RETENTION_DAYS`: Days to keep metrics
- `ENABLE_DETAILED_METRICS`: Enable detailed metrics collection

### Alerting
- `ALERT_WEBHOOK_URL`: Webhook URL for alerts
- `ALERT_EMAIL`: Email for critical alerts
- `ALERT_THRESHOLD_ERRORS`: Error count threshold for alerts
- `ALERT_THRESHOLD_LATENCY`: Latency threshold in ms
- `ALERT_THRESHOLD_MEMORY`: Memory usage threshold %
- `ALERT_THRESHOLD_CPU`: CPU usage threshold %

### Tracing
- `ENABLE_TRACING`: Enable request tracing
- `TRACK_PERFORMANCE`: Track performance metrics
- `TRACK_MEMORY`: Track memory usage
- `TRACK_DATABASE`: Track database metrics

## Security Configuration

### TLS/SSL
- `TLS_CERT_PATH`: TLS certificate path
- `TLS_KEY_PATH`: TLS private key path
- `TLS_MIN_VERSION`: Minimum TLS version

### Access Control
- `ALLOWED_IPS`: Comma-separated list of allowed IPs
- `ENABLE_IP_FILTERING`: Enable IP filtering
- `RATE_LIMIT_BY_IP`: Enable per-IP rate limiting
- `RATE_LIMIT_WHITELIST`: IPs exempt from rate limiting

## Backup Configuration

### Backup Settings
- `BACKUP_ENABLED`: Enable automatic backups
- `BACKUP_RETENTION_DAYS`: Days to keep backups
- `BACKUP_ENCRYPTION_KEY`: GPG key for backup encryption
- `BACKUP_STORAGE_URL`: Backup storage location

### Log Rotation
- `LOG_ROTATION_DAYS`: Days to keep logs
- `LOG_MAX_SIZE`: Maximum log file size
- `LOG_COMPRESSION`: Enable log compression
- `LOG_BACKUP_COUNT`: Number of log backups to keep

## Maintenance Configuration

### Scheduling
- `MAINTENANCE_WINDOW`: Cron schedule for maintenance
- `MAINTENANCE_MAX_DURATION`: Maximum maintenance duration
- `CLEANUP_SCHEDULE`: Cleanup cron schedule
- `RECONCILIATION_SCHEDULE`: Data reconciliation schedule

### Resource Limits
- `MAX_MEMORY_MB`: Maximum memory usage
- `MAX_CPU_CORES`: Maximum CPU cores
- `MAX_DISK_GB`: Maximum disk usage
- `TEMP_DIR`: Temporary directory path

## Development Features

### Debug Options
- `ENABLE_DEBUG_ENDPOINTS`: Enable debug endpoints
- `ENABLE_TEST_HELPERS`: Enable test helper functions
- `ENABLE_API_DOCS`: Enable API documentation
- `SHOW_STACK_TRACES`: Show detailed error traces

### Testing
- `TEST_MODE`: Enable test mode
- `MOCK_STRIPE_RESPONSES`: Mock Stripe API responses
- `SIMULATE_LATENCY`: Add artificial latency
- `SIMULATED_LATENCY_MS`: Simulated latency in ms

## Environment-Specific Configuration

### Production Only
- `ENABLE_FAILOVER`: Enable high availability
- `REPLICA_COUNT`: Number of replicas
- `HEALTH_CHECK_INTERVAL`: Health check frequency
- `ENABLE_AUTO_SCALING`: Enable auto-scaling

### Development Only
- `ENABLE_LIVE_RELOAD`: Enable live reload
- `ENABLE_PLAYGROUND`: Enable API playground
- `GENERATE_FAKE_DATA`: Generate test data
- `AUTO_RELOAD_TEMPLATES`: Auto-reload templates

## Usage

Each environment has its own configuration file:
- `.env.development` - Local development
- `.env.test` - Testing environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Use the `env.sh` script to manage environments:
```bash
# List environments
./scripts/env.sh list

# Switch environment
./scripts/env.sh switch development

# Validate environment
./scripts/env.sh validate
```

## Security Notes

1. Never commit actual `.env` files to version control
2. Use appropriate key rotation policies
3. Keep sensitive values secure
4. Use different values for different environments
5. Regularly audit environment configurations