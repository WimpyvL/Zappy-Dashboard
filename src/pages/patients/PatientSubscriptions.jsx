import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Pill, 
  CheckCircle, 
  X, 
  Edit, 
  Package,
  FileText,
  CreditCard,
  AlertCircle,
  Plus,
  Truck
} from 'lucide-react';
import { redirectToCheckout } from '../../utils/stripeCheckout';

// Enhanced version of PatientSubscriptions that includes Stripe Checkout integration
const PatientSubscriptions = ({ patient }) => {
  const [paymentStatus, setPaymentStatus] = useState('unknown');
  const [lastShipment, setLastShipment] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        contents: [patient.medication]
      });
      
      // Mock medications
      setMedications([
        {
          name: patient.medication,
          dose: '0.5mg',
          frequency: 'Weekly',
          remaining: 3
        }
      ]);
      
      setLoading(false);
    }
  }, [patient]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };
  
  // Calculate next shipment date
  const getNextShipmentDate = () => {
    // In a real app, this would come from the backend
    // For now, just add 30 days to today's date as an example
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return formatDate(nextDate);
  };
  
  // Handle subscription management with Stripe
  const handleSubscriptionManagement = async () => {
    try {
      // Prepare plan details to send to checkout
      const planDetails = {
        name: `${patient.subscriptionPlan ? patient.subscriptionPlan.charAt(0).toUpperCase() + patient.subscriptionPlan.slice(1) : 'Basic'} Plan`,
        description: `Monthly subscription for ${patient.medication}`,
        price: 199.99, // This would come from your actual plan data
        medication: patient.medication
      };
      
      await redirectToCheckout(patient.id, planDetails);
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
      // Handle error - you could show an error message to the user
    }
  };
  
  // Render payment status indicator
  const renderPaymentStatus = () => {
    switch(paymentStatus) {
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
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Subscription Details</h2>
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
        <h2 className="text-lg font-medium text-gray-900">Subscription Details</h2>
      </div>
      
      <div className="p-6">
        {patient.subscriptionPlan ? (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    {patient.subscriptionPlan.charAt(0).toUpperCase() + patient.subscriptionPlan.slice(1)} Plan
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
                    <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Medications</h4>
                    {medications.map((medication, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-900 mb-2">
                        <Pill className="h-4 w-4 text-indigo-500 mr-2" />
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-xs text-gray-500">
                            {medication.dose} - {medication.frequency} - {medication.remaining} refills remaining
                          </p>
                        </div>
                      </div>
                    ))}
                    <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-900 flex items-center">
                      <Plus className="h-3 w-3 mr-1" />
                      Add medication
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Next Shipment</h4>
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {getNextShipmentDate()}
                    </div>
                    
                    {lastShipment && (
                      <div className="mt-4">
                        <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Last Shipment</h4>
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
                    <button className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50">
                      Pause Subscription
                    </button>
                    <button 
                      className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50"
                      onClick={handleSubscriptionManagement}
                    >
                      Modify
                    </button>
                    <button className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-red-700 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subscription Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Subscription Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">{patient.subscriptionPlan} delivery</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Started</p>
                  <p className="text-sm font-medium text-gray-900">{patient.lastVisit ? formatDate(patient.lastVisit) : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="flex items-center">
                    <CreditCard className="h-3 w-3 text-gray-400 mr-1" />
                    <button 
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                      onClick={handleSubscriptionManagement}
                    >
                      Update
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
                      Your payment is past due. Please update your payment method to continue your subscription.
                    </p>
                    <div className="mt-2">
                      <button
                        className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        onClick={handleSubscriptionManagement}
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
                This view currently shows a single medication subscription. Future updates will enable
                managing multiple medications and subscription plans for each patient.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <Pill className="h-10 w-10 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No Active Subscription</h3>
            <p className="text-gray-500 mb-4">This patient doesn't have an active subscription plan.</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
              onClick={handleSubscriptionManagement}
            >
              Add Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSubscriptions;