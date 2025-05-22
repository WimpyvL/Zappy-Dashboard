import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ERROR_SEVERITY } from '../../utils/errorHandlingSystem';

/**
 * Enhanced Error Boundary component with different strategies
 * for handling errors based on component criticality
 */
class ErrorBoundarySystem extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  /**
   * Update state when an error occurs
   * @param {Error} error - The error that was thrown
   * @returns {Object} - New state with error information
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Component stack information
   */
  componentDidCatch(error, errorInfo) {
    const { errorCount, lastErrorTime } = this.state;
    const now = Date.now();
    
    // Track error frequency
    this.setState({ 
      errorInfo,
      errorCount: errorCount + 1,
      lastErrorTime: now
    });
    
    // Log the error
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, {
        errorCount: errorCount + 1,
        timeSinceLastError: lastErrorTime ? now - lastErrorTime : null
      });
    }
  }

  /**
   * Reset the error state
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Determine if we should retry automatically
   * @returns {boolean} Whether to retry automatically
   */
  shouldAutoRetry = () => {
    const { strategy, maxAutoRetries = 3 } = this.props;
    const { errorCount } = this.state;
    
    // Only auto-retry for non-critical components
    if (strategy === 'critical') {
      return false;
    }
    
    // Don't retry if we've exceeded max retries
    if (errorCount > maxAutoRetries) {
      return false;
    }
    
    return true;
  };

  /**
   * Auto retry after a delay
   */
  autoRetry = () => {
    const { errorCount } = this.state;
    const { autoRetryDelay = 2000 } = this.props;
    
    // Exponential backoff
    const delay = autoRetryDelay * Math.pow(2, errorCount - 1);
    
    setTimeout(this.resetErrorBoundary, delay);
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { 
      fallback, 
      children, 
      strategy = 'default',
      fallbackRender,
      FallbackComponent
    } = this.props;

    if (!hasError) {
      return children;
    }
    
    // Determine if we should auto-retry
    if (this.shouldAutoRetry()) {
      this.autoRetry();
    }
    
    // If a render prop is provided
    if (fallbackRender) {
      return fallbackRender({
        error,
        errorInfo,
        errorCount,
        resetErrorBoundary: this.resetErrorBoundary,
        strategy
      });
    }
    
    // If a component is provided
    if (FallbackComponent) {
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          errorCount={errorCount}
          resetErrorBoundary={this.resetErrorBoundary}
          strategy={strategy}
        />
      );
    }

    // If a custom fallback is provided, use it
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback({ 
            error, 
            errorInfo, 
            resetErrorBoundary: this.resetErrorBoundary,
            errorCount,
            strategy
          })
        : fallback;
    }

    // Strategy-specific default fallback UI
    switch (strategy) {
      case 'critical':
        // Critical components show a prominent error with no auto-retry
        return (
          <div className="p-6 border-2 border-red-500 rounded-md bg-red-50 shadow-lg max-w-2xl mx-auto my-8">
            <h2 className="text-xl font-bold text-red-800 mb-3">Critical Error</h2>
            <p className="text-red-700 mb-4">
              {error?.message || 'A critical error has occurred in this component.'}
            </p>
            {process.env.NODE_ENV !== 'production' && errorInfo && (
              <details className="mb-4">
                <summary className="text-sm text-red-700 cursor-pointer font-medium">View technical details</summary>
                <pre className="mt-2 p-3 text-xs bg-red-100 rounded overflow-auto max-h-64">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.resetErrorBoundary}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Reload page
              </button>
            </div>
          </div>
        );
        
      case 'minimal':
        // Minimal error display for non-critical UI elements
        return (
          <div className="p-3 border border-amber-300 rounded bg-amber-50">
            <p className="text-amber-800 text-sm">
              This component couldn't be displayed
              <button
                onClick={this.resetErrorBoundary}
                className="ml-2 px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors"
              >
                Retry
              </button>
            </p>
          </div>
        );
        
      case 'silent':
        // Silent failure - just don't render anything
        // Useful for optional UI elements that shouldn't break the page
        return null;
        
      case 'default':
      default:
        // Default fallback UI
        return (
          <div className="p-4 border border-red-300 rounded-md bg-red-50">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-700 mb-4">
              {error?.message || 'An unexpected error occurred'}
            </p>
            {process.env.NODE_ENV !== 'production' && errorInfo && (
              <details className="mb-4">
                <summary className="text-sm text-red-700 cursor-pointer">View technical details</summary>
                <pre className="mt-2 p-2 text-xs bg-red-100 rounded overflow-auto">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetErrorBoundary}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        );
    }
  }
}

ErrorBoundarySystem.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  fallbackRender: PropTypes.func,
  FallbackComponent: PropTypes.elementType,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  strategy: PropTypes.oneOf(['default', 'critical', 'minimal', 'silent']),
  maxAutoRetries: PropTypes.number,
  autoRetryDelay: PropTypes.number
};

export default ErrorBoundarySystem;