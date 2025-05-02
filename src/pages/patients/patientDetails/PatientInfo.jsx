// components/patients/components/PatientInfo.jsx
import React from 'react';
import { Mail, Phone, MapPin, Calendar, CreditCard, Clock, CheckSquare, AlertCircle } from 'lucide-react';
import PatientSubscriptions from '../PatientSubscriptions';
import { usePatientSubscription } from '../../../apis/treatmentPackages/hooks'; // Fixed hook name from plural to singular

const PatientInfo = ({ patient }) => {
  // Fetch patient's subscription using the correct hook (singular, not plural)
  const { data: subscription, isLoading: isLoadingSubscription } = usePatientSubscription(patient.id);
  // Using activeSubscription directly since usePatientSubscription already returns the active one
  const activeSubscription = subscription;

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

  // Calculate patient age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper to calculate days remaining until date
  const getDaysRemaining = (dateString) => {
    if (!dateString) return 'Unknown';
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Due now';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column (spans 2 columns on large screens) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Enhanced Patient Information Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🧑</span> Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="text-sm font-medium">{patient.id?.substring(0, 8) || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium">{`${patient.first_name || ''} ${patient.last_name || ''}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium">
                  {formatDate(patient.date_of_birth)} (Age: {calculateAge(patient.date_of_birth)})
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{patient.email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{patient.phone || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium">
                    {patient.address || patient.city || patient.state || patient.zip
                      ? `${patient.address || ''}${patient.city ? ', ' + patient.city : ''}${patient.state ? ', ' + patient.state : ''} ${patient.zip || ''}`.trim().replace(/^,|,$/g, '').replace(/ , /g, ', ')
                      : 'No address on file'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Plan Card (Replacing Medical Information) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💊</span> Treatment Plan
          </h2>
          
          {isLoadingSubscription ? (
            <div className="py-4 text-center text-gray-500">Loading treatment plan...</div>
          ) : activeSubscription ? (
            <div>
              {/* Treatment Effectiveness Alert */}
              <div className="mb-4 bg-blue-50 text-blue-800 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Treatment status:</strong> Patient is on an active treatment plan. 
                  {activeSubscription.currentPeriodStart && 
                    ` Started ${formatDate(activeSubscription.currentPeriodStart)}.`}
                </div>
              </div>
              
              {/* Treatment Package Display */}
              <div className="mb-4 border border-gray-200 rounded-lg p-4 flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-lg font-bold text-gray-700">
                  {activeSubscription.packageName?.charAt(0) || 'T'}
                </div>
                <div className="ml-4 flex-grow">
                  <div className="font-semibold">{activeSubscription.packageName || 'Treatment Package'}</div>
                  <div className="text-sm text-gray-500">{activeSubscription.packageCondition || 'No description available'}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${activeSubscription.basePrice || '0.00'}</div>
                  <div className="text-sm text-gray-500">
                    {activeSubscription.durationName || 'Standard'} subscription
                  </div>
                </div>
              </div>
              
              {/* Next Shipment/Billing */}
              {activeSubscription.currentPeriodEnd && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Next billing</div>
                  <div className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDate(activeSubscription.currentPeriodEnd)} 
                    ({getDaysRemaining(activeSubscription.currentPeriodEnd)} from now)
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                <button className="px-3 py-2 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50">
                  Modify Plan
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Renew Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No active treatment plan. 
              <button className="ml-2 text-blue-600 hover:underline">
                Create new plan
              </button>
            </div>
          )}
        </div>

        {/* Full Subscriptions Component (moved to bottom) */}
        <PatientSubscriptions patient={patient} />
      </div>

      {/* Right column (subscription status and progress) */}
      <div className="space-y-6">
        {/* Subscription Status Card (New) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💳</span> Subscription Status
          </h2>
          
          {isLoadingSubscription ? (
            <div className="py-4 text-center text-gray-500">Loading subscription status...</div>
          ) : activeSubscription ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Subscription ID</p>
                <p className="text-sm font-medium">{activeSubscription.id?.substring(0, 8) || 'Not available'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm font-medium">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(activeSubscription.status)}`}>
                    {activeSubscription.status?.charAt(0).toUpperCase() + activeSubscription.status?.slice(1) || 'Unknown'}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Started</p>
                <p className="text-sm font-medium">{formatDate(activeSubscription.currentPeriodStart)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {activeSubscription.durationName || 'Monthly'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="text-sm font-medium">{formatDate(activeSubscription.currentPeriodEnd)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-sm font-medium flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                  {activeSubscription.stripeSubscriptionId ? 'Credit card on file' : 'Not available'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Update Payment
                </button>
                <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  {activeSubscription.status === 'active' ? 'Pause' : 'Resume'} Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No active subscription found.
            </div>
          )}
        </div>

        {/* Treatment Progress Card (New) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span> Compliance Summary
          </h2>
          
          {isLoadingSubscription ? (
            <div className="py-4 text-center text-gray-500">Loading compliance data...</div>
          ) : activeSubscription ? (
            <div>
              {/* Simple progress indicator */}
              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-1">Treatment Adherence</div>
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
              
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Appointments</div>
                  <div className="text-lg font-semibold">4/5</div>
                  <div className="text-xs text-green-600">80% attended</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Medication</div>
                  <div className="text-lg font-semibold">28/30</div>
                  <div className="text-xs text-green-600">93% adherence</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No treatment compliance data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
