import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/AuthContext';

const ShippingAddressStep = ({ 
  formData, 
  updateFormData, 
  onNext,
  onPrevious
}) => {
  const { user } = useAuth();
  const { shippingAddress = {} } = formData;
  
  // Local state for form validation
  const [errors, setErrors] = useState({});
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  
  // US states for dropdown
  const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
    { value: 'DC', label: 'District of Columbia' }
  ];
  
  // Initialize form with user's address if available
  useEffect(() => {
    if (useProfileAddress && user?.address && !shippingAddress.street) {
      updateFormData('shippingAddress', {
        street: user.address.street || '',
        street2: user.address.street2 || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zip: user.address.zip || ''
      });
    }
  }, [user, updateFormData, useProfileAddress, shippingAddress.street]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('shippingAddress', { [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  // Handle toggle for using profile address
  const handleToggleProfileAddress = () => {
    const newValue = !useProfileAddress;
    setUseProfileAddress(newValue);
    
    if (newValue && user?.address) {
      // Use profile address
      updateFormData('shippingAddress', {
        street: user.address.street || '',
        street2: user.address.street2 || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zip: user.address.zip || ''
      });
    } else if (!newValue) {
      // Clear address fields for manual entry
      updateFormData('shippingAddress', {
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: ''
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!shippingAddress.street) {
      newErrors.street = 'Street address is required';
    }
    
    if (!shippingAddress.city) {
      newErrors.city = 'City is required';
    }
    
    if (!shippingAddress.state) {
      newErrors.state = 'State is required';
    }
    
    if (!shippingAddress.zip) {
      newErrors.zip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingAddress.zip)) {
      newErrors.zip = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Proceed to next step
    onNext();
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
      <p className="text-gray-600 mb-6">
        Please provide the address where you would like your medication to be delivered.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Profile Address Toggle */}
        {user?.address && (
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useProfileAddress}
                onChange={handleToggleProfileAddress}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Use my profile address
              </span>
            </label>
          </div>
        )}
        
        {/* Street Address */}
        <div className="mb-4">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={shippingAddress.street || ''}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.street ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            placeholder="123 Main St"
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
          )}
        </div>
        
        {/* Apartment, Suite, etc. */}
        <div className="mb-4">
          <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
            Apartment, Suite, etc. (optional)
          </label>
          <input
            type="text"
            id="street2"
            name="street2"
            value={shippingAddress.street2 || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Apt 4B, Suite 100, etc."
          />
        </div>
        
        {/* City */}
        <div className="mb-4">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={shippingAddress.city || ''}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            placeholder="San Francisco"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
        
        {/* State and ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              value={shippingAddress.state || ''}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={shippingAddress.zip || ''}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.zip ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              placeholder="12345"
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-600">{errors.zip}</p>
            )}
          </div>
        </div>
        
        {/* Shipping Notice */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All medications are shipped in discreet packaging with no indication of the contents.
            Delivery typically takes 2-3 business days after your order is approved by a healthcare provider.
          </p>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingAddressStep;