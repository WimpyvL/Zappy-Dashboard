import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/auth/AuthContext';
import ProtectedRoute from '../../appGuards/ProtectedRoute';
import { supabase } from '../../lib/supabase';

// Mock components for testing routes
const Dashboard = () => <div>Dashboard Content</div>;
const LoginPage = () => <div>Login Page</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

// Create a wrapper with providers and routes
const createTestApp = (initialEntries = ['/dashboard']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Protected Route Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to login when user is not authenticated', async () => {
    // Mock no session (unauthenticated)
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(createTestApp());

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    // Dashboard should not be rendered
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  test('allows access to protected route when user is authenticated', async () => {
    // Mock authenticated session
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
          access_token: 'mock-token',
        },
      },
      error: null,
    });

    render(createTestApp());

    // Should render the dashboard
    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Login page should not be rendered
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('handles authentication error gracefully', async () => {
    // Mock authentication error
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Auth error' },
    });

    // Mock console.error to avoid test output clutter
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(createTestApp());

    // Should redirect to login page on error
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
