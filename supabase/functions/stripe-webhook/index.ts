import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'stripe';
import { loadConfig, DEFAULT_HEADERS } from './config.ts';
import { createLogger } from './logger.ts';
import { createDatabaseClient } from './db.ts';
import { handleWebhookEvent } from './handler.ts';

// Load environment configuration
const config = loadConfig();

// Initialize Stripe
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize database client
const db = createDatabaseClient(config.supabaseUrl, config.supabaseServiceKey);

// Create base logger
const logger = createLogger();

/**
 * Custom error class for webhook handling
 */
class WebhookError extends Error {
  type: string;
  statusCode: number;
  code?: string;
  detail?: string;

  constructor(message: string, statusCode: number, cause?: unknown) {
    super(message);
    this.name = 'WebhookError';
    this.type = 'WebhookError';
    this.statusCode = statusCode;
    
    if (cause instanceof Error) {
      this.code = cause.name;
      this.detail = cause.message;
    }
  }

  static isWebhookError(error: unknown): error is WebhookError {
    return error instanceof WebhookError;
  }
}

serve(async (req: Request) => {
  // Check for required method
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: DEFAULT_HEADERS,
    });
  }

  // Create request-specific logger
  const requestLogger = logger.child({ requestId: crypto.randomUUID() });

  try {
    // Get the stripe signature header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new WebhookError('No signature found', 401);
    }

    // Get the raw body
    const body = await req.text();
    if (!body) {
      throw new WebhookError('No body found', 400);
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripeWebhookSecret
      );
    } catch (err) {
      throw new WebhookError('Invalid signature', 401, err);
    }

    // Process the webhook event
    await handleWebhookEvent(event, {
      db,
      stripe,
      logger: requestLogger,
    });

    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    // Log the error
    requestLogger.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof WebhookError ? error.type : 'UnknownError',
      code: error instanceof WebhookError ? error.code : undefined,
      detail: error instanceof WebhookError ? error.detail : undefined,
    });

    // Determine status code and error details
    const status = WebhookError.isWebhookError(error) ? error.statusCode : 500;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        ...(WebhookError.isWebhookError(error) && {
          type: error.type,
          code: error.code,
          detail: error.detail,
        }),
      }),
      {
        status,
        headers: {
          ...DEFAULT_HEADERS,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

// Log startup
logger.info('Stripe webhook handler initialized', {
  url: config.supabaseUrl,
  stripeVersion: stripe.getApiField('version'),
});