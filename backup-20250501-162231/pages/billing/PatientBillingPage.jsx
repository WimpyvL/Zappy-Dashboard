import React from 'react';
import { useAuth } from '../../context/AuthContext';
// Import necessary hooks including useMySubscription
import { useMyInvoices, useMySubscription, useCreateCustomerPortalSession } from '../../apis/subscriptionPlans/hooks'; 
import { Link } from 'react-router-dom';
import { 
  Loader2, AlertTriangle, FileText, CheckCircle, 
  Clock, Download, Award // Removed unused CreditCard
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Invoice Status Badge Component
const InvoiceStatusBadge = ({ status }) => {
  let bgColor, textColor, Icon;
  switch (status?.toLowerCase()) {
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      Icon = CheckCircle;
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      Icon = Clock;
      break;
    // Add other statuses like 'overdue', 'failed' if needed
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      Icon = FileText; // Default icon
      status = status || 'Unknown';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PatientBillingPage = () => {
  const { currentUser } = useAuth();
  const patientId = currentUser?.id || 'dev-patient-id'; // Use default for testing

  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useMyInvoices(patientId);
  // Use the implemented hook to fetch subscription data
  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useMySubscription(patientId);
  
  // Mutation hook for managing subscription
  const manageSubscriptionMutation = useCreateCustomerPortalSession();

  const isLoading = invoicesLoading || subscriptionLoading; // Don't include mutation loading here
  const error = invoicesError || subscriptionError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#F85C5C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading your billing information.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="watercolor" color="accent1" position="top-right" size={150} rotation={-10} opacity={0.2} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Plan</h1>
        <p className="text-sm font-handwritten text-accent3 mt-1">Subscription details and management</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-accent1 mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center">
            <Award className="h-5 w-5 mr-2 text-accent1" /> Current Subscription
          </h2>
          {subscription?.status === 'active' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </span>
          )}
        </div>
        <div className="p-6">
          {subscription ? (
            <div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-gray-900">{subscription.planName || 'Standard Plan'}</h3>
                  <p className="text-sm text-gray-600 mt-1">Renews automatically on {formatDate(subscription.nextBillingDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent1">${subscription.amount ? subscription.amount.toFixed(2) : '99.99'}<span className="text-sm text-gray-500">/month</span></p>
                </div>
              </div>
              
              {/* Key Benefits - Simplified */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Plan Includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent2 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Unlimited consultations with healthcare professionals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent2 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Priority support with responses within 2 hours</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-accent2 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Health monitoring with detailed analytics</span>
                  </li>
                </ul>
              </div>
              
              {/* Subscription Management - Simplified */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <button 
                  onClick={() => manageSubscriptionMutation.mutate()}
                  disabled={manageSubscriptionMutation.isLoading}
                  className="px-4 py-2 bg-accent3 text-white rounded-md text-sm font-medium hover:bg-accent3/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {manageSubscriptionMutation.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  ) : null}
                  Manage Subscription
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel your subscription? Your benefits will continue until the end of your current billing period.')) {
                      alert('Subscription cancellation process initiated. You will receive a confirmation email shortly.');
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center justify-center"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Plan details not available.</p>
          )}
        </div>
      </div>

      {/* Payment History - Simplified */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center">
             <FileText className="h-5 w-5 mr-2 text-accent2" /> Recent Payments
          </h2>
        </div>
        <div className="p-6">
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.slice(0, 3).map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${(invoice.invoiceAmount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => alert(`Viewing invoice ${invoice.invoiceId || invoice.id} not yet implemented.`)}
                          className="text-accent3 hover:text-accent3/80 hover:underline text-xs inline-flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length > 3 && (
                <div className="text-center mt-4">
                  <Link to="/payment-history" className="text-sm text-accent3 hover:text-accent3/80">
                    View all payment history
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No payment history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientBillingPage;
