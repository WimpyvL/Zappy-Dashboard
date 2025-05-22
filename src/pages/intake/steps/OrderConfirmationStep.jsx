<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Calendar, FileText, Home, MessageSquare, ShoppingCart } from 'lucide-react';
import { useCart } from '../../../contexts/cart/CartContext';
import { message } from 'antd';

// Mock recommended products - in a real app, these would come from an API
const mockRecommendedProducts = [
  {
    id: 'np1',
    name: 'Daily Multivitamin',
    description: 'Essential vitamins and minerals for daily health support.',
    price: 19.99,
    imageUrl: null,
    requiresPrescription: false,
    allowOneTimePurchase: true,
    type: 'supplement'
  },
  {
    id: 'np2',
    name: 'Omega-3 Fish Oil',
    description: 'Supports heart and brain health with essential fatty acids.',
    price: 24.99,
    imageUrl: null,
    requiresPrescription: false,
    allowOneTimePurchase: true,
    type: 'supplement'
  },
  {
    id: 'np3',
    name: 'Vitamin D3 Supplement',
    description: 'Supports bone health and immune function.',
    price: 15.99,
    imageUrl: null,
    requiresPrescription: false,
    allowOneTimePurchase: true,
    type: 'supplement'
  }
];
=======
import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Package, Calendar, FileText, Home } from 'lucide-react';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
>>>>>>> a087814b715110cb6e31d9569a5ee74a779b4d23

/**
 * OrderConfirmationStep component - Displays order confirmation and next steps
 */
const OrderConfirmationStep = ({ 
  orderId,
  consultationId,
  navigateToHome,
  navigateToOrderDetails
}) => {
  const { addItem } = useCart();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  
  // In a real app, you would fetch recommended products based on the ordered items
  useEffect(() => {
    // Simulate API call to get recommended products
    const fetchRecommendedProducts = async () => {
      // In a real app, this would be an API call
      // For now, we'll use the mock data
      setRecommendedProducts(mockRecommendedProducts);
    };
    
    fetchRecommendedProducts();
  }, []);
  
  const handleAddToCart = (product) => {
    // Create a mock dose object since non-prescription products might not have doses
    const mockDose = {
      id: `dose-${product.id}`,
      value: 'Standard',
      allowOneTimePurchase: true
    };
    
    addItem(product, mockDose, 1);
    message.success(`${product.name} added to your cart!`);
  };
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
<<<<<<< HEAD
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
=======
>>>>>>> a087814b715110cb6e31d9569a5ee74a779b4d23
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 text-left">
          <h3 className="font-medium text-lg mb-4">What happens next?</h3>
          
<<<<<<< HEAD
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
=======
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
>>>>>>> a087814b715110cb6e31d9569a5ee74a779b4d23
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
<<<<<<< HEAD
      
      <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You can track the status of your order and consultation in your account dashboard. 
          If you have any questions, please contact our support team.
        </p>
      </div>
      
      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="font-medium text-lg mb-4">Recommended Products</h3>
          <p className="text-sm text-gray-600 mb-4">
            These products complement your prescription and may help improve your results.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedProducts.map(product => (
              <div key={product.id} className="border rounded-lg p-4 flex flex-col">
                <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center mb-3">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Package size={32} />
                    </div>
                  )}
                </div>
                
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600 mt-1 flex-grow">{product.description}</p>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                  >
                    <ShoppingCart size={14} className="mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
=======
    </ErrorBoundary>
>>>>>>> a087814b715110cb6e31d9569a5ee74a779b4d23
  );
};

OrderConfirmationStep.propTypes = {
  orderId: PropTypes.string.isRequired,
  navigateToHome: PropTypes.func.isRequired,
  navigateToOrderDetails: PropTypes.func.isRequired
};

export default OrderConfirmationStep;
