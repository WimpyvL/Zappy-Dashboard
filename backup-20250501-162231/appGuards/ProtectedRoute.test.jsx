import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Create a test component to render inside the protected route
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

describe('ProtectedRoute Component', () => {
  // Save original localStorage
  const originalLocalStorage = window.localStorage;
  
  beforeEach(() => {
    // Create a mock implementation of localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    // Replace localStorage with mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  
  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
  });

  test('renders children when user is authenticated', () => {
    // Mock authenticated state
    window.localStorage.getItem.mockReturnValue('true');
    
    render(
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Check that the protected content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Verify localStorage was checked
    expect(window.localStorage.getItem).toHaveBeenCalledWith('isAuthenticated');
  });

  test('redirects to login when user is not authenticated', () => {
    // Mock unauthenticated state
    window.localStorage.getItem.mockReturnValue(null);
    
    // We need to mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
      },
      writable: true,
    });
    
    render(
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Check that we're redirected to the login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    
    // Verify localStorage was checked
    expect(window.localStorage.getItem).toHaveBeenCalledWith('isAuthenticated');
  });

  test('redirects to login when isAuthenticated is not true', () => {
    // Mock invalid authentication state
    window.localStorage.getItem.mockReturnValue('false');
    
    render(
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Check that we're redirected to the login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    
    // Verify localStorage was checked
    expect(window.localStorage.getItem).toHaveBeenCalledWith('isAuthenticated');
  });
});