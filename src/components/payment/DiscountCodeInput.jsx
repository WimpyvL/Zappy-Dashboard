import React, { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

/**
 * Component for entering and applying discount/referral codes
 * @param {Function} onApply - Callback when a valid code is applied
 * @param {Function} onRemove - Callback when a code is removed
 * @param {Object} appliedDiscount - Currently applied discount (if any)
 * @param {number} orderTotal - Current order total before discount
 * @returns {JSX.Element} Discount code input component
 */
const DiscountCodeInput = ({ onApply, onRemove, appliedDiscount, orderTotal }) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Handle applying a discount code
   */
  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }
    
    setIsValidating(true);
    setError(null);
    
    try {
      // Validate the discount code
      const result = await paymentService.validateDiscountCode(code.trim(), orderTotal);
      
      if (!result.valid) {
        setError(result.message || 'Invalid discount code');
        setIsValidating(false);
        return;
      }
      
      // Call the onApply callback with the validated discount
      if (onApply) {
        onApply(result);
      }
      
      setCode(''); // Clear the input
    } catch (err) {
      console.error('Error validating discount code:', err);
      setError('Error validating code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };
  
  /**
   * Handle removing an applied discount
   */
  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };
  
  /**
   * Handle input change
   */
  const handleChange = (e) => {
    setCode(e.target.value);
    if (error) {
      setError(null);
    }
  };
  
  /**
   * Handle key press (apply on Enter)
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.trim() && !isValidating) {
      e.preventDefault();
      handleApply();
    }
  };
  
  // If a discount is already applied, show the applied discount
  if (appliedDiscount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Check className="text-green-500 w-5 h-5 mr-2" />
          <div>
            <p className="text-sm font-medium">{appliedDiscount.code}</p>
            <p className="text-xs text-gray-600">{appliedDiscount.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Remove discount code"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  
  // Otherwise, show the input form
  return (
    <div>
      <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700 mb-1">
        Discount or Referral Code
      </label>
      <div className="flex">
        <input
          type="text"
          id="discount-code"
          value={code}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter code"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          disabled={isValidating}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
        >
          {isValidating ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DiscountCodeInput;
