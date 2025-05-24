/**
 * Logger interface for consistent logging across the application
 */
export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

/**
 * Creates a logger instance with the specified configuration
 * @returns A Logger instance
 */
export function createLogger(): Logger {
  return {
    info(message: string, data?: Record<string, unknown>) {
      console.info(message, data ? JSON.stringify(data, null, 2) : '');
    },

    warn(message: string, data?: Record<string, unknown>) {
      console.warn(message, data ? JSON.stringify(data, null, 2) : '');
    },

    error(message: string, error?: Error, data?: Record<string, unknown>) {
      console.error(
        message,
        error ? `\nError: ${error.message}\nStack: ${error.stack}` : '',
        data ? `\nData: ${JSON.stringify(data, null, 2)}` : ''
      );
    },

    debug(message: string, data?: Record<string, unknown>) {
      if (Deno.env.get('DEBUG')) {
        console.debug(message, data ? JSON.stringify(data, null, 2) : '');
      }
    },
  };
}