import React from 'react';
import { AlertTriangle, RefreshCw, CreditCard, HelpCircle, ArrowRight } from 'lucide-react';

/**
 * Component for displaying payment errors and recovery options
 * @param {Object} error - The error object with type, message, and action
 * @param {Function} onRetry - Callback when retry is clicked
 * @param {Function} onChangePaymentMethod - Callback when change payment method is clicked
 * @param {Function} onContactSupport - Callback when contact support is clicked
 * @param {Function} onContinue - Callback when continue is clicked (for non-critical errors)
 * @returns {JSX.Element} Payment error recovery component
 */
const PaymentErrorRecovery = ({ 
  error, 
  onRetry, 
  onChangePaymentMethod, 
  onContactSupport,
  onContinue
}) => {
  if (!error) return null;
  
  /**
   * Render the appropriate recovery UI based on error type
   * @returns {JSX.Element} Error-specific recovery UI
   */
  const renderRecoveryUI = () => {
    switch (error.action) {
      case 'retry':
        return (
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
            <p className="text-gray-600 mb-4">
              We encountered a network issue while processing your payment. 
              This is often temporary.
            </p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
        
      case 'try_another_card':
        return (
          <div className="text-center">
            <CreditCard className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Declined</h3>
            <p className="text-gray-600 mb-4">
              {error.message || 'Your payment was declined. Please try a different payment method.'}
            </p>
            <button
              onClick={onChangePaymentMethod}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Use Different Payment Method
            </button>
          </div>
        );
        
      case 'refresh_session':
        return (
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Session Expired</h3>
            <p className="text-gray-600 mb-4">
              Your checkout session has expired. We need to refresh it to continue.
            </p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Session
            </button>
          </div>
        );
        
      case 'authenticate':
        return (
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">
              Your card requires additional authentication to complete this purchase.
            </p>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue to Authentication <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        );
        
      default:
        return (
          <div className="text-center">
            <HelpCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Issue</h3>
            <p className="text-gray-600 mb-4">
              {error.message || 'We encountered an issue processing your payment.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onContactSupport}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
      {renderRecoveryUI()}
    </div>
  );
};

export default PaymentErrorRecovery;
