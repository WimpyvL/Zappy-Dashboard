/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * It will be replaced with a component that uses the subscription plans API instead.
 * See src/apis/treatmentPackages/DEPRECATED.md for more information.
 */

import React, { useState, useEffect } from 'react';
import { useSubscriptionDurations } from '../../apis/subscriptionDurations/hooks';
import { useTreatmentPackages } from '../../apis/treatmentPackages/hooks';
import { useSubscribePatient } from '../../apis/treatmentPackages/hooks';
import { toast } from 'react-toastify';

// Display deprecation warning in console
console.warn(
  'The TreatmentPackageSelection component is deprecated and will be removed in a future version. ' +
  'It will be replaced with a component that uses the subscription plans API instead.'
);

const TreatmentPackageSelection = ({ patientId }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get all available conditions for filtering
  const [conditions, setConditions] = useState([]);

  // Fetch subscription durations
  const { 
    data: durations, 
    isLoading: durationsLoading 
  } = useSubscriptionDurations();

  // Fetch treatment packages with condition filter
  const { 
    data: packagesData, 
    isLoading: packagesLoading 
  } = useTreatmentPackages({ active: true, condition: selectedCondition || undefined });

  // Subscribe patient mutation
  const { mutate: subscribePatient, isLoading: subscribing } = useSubscribePatient({
    onSuccess: () => {
      toast.success('Subscription created successfully!');
      setSelectedPackage(null);
      setSelectedDuration(null);
    },
    onError: (error) => {
      toast.error(`Subscription failed: ${error.message}`);
    }
  });

  // Extract unique conditions for the filter
  useEffect(() => {
    if (packagesData?.data) {
      const uniqueConditions = [...new Set(packagesData.data.map(pkg => pkg.condition))].filter(Boolean);
      setConditions(uniqueConditions);
    }
  }, [packagesData]);

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
  const handleSubscribe = () => {
    if (!patientId) {
      toast.error('Patient ID is required');
      return;
    }

    if (!selectedPackage || !selectedDuration) {
      toast.error('Please select a treatment package and subscription duration');
      return;
    }

    setIsLoading(true);
    subscribePatient({
      patientId,
      packageId: selectedPackage,
      durationId: selectedDuration
    });
  };

  const getSelectedDurationDiscount = () => {
    if (!selectedDuration || !durations) return 0;
    const duration = durations.find(d => d.id === selectedDuration);
    return duration?.discount_percent || 0;
  };

  const getSelectedPackagePrice = () => {
    if (!selectedPackage || !packagesData?.data) return 0;
    const pkg = packagesData.data.find(p => p.id === selectedPackage);
    return pkg?.base_price || 0;
  };

  return (
    <div className="subscription-selection-container">
      <h2 className="text-2xl font-bold mb-6">Select a Treatment Plan</h2>
      
      {/* Condition Filter */}
      {conditions.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Condition</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="">All Conditions</option>
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Treatment Packages */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Treatment Packages</h3>
        
        {packagesLoading ? (
          <div>Loading packages...</div>
        ) : packagesData?.data?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packagesData.data.map(pkg => (
              <div 
                key={pkg.id}
                className={`p-4 border rounded cursor-pointer transition-all ${
                  selectedPackage === pkg.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <h4 className="font-bold">{pkg.name}</h4>
                <div className="text-sm text-gray-600 mb-2">Condition: {pkg.condition}</div>
                <div className="font-semibold mb-2">
                  ${calculatePrice(pkg.base_price, getSelectedDurationDiscount())} 
                  {getSelectedDurationDiscount() > 0 && (
                    <span className="line-through text-gray-500 ml-2">${pkg.base_price}</span>
                  )}
                </div>
                <p className="text-sm">{pkg.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>No treatment packages available</div>
        )}
      </div>

      {/* Subscription Durations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Subscription Duration</h3>
        
        {durationsLoading ? (
          <div>Loading durations...</div>
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
                  <span>{duration.duration_months} {duration.duration_months === 1 ? 'month' : 'months'}</span>
                  {duration.discount_percent > 0 && (
                    <span className="text-green-600 font-semibold">Save {duration.discount_percent}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No subscription durations available</div>
        )}
      </div>

      {/* Selected Plan Summary & Subscription Button */}
      {selectedPackage && (
        <div className="bg-gray-50 p-4 rounded border mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Selected Plan</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600">Treatment Package:</div>
            <div className="font-semibold">
              {packagesData?.data?.find(p => p.id === selectedPackage)?.name}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Duration:</div>
            <div className="font-semibold">
              {durations?.find(d => d.id === selectedDuration)?.name} 
              ({durations?.find(d => d.id === selectedDuration)?.duration_months} months)
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Price:</div>
            <div className="text-lg font-bold">
              ${calculatePrice(getSelectedPackagePrice(), getSelectedDurationDiscount())}
              {getSelectedDurationDiscount() > 0 && (
                <span className="ml-2 text-sm text-green-600">
                  (Save {getSelectedDurationDiscount()}%)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isLoading || subscribing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isLoading || subscribing ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentPackageSelection;
