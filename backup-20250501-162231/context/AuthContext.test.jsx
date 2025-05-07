import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useAppContext } from './AppContext';

// Mock dependencies
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signInWithOtp: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

jest.mock('./AppContext', () => ({
  useAppContext: jest.fn().mockReturnValue({
    setViewMode: jest.fn(),
  }),
}));

// Create a test component that uses the auth context
const TestComponent = () => {
  const {
    currentUser,
    userRole,
    isAuthenticated,
    authLoading,
    actionLoading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    updatePassword,
    resendVerificationEmail,
    clearError,
  } = useAuth();

  return (
    <div>
      <div data-testid="loading-state">
        {authLoading ? 'Auth Loading' : 'Auth Ready'}
      </div>
      <div data-testid="action-loading-state">
        {actionLoading ? 'Action Loading' : 'Action Ready'}
      </div>
      <div data-testid="auth-state">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">
        {currentUser?.email || 'No user email'}
      </div>
      <div data-testid="user-role">{userRole || 'No role'}</div>
      <div data-testid="error-message">{error || 'No errors'}</div>
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register('new@example.com', 'password123')}>
        Register
      </button>
      <button onClick={() => updateProfile({ displayName: 'New Name' })}>
        Update Profile
      </button>
      <button onClick={() => changePassword('newpassword123')}>
        Change Password
      </button>
      <button onClick={() => forgotPassword('test@example.com')}>
        Forgot Password
      </button>
      <button onClick={() => updatePassword('resetpassword123')}>
        Reset Password
      </button>
      <button onClick={() => resendVerificationEmail('test@example.com')}>
        Resend Verification
      </button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock alert for tests that use it
    global.alert = jest.fn();
    
    // Default successful session response
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  test('renders with initial unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially shows loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Loading');
    
    // After session check resolves
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Check that the user is not authenticated
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user email');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No role');
  });

  test('handles successful login', async () => {
    const user = userEvent.setup();
    
    // Mock a successful login response
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user123', email: 'test@example.com' },
        session: { user: { id: 'user123', email: 'test@example.com' } },
      },
      error: null,
    });
    
    // Mock profile fetch response for role
    supabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Perform login
    await user.click(screen.getByText('Login'));
    
    // Check that action loading state is shown
    expect(screen.getByTestId('action-loading-state')).toHaveTextContent('Action Loading');
    
    // Verify login was called with correct params
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Wait for login action to complete
    await waitFor(() => {
      expect(screen.getByTestId('action-loading-state')).toHaveTextContent('Action Ready');
    });
    
    // Simulate the onAuthStateChange event with auth state change
    // Get the callback from the mock
    const authStateChangeCallback = supabase.auth.onAuthStateChange.mock.calls[0][0];
    
    // Call it with SIGNED_IN event
    authStateChangeCallback('SIGNED_IN', {
      user: { id: 'user123', email: 'test@example.com' },
    });
    
    // Check that the user is authenticated
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  test('handles login error', async () => {
    const user = userEvent.setup();
    
    // Mock a failed login response
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Perform login
    await user.click(screen.getByText('Login'));
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid login credentials');
    });
  });

  test('handles successful logout', async () => {
    const user = userEvent.setup();
    
    // Mock a successful logout response
    supabase.auth.signOut.mockResolvedValue({ error: null });
    
    // Start with authenticated state
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user123', email: 'test@example.com' },
        },
      },
      error: null,
    });
    
    // Mock profile response
    supabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth to complete and establish authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Simulate auth state change with authenticated user
    const authStateChangeCallback = supabase.auth.onAuthStateChange.mock.calls[0][0];
    authStateChangeCallback('INITIAL_SESSION', {
      user: { id: 'user123', email: 'test@example.com' },
    });
    
    // Check authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Perform logout
    await user.click(screen.getByText('Logout'));
    
    // Verify logout was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
    
    // Simulate auth state change after logout
    authStateChangeCallback('SIGNED_OUT', null);
    
    // Check unauthenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    });
  });

  test('handles successful registration', async () => {
    const user = userEvent.setup();
    
    // Mock a successful registration response
    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new123', email: 'new@example.com' },
        session: null, // Simulate email confirmation required
      },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Perform registration
    await user.click(screen.getByText('Register'));
    
    // Verify register was called with correct params
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: {},
    });
    
    // Check that alert was shown for email confirmation
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Registration successful')
      );
    });
  });

  test('handles profile update', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated user
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user123', email: 'test@example.com' },
        },
      },
      error: null,
    });
    
    // Mock profile response
    supabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    
    // Mock profile update response
    supabase.auth.updateUser.mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
          user_metadata: { displayName: 'New Name' },
        },
      },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check and simulate authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    const authStateChangeCallback = supabase.auth.onAuthStateChange.mock.calls[0][0];
    authStateChangeCallback('INITIAL_SESSION', {
      user: { id: 'user123', email: 'test@example.com' },
    });
    
    // Perform profile update
    await user.click(screen.getByText('Update Profile'));
    
    // Verify update was called with correct params
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { displayName: 'New Name' },
    });
  });

  test('handles password change', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated user
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user123', email: 'test@example.com' },
        },
      },
      error: null,
    });
    
    // Mock profile response
    supabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    
    // Mock password change response
    supabase.auth.updateUser.mockResolvedValue({
      data: { user: { id: 'user123', email: 'test@example.com' } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Simulate authenticated state
    const authStateChangeCallback = supabase.auth.onAuthStateChange.mock.calls[0][0];
    authStateChangeCallback('INITIAL_SESSION', {
      user: { id: 'user123', email: 'test@example.com' },
    });
    
    // Perform password change
    await user.click(screen.getByText('Change Password'));
    
    // Verify password change was called with correct params
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123',
    });
    
    // Check that alert was shown
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Password updated successfully!');
    });
  });

  test('handles forgot password request', async () => {
    const user = userEvent.setup();
    
    // Mock forgot password response
    supabase.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Perform forgot password action
    await user.click(screen.getByText('Forgot Password'));
    
    // Verify reset password was called with correct email
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(Object)
    );
    
    // Check that alert was shown
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Password reset email sent')
      );
    });
  });

  test('handles resend verification email', async () => {
    const user = userEvent.setup();
    
    // Mock resend verification response
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Perform resend verification action
    await user.click(screen.getByText('Resend Verification'));
    
    // Verify signInWithOtp was called with correct email
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });

  test('clears error when clearError is called', async () => {
    const user = userEvent.setup();
    
    // Setup initial error state
    supabase.auth.getSession.mockImplementation(() => {
      throw new Error('Initial error');
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).not.toHaveTextContent('No errors');
    });
    
    // Clear the error
    await user.click(screen.getByText('Clear Error'));
    
    // Check that error is cleared
    expect(screen.getByTestId('error-message')).toHaveTextContent('No errors');
  });

  test('handles uninitialized supabase client', async () => {
    // Temporarily unmock supabase to simulate uninitialized client
    jest.unmock('../lib/supabase');
    jest.mock('../lib/supabase', () => ({
      supabase: null,
    }));
    
    // Re-require the modules with the new mock
    const { AuthProvider, useAuth } = require('./AuthContext');
    
    // Create a local test component
    const LocalTestComponent = () => {
      const { error, authLoading } = useAuth();
      return (
        <div>
          <div data-testid="local-loading">{authLoading ? 'Loading' : 'Ready'}</div>
          <div data-testid="local-error">{error || 'No error'}</div>
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <LocalTestComponent />
      </AuthProvider>
    );
    
    // Check that error about uninitialized client is shown
    await waitFor(() => {
      expect(screen.getByTestId('local-loading')).toHaveTextContent('Ready');
      expect(screen.getByTestId('local-error')).toHaveTextContent('Supabase client not initialized');
    });
    
    // Restore the original mock
    jest.resetModules();
    jest.mock('../lib/supabase', () => ({
      supabase: {
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: jest.fn().mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
          }),
        },
      },
    }));
  });

  test('sets view mode based on user role', async () => {
    // Mock authenticated admin user
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'admin123', email: 'admin@example.com' },
        },
      },
      error: null,
    });
    
    // Mock profile response with admin role
    supabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Check that setViewMode was called with admin
    await waitFor(() => {
      expect(useAppContext().setViewMode).toHaveBeenCalledWith('admin');
    });
    
    // Now test with regular user role
    jest.clearAllMocks();
    
    // Mock profile response with patient role
    supabase.single.mockResolvedValue({
      data: { role: 'patient' },
      error: null,
    });
    
    // Re-render
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Auth Ready');
    });
    
    // Check that setViewMode was called with patient
    await waitFor(() => {
      expect(useAppContext().setViewMode).toHaveBeenCalledWith('patient');
    });
  });
});