import React from 'react';
import { usePatientSubscription } from '../../apis/treatmentPackages/hooks';
import { usePauseSubscription, useCancelSubscription } from '../../apis/subscriptionPlans/hooks';
import { useCreateCustomerPortalSession } from '../../apis/subscriptionPlans/hooks';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Components
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientSubscriptionDetails = ({ patientId }) => {
  // Fetch patient's active subscription
  const { 
    data: subscription, 
    isLoading,
    refetch 
  } = usePatientSubscription(patientId);

  // Mutations for subscription management
  const { mutate: pauseSubscription, isLoading: isPausing } = usePauseSubscription({
    onSuccess: () => {
      toast.success('Subscription paused successfully');
      refetch();
    }
  });

  const { mutate: cancelSubscription, isLoading: isCancelling } = useCancelSubscription({
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      refetch();
    }
  });

  const { mutate: openPortal, isLoading: isOpeningPortal } = useCreateCustomerPortalSession({
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!subscription) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
        <div className="text-gray-600">You don't have an active subscription.</div>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Calculate savings based on discount percentage
  const calculateSavings = () => {
    if (!subscription.basePrice || !subscription.discountPercent) return 0;
    return (subscription.basePrice * subscription.discountPercent / 100).toFixed(2);
  };

  // Handle pause subscription
  const handlePauseSubscription = () => {
    if (window.confirm('Are you sure you want to pause your subscription? You can resume it later.')) {
      pauseSubscription({
        subscriptionId: subscription.stripeSubscriptionId,
        patientId
      });
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This cannot be undone.')) {
      cancelSubscription({
        subscriptionId: subscription.stripeSubscriptionId,
        patientId
      });
    }
  };

  // Handle manage subscription (Stripe portal)
  const handleManageSubscription = () => {
    openPortal();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Your Subscription</h2>
        
        {/* Package details */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900">{subscription.packageName}</h3>
          <div className="text-sm text-gray-600">Condition: {subscription.packageCondition}</div>
        </div>
        
        {/* Subscription details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Billing Cycle</div>
            <div className="font-medium">{subscription.durationName} ({subscription.durationMonths} months)</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-medium">
              <span className={`px-2 py-1 text-xs rounded-full ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : subscription.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Current Period</div>
            <div className="font-medium">
              {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Monthly Price</div>
            <div className="font-medium">
              ${(subscription.basePrice - calculateSavings()).toFixed(2)}
              {subscription.discountPercent > 0 && (
                <span className="text-green-600 text-sm ml-1">
                  ({subscription.discountPercent}% off)
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleManageSubscription}
            disabled={isOpeningPortal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
          >
            {isOpeningPortal ? 'Opening...' : 'Manage Subscription'}
          </button>
          
          {subscription.status === 'active' && (
            <button
              onClick={handlePauseSubscription}
              disabled={isPausing}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              {isPausing ? 'Processing...' : 'Pause Subscription'}
            </button>
          )}
          
          <button
            onClick={handleCancelSubscription}
            disabled={isCancelling || subscription.status === 'cancelled'}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
          >
            {isCancelling ? 'Processing...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t">
        <h3 className="text-sm font-medium text-gray-500">What's included in your subscription:</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
          <li>Access to all telehealth services in your treatment package</li>
          <li>Ongoing support from healthcare providers</li>
          <li>Secure messaging with your care team</li>
          <li>Medication management and prescription renewals (if applicable)</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientSubscriptionDetails;