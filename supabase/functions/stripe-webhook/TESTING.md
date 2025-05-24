# Testing Guide

This document outlines the testing setup for the Stripe webhook handler function.

## Structure

```
stripe-webhook/
├── __tests__/                # Test files and utilities
│   ├── utils.ts             # Shared test utilities and mocks
│   ├── handler.test.ts      # Webhook handler tests
│   ├── logger.test.ts       # Logger implementation tests
│   └── import_map.test.json # Test-specific import map
├── deno.json                # Deno configuration
└── import_map.json          # Project import map
```

## Test Configuration

The project uses Deno's built-in testing framework with the following configuration:

- Import maps for module resolution
- TypeScript for type safety
- ESLint for code quality
- Environment variable handling for configuration

## Running Tests

To run all tests:

```bash
deno test --allow-net --allow-env --allow-read
```

To run tests with watch mode:

```bash
deno task test:watch
```

For coverage report:

```bash
deno task test:coverage
```

## Test Utilities

### MockDatabase

A test implementation of the DatabaseClient interface that stores data in memory. Useful for verifying database operations without actual database connections.

### Mock Stripe Client

A minimal implementation of the Stripe client for testing webhook handlers without making actual API calls.

## Writing Tests

Follow these patterns when writing new tests:

1. Use the provided mock utilities
2. Group related tests using Deno.test() with steps
3. Clean up any environment changes after tests
4. Use type-safe assertions

Example:

```typescript
Deno.test("feature name", async (t) => {
  // Setup
  const mockDb = createMockDb();
  const mockStripe = createMockStripe();
  
  await t.step("should handle specific case", async () => {
    const result = await someOperation();
    assertEquals(result, expectedValue);
  });
});
```

## Environment Variables

For testing, the following environment variables are used:

- `DEBUG`: Controls debug logging in tests
- `STRIPE_SECRET_KEY`: Test mode Stripe API key
- `WEBHOOK_SECRET`: Webhook signing secret

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Merges to main branch
- Release tags

## Contributing

When adding new features:
1. Add corresponding tests
2. Ensure existing tests pass
3. Update documentation if needed
4. Run the full test suite before submitting PR