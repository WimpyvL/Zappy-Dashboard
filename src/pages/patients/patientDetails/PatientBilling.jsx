// components/patients/components/PatientBilling.jsx - Refactored for Supabase Invoices
import React, { useState, useMemo } from "react"; // Added state/memo
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Link as LinkIcon // Renamed Link icon to avoid conflict
} from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // React Router Link
import { redirectToCheckout } from "../../../utils/stripeCheckout";
import LoadingSpinner from "./common/LoadingSpinner";
// import apiService from "../../../utils/apiService"; // Keep commented/remove later
import { useInvoices } from "../../../apis/invoices/hooks"; // Import invoice hook
import { useQueryClient } from '@tanstack/react-query'; // Import query client for refreshPatient placeholder

// --- PaymentMethodCard ---
// TODO: Refactor handleMakeDefault to use a mutation hook when payment methods API is migrated
const PaymentMethodCard = ({
  method,
  isDefault,
  patientId,
  refreshPatient, // This refresh might need updating too
}) => {
  const handleMakeDefault = async () => {
    try {
      // Placeholder for old logic - Replace with mutation hook call
      console.warn("handleMakeDefault needs refactoring with mutation hook.");
      // await apiService.put(`/api/v1/admin/patients/${patientId}/payment_methods/${method.id}/make_default`);
      toast.info("Updating default payment method needs refactoring.");
      // refreshPatient(); // Invalidate query instead
    } catch (error) {
      console.error("Failed to update default payment method:", error);
      toast.error("Failed to update payment method");
    }
  };

  return (
    <div
      className={`border ${
        isDefault ? "border-indigo-300 bg-indigo-50" : "border-gray-200"
      } rounded-lg p-4 flex justify-between items-center`}
    >
      <div className="flex items-center">
        <div className="mr-4">
          {method.type === "card" ? (
            <CreditCard className="h-6 w-6 text-gray-500" />
          ) : (
            <DollarSign className="h-6 w-6 text-gray-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {method.type === "card"
              ? `${method.brand} ending in ${method.last4}`
              : "Bank Account"}
            {isDefault && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                Default
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {method.type === "card"
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
            // TODO: Replace onClick with mutation hook call
          >
            Make Default
          </button>
        )}
      </div>
    </div>
  );
};

// --- PaymentStatusBadge ---
// Adapting to invoice statuses
const PaymentStatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        lowerStatus === "paid"
          ? "bg-green-100 text-green-800"
          : lowerStatus === "pending" || lowerStatus === "draft" || lowerStatus === "sent"
          ? "bg-yellow-100 text-yellow-800"
          : lowerStatus === "failed" || lowerStatus === "overdue" || lowerStatus === "void"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800" // Default for unknown/other statuses
      }`}
    >
      {lowerStatus === "paid" ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : lowerStatus === "pending" || lowerStatus === "sent" ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" /> // Icon for failed/overdue/void
      )}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};


// --- PatientBilling Component ---
const PatientBilling = ({ patient, refreshPatient }) => { // Removed invoices, loading props
  const [currentPage, setCurrentPage] = useState(1); // State for invoice pagination
  const queryClient = useQueryClient();

  // Memoize filters for invoices
  const filters = useMemo(() => ({ patientId: patient?.id }), [patient?.id]);

  // Fetch invoices using the hook
  const {
      data: invoicesData,
      isLoading: invoicesLoading, // Use hook's loading state
      error: invoicesError,
  } = useInvoices(currentPage, filters, {
      enabled: !!patient?.id, // Only fetch if patientId is available
  });

  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination || { totalPages: 1 };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
     try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date);
    } catch (e) {
        return "Invalid Date";
    }
  };

  // Handle initiating a payment through Stripe Checkout (keep as is for now)
  const handlePayment = async () => {
    try {
      // TODO: Update planDetails based on actual subscription data structure if available
      const planDetails = {
        name: `${
          patient?.subscriptionPlan // Use optional chaining
            ? patient.subscriptionPlan.charAt(0).toUpperCase() +
              patient.subscriptionPlan.slice(1)
            : "Basic"
        } Plan`,
        description: `Monthly subscription for ${patient?.medication || 'service'}`, // Use optional chaining
        price: 199.99, // This would come from your actual plan data
        medication: patient?.medication, // Use optional chaining
      };

      await redirectToCheckout(patient.id, planDetails);
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      toast.error("Failed to initiate payment process");
    }
  };

  // TODO: Refactor subscription management functions (pause, cancel)
  // These will require dedicated mutation hooks once the backend logic/tables exist
  const handlePauseSubscription = async () => {
      console.warn("Pausing subscription needs refactoring with mutation hook.");
      toast.info("Pausing subscription needs refactoring.");
      // try {
      //   await apiService.post(`/api/v1/admin/patients/${patient.id}/subscription/pause`);
      //   toast.success("Subscription paused successfully");
      //   refreshPatient(); // Replace with query invalidation
      // } catch (error) { ... }
  };

  const handleCancelSubscription = async () => {
      if (window.confirm("Are you sure you want to cancel this subscription? This action cannot be undone.")) {
          console.warn("Cancelling subscription needs refactoring with mutation hook.");
          toast.info("Cancelling subscription needs refactoring.");
          // try {
          //   await apiService.post(`/api/v1/admin/patients/${patient.id}/subscription/cancel`);
          //   toast.success("Subscription cancelled successfully");
          //   refreshPatient(); // Replace with query invalidation
          // } catch (error) { ... }
      }
  };

  // TODO: Refactor refreshPatient to use queryClient.invalidateQueries
   const handleRefreshPatient = () => {
       console.warn("refreshPatient needs to be updated to use query invalidation.");
       // Example: queryClient.invalidateQueries({ queryKey: ['patient', patient.id] });
       if (refreshPatient) refreshPatient(); // Keep old prop call temporarily if needed elsewhere
   };


  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
          {/* TODO: Update onClick to potentially open Stripe portal or dedicated update form */}
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            onClick={handlePayment}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Update Payment Method
          </button>
        </div>

        {/* TODO: Fetch payment methods from Stripe/backend */}
        {/* {loading.patient ? ( <LoadingSpinner size="small" /> ) : */}
        {patient?.paymentMethods && patient.paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {patient.paymentMethods.map((method, index) => (
              <PaymentMethodCard
                key={index}
                method={method}
                isDefault={method.isDefault}
                patientId={patient.id}
                refreshPatient={handleRefreshPatient} // Pass updated refresh handler
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No payment methods on file.
            <div className="mt-2">
              {/* TODO: Update onClick to potentially open Stripe portal or dedicated add form */}
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

        {invoicesLoading ? ( // Use hook's loading state
          <LoadingSpinner message="Loading invoices..." />
        ) : invoicesError ? ( // Use hook's error state
           <div className="text-center py-8 text-red-500">
              Error loading invoices: {invoicesError.message}
           </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issue_date)}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.total_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* TODO: Add link/button to view invoice details page */}
                      <Link
                        to={`/invoices/${invoice.id}`} // Example route
                        className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                      >
                         <LinkIcon className="h-4 w-4 mr-1"/> View
                      </Link>
                      {/* Keep Pay Now button, assuming handlePayment can handle invoices */}
                      {(invoice.status === "pending" || invoice.status === "draft" || invoice.status === "sent" || invoice.status === "overdue") && (
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={handlePayment} // This might need adjustment for specific invoice payment
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {/* TODO: Add pagination controls for invoices if needed */}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No billing history found for this patient.
          </div>
        )}
      </div>

      {/* Subscription Summary */}
      {/* TODO: Refactor this section once subscription data/API/hooks are available */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Subscription Summary
        </h2>

        {/* {loading.patient ? ( <LoadingSpinner size="small" /> ) : */}
        {patient?.subscriptionPlan ? ( // Use optional chaining
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {patient.subscriptionPlan.charAt(0).toUpperCase() +
                    patient.subscriptionPlan.slice(1)}{" "}
                  Plan
                </p>
                <p className="text-sm text-gray-500">Monthly subscription</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  $199.99/month {/* Placeholder price */}
                </p>
                {/* TODO: Link to subscription management page/modal */}
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                  // onClick={() => (window.location.href = `/patients/${patient.id}/subscription/change`)}
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
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Started On</p>
                  <p className="text-sm font-medium">
                    {patient.subscriptionStartDate
                      ? formatDate(patient.subscriptionStartDate)
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={handlePauseSubscription} // Use refactored handler
              >
                Pause Subscription
              </button>
              <button
                className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                onClick={handleCancelSubscription} // Use refactored handler
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Patient does not have an active subscription.
            <div className="mt-2">
              {/* TODO: Update onClick to initiate subscription flow */}
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
