import { WebhookError } from './types.ts';

/**
 * Environment configuration interface
 */
interface Config {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
}

/**
 * Load and validate environment configuration
 */
export function loadConfig(): Config {
  const config = {
    stripeSecretKey: Deno.env.get('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: Deno.env.get('STRIPE_WEBHOOK_SECRET'),
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  };

  // Validate required environment variables
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const error = new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    ) as WebhookError;
    error.type = 'ConfigurationError';
    error.code = 'ENV_MISSING';
    error.statusCode = 500;
    throw error;
  }

  return config as Config;
}

/**
 * Runtime configuration singleton
 */
export const config = loadConfig();

/**
 * Constants
 */
export const ALLOWED_STRIPE_VERSIONS = ['2023-10-16'];
export const DEFAULT_SUCCESS_URL = 'https://app.example.com/payment/success';
export const DEFAULT_CANCEL_URL = 'https://app.example.com/payment/cancel';

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_INTERVALS = [1, 3, 7]; // Days between retry attempts

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export const CORS_CONFIG = {
  allowedOrigins: ['https://app.example.com'],
  allowedMethods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'stripe-signature'],
  maxAge: 86400, // 24 hours
};

/**
 * Validation functions
 */
export function validateStripeVersion(version: string): boolean {
  return ALLOWED_STRIPE_VERSIONS.includes(version);
}

export function validateSuccessUrl(url: string | undefined): string {
  if (!url) return DEFAULT_SUCCESS_URL;
  try {
    new URL(url);
    return url;
  } catch {
    return DEFAULT_SUCCESS_URL;
  }
}

export function validateCancelUrl(url: string | undefined): string {
  if (!url) return DEFAULT_CANCEL_URL;
  try {
    new URL(url);
    return url;
  } catch {
    return DEFAULT_CANCEL_URL;
  }
}

export function validateRetryAttempt(attemptNumber: number): boolean {
  return attemptNumber > 0 && attemptNumber <= MAX_RETRY_ATTEMPTS;
}

export function getRetryInterval(attemptNumber: number): number {
  return RETRY_INTERVALS[attemptNumber - 1] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1];
}

/**
 * Default response headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': CORS_CONFIG.allowedOrigins[0],
  'Access-Control-Allow-Methods': CORS_CONFIG.allowedMethods.join(', '),
  'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
  'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
};