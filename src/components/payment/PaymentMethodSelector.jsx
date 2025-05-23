import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Plus } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

/**
 * Payment method configuration with supported methods
 * All payment methods are processed through Stripe Checkout
 */
const PAYMENT_METHODS = {
  CREDIT_CARD: {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-5 h-5" />,
    processor: 'stripe',
    supported: true
  },
  APPLE_PAY: {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: <div className="w-5 h-5 flex items-center justify-center text-black font-bold text-xs">A</div>,
    processor: 'stripe',
    supported: () => {
      /* global ApplePaySession */
      return typeof window !== 'undefined' && 
             typeof window.ApplePaySession !== 'undefined' && 
             window.ApplePaySession.canMakePayments();
    }
  },
  GOOGLE_PAY: {
    id: 'google_pay',
    name: 'Google Pay',
    icon: <div className="w-5 h-5 flex items-center justify-center text-blue-500 font-bold text-xs">G</div>,
    processor: 'stripe',
    supported: () => !!window.google?.payments
  },
  ACH: {
    id: 'ach',
    name: 'Bank Account (ACH)',
    icon: <DollarSign className="w-5 h-5" />,
    processor: 'stripe',
    supported: true
  }
};

/**
 * Component for selecting a payment method
 * @param {string} selectedMethod - Currently selected payment method ID
 * @param {Function} onSelectMethod - Callback when a method is selected
 * @param {number} amount - Order amount (some methods have amount restrictions)
 * @param {Array} savedPaymentMethods - User's saved payment methods
 * @returns {JSX.Element} Payment method selector component
 */
const PaymentMethodSelector = ({ 
  selectedMethod, 
  onSelectMethod, 
  amount = 0,
  savedPaymentMethods = []
}) => {
  const [availableMethods, setAvailableMethods] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Determine which payment methods are available based on device, amount, etc.
  useEffect(() => {
    const methods = Object.values(PAYMENT_METHODS).filter(method => {
      if (typeof method.supported === 'function') {
        return method.supported(amount);
      }
      return method.supported;
    });
    
    setAvailableMethods(methods);
  }, [amount]);
  
  /**
   * Handle selecting a payment method
   * @param {string} methodId - The payment method ID
   */
  const handleSelectMethod = (methodId) => {
    if (onSelectMethod) {
      onSelectMethod(methodId);
    }
  };
  
  /**
   * Get card brand icon
   * @param {string} brand - The card brand
   * @returns {JSX.Element} Card brand icon
   */
  const getCardBrandIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <div className="w-8 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">VISA</div>;
      case 'mastercard':
        return <div className="w-8 h-5 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">MC</div>;
      case 'amex':
        return <div className="w-8 h-5 bg-blue-400 rounded text-white flex items-center justify-center text-xs font-bold">AMEX</div>;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Method</h3>
      
      {/* Saved payment methods */}
      {savedPaymentMethods.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Saved Payment Methods</p>
          <div className="space-y-2">
            {savedPaymentMethods.map(method => (
              <div 
                key={method.id}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleSelectMethod(method.id)}
              >
                <div className="flex items-center">
                  <input 
                    type="radio"
                    id={`payment-${method.id}`}
                    name="paymentMethod"
                    checked={selectedMethod === method.id}
                    onChange={() => handleSelectMethod(method.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={`payment-${method.id}`} className="ml-3 flex items-center flex-grow cursor-pointer">
                    <span className="mr-2">{getCardBrandIcon(method.brand)}</span>
                    <span>•••• {method.last4}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      Expires {method.expMonth}/{method.expYear.toString().slice(-2)}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Available payment methods */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Payment Options</p>
        <div className="space-y-2">
          {availableMethods.map(method => (
            <div 
              key={method.id}
              className={`border rounded-lg p-3 cursor-pointer ${
                selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleSelectMethod(method.id)}
            >
              <div className="flex items-center">
                <input 
                  type="radio"
                  id={`payment-option-${method.id}`}
                  name="paymentMethod"
                  checked={selectedMethod === method.id}
                  onChange={() => handleSelectMethod(method.id)}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor={`payment-option-${method.id}`} className="ml-3 flex items-center flex-grow cursor-pointer">
                  <span className="mr-2">{method.icon}</span>
                  <span>{method.name}</span>
                </label>
              </div>
            </div>
          ))}
          
          {/* Add new payment method option */}
          <div 
            className="border rounded-lg p-3 cursor-pointer border-dashed border-gray-300 hover:border-blue-300"
            onClick={() => setIsAddingNew(true)}
          >
            <div className="flex items-center">
              <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
              <label className="ml-3 flex items-center cursor-pointer">
                <Plus className="w-5 h-5 mr-2 text-gray-500" />
                <span>Add new payment method</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment method form (would be shown when isAddingNew is true) */}
      {isAddingNew && (
        <div className="mt-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-3">Add New Payment Method</h4>
          
          {/* This would be replaced with Stripe Elements or other payment form */}
          <div className="space-y-3">
            <div>
              <label htmlFor="card-number" className="block text-sm text-gray-700 mb-1">Card Number</label>
              <input 
                type="text" 
                id="card-number" 
                placeholder="1234 5678 9012 3456" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <label htmlFor="expiry" className="block text-sm text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiry" 
                  placeholder="MM/YY" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-1/3">
                <label htmlFor="cvc" className="block text-sm text-gray-700 mb-1">CVC</label>
                <input 
                  type="text" 
                  id="cvc" 
                  placeholder="123" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                type="button" 
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md"
                onClick={() => setIsAddingNew(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-3 py-1 bg-blue-600 text-white rounded-md"
                onClick={() => {
                  // This would save the payment method in a real implementation
                  setIsAddingNew(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
