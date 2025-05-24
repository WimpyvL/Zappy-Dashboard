import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { setupServer } from 'msw/node';
import { http } from 'msw';

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Create MSW server instance
export const server = setupServer(
  // Add handlers for any API endpoints you want to mock
  http.post('/api/checkout/verify/:sessionId', ({ request, params }) => {
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  })
);

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());

// Mock window.location methods
const windowLocation = window.location;
Object.defineProperty(window, 'location', {
  value: {
    ...windowLocation,
    href: '',
    assign: vi.fn(),
    reload: vi.fn(),
  },
  writable: true
});

// Add any other global test setup here