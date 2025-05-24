import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { type Logger, createLogger } from "@logger";

Deno.test("Logger Implementation", async (t) => {
  const messages: Array<{ level: string; message: string; data?: unknown }> = [];

  // Create a test logger that captures messages
  const testLogger: Logger = {
    info(message: string, data?: Record<string, unknown>) {
      messages.push({ level: "info", message, data });
    },
    warn(message: string, data?: Record<string, unknown>) {
      messages.push({ level: "warn", message, data });
    },
    error(message: string, error?: Error, data?: Record<string, unknown>) {
      messages.push({ 
        level: "error", 
        message, 
        data: { 
          error: error?.message, 
          stack: error?.stack,
          ...data 
        } 
      });
    },
    debug(message: string, data?: Record<string, unknown>) {
      if (Deno.env.get("DEBUG")) {
        messages.push({ level: "debug", message, data });
      }
    },
  };

  await t.step("should log info messages with data", () => {
    const testMessage = "Test info message";
    const testData = { key: "value" };
    
    testLogger.info(testMessage, testData);
    
    const lastMessage = messages.at(-1);
    assertEquals(lastMessage?.level, "info");
    assertEquals(lastMessage?.message, testMessage);
    assertEquals(lastMessage?.data, testData);
  });

  await t.step("should log error messages with error details", () => {
    const testMessage = "Test error message";
    const testError = new Error("Test error");
    const testData = { errorCode: 500 };
    
    testLogger.error(testMessage, testError, testData);
    
    const lastMessage = messages.at(-1);
    assertEquals(lastMessage?.level, "error");
    assertEquals(lastMessage?.message, testMessage);
    assertEquals((lastMessage?.data as Record<string, unknown>)?.error, testError.message);
    assertEquals((lastMessage?.data as Record<string, unknown>)?.errorCode, testData.errorCode);
  });

  await t.step("should conditionally log diagnostic information", () => {
    const initialCount = messages.length;
    const diagnosticMessage = "Test diagnostic info";

    // Verify behavior when DEBUG is not set
    Deno.env.delete("DEBUG");
    testLogger.info(diagnosticMessage);
    assertEquals(messages.length, initialCount + 1, "Should log info level message");
    assertEquals(messages.at(-1)?.level, "info");

    // Verify behavior when DEBUG is set
    const debugCount = messages.length;
    Deno.env.set("DEBUG", "true");
    testLogger.info(diagnosticMessage);
    assertEquals(messages.length, debugCount + 1, "Should log when DEBUG is enabled");
    assertEquals(messages.at(-1)?.level, "info");
  });

  await t.step("logger interface implementation", () => {
    const logger = createLogger();
    const methods: Array<keyof Logger> = ['info', 'warn', 'error', 'debug'];
    
    methods.forEach(method => {
      assertEquals(
        typeof logger[method], 
        "function",
        `Logger should implement ${method} method`
      );
    });

    // Verify method availability
    assertEquals(logger.hasOwnProperty('info'), true);
    assertEquals(logger.hasOwnProperty('warn'), true);
    assertEquals(logger.hasOwnProperty('error'), true);
    assertEquals(logger.hasOwnProperty('debug'), true);
  });
});