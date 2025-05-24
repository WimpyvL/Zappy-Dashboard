# Stripe Webhook Handler - Installation Guide

This guide walks through the setup and installation of the Stripe webhook handler and its maintenance tools.

## Prerequisites

- Node.js >= 18.0.0
- Deno >= 1.32.3
- PostgreSQL client tools
- systemd (for automated maintenance)
- Supabase CLI
- Stripe CLI (optional, for local testing)

## Installation Steps

### 1. Clone and Initial Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd supabase/functions/stripe-webhook

# Run setup script
bash scripts/setup.sh
```

### 2. Environment Configuration

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key from Supabase

### 3. Database Setup

```bash
# Apply database migrations
supabase migration up

# Verify database connection
node scripts/monitor-db.js --check
```

### 4. Install Maintenance Service

Install the systemd service for automated maintenance (requires root):

```bash
sudo bash scripts/install-service.sh install
```

This will:
- Create required directories
- Install systemd service files
- Configure environment
- Enable and start the maintenance timer

### 5. Verify Installation

```bash
# Check service status
sudo systemctl status stripe-webhook-maintenance.timer
sudo systemctl status stripe-webhook-maintenance.service

# Run manual health check
node scripts/manage.js health

# Send test webhook
node scripts/test-webhook.js paymentSuccess
```

## Directory Structure

```
stripe-webhook/
├── __tests__/          # Test files
├── scripts/            # Maintenance and utility scripts
├── .env               # Environment configuration
├── .env.example       # Example environment file
├── config.toml        # Function configuration
├── deno.json         # Deno configuration
├── import_map.json   # Import map for Deno
├── index.ts          # Main webhook handler
└── types.ts          # TypeScript type definitions
```

## Maintenance Tools

### Manual Maintenance

```bash
# Run all maintenance tasks
node scripts/manage.js maintain

# Run quick maintenance only
node scripts/manage.js maintain --quick

# Generate maintenance report
node scripts/manage.js report
```

### Database Recovery

```bash
# Run database recovery procedures
node scripts/manage.js recover

# Run data reconciliation with Stripe
node scripts/reconcile.js all
```

### Monitoring

```bash
# Monitor database metrics
node scripts/monitor-db.js

# Analyze webhook logs
node scripts/analyze-logs.js

# Run error tests
bash scripts/test-errors.sh
```

### Load Testing

```bash
# Run load test with default settings
node scripts/load-test.js

# Run with custom concurrency and total requests
node scripts/load-test.js 20 1000
```

## Debugging

1. Start Chrome in debug mode:
```bash
cd scripts
npm run chrome:debug
```

2. Connect to Chrome debugger:
```bash
npm start
```

3. Use VSCode debugging:
   - Open command palette (Ctrl/Cmd + Shift + P)
   - Select "Debug: Select and Start Debugging"
   - Choose "Debug Edge Function" configuration

## Troubleshooting

### Common Issues

1. **Webhook Authentication Failures**
   - Verify `STRIPE_WEBHOOK_SECRET` in `.env`
   - Check webhook configuration in Stripe Dashboard

2. **Database Connection Issues**
   - Verify Supabase credentials in `.env`
   - Check database status: `node scripts/monitor-db.js --check`

3. **Maintenance Service Failures**
   - Check service logs: `journalctl -u stripe-webhook-maintenance`
   - Verify permissions on directories and files
   - Check available disk space

### Getting Help

1. Check the logs:
```bash
# View webhook logs
tail -f .logs/webhook.log

# View maintenance logs
sudo journalctl -u stripe-webhook-maintenance -f
```

2. Generate diagnostic report:
```bash
node scripts/manage.js report
```

3. Run health check:
```bash
node scripts/manage.js health
```

## Security Considerations

1. **Environment Variables**
   - Keep `.env` file secure and restricted
   - Regularly rotate Stripe and Supabase keys
   - Never commit sensitive credentials

2. **Access Control**
   - Maintain strict file permissions
   - Use service account for maintenance tasks
   - Restrict network access appropriately

3. **Monitoring**
   - Regularly review logs for suspicious activity
   - Monitor error rates and performance metrics
   - Set up alerts for critical issues

## Updating

1. Pull latest changes:
```bash
git pull origin main
```

2. Run setup:
```bash
bash scripts/setup.sh
```

3. Apply any database migrations:
```bash
supabase migration up
```

4. Restart services:
```bash
sudo systemctl restart stripe-webhook-maintenance.timer
```

## Uninstallation

1. Stop and remove services:
```bash
sudo bash scripts/install-service.sh uninstall
```

2. Remove files:
```bash
# Be careful with this command
sudo rm -rf /opt/supabase/functions/stripe-webhook
```

3. Clean up database (optional):
```sql
DROP TABLE IF EXISTS stripe_events;
DROP TABLE IF EXISTS payment_recovery_attempts;