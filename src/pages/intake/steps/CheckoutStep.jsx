import React from 'react';
import PropTypes from 'prop-types';
import { CreditCard, Check } from 'lucide-react';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { FormError } from '../../../components/common/FormError';
import useFormValidation from '../../../hooks/useFormValidation';
import usePaymentMethods from '../../../hooks/usePaymentMethods';

/**
 * CheckoutStep component - Handles payment selection and order completion
 */
const CheckoutStep = ({ 
  formData, 
  updateFormData, 
  prescriptionItems,
  productCategory,
  onSubmit,
  onPrevious,
  isSubmitting
}) => {
  const { treatmentPreferences = {}, checkout = {} } = formData;
  
  // Define validation rules
  const validationRules = {
    'paymentMethodId': [
      { 
        required: true, 
        message: 'Please select a payment method' 
      }
    ]
  };
  
  // Initialize form validation hook
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue
  } = useFormValidation(
    checkout,
    validationRules,
    async (values) => {
      // Update form data
      updateFormData('checkout', values);
      
      // Submit the form
      onSubmit();
    }
  );
  
  // Initialize payment methods hook
  const {
    paymentMethods,
    selectedPaymentMethodId,
    error: paymentError,
    selectPaymentMethod,
    getCardBrandIcon
  } = usePaymentMethods({
    onSelect: (method) => {
      setFieldValue('paymentMethodId', method.id);
      updateFormData('checkout', { paymentMethodId: method.id });
    }
  });
  
  // Find the selected product
  const selectedProduct = prescriptionItems.find(
    item => item.id === treatmentPreferences.selectedProductId
  ) || prescriptionItems[0];
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentMethodId) => {
    selectPaymentMethod(paymentMethodId);
  };
  
  return (
    <ErrorBoundary>
      <div>
        <h2 className="text-xl font-semibold mb-4">Complete Your Order</h2>
        <p className="text-gray-600 mb-6">
          Please select a payment method to complete your order.
        </p>
        
        <form onSubmit={handleSubmit} noValidate>
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
            
            <div className="space-y-3" role="radiogroup" aria-labelledby="payment-method-heading">
              <span id="payment-method-heading" className="sr-only">Select a payment method</span>
              
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    values.paymentMethodId === method.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handlePaymentMethodSelect(method.id);
                    }
                  }}
                  tabIndex={0}
                  role="radio"
                  aria-checked={values.paymentMethodId === method.id}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`payment-${method.id}`}
                      name="paymentMethod"
                      checked={values.paymentMethodId === method.id}
                      onChange={() => handlePaymentMethodSelect(method.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      aria-labelledby={`payment-label-${method.id}`}
                    />
                    <label 
                      id={`payment-label-${method.id}`}
                      htmlFor={`payment-${method.id}`} 
                      className="ml-3 flex items-center flex-grow cursor-pointer"
                    >
                      <span className="mr-2" aria-hidden="true">{getCardBrandIcon(method.brand)}</span>
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    /* Open add payment method modal */
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Add new payment method"
              >
                <div className="flex items-center">
                  <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                  <label className="ml-3 flex items-center cursor-pointer">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
                    <span>Add new payment method</span>
                  </label>
                </div>
              </div>
            </div>
            
            {(errors.paymentMethodId || paymentError) && (
              <FormError error={errors.paymentMethodId || paymentError} className="mt-2" />
            )}
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex">
              <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
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
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

CheckoutStep.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  prescriptionItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
      dosage: PropTypes.string,
      frequency: PropTypes.string
    })
  ).isRequired,
  productCategory: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default CheckoutStep;
