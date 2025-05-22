import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Error Boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole application
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
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
    this.setState({ errorInfo });
    
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
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

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, errorInfo, resetErrorBoundary: this.resetErrorBoundary })
          : fallback;
      }

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

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  onReset: PropTypes.func
};

export default ErrorBoundary;