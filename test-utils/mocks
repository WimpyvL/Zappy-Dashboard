// src/lib/__mocks__/supabase.js

// Store the callback for onAuthStateChange globally within the mock module
let storedAuthCallback = null;

// Base mock structure
const baseSupabaseMock = {
  // Mock the 'from' method
  from: jest.fn().mockImplementation((tableName) => ({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockResolvedValue({ data: [], error: null }),
    delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    limit: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    // Add other methods used in your app as needed
  })),

  // Mock the 'auth' object
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ // Default success
      data: { user: { id: 'default-mock-user-id', email: 'default@example.com' }, session: { access_token: 'default-mock-token' } },
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'default-mock-user-id', email: 'default@example.com' }, session: { access_token: 'default-mock-token' } },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn((_event, callback) => {
      // console.log('Mock onAuthStateChange called'); // Keep for debugging if needed
      if (typeof callback === 'function') {
        storedAuthCallback = callback; // Store the callback
        // Simulate initial state immediately
        callback('INITIAL_SESSION', null);
      } else {
        // console.error('Mock onAuthStateChange: callback is not a function', callback);
      }
      // Return the expected subscription structure
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }), // Default no session
    // Add other auth methods used as needed
  },

  // Mock other top-level Supabase methods if used
  storage: {
    // Mock storage methods if used
  },
  functions: {
    // Mock functions methods if used
  },

  // Helper function for tests to trigger auth state changes
  __triggerAuthStateChange: (event, session) => {
    // console.log('Mock __triggerAuthStateChange called with:', event, session); // Keep for debugging
    if (storedAuthCallback) {
      storedAuthCallback(event, session);
    } else {
       // console.error('Mock __triggerAuthStateChange: storedAuthCallback is null');
    }
  },
};

// Export the mock
export const supabase = baseSupabaseMock;
