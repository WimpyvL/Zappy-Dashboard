import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also send this to a logging service like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              {this.props.title || 'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-4">
              {this.props.message || 'An unexpected error occurred in this component.'}
            </p>
            {this.props.showError && (
              <pre className="bg-gray-100 p-3 rounded text-left text-xs text-gray-700 overflow-auto max-h-32 mb-4">
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {this.props.retryLabel || 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;