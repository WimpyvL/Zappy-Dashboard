import React from 'react';
import { CheckCircle, Package, Calendar, FileText, Home, MessageSquare } from 'lucide-react';

const OrderConfirmationStep = ({ 
  orderId,
  consultationId,
  navigateToHome,
  navigateToOrderDetails
}) => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
        <p className="text-gray-600 mt-2">
          Your order #{orderId} has been received and is being processed.
        </p>
        {consultationId && (
          <p className="text-blue-600 mt-1 text-sm">
            Consultation #{consultationId} has been created for provider review.
          </p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 text-left">
        <h3 className="font-medium text-lg mb-4">What happens next?</h3>
        
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="ml-4">
              <h4 className="font-medium">Medical Review</h4>
              <p className="text-sm text-gray-600">
                A healthcare provider will review your information within 24-48 hours.
              </p>
            </div>
          </div>
          
          {consultationId && (
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Provider Consultation</h4>
                <p className="text-sm text-gray-600">
                  A licensed provider in your state has been assigned to review your case. You may receive follow-up questions if needed.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-4 w-4" />
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
                <Package className="h-4 w-4" />
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
                <Home className="h-4 w-4" />
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
          <strong>Note:</strong> You can track the status of your order and consultation in your account dashboard. 
          If you have any questions, please contact our support team.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={navigateToOrderDetails}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Order Details
        </button>
        {consultationId && (
          <button
            onClick={() => window.location.href = `/consultations/${consultationId}`}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            View Consultation
          </button>
        )}
        <button
          onClick={navigateToHome}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationStep;
