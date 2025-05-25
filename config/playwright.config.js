// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './playwright-tests',
  timeout: 60 * 1000, // Increased timeout for longer tests
  expect: {
    timeout: 10000 // Increased timeout for assertions
  },
  fullyParallel: false, // Set to false to avoid race conditions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Add 1 retry even in dev mode
  workers: process.env.CI ? 1 : 1, // Limit to 1 worker to avoid conflicts
  reporter: [['html'], ['list']], // Add list reporter for console output
  
  use: {
    actionTimeout: 15000, // Increased timeout for actions
    navigationTimeout: 30000, // Timeout for navigation
    trace: 'on', // Always capture traces for debugging
    screenshot: 'only-on-failure', // Take screenshots on failure
    video: 'on-first-retry', // Capture video on retry
    baseURL: 'http://localhost:3000', // Set base URL for all tests
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  
  // Web server configuration - ensure app is running during tests
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    timeout: 120 * 1000, // 2 minutes to start the server
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe', // Pipe server output for better debugging
    stderr: 'pipe',
  },
});