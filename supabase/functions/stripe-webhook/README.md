# Stripe Webhook Handler

Edge function for processing Stripe webhook events.

## Features

- Handles various Stripe webhook events (payments, subscriptions, refunds)
- Secure webhook signature verification
- Robust error handling and logging
- TypeScript for type safety
- Comprehensive test coverage

## Setup

1. Clone the repository
2. Install Deno (v1.x)
3. Copy `.env.example` to `.env` and configure variables
4. Install dependencies:
   ```bash
   deno cache --reload import_map.json
   ```

## Development

```bash
# Start development server
deno task dev

# Run linter
deno task lint

# Format code
deno task fmt
```

## Testing

This project uses Deno's built-in testing framework with a comprehensive test suite.

### Running Tests

```bash
# Run test script (handles env and runs tests)
./scripts/test.sh

# Run tests in watch mode
./scripts/test.sh watch

# Run tests with coverage
./scripts/test.sh coverage

# Run CI test sequence
./scripts/test.sh ci
```

For detailed testing information, see:
- [Testing Guide](./TESTING.md) - Complete testing documentation
- [.env.example](./.env.example) - Environment variable setup
- [test.yml](./.github/workflows/test.yml) - CI/CD configuration

### Test Structure

```
__tests__/
├── utils.ts           # Shared test utilities
├── handler.test.ts    # Webhook handler tests
├── logger.test.ts     # Logger implementation tests
└── import_map.json    # Test-specific imports
```

## Configuration

Configuration is handled through environment variables:

```bash
# Required
STRIPE_SECRET_KEY=sk_test_...
WEBHOOK_SECRET=whsec_...

# Optional
DEBUG=false
MAX_RETRY_ATTEMPTS=3
WEBHOOK_TIMEOUT_MS=30000
```

See [.env.example](./.env.example) for all available options.

## Deployment

Deploy using Supabase CLI:

```bash
supabase functions deploy stripe-webhook
```

## Type Safety

The project uses TypeScript with:
- Strict type checking
- ESLint configuration
- Import maps for module resolution
- Shared type definitions

## Contributing

1. Create feature branch (`git checkout -b feature/xyz`)
2. Make changes
3. Add tests
4. Run test suite (`./scripts/test.sh ci`)
5. Create Pull Request

## License

MIT License - see [LICENSE](LICENSE)

## Support

- [Issue Tracker](https://github.com/org/repo/issues)
- [Documentation](./docs)
- [Security Policy](./SECURITY.md)