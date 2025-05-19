import React, { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';

const CheckoutStep = ({ 
  formData, 
  updateFormData, 
  prescriptionItems,
  productCategory,
  onSubmit,
  onPrevious,
  isSubmitting
}) => {
  const { treatmentPreferences, checkout } = formData;
  
  // Local state for form validation
  const [errors, setErrors] = useState({});
  
  // Find the selected product
  const selectedProduct = prescriptionItems.find(
    item => item.id === treatmentPreferences.selectedProductId
  ) || prescriptionItems[0];
  
  // Mock payment methods
  const [paymentMethods] = useState([
    { id: 'pm_1', last4: '4242', brand: 'visa', expMonth: 12, expYear: 2028 },
    { id: 'pm_2', last4: '5555', brand: 'mastercard', expMonth: 10, expYear: 2026 },
  ]);
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentMethodId) => {
    updateFormData('checkout', { paymentMethodId });
    setErrors({ ...errors, paymentMethod: undefined });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!checkout.paymentMethodId) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the form
    onSubmit();
  };
  
  // Get card brand icon
  const getCardBrandIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳'; // Replace with actual Visa icon
      case 'mastercard':
        return '💳'; // Replace with actual Mastercard icon
      case 'amex':
        return '💳'; // Replace with actual Amex icon
      default:
        return '💳';
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Complete Your Order</h2>
      <p className="text-gray-600 mb-6">
        Please select a payment method to complete your order.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Order Summary</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              {selectedProduct.imageUrl && (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
              )}
              <div className="flex-grow">
                <h4 className="font-medium">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                
                {selectedProduct.dosage && (
                  <p className="text-sm text-gray-600">Dosage: {selectedProduct.dosage}</p>
                )}
                
                {selectedProduct.frequency && (
                  <p className="text-sm text-gray-600">Frequency: {selectedProduct.frequency}</p>
                )}
              </div>
              <div className="text-right">
                <span className="font-medium">${selectedProduct.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${selectedProduct.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-medium text-lg mt-4">
              <span>Total</span>
              <span>${selectedProduct.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  checkout.paymentMethodId === method.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handlePaymentMethodSelect(method.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`payment-${method.id}`}
                    name="paymentMethod"
                    checked={checkout.paymentMethodId === method.id}
                    onChange={() => handlePaymentMethodSelect(method.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`payment-${method.id}`} className="ml-3 flex items-center flex-grow cursor-pointer">
                    <span className="mr-2">{getCardBrandIcon(method.brand)}</span>
                    <span className="font-medium">
                      {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in {method.last4}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      Expires {method.expMonth}/{method.expYear.toString().slice(-2)}
                    </span>
                  </label>
                </div>
              </div>
            ))}
            
            <div 
              className="border rounded-lg p-4 cursor-pointer transition-colors border-gray-300 hover:border-blue-300"
              onClick={() => {/* Open add payment method modal */}}
            >
              <div className="flex items-center">
                <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                <label className="ml-3 flex items-center cursor-pointer">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                  <span>Add new payment method</span>
                </label>
              </div>
            </div>
          </div>
          
          {errors.paymentMethod && (
            <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex">
            <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">What happens next?</p>
              <p className="text-sm text-blue-800 mt-1">
                After placing your order, a healthcare provider will review your information within 24-48 hours. 
                If approved, your medication will be shipped directly to you. You'll receive email updates throughout the process.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutStep;
