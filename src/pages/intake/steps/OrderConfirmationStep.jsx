import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Package, Calendar, FileText, Home } from 'lucide-react';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';

/**
 * OrderConfirmationStep component - Displays order confirmation and next steps
 */
const OrderConfirmationStep = ({ 
  orderId,
  navigateToHome,
  navigateToOrderDetails
}) => {
  return (
    <ErrorBoundary>
      <div className="text-center">
        <div className="mb-6" role="status" aria-live="polite">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
          <p className="text-gray-600 mt-2">
            Your order #{orderId} has been received and is being processed.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 text-left">
          <h3 className="font-medium text-lg mb-4">What happens next?</h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Medical Review</h4>
                <p className="text-sm text-gray-600">
                  A healthcare provider will review your information within 24-48 hours.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Approval Notification</h4>
                <p className="text-sm text-gray-600">
                  You'll receive an email notification once your prescription is approved or if additional information is needed.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <Package className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Shipping</h4>
                <p className="text-sm text-gray-600">
                  Once approved, your medication will be shipped directly to your address with tracking information.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <Home className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Your medication will arrive in discreet packaging within 3-5 business days after approval.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can track the status of your order in your account dashboard. 
            If you have any questions, please contact our support team.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={navigateToOrderDetails}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            aria-label="View details for order number ${orderId}"
          >
            View Order Details
          </button>
          <button
            onClick={navigateToHome}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

OrderConfirmationStep.propTypes = {
  orderId: PropTypes.string.isRequired,
  navigateToHome: PropTypes.func.isRequired,
  navigateToOrderDetails: PropTypes.func.isRequired
};

export default OrderConfirmationStep;
