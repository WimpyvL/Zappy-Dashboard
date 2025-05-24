# Stripe Webhook Handler

A secure and maintainable webhook handler for Stripe events using Supabase Edge Functions.

## Quick Start

1. Install dependencies and setup environment:
```bash
./scripts/setup.sh
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start development server:
```bash
deno task dev
```

## Project Structure

```
├── __tests__/          # Test files
├── scripts/            # Maintenance scripts
├── .env               # Environment variables
├── deno.json         # Deno configuration
├── deps.ts           # Dependencies
├── import_map.json   # Import map
├── index.ts          # Main webhook handler
└── README.md         # This file
```

## Maintenance Scripts

Collection of scripts for managing and maintaining the webhook handler.

### Core Operations

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup.sh` | Complete system setup | `./scripts/setup.sh [--quick]` |
| `manage.sh` | Central management interface | `./scripts/manage.sh [command]` |
| `uninstall.sh` | Clean system removal | `./scripts/uninstall.sh [--no-backup]` |

### Development

| Script | Purpose | Usage |
|--------|---------|-------|
| `install.sh` | Install dependencies | `./scripts/install.sh [--no-dev-tools]` |
| `setup-dev.sh` | Setup development environment | `./scripts/setup-dev.sh [--no-database]` |
| `test-webhook.sh` | Test webhook functionality | `./scripts/test-webhook.sh [--basic]` |

### Deployment

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy.sh` | Deploy webhook handler | `./scripts/deploy.sh [environment]` |
| `validate.sh` | Validate configuration | `./scripts/validate.sh [--quick]` |

### Maintenance

| Script | Purpose | Usage |
|--------|---------|-------|
| `backup.sh` | System backup | `./scripts/backup.sh [--no-encrypt]` |
| `cleanup.sh` | System cleanup | `./scripts/cleanup.sh [--logs-only]` |
| `maintain-db.sh` | Database maintenance | `./scripts/maintain-db.sh [--vacuum]` |

### Monitoring

| Script | Purpose | Usage |
|--------|---------|-------|
| `monitor.sh` | System monitoring | `./scripts/monitor.sh [--dashboard]` |
| `health-check.sh` | Health monitoring | `./scripts/health-check.sh [--once]` |
| `analyze-logs.sh` | Log analysis | `./scripts/analyze-logs.sh [--report]` |

### Security

| Script | Purpose | Usage |
|--------|---------|-------|
| `security.sh` | Security checks and fixes | `./scripts/security.sh [--audit]` |
| `rotate-logs.sh` | Log rotation | `./scripts/rotate-logs.sh [--force]` |

## Configuration

### Environment Variables

Required variables:
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

Optional variables:
- `LOG_LEVEL`: Logging level (default: "info")
- `METRICS_PORT`: Monitoring port (default: 9090)
- `BACKUP_RETENTION_DAYS`: Days to keep backups (default: 30)

### Database

The webhook handler requires a PostgreSQL database with the following tables:
- `stripe_events`: Stores processed webhook events
- `stripe_metrics`: Stores performance metrics

Run migrations:
```bash
supabase db push
```

## Development

1. Setup development environment:
```bash
./scripts/setup-dev.sh
```

2. Start development server:
```bash
deno task dev
```

3. Run tests:
```bash
deno test
```

## Deployment

1. Validate configuration:
```bash
./scripts/validate.sh
```

2. Deploy to environment:
```bash
./scripts/deploy.sh production
```

3. Verify deployment:
```bash
./scripts/deploy.sh --verify
```

## Monitoring

1. Start monitoring dashboard:
```bash
./scripts/monitor.sh --dashboard
```

2. Check system health:
```bash
./scripts/health-check.sh
```

3. Analyze logs:
```bash
./scripts/analyze-logs.sh --report
```

## Maintenance

1. Backup system:
```bash
./scripts/backup.sh
```

2. Clean up system:
```bash
./scripts/cleanup.sh
```

3. Maintain database:
```bash
./scripts/maintain-db.sh
```

## Security

1. Run security audit:
```bash
./scripts/security.sh --audit
```

2. Fix security issues:
```bash
./scripts/security.sh --fix
```

## Troubleshooting

1. Check system health:
```bash
./scripts/health-check.sh --verbose
```

2. View logs:
```bash
./scripts/analyze-logs.sh --tail
```

3. Validate configuration:
```bash
./scripts/validate.sh --fix
```

## Contributing

1. Setup development environment:
```bash
./scripts/setup-dev.sh
```

2. Create feature branch:
```bash
git checkout -b feature/your-feature
```

3. Run tests:
```bash
deno test
```

4. Submit pull request

## License

MIT License - See [LICENSE](LICENSE) for details.