import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Pill,
  CreditCard,
  AlertCircle,
  Plus,
  Truck,
  PauseCircle,
  XCircle,
  Edit,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckSquare
} from 'lucide-react';
import {
  updateSubscription,
  cancelSubscription,
  redirectToCustomerPortal
} from '../../utils/stripeCheckout';

const ConsolidatedSubscriptions = ({ patient }) => {
  const [paymentStatus, setPaymentStatus] = useState('unknown');
  const [lastShipment, setLastShipment] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [previousSubscriptions, setPreviousSubscriptions] = useState([]);
  const [expandedHistoryItem, setExpandedHistoryItem] = useState(null);

  // --- Mock Subscription ID ---
  const mockSubscriptionId = patient ? `sub_mock_${patient.id}` : null;
  // --- End Mock Data ---

  // Fetch subscription data
  useEffect(() => {
    // In a real app, you would fetch these from your API
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

      // Mock previous subscriptions
      setPreviousSubscriptions([
        {
          id: 'sub_prev_1',
          planName: 'Basic Plan',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'expired',
          totalPaid: 99.99,
          medications: ['Generic Medication A'],
          invoiceId: 'inv_12345'
        },
        {
          id: 'sub_prev_2',
          planName: 'Premium Plan',
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          status: 'cancelled',
          totalPaid: 199.99,
          medications: ['Brand Medication B', 'Generic Supplement C'],
          invoiceId: 'inv_12346'
        }
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
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return formatDate(nextDate);
  };

  // Handle redirecting to Stripe Customer Portal
  const handleManageSubscriptionViaPortal = async () => {
    if (!patient || !patient.id) {
      setError('Patient information is missing.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await redirectToCustomerPortal(patient.id);
    } catch (err) {
      console.error('Failed to redirect to customer portal:', err);
      setError('Could not open subscription/payment settings. Please try again.');
      setIsSubmitting(false);
    }
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
        await updateSubscription(mockSubscriptionId, { pause_collection: { behavior: 'void' } });
        alert('Subscription paused successfully.');
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
        await cancelSubscription(mockSubscriptionId, false);
        alert('Subscription cancelled successfully.');
        setPaymentStatus('cancelled');
      } catch (err) {
        console.error('Failed to cancel subscription:', err);
        setError('Failed to cancel subscription. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Toggle history item expansion
  const toggleHistoryItem = (id) => {
    if (expandedHistoryItem === id) {
      setExpandedHistoryItem(null);
    } else {
      setExpandedHistoryItem(id);
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

  // Get status color class based on status string
  const getStatusColorClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Subscription Information
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
          Subscription Information
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
            {/* Quick Status Section (from the sidebar component) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Subscription Status
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(paymentStatus)}`}>
                    {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Unknown'}
                  </span>
                  {renderPaymentStatus()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Subscription ID</p>
                  <p className="text-sm font-medium text-gray-900">{mockSubscriptionId?.substring(0, 8) || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next Billing Date</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {getNextShipmentDate()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    {mockSubscriptionId ? 'Credit card on file' : 'Not available'}
                  </p>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                  onClick={handleManageSubscriptionViaPortal}
                  disabled={isSubmitting || paymentStatus === 'cancelled'}
                >
                  <Edit className="h-4 w-4 mr-1" /> Manage Billing
                </button>
              </div>
            </div>

            {/* Current Subscription Details */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    {patient.subscriptionPlan?.charAt(0).toUpperCase() +
                      patient.subscriptionPlan?.slice(1) || 'Current'}{' '}
                    Plan
                  </h3>
                  <p className="text-sm text-gray-500">Active subscription</p>
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
                    <button
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-900 flex items-center disabled:opacity-50"
                      onClick={() => alert('Feature to add medication to an existing subscription is not yet implemented.')}
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

                {/* Treatment Adherence */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">
                    Treatment Adherence
                  </h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    {/* Assuming 75% progress as a placeholder */}
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <div>Start</div>
                    <div className="flex items-center">
                      <CheckSquare className="h-3 w-3 text-green-500 mr-1" />
                      <span>75% adherence rate</span>
                    </div>
                    <div>Goal</div>
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
                    {/* Modify Button */}
                    <button
                      className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                      onClick={handleManageSubscriptionViaPortal}
                      disabled={isSubmitting || paymentStatus === 'cancelled'}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modify
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
                Billing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {patient.subscriptionPlan || 'Standard'} delivery
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Billing Cycle</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    Monthly
                  </p>
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
                    <button
                      className="text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleManageSubscriptionViaPortal}
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
                      <button
                        className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                        onClick={handleManageSubscriptionViaPortal}
                        disabled={isSubmitting}
                      >
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription History Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setShowHistory(!showHistory)}
              >
                <h3 className="text-md font-medium text-gray-900">
                  Subscription History
                </h3>
                <button className="text-gray-500 hover:text-gray-700">
                  {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {showHistory && (
                <div className="p-4">
                  {previousSubscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {previousSubscriptions.map((subscription) => (
                        <div key={subscription.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleHistoryItem(subscription.id)}
                          >
                            <div>
                              <p className="font-medium text-sm">{subscription.planName}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(subscription.status)}`}>
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                              </span>
                              <button className="text-gray-500 hover:text-gray-700">
                                {expandedHistoryItem === subscription.id ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />
                                }
                              </button>
                            </div>
                          </div>
                          
                          {expandedHistoryItem === subscription.id && (
                            <div className="p-3 bg-white">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Medications</p>
                                  <ul className="mt-1 text-sm">
                                    {subscription.medications.map((med, idx) => (
                                      <li key={idx} className="flex items-center">
                                        <Pill className="h-3 w-3 text-gray-400 mr-1" />
                                        {med}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Billing Information</p>
                                  <p className="text-sm mt-1">Total paid: ${subscription.totalPaid.toFixed(2)}</p>
                                  <button 
                                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
                                    onClick={() => alert(`View invoice ${subscription.invoiceId}`)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    View Invoice
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No previous subscriptions found.</p>
                  )}
                </div>
              )}
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
              onClick={handleManageSubscriptionViaPortal}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Redirecting...' : 'Add / Manage Subscription'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolidatedSubscriptions;
