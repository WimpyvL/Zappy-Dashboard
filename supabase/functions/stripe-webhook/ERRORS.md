# Error Handling Guide - Stripe Webhook Handler

This guide documents common errors, troubleshooting steps, and error handling best practices for the Stripe webhook handler.

## Error Categories

### 1. Webhook Validation Errors

```typescript
export enum WebhookValidationError {
  MISSING_SIGNATURE = 'missing_signature',
  INVALID_SIGNATURE = 'invalid_signature',
  EXPIRED_SIGNATURE = 'expired_signature',
  INVALID_PAYLOAD = 'invalid_payload',
}

interface ValidationError {
  code: WebhookValidationError;
  status: 401 | 400;
  message: string;
  retryable: false;
}
```

#### Common Scenarios
1. **Missing Signature**
   ```json
   {
     "error": {
       "code": "missing_signature",
       "message": "No signature found in request headers",
       "status": 401
     }
   }
   ```

2. **Invalid Signature**
   ```json
   {
     "error": {
       "code": "invalid_signature",
       "message": "Signature verification failed",
       "status": 401
     }
   }
   ```

### 2. Processing Errors

```typescript
export enum ProcessingError {
  DATABASE_ERROR = 'database_error',
  STRIPE_API_ERROR = 'stripe_api_error',
  INVALID_EVENT = 'invalid_event',
  DUPLICATE_EVENT = 'duplicate_event',
}

interface ProcessingError {
  code: ProcessingError;
  status: 500 | 409;
  message: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}
```

#### Examples

1. **Database Error**
   ```json
   {
     "error": {
       "code": "database_error",
       "message": "Failed to store event",
       "status": 500,
       "retryable": true,
       "context": {
         "operation": "insert",
         "table": "stripe_events"
       }
     }
   }
   ```

2. **Duplicate Event**
   ```json
   {
     "error": {
       "code": "duplicate_event",
       "message": "Event already processed",
       "status": 409,
       "retryable": false,
       "context": {
         "eventId": "evt_123",
         "processedAt": "2025-05-24T00:48:30Z"
       }
     }
   }
   ```

### 3. Business Logic Errors

```typescript
export enum BusinessError {
  INVALID_STATUS_TRANSITION = 'invalid_status_transition',
  MISSING_REFERENCE = 'missing_reference',
  INVALID_AMOUNT = 'invalid_amount',
  SUBSCRIPTION_CONFLICT = 'subscription_conflict',
}

interface BusinessError {
  code: BusinessError;
  status: 422;
  message: string;
  retryable: false;
  details: Record<string, unknown>;
}
```

## Error Handling Patterns

### 1. Generic Error Handler

```typescript
async function handleError(error: Error): Promise<Response> {
  // Log error
  logger.error('Error processing webhook', {
    error: error.message,
    stack: error.stack,
    code: error instanceof WebhookError ? error.code : 'unknown',
  });

  // Create safe response
  const response = createErrorResponse(error);

  // Record metric
  metrics.incrementCounter('webhook_errors', {
    type: response.error.code,
  });

  return new Response(JSON.stringify(response), {
    status: response.error.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 2. Retry Logic

```typescript
class RetryStrategy {
  private attempts = 0;
  private readonly maxAttempts: number;
  private readonly delays: number[];

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!this.shouldRetry(error)) {
        throw error;
      }

      const delay = this.getDelay();
      await this.wait(delay);
      return this.execute(operation);
    }
  }

  private shouldRetry(error: Error): boolean {
    return (
      this.attempts < this.maxAttempts &&
      error instanceof WebhookError &&
      error.retryable
    );
  }
}
```

## Recovery Procedures

### 1. Event Recovery

```typescript
async function recoverFailedEvent(eventId: string): Promise<void> {
  // Load event
  const event = await db.getEvent(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Check Stripe state
  const stripeEvent = await stripe.events.retrieve(eventId);
  
  // Reconcile state
  await reconcileEventState(event, stripeEvent);
  
  // Reprocess if needed
  if (needsReprocessing(event)) {
    await reprocessEvent(event);
  }
}
```

### 2. Database Recovery

```typescript
async function repairDatabaseState(): Promise<void> {
  // Find inconsistencies
  const issues = await findDataInconsistencies();

  // Fix each issue
  for (const issue of issues) {
    try {
      await fixInconsistency(issue);
      await logRecoveryAction(issue, 'success');
    } catch (error) {
      await logRecoveryAction(issue, 'failed', error);
    }
  }
}
```

## Monitoring and Alerts

### 1. Error Metrics

```typescript
interface ErrorMetrics {
  count: number;
  rate: number;
  types: Record<string, number>;
  responseTime: number;
  lastError: {
    timestamp: Date;
    code: string;
    message: string;
  };
}

function trackError(error: WebhookError): void {
  metrics.increment('errors', {
    type: error.code,
    retryable: error.retryable,
  });
}
```

### 2. Alert Conditions

```typescript
interface AlertConfig {
  errorRateThreshold: number;
  errorBurstThreshold: number;
  consecutiveFailuresThreshold: number;
  responseTimeThreshold: number;
}

function checkAlertConditions(metrics: ErrorMetrics): void {
  if (metrics.rate > config.errorRateThreshold) {
    alerts.send('High error rate detected', {
      rate: metrics.rate,
      threshold: config.errorRateThreshold,
    });
  }
}
```

## Troubleshooting Steps

### 1. Webhook Issues

1. Verify Stripe configuration
   ```bash
   stripe webhooks list
   ```

2. Check webhook logs
   ```bash
   tail -f .logs/webhook.log | grep error
   ```

3. Verify event processing
   ```bash
   node scripts/verify-webhook.js <event_id>
   ```

### 2. Database Issues

1. Check connections
   ```sql
   SELECT * FROM pg_stat_activity 
   WHERE application_name LIKE 'webhook%';
   ```

2. View recent errors
   ```sql
   SELECT * FROM webhook_errors 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. Check data consistency
   ```bash
   node scripts/check-consistency.js
   ```

## Best Practices

### 1. Error Logging

```typescript
// DO: Include context
logger.error('Failed to process payment', {
  eventId,
  paymentId,
  error: error.message,
  stack: error.stack,
});

// DON'T: Log sensitive data
logger.error(`Card declined: ${cardNumber}`);
```

### 2. Error Responses

```typescript
// DO: Return safe errors
return {
  error: {
    code: 'processing_error',
    message: 'Failed to process webhook',
    requestId: context.requestId,
  },
};

// DON'T: Expose internal details
return {
  error: {
    message: error.stack,
    query: sqlQuery,
    data: sensitiveData,
  },
};
```

### 3. Recovery Actions

```typescript
// DO: Log recovery attempts
await logRecoveryAction({
  eventId,
  action: 'retry',
  attempt: attempt + 1,
  result: 'success',
});

// DON'T: Silent recovery
await retryEvent(eventId); // No logging
```

## Support Resources

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Error Codes Reference](./docs/error-codes.md)
- [Recovery Procedures](./docs/recovery.md)
- [Support Contacts](./SUPPORT.md)