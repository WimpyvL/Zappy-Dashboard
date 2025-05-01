import React, { useState, useEffect } from 'react';
import {
  // Clock, // Removed unused import
  Calendar,
  Pill,
  // CheckCircle, // Removed unused import
  // X, // Removed unused import
  // Edit, // Removed unused import
  // Package, // Removed unused import
  // FileText, // Removed unused import
  CreditCard,
  AlertCircle,
  Plus,
  Truck,
  PauseCircle, // Added for Pause button
  XCircle, // Added for Cancel button
  Edit, // Re-added Edit icon
} from 'lucide-react';
// Import necessary functions from stripeCheckout utility, including the new one
import {
  // redirectToCheckout, // Removed unused import
  updateSubscription,
  cancelSubscription,
  redirectToCustomerPortal // Added import
} from '../../utils/stripeCheckout';

// Enhanced version of PatientSubscriptions that includes Stripe Checkout integration
const PatientSubscriptions = ({ patient }) => {
  const [paymentStatus, setPaymentStatus] = useState('unknown');
  const [lastShipment, setLastShipment] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false); // To disable buttons during API call
  const [error, setError] = useState(null); // To display errors

  // --- Mock Subscription ID ---
  // In a real app, this would be fetched from the backend along with other subscription data
  const mockSubscriptionId = patient ? `sub_mock_${patient.id}` : null;
  // --- End Mock Data ---

  useEffect(() => {
    // In a real app, you would fetch these from your API
    // This is mock data for demonstration purposes
    if (patient) {
      // Mock payment status
      setPaymentStatus(patient.paymentStatus || 'active');

      // Mock last shipment
      setLastShipment({
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        trackingNumber: 'TRK' + Math.floor(Math.random() * 1000000),
        contents: [patient.medication],
      });

      // Mock medications
      setMedications([
        {
          name: patient.medication,
          dose: '0.5mg',
          frequency: 'Weekly',
          remaining: 3,
        },
      ]);

      setLoading(false);
    }
  }, [patient]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Calculate next shipment date
  const getNextShipmentDate = () => {
    // In a real app, this would come from the backend
    // For now, just add 30 days to today's date as an example
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return formatDate(nextDate);
  };

  // Renamed function: Handles redirecting to Stripe Customer Portal for managing subscription/payment
  const handleManageSubscriptionViaPortal = async () => {
    if (!patient || !patient.id) {
      setError('Patient information is missing.');
      return;
    }
    setIsSubmitting(true); // Use submitting state to provide feedback
    setError(null);
    try {
      await redirectToCustomerPortal(patient.id);
      // Redirect happens in the utility function, no further action needed here.
    } catch (err) {
      console.error('Failed to redirect to customer portal:', err);
      setError('Could not open subscription/payment settings. Please try again.');
      setIsSubmitting(false); // Only set submitting false if redirect fails
    }
    // Don't set isSubmitting to false here if redirect is successful, as the page will navigate away.
  };

  // Handle pausing the subscription
  const handlePauseSubscription = async () => {
    if (!mockSubscriptionId) {
      setError('Subscription ID not found.');
      return;
    }
    if (window.confirm('Are you sure you want to pause this subscription? Payments will stop, but the subscription remains active.')) {
      setIsSubmitting(true);
      setError(null);
      try {
        // Example: Pausing collection. Backend needs to handle this specific update.
        await updateSubscription(mockSubscriptionId, { pause_collection: { behavior: 'void' } });
        // TODO: Update local state to reflect paused status if needed, ideally refetch data
        alert('Subscription paused successfully.'); // Placeholder feedback
      } catch (err) {
        console.error('Failed to pause subscription:', err);
        setError('Failed to pause subscription. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle cancelling the subscription
  const handleCancelSubscription = async () => {
    if (!mockSubscriptionId) {
      setError('Subscription ID not found.');
      return;
    }
    if (window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      setIsSubmitting(true);
      setError(null);
      try {
        // Cancel at period end by default
        await cancelSubscription(mockSubscriptionId, false);
        // TODO: Update local state to reflect cancelled status, ideally refetch data
        alert('Subscription cancelled successfully.'); // Placeholder feedback
        setPaymentStatus('cancelled'); // Basic local state update for demo
      } catch (err) {
        console.error('Failed to cancel subscription:', err);
        setError('Failed to cancel subscription. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Render payment status indicator
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Payment Current
          </span>
        );
      case 'past_due':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Payment Past Due
          </span>
        );
      case 'unpaid':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Payment Failed
          </span>
        );
      // Added case for cancelled status
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Subscription Details
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Subscription Details
        </h2>
      </div>

      <div className="p-6">
        {/* Display Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {patient.subscriptionPlan ? (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    {patient.subscriptionPlan.charAt(0).toUpperCase() +
                      patient.subscriptionPlan.slice(1)}{' '}
                    Plan
                  </h3>
                  <p className="text-sm text-gray-500">Active subscription</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                  {renderPaymentStatus()}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">
                      Medications
                    </h4>
                    {medications.map((medication, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-900 mb-2"
                      >
                        <Pill className="h-4 w-4 text-indigo-500 mr-2" />
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-xs text-gray-500">
                            {medication.dose} - {medication.frequency} -{' '}
                            {medication.remaining} refills remaining
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Added placeholder onClick handler */}
                    <button
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-900 flex items-center disabled:opacity-50"
                      onClick={() => alert('Feature to add medication to an existing subscription is not yet implemented.')}
                      // disabled // Optionally disable if preferred
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add medication
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">
                      Next Shipment
                    </h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {getNextShipmentDate()}
                    </div>

                    {lastShipment && (
                      <div className="mt-4">
                        <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">
                          Last Shipment
                        </h4>
                        <div className="flex items-center text-sm text-gray-900">
                          <Truck className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p>{formatDate(lastShipment.date)}</p>
                            <p className="text-xs text-gray-500">
                              Tracking: {lastShipment.trackingNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              Contents: {lastShipment.contents.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-end space-x-2">
                    {/* Pause Button */}
                    <button
                      className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-yellow-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                      onClick={handlePauseSubscription}
                      disabled={isSubmitting || paymentStatus === 'cancelled'}
                    >
                      <PauseCircle className="h-4 w-4 mr-1" /> Pause
                    </button>
                    {/* Modify Button - Updated onClick */}
                    <button
                      className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                      onClick={handleManageSubscriptionViaPortal} // Use portal redirect
                       disabled={isSubmitting || paymentStatus === 'cancelled'}
                     >
                       <Edit className="h-4 w-4 mr-1" /> Manage Billing
                     </button>
                     {/* Cancel Button */}
                     <button
                      className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-red-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                      onClick={handleCancelSubscription}
                      disabled={isSubmitting || paymentStatus === 'cancelled'}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Subscription Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {patient.subscriptionPlan} delivery
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Started</p>
                  <p className="text-sm font-medium text-gray-900">
                    {patient.lastVisit
                      ? formatDate(patient.lastVisit)
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="flex items-center">
                    <CreditCard className="h-3 w-3 text-gray-400 mr-1" />
                    {/* Updated onClick handler */}
                    <button
                      className="text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleManageSubscriptionViaPortal} // Use portal redirect
                      disabled={isSubmitting}
                    >
                      Update Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Processing Alert */}
            {paymentStatus === 'past_due' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your payment is past due. Please update your payment
                      method to continue your subscription.
                    </p>
                    <div className="mt-2">
                      {/* Updated onClick handler */}
                      <button
                        className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                        onClick={handleManageSubscriptionViaPortal} // Use portal redirect
                        disabled={isSubmitting}
                      >
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expandability note */}
            <div className="border border-indigo-100 bg-indigo-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-indigo-700 mb-2">
                Looking to add multiple medications?
              </h4>
              <p className="text-sm text-indigo-600">
                This view currently shows a single medication subscription.
                Future updates will enable managing multiple medications and
                subscription plans for each patient.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <Pill className="h-10 w-10 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">
              No Active Subscription
            </h3>
            <p className="text-gray-500 mb-4">
              This patient doesn't have an active subscription plan.
            </p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
              onClick={handleManageSubscriptionViaPortal} // Use the existing portal redirect function
              disabled={isSubmitting} // Disable while submitting/redirecting
            >
              {isSubmitting ? 'Redirecting...' : 'Add / Manage Subscription'} {/* Update button text */}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSubscriptions;
