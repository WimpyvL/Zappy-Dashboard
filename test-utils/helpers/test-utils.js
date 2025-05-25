import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { CartProvider } from '../context/CartContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';

// Create a QueryClient instance for tests with default options
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {}, // silent errors in tests
  },
});

/**
 * A custom render function that includes all providers needed throughout the app
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Options passed to render
 * @param {Array} options.routerProps - Props passed to MemoryRouter
 * @returns {Object} - The result of render
 */
export function renderWithProviders(
  ui,
  {
    routerProps = { initialEntries: ['/'] },
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationsProvider>
                <MemoryRouter {...routerProps}>
                  {children}
                </MemoryRouter>
              </NotificationsProvider>
            </CartProvider>
          </AuthProvider>
        </AppProvider>
      </QueryClientProvider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Helper function to wait for asynchronous operations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - A promise that resolves after the specified time
 */
export const waitMs = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock common API responses based on provided resources and data
 * @param {Array} resources - Resources to mock (e.g., 'patients', 'tasks')
 * @param {Object} mockData - Mock data for each resource
 * @returns {Object} - Mock handlers for API requests
 */
export const createApiMocks = (resources = [], mockData = {}) => {
  const mocks = {};
  
  resources.forEach(resource => {
    const resourceData = mockData[resource] || [];
    
    mocks[resource] = {
      getAll: jest.fn().mockResolvedValue({ data: resourceData }),
      getById: jest.fn().mockImplementation((id) => {
        const item = resourceData.find(item => item.id === id);
        return Promise.resolve({ data: item || null });
      }),
      create: jest.fn().mockImplementation((data) => {
        const newItem = { id: Date.now().toString(), ...data };
        return Promise.resolve({ data: newItem });
      }),
      update: jest.fn().mockImplementation((id, data) => {
        return Promise.resolve({ data: { id, ...data } });
      }),
      delete: jest.fn().mockResolvedValue({ success: true }),
    };
  });
  
  return mocks;
};

/**
 * Create mock user authentication data
 * @param {Object} overrides - Properties to override in the default user
 * @returns {Object} - Mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-test-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'provider',
  created_at: new Date().toISOString(),
  ...overrides
});

/**
 * Create a mock authenticated session
 * @param {Object} user - User data
 * @returns {Object} - Mock session
 */
export const createMockSession = (user = createMockUser()) => ({
  access_token: 'mock-token-xyz',
  user,
  expires_at: Date.now() + 3600000 // 1 hour from now
});