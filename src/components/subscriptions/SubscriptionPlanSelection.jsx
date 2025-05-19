import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useSubscriptionDurations } from '../../apis/subscriptionDurations/hooks';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { handleApiError } from '../../utils/errorHandling';

// Components
import LoadingSpinner from '../ui/LoadingSpinner';

const SubscriptionPlanSelection = ({ patientId, onSubscriptionCreated }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch subscription plans
  const { 
    data: plans, 
    isLoading: plansLoading 
  } = useSubscriptionPlans();

  // Fetch subscription durations
  const { 
    data: durations, 
    isLoading: durationsLoading 
  } = useSubscriptionDurations();

  // Extract unique categories for the filter
  useEffect(() => {
    if (plans?.length) {
      const uniqueCategories = [...new Set(plans.map(plan => plan.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [plans]);

  // Set default duration (monthly) when durations load
  useEffect(() => {
    if (durations?.length && !selectedDuration) {
      setSelectedDuration(durations.find(d => d.name === 'Monthly')?.id);
    }
  }, [durations, selectedDuration]);

  // Calculate discounted price
  const calculatePrice = (basePrice, discountPercent) => {
    if (!basePrice) return 0;
    const discount = (basePrice * discountPercent) / 100;
    return (basePrice - discount).toFixed(2);
  };

  // Handle subscription
  const handleSubscribe = async () => {
    if (!patientId) {
      toast.error('Patient ID is required');
      return;
    }

    if (!selectedPlan || !selectedDuration) {
      toast.error('Please select a subscription plan and duration');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get the selected plan and duration details
      const plan = plans.find(p => p.id === selectedPlan);
      const duration = durations.find(d => d.id === selectedDuration);
      
      if (!plan || !duration) {
        throw new Error('Selected plan or duration not found');
      }
      
      // Calculate dates
      const now = new Date();
      const endDate = new Date(now);
      
      // Use days if available, otherwise use months
      if (duration.duration_days) {
        endDate.setDate(now.getDate() + duration.duration_days);
      } else {
        endDate.setMonth(now.getMonth() + duration.duration_months);
      }
      
      // Calculate price with discount
      const discountPercent = duration.discount_percent || 0;
      const discountAmount = (plan.price * discountPercent) / 100;
      const finalPrice = plan.price - discountAmount;
      
      // Create the subscription
      const { data, error } = await supabase
        .from('patient_subscriptions')
        .insert({
          patient_id: patientId,
          subscription_plan_id: selectedPlan,
          duration_id: selectedDuration,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          amount: finalPrice,
          discount_percent: discountPercent,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Subscription created successfully!');
      setSelectedPlan(null);
      setSelectedDuration(null);
      
      // Optionally redirect to subscription details page
      if (onSubscriptionCreated && typeof onSubscriptionCreated === 'function') {
        onSubscriptionCreated(data);
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(`Failed to create subscription: ${err.message}`);
      toast.error(`Failed to create subscription: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedDurationDiscount = () => {
    if (!selectedDuration || !durations) return 0;
    const duration = durations.find(d => d.id === selectedDuration);
    return duration?.discount_percent || 0;
  };

  const getSelectedPlanPrice = () => {
    if (!selectedPlan || !plans) return 0;
    const plan = plans.find(p => p.id === selectedPlan);
    return plan?.price || 0;
  };

  // Filter plans by category
  const filteredPlans = selectedCategory 
    ? plans?.filter(plan => plan.category === selectedCategory) 
    : plans;

  return (
    <div className="subscription-selection-container">
      <h2 className="text-2xl font-bold mb-6">Select a Subscription Plan</h2>
      
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
        
        {plansLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredPlans?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map(plan => (
              <div 
                key={plan.id}
                className={`p-4 border rounded cursor-pointer transition-all ${
                  selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <h4 className="font-bold">{plan.name}</h4>
                <div className="text-sm text-gray-600 mb-2">Category: {plan.category || 'General'}</div>
                <div className="font-semibold mb-2">
                  ${calculatePrice(plan.price, getSelectedDurationDiscount())} 
                  {getSelectedDurationDiscount() > 0 && (
                    <span className="line-through text-gray-500 ml-2">${plan.price}</span>
                  )}
                </div>
                <p className="text-sm">{plan.description}</p>
                
                {plan.features && (
                  <div className="mt-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase">Features</h5>
                    <ul className="mt-1 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start mt-1">
                          <span className="text-green-500 mr-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No subscription plans available</div>
        )}
      </div>

      {/* Subscription Durations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Subscription Duration</h3>
        
        {durationsLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : durations?.length ? (
          <div className="flex flex-wrap gap-4">
            {durations.map(duration => (
              <div 
                key={duration.id}
                className={`p-4 border rounded cursor-pointer flex-1 min-w-[150px] transition-all ${
                  selectedDuration === duration.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedDuration(duration.id)}
              >
                <h4 className="font-bold">{duration.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span>
                    {duration.duration_days 
                      ? `${duration.duration_days} days` 
                      : `${duration.duration_months} ${duration.duration_months === 1 ? 'month' : 'months'}`}
                  </span>
                  {duration.discount_percent > 0 && (
                    <span className="text-green-600 font-semibold">Save {duration.discount_percent}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No subscription durations available</div>
        )}
      </div>

      {/* Selected Plan Summary & Subscription Button */}
      {selectedPlan && (
        <div className="bg-gray-50 p-4 rounded border mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Selected Plan</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600">Subscription Plan:</div>
            <div className="font-semibold">
              {plans?.find(p => p.id === selectedPlan)?.name}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Duration:</div>
            <div className="font-semibold">
              {durations?.find(d => d.id === selectedDuration)?.name} 
              {durations?.find(d => d.id === selectedDuration)?.duration_days 
                ? ` (${durations?.find(d => d.id === selectedDuration)?.duration_days} days)` 
                : ` (${durations?.find(d => d.id === selectedDuration)?.duration_months} months)`}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Price:</div>
            <div className="text-lg font-bold">
              ${calculatePrice(getSelectedPlanPrice(), getSelectedDurationDiscount())}
              {getSelectedDurationDiscount() > 0 && (
                <span className="ml-2 text-sm text-green-600">
                  (Save {getSelectedDurationDiscount()}%)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      )}
    </div>
  );
};

SubscriptionPlanSelection.propTypes = {
  patientId: PropTypes.string.isRequired,
  onSubscriptionCreated: PropTypes.func
};

SubscriptionPlanSelection.defaultProps = {
  onSubscriptionCreated: null
};

export default SubscriptionPlanSelection;
