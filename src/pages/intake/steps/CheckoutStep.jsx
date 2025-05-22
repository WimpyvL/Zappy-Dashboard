import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { usePaymentErrorHandler } from '../../../hooks/usePaymentErrorHandler';
import { paymentService } from '../../../services/paymentService';
import PaymentMethodSelector from '../../../components/payment/PaymentMethodSelector';
import DiscountCodeInput from '../../../components/payment/DiscountCodeInput';
import PaymentErrorRecovery from '../../../components/payment/PaymentErrorRecovery';

const CheckoutStep = ({ 
  formData, 
  updateFormData, 
  prescriptionItems,
  productCategory,
  onSubmit,
  onPrevious,
  isSubmitting
}) => {
  const { treatmentPreferences, checkout = {} } = formData;
  const { handlePaymentError, retryPayment, clearError, isRecovering, errorType, errorMessage } = usePaymentErrorHandler();
  
  // Local state
  const [errors, setErrors] = useState({});
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, succeeded, failed
  const [paymentSession, setPaymentSession] = useState(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(checkout.paymentMethodId || null);
  
  // Discount state
  const [originalTotal, setOriginalTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  
  // Find the selected product
  const selectedProduct = prescriptionItems.find(
    item => item.id === treatmentPreferences.selectedProductId
  ) || prescriptionItems[0];
  
  // Calculate totals
  useEffect(() => {
    if (selectedProduct) {
      const subtotal = selectedProduct.price || 0;
      setOriginalTotal(subtotal);
      
      // Apply discount if one exists in form data
      if (checkout.discountCode && checkout.discountAmount) {
        setDiscountedTotal(subtotal - checkout.discountAmount);
        setAppliedDiscount({
          code: checkout.discountCode,
          description: checkout.discountDescription || `${checkout.discountCode} applied`,
          amount: checkout.discountAmount
        });
      } else {
        setDiscountedTotal(subtotal);
      }
    }
  }, [selectedProduct, checkout]);
  
  // Fetch saved payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        // This will be replaced with an actual API call when available
        const methods = await paymentService.getAvailablePaymentMethods();
        setSavedPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentMethodId) => {
    setSelectedPaymentMethod(paymentMethodId);
    updateFormData('checkout', { 
      ...checkout, 
      paymentMethodId 
    });
    setErrors({ ...errors, paymentMethod: undefined });
  };
  
  // Handle applying a discount code
  const handleApplyDiscount = (discountResult) => {
    if (discountResult && discountResult.valid) {
      setAppliedDiscount({
        code: discountResult.code,
        description: discountResult.description,
        amount: discountResult.amount
      });
      
      setDiscountedTotal(originalTotal - discountResult.amount);
      
      // Update form data with discount info
      updateFormData('checkout', { 
        ...checkout, 
        discountCode: discountResult.code,
        discountDescription: discountResult.description,
        discountAmount: discountResult.amount
      });
    }
  };
  
  // Handle removing a discount code
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountedTotal(originalTotal);
    
    // Update form data to remove discount
    const updatedCheckout = { ...checkout };
    delete updatedCheckout.discountCode;
    delete updatedCheckout.discountDescription;
    delete updatedCheckout.discountAmount;
    updateFormData('checkout', updatedCheckout);
  };
  
  // Create a payment session
  const createPaymentSession = async () => {
    try {
      setPaymentStatus('processing');
      
      // Prepare the cart item for checkout
      const cartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        type: selectedProduct.type || 'product',
        stripePriceId: selectedProduct.stripePriceId || 'price_mock'
      };
      
      // Create checkout session options
      const options = {};
      if (appliedDiscount) {
        options.discountCode = appliedDiscount.code;
      }
      
      // Create the checkout session
      const session = await paymentService.createCheckoutSession(
        [cartItem],
        { paymentMethodId: selectedPaymentMethod },
        options
      );
      
      setPaymentSession(session);
      return session;
    } catch (error) {
      console.error('Error creating payment session:', error);
      setPaymentStatus('failed');
      
      // Handle the error
      const errorResult = await handlePaymentError(error);
      setErrors({ 
        ...errors, 
        payment: errorResult.message 
      });
      
      return null;
    }
  };
  
  // Process the payment
  const processPayment = async (session) => {
    try {
      // Process the payment with the selected payment method
      const result = await paymentService.processPayment(session.sessionId, {
        paymentMethodId: selectedPaymentMethod
      });
      
      setPaymentStatus('succeeded');
      
      // Submit the form with payment details
      onSubmit({
        paymentResult: result,
        sessionId: session.sessionId
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('failed');
      
      // Handle the error
      const errorResult = await handlePaymentError(error, session.sessionId);
      setErrors({ 
        ...errors, 
        payment: errorResult.message 
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create payment session and process payment
    const session = await createPaymentSession();
    if (session) {
      await processPayment(session);
    }
  };
  
  // Handle retrying a payment
  const handleRetryPayment = async () => {
    if (paymentSession) {
      const result = await retryPayment(paymentSession.sessionId);
      
      if (result.success) {
        setPaymentStatus('succeeded');
        
        // Submit the form with payment details
        onSubmit({
          paymentResult: result.result,
          sessionId: paymentSession.sessionId
        });
      }
    } else {
      // Create a new session if the previous one doesn't exist
      const session = await createPaymentSession();
      if (session) {
        await processPayment(session);
      }
    }
  };
  
  // Handle changing payment method
  const handleChangePaymentMethod = () => {
    clearError();
    setSelectedPaymentMethod(null);
    updateFormData('checkout', { 
      ...checkout, 
      paymentMethodId: null 
    });
  };
  
  // Render payment error if there is one
  if (errorType && errorMessage) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Issue</h2>
        
        <PaymentErrorRecovery
          error={{ type: errorType, message: errorMessage, action: errorType }}
          onRetry={handleRetryPayment}
          onChangePaymentMethod={handleChangePaymentMethod}
          onContactSupport={() => window.location.href = '/support'}
          onContinue={handleRetryPayment}
        />
        
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Previous Step
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Complete Your Order</h2>
      <p className="text-gray-600 mb-6">
        Please select a payment method to complete your order.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Order Summary Section */}
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
                <span className="font-medium">${selectedProduct.price?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
          
          {/* Discount Code Section */}
          <div className="mb-4">
            <DiscountCodeInput 
              onApply={handleApplyDiscount}
              onRemove={handleRemoveDiscount}
              appliedDiscount={appliedDiscount}
              orderTotal={originalTotal}
            />
          </div>
          
          {/* Order totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${originalTotal.toFixed(2)}</span>
            </div>
            
            {appliedDiscount && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount ({appliedDiscount.description})</span>
                <span>-${appliedDiscount.amount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span>Free</span>
            </div>
            
            <div className="flex justify-between font-medium text-lg mt-4">
              <span>Total</span>
              <span>${discountedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Method Section */}
        <div className="mb-6">
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onSelectMethod={handlePaymentMethodSelect}
            amount={discountedTotal}
            savedPaymentMethods={savedPaymentMethods}
          />
          
          {errors.paymentMethod && (
            <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
        
        {/* Payment error message */}
        {errors.payment && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm">{errors.payment}</p>
            </div>
          </div>
        )}
        
        {/* What happens next section */}
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
        
        {/* Form buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting || paymentStatus === 'processing' || isRecovering}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={isSubmitting || paymentStatus === 'processing' || isRecovering}
          >
            {paymentStatus === 'processing' ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutStep;
