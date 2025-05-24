import { assertEquals, assertMatch } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { createLogger } from '../logger.ts';
import { LOG_LEVELS } from '../config.ts';

// Mock console methods
const mockConsole = {
  error: [] as string[],
  warn: [] as string[],
  info: [] as string[],
  verbose: [] as string[],
};

// Store original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Setup and teardown console mocks
function setupConsoleMocks() {
  console.error = (msg: string) => mockConsole.error.push(msg);
  console.warn = (msg: string) => mockConsole.warn.push(msg);
  console.info = (msg: string) => mockConsole.info.push(msg);
}

function teardownConsoleMocks() {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  mockConsole.error = [];
  mockConsole.warn = [];
  mockConsole.info = [];
  mockConsole.verbose = [];
}

Deno.test('Logger', async (t) => {
  await t.step('basic logging', async (t) => {
    setupConsoleMocks();

    const logger = createLogger();

    await t.step('should log error messages', () => {
      logger.error('Test error');
      assertEquals(mockConsole.error.length, 1);
      assertMatch(mockConsole.error[0], /ERROR: Test error/);
    });

    await t.step('should log warning messages', () => {
      logger.warn('Test warning');
      assertEquals(mockConsole.warn.length, 1);
      assertMatch(mockConsole.warn[0], /WARN: Test warning/);
    });

    await t.step('should log info messages', () => {
      logger.info('Test info');
      assertEquals(mockConsole.info.length, 1);
      assertMatch(mockConsole.info[0], /INFO: Test info/);
    });

    teardownConsoleMocks();
  });

  await t.step('log levels', async (t) => {
    setupConsoleMocks();

    await t.step('should respect minimum log level', () => {
      const logger = createLogger({ minLevel: LOG_LEVELS.WARN });

      logger.info('Info message');      // Should not log
      logger.warn('Warning message');   // Should log
      logger.error('Error message');    // Should log

      assertEquals(mockConsole.info.length, 0);
      assertEquals(mockConsole.warn.length, 1);
      assertEquals(mockConsole.error.length, 1);
    });

    teardownConsoleMocks();
  });

  await t.step('context and formatting', async (t) => {
    setupConsoleMocks();

    const logger = createLogger();
    const context = { userId: '123', action: 'test' };

    await t.step('should include context in log messages', () => {
      logger.info('Test with context', context);
      const logMessage = mockConsole.info[0];
      assertMatch(logMessage, /INFO: Test with context/);
      assertMatch(logMessage, /"userId": "123"/);
      assertMatch(logMessage, /"action": "test"/);
    });

    await t.step('should include timestamp', () => {
      logger.info('Test timestamp');
      assertMatch(mockConsole.info[1], /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    teardownConsoleMocks();
  });

  await t.step('request tracking', async (t) => {
    setupConsoleMocks();

    await t.step('should include request ID when provided', () => {
      const logger = createLogger({ requestId: 'req_123' });
      logger.info('Test request');
      assertMatch(mockConsole.info[0], /Request ID: req_123/);
    });

    await t.step('should create child loggers with request ID', () => {
      const parentLogger = createLogger({ requestId: 'req_123' });
      const childLogger = parentLogger.child({});
      childLogger.info('Test child logger');
      assertMatch(mockConsole.info[1], /Request ID: req_123/);
    });

    teardownConsoleMocks();
  });

  await t.step('error handling', async (t) => {
    setupConsoleMocks();

    const logger = createLogger();

    await t.step('should create error with logging', () => {
      const error = logger.createError('Test error', { code: 'TEST_ERROR' });
      assertEquals(error instanceof Error, true);
      assertEquals(error.message, 'Test error');
      assertMatch(mockConsole.error[0], /code.*TEST_ERROR/);
    });

    await t.step('should log and rethrow errors', () => {
      const error = new Error('Test error');
      try {
        logger.logAndRethrow(error, { code: 'TEST_ERROR' });
      } catch (e) {
        assertEquals(e, error);
      }
      assertMatch(mockConsole.error[1], /Test error/);
      assertMatch(mockConsole.error[1], /code.*TEST_ERROR/);
    });

    teardownConsoleMocks();
  });
});