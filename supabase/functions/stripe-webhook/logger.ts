import { LOG_LEVELS } from './config.ts';

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

interface LogContext {
  [key: string]: unknown;
}

interface LogMessage {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  requestId?: string;
}

interface LoggerOptions {
  minLevel?: LogLevel;
  requestId?: string;
}

class Logger {
  private minLevel: LogLevel;
  private requestId?: string;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel || LOG_LEVELS.INFO;
    this.requestId = options.requestId;
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const levelMap = {
      [LOG_LEVELS.ERROR]: 0,
      [LOG_LEVELS.WARN]: 1,
      [LOG_LEVELS.INFO]: 2,
      [LOG_LEVELS.DEBUG]: 3,
    };

    // Only log if level is higher priority than minimum level
    if (levelMap[level] > levelMap[this.minLevel]) {
      return;
    }

    const logMessage: LogMessage = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    if (this.requestId) {
      logMessage.requestId = this.requestId;
    }

    // In production, you might want to send logs to a logging service
    // For now, just use console methods
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(this.formatMessage(logMessage));
        break;
      case LOG_LEVELS.WARN:
        console.warn(this.formatMessage(logMessage));
        break;
      case LOG_LEVELS.INFO:
        console.info(this.formatMessage(logMessage));
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(this.formatMessage(logMessage));
        break;
    }
  }

  /**
   * Format a log message for output
   */
  private formatMessage(logMessage: LogMessage): string {
    const { level, message, context, timestamp, requestId } = logMessage;
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (requestId) {
      formatted = `${formatted} (Request ID: ${requestId})`;
    }

    if (context) {
      formatted = `${formatted}\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    return formatted;
  }

  /**
   * Create a child logger with additional context
   */
  child(options: LoggerOptions): Logger {
    return new Logger({
      minLevel: this.minLevel,
      requestId: options.requestId || this.requestId,
    });
  }

  /**
   * Create an error object with logging
   */
  createError(message: string, context?: LogContext): Error {
    this.error(message, context);
    return new Error(message);
  }

  /**
   * Log and rethrow an error
   */
  logAndRethrow(error: Error, context?: LogContext): never {
    this.error(error.message, {
      ...context,
      stack: error.stack,
    });
    throw error;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory function for creating loggers with custom options
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

// Export types
export type { LogLevel, LogContext, LogMessage, LoggerOptions };