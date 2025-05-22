import React from 'react';
import ErrorBoundarySystem from './ErrorBoundarySystem';
import { ErrorFallback } from './ErrorNotifications';

/**
 * Higher-order component that wraps a component with an error boundary
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.ComponentType} Wrapped component with error boundary
 */
const withErrorBoundary = (Component, options = {}) => {
  const {
    strategy = 'default',
    fallback = null,
    FallbackComponent = ErrorFallback,
    onError = null,
    onReset = null,
    maxAutoRetries = 3,
    autoRetryDelay = 2000,
    componentDisplayName = Component.displayName || Component.name || 'Component'
  } = options;

  const WithErrorBoundary = (props) => {
    return (
      <ErrorBoundarySystem
        strategy={strategy}
        FallbackComponent={fallback ? null : FallbackComponent}
        fallback={fallback}
        onError={onError}
        onReset={onReset}
        maxAutoRetries={maxAutoRetries}
        autoRetryDelay={autoRetryDelay}
      >
        <Component {...props} />
      </ErrorBoundarySystem>
    );
  };

  WithErrorBoundary.displayName = `withErrorBoundary(${componentDisplayName})`;

  return WithErrorBoundary;
};

/**
 * Creates a component wrapped with an error boundary for critical components
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Additional options
 * @returns {React.ComponentType} Component wrapped with critical error boundary
 */
export const withCriticalErrorBoundary = (Component, options = {}) => {
  return withErrorBoundary(Component, {
    strategy: 'critical',
    maxAutoRetries: 0, // No auto-retry for critical components
    ...options
  });
};

/**
 * Creates a component wrapped with a minimal error boundary for non-critical UI elements
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Additional options
 * @returns {React.ComponentType} Component wrapped with minimal error boundary
 */
export const withMinimalErrorBoundary = (Component, options = {}) => {
  return withErrorBoundary(Component, {
    strategy: 'minimal',
    maxAutoRetries: 3,
    ...options
  });
};

/**
 * Creates a component wrapped with a silent error boundary
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Additional options
 * @returns {React.ComponentType} Component wrapped with silent error boundary
 */
export const withSilentErrorBoundary = (Component, options = {}) => {
  return withErrorBoundary(Component, {
    strategy: 'silent',
    maxAutoRetries: 0, // No auto-retry for silent failures
    ...options
  });
};

export default withErrorBoundary;