import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMySubscriptionDetails } from '../../apis/subscriptionPlans/hooks';
import { useRecommendedProducts } from '../../hooks/useRecommendedProducts';
import { toast } from 'react-toastify';
import { Tag, CreditCard, Check, Calendar, Clock, Shield, Users } from 'lucide-react';

// Components
import PatientSubscriptionDetails from '../../components/subscriptions/PatientSubscriptionDetails';
import SubscriptionPlanSelection from '../../components/subscriptions/SubscriptionPlanSelection';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientSubscriptionContent = () => {
  const { user } = useAuth();
  const patientId = user?.id;
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  
  // Fetch patient's active subscription
  const { 
    data: subscription, 
    isLoading,
    isError,
    error 
  } = useMySubscriptionDetails(patientId);
  
  // Fetch recommended products based on the subscription's condition
  const { 
    recommendedProducts,
    isLoading: isLoadingProducts
  } = useRecommendedProducts(
    patientId, 
    subscription?.packageCondition || 'general-health',
    { limit: 3 }
  );
  
  // Handle adding a product to cart or subscription
  const handleAddProduct = (productId) => {
    if (selectedAddOns.includes(productId)) {
      setSelectedAddOns(selectedAddOns.filter(id => id !== productId));
    } else {
      setSelectedAddOns([...selectedAddOns, productId]);
      toast.success("Item added to selection!");
    }
  };
  
  const handleAddSelectedItems = () => {
    if (selectedAddOns.length === 0) {
      toast.info("Please select at least one item");
      return;
    }
    
    const selectedProducts = recommendedProducts.filter(p => selectedAddOns.includes(p.id));
    const totalPrice = selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    
    toast.success(`${selectedProducts.length} items added to your subscription! +$${totalPrice.toFixed(2)}/month`);
    setSelectedAddOns([]);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>Error loading subscription: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscription ? (
        <>
          {/* Subscription Card - Vibrant Style */}
          <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#818CF8]"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <div className="flex items-center mb-2">
                <CreditCard className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-bold">Current Subscription</h2>
              </div>
              <h3 className="text-2xl font-bold mb-1">{subscription.packageName}</h3>
              <div className="flex items-center text-sm opacity-90 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{subscription.durationMonths} Month Plan</span>
                <span className="mx-2">•</span>
                <span>${subscription.price}/month</span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Renews on {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Subscription Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Subscription Details</h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5 text-[#4F46E5]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Coverage</h4>
                      <p className="text-sm text-gray-500">Unlimited consultations</p>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    <Check className="h-3 w-3 inline mr-1" />Active
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Provider</h4>
                      <p className="text-sm text-gray-500">Dr. Emily Carter</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <CreditCard className="h-5 w-5 text-[#F85C5C]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Payment</h4>
                      <p className="text-sm text-gray-500">Visa ending in 4242</p>
                    </div>
                  </div>
                  <button 
                    className="text-xs text-[#4F46E5] font-medium"
                    onClick={() => toast.info("Change payment method feature coming soon")}
                  >
                    Change
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Base plan</span>
                  <span className="text-sm font-medium">${subscription.price}/mo</span>
                </div>
                {subscription.addOns?.map(addon => (
                  <div key={addon.id} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">{addon.name}</span>
                    <span className="text-sm font-medium">+${addon.price}/mo</span>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${subscription.totalPrice}/mo</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button 
                  className="flex-1 py-3 border border-gray-300 rounded-full text-sm font-medium"
                  onClick={() => toast.info("Cancel subscription feature coming soon")}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 py-3 bg-[#4F46E5] text-white rounded-full text-sm font-medium"
                  onClick={() => toast.info("Upgrade plan feature coming soon")}
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
          
          {/* Bundle Suggestion */}
          {!isLoadingProducts && recommendedProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-[#818CF8] p-2 rounded-full mr-3">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enhance Your Subscription</h3>
                    <p className="text-sm text-gray-600">Add these items to support your treatment</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="space-y-3">
                  {recommendedProducts.map(product => (
                    <div key={product.id} className="p-3 flex items-center border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                      <input 
                        type="checkbox" 
                        id={`product-${product.id}`}
                        checked={selectedAddOns.includes(product.id)}
                        onChange={() => handleAddProduct(product.id)}
                        className="h-5 w-5 text-[#4F46E5] rounded border-gray-300 mr-3"
                      />
                      <div className="flex-1">
                        <label htmlFor={`product-${product.id}`} className="text-sm font-medium cursor-pointer">
                          {product.name}
                        </label>
                        <p className="text-xs text-gray-500">{product.description}</p>
                      </div>
                      <span className="text-sm font-medium">+${product.price?.toFixed(2) || '0.00'}/mo</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-5">
                  <button 
                    className="w-full py-3 bg-[#F85C5C] text-white rounded-full text-sm font-medium"
                    onClick={handleAddSelectedItems}
                  >
                    Add Selected Items
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          {/* No Subscription Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold mb-2">No Active Subscription</h2>
              <p className="text-gray-600">
                You don't have an active subscription plan. Select a subscription plan below to subscribe to our telehealth services.
              </p>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="font-bold flex items-center mb-3">
                <Shield className="h-5 w-5 mr-2 text-[#4F46E5]" />
                Benefits of subscribing:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-white p-1 rounded-full mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-[#4F46E5]" />
                  </div>
                  <span className="text-sm">Unlimited access to telehealth consultations</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white p-1 rounded-full mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-[#4F46E5]" />
                  </div>
                  <span className="text-sm">Discounted rates for longer subscription periods</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white p-1 rounded-full mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-[#4F46E5]" />
                  </div>
                  <span className="text-sm">Personalized care for your specific health needs</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white p-1 rounded-full mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-[#4F46E5]" />
                  </div>
                  <span className="text-sm">Cancel or pause anytime</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Subscription Plan Selection */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Select a Subscription Plan</h3>
            </div>
            <div className="p-5">
              <SubscriptionPlanSelection patientId={patientId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSubscriptionContent;
