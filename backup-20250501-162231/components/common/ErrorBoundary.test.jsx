import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error for testing purposes
const ThrowError = () => {
  throw new Error('Test error');
  return <div>This will never render</div>;
};

// Empty component that doesn't throw an error
const NoError = () => <div>No error</div>;

// Suppress expected console errors in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('renders fallback UI when child component throws an error', () => {
    // In React 16+, errors thrown during render will log to console.error
    // We need to mock this to avoid cluttering the test output
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    // Verify fallback UI is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred in this component.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  test('uses custom error message and title when provided', () => {
    render(
      <ErrorBoundary 
        title="Custom Error Title" 
        message="Custom error message"
      >
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  test('displays error details when showError is true', () => {
    render(
      <ErrorBoundary showError={true}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  test('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    // Verify error UI is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click retry button
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    
    // Rerender with a component that doesn't throw an error
    rerender(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );
    
    // Verify the child component renders after retry
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('uses custom retry button label when provided', () => {
    render(
      <ErrorBoundary retryLabel="Reset Application">
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /Reset Application/i })).toBeInTheDocument();
  });
});