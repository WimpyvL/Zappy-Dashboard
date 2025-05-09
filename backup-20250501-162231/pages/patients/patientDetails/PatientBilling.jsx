// components/patients/components/PatientBilling.jsx
import React from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { redirectToCheckout } from '../../../utils/stripeCheckout';
import { usePauseSubscription, useCancelSubscription } from '../../../apis/subscriptionPlans/hooks';
import LoadingSpinner from './common/LoadingSpinner';

const PaymentMethodCard = ({
  method,
  isDefault,
  patientId,
  refreshPatient,
}) => {
  const handleMakeDefault = async () => {
    // TODO: Implement backend call to set default payment method
    toast.info('Setting default payment method - Not implemented yet.');
    /*
    try {
      // const response = await someBackendFunctionToSetDefault(patientId, method.id); // Replace with actual backend call
      // toast.success('Default payment method updated');
      // refreshPatient(); // Refresh data after successful update
    } catch (error) {
      console.error('Failed to update default payment method:', error);
      toast.error('Failed to update payment method');
    }
    */
  };

  return (
    <div
      className={`border ${
        isDefault ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
      } rounded-lg p-4 flex justify-between items-center`}
    >
      <div className="flex items-center">
        <div className="mr-4">
          {method.type === 'card' ? (
            <CreditCard className="h-6 w-6 text-gray-500" />
          ) : (
            <DollarSign className="h-6 w-6 text-gray-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {method.type === 'card'
              ? `${method.brand} ending in ${method.last4}`
              : 'Bank Account'}
            {isDefault && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                Default
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {method.type === 'card'
              ? `Expires ${method.expMonth}/${method.expYear}`
              : `****${method.last4}`}
          </p>
        </div>
      </div>
      <div>
        {!isDefault && (
          <button
            className="text-sm text-indigo-600 hover:text-indigo-900"
            onClick={handleMakeDefault}
          >
            Make Default
          </button>
        )}
      </div>
    </div>
  );
};

const PaymentStatusBadge = ({ status }) => {
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        status === 'paid'
          ? 'bg-green-100 text-green-800'
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'paid' ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : status === 'pending' ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PatientBilling = ({ patient, invoices, loading, refreshPatient }) => {
  // Format date for display
  const pauseSubscriptionMutation = usePauseSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();

  // TODO: Implement invoice viewing functionality

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Handle initiating a payment through Stripe Checkout
  const handlePayment = async () => {
    try {
      // Prepare plan details to send to checkout
      const planDetails = {
        name: `${
          patient.subscriptionPlan
            ? patient.subscriptionPlan.charAt(0).toUpperCase() +
              patient.subscriptionPlan.slice(1)
            : 'Basic'
        } Plan`,
        description: `Monthly subscription for ${patient.medication}`,
        price: 199.99, // This would come from your actual plan data
        medication: patient.medication,
      };

      await redirectToCheckout(patient.id, planDetails);
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
      toast.error('Failed to initiate payment process');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            onClick={handlePayment}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Update Payment Method
          </button>
        </div>

        {loading.patient ? (
          <LoadingSpinner size="small" />
        ) : patient.paymentMethods && patient.paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {patient.paymentMethods.map((method, index) => (
              <PaymentMethodCard
                key={index}
                method={method}
                isDefault={method.isDefault}
                patientId={patient.id}
                refreshPatient={refreshPatient}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No payment methods on file.
            <div className="mt-2">
              <button
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={handlePayment}
              >
                Add Payment Method
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Billing History
        </h2>

        {loading.invoices ? (
          <LoadingSpinner size="small" />
        ) : invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {}}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View
                      </button>
                      {invoice.status === 'pending' && (
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={handlePayment}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No billing history found for this patient.
          </div>
        )}
      </div>

      {/* Subscription Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Subscription Summary
        </h2>

        {loading.patient ? (
          <LoadingSpinner size="small" />
        ) : patient.subscriptionPlan ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {patient.subscriptionPlan.charAt(0).toUpperCase() +
                    patient.subscriptionPlan.slice(1)}{' '}
                  Plan
                </p>
                <p className="text-sm text-gray-500">Monthly subscription</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  $199.99/month
                </p>
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={() =>
                    (window.location.href = `/patients/${patient.id}/subscription/change`)
                  }
                >
                  Change Plan
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Subscription Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Next Billing Date</p>
                  <p className="text-sm font-medium">
                    {patient.nextBillingDate
                      ? formatDate(patient.nextBillingDate)
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Started On</p>
                  <p className="text-sm font-medium">
                    {patient.subscriptionStartDate
                      ? formatDate(patient.subscriptionStartDate)
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                className={`px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${pauseSubscriptionMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  // Assuming patient.stripe_subscription_id holds the relevant ID
                  if (patient?.stripe_subscription_id) {
                     pauseSubscriptionMutation.mutate({ 
                       subscriptionId: patient.stripe_subscription_id,
                       patientId: patient.id // Pass patientId for query invalidation if needed by hook
                     });
                  } else {
                    toast.error("Cannot pause: Subscription ID not found.");
                  }
                }}
                disabled={pauseSubscriptionMutation.isLoading}
              >
                {pauseSubscriptionMutation.isLoading ? 'Pausing...' : 'Pause Subscription'}
              </button>
              <button
                className={`px-3 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 ${cancelSubscriptionMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
                    // Assuming patient.stripe_subscription_id holds the relevant ID
                    if (patient?.stripe_subscription_id) {
                      cancelSubscriptionMutation.mutate({ 
                        subscriptionId: patient.stripe_subscription_id,
                        patientId: patient.id // Pass patientId for query invalidation if needed by hook
                      });
                    } else {
                       toast.error("Cannot cancel: Subscription ID not found.");
                    }
                  }
                }}
                disabled={cancelSubscriptionMutation.isLoading}
              >
                {cancelSubscriptionMutation.isLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Patient does not have an active subscription.
            <div className="mt-2">
              <button
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={handlePayment}
              >
                Add Subscription
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientBilling;
