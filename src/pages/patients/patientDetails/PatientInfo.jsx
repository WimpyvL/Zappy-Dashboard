// components/patients/components/PatientInfo.jsx
import React from 'react';
import { Mail, Phone, MapPin, Calendar, AlertCircle, Edit } from 'lucide-react';
import ConsolidatedSubscriptions from '../../../components/subscriptions/ConsolidatedSubscriptions';
import { usePatientSubscription } from '../../../apis/treatmentPackages/hooks';

const PatientInfo = ({ patient }) => {
  // Fetch patient's subscription using the hook
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2">🧑</span> Patient Information
            </h2>
            <button
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              onClick={() => alert('Edit functionality needs to be implemented')}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
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

        {/* Consolidated Subscriptions Component */}
        <ConsolidatedSubscriptions patient={patient} />
      </div>

      {/* Right column - now used for other patient information */}
      <div className="space-y-6">
        {/* Insurance Information Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2">🏥</span> Insurance Information
            </h2>
            <button
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              onClick={() => alert('Insurance edit functionality needs to be implemented')}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Insurance Provider</p>
              <p className="text-sm font-medium">{patient.insurance_provider || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Policy Number</p>
              <p className="text-sm font-medium">{patient.insurance_policy_number || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Group Number</p>
              <p className="text-sm font-medium">{patient.insurance_group_number || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Primary Holder</p>
              <p className="text-sm font-medium">{patient.insurance_primary_holder || 'Patient'}</p>
            </div>
            
            {/* Removed small update button in favor of the main Edit button */}
          </div>
        </div>
        
        {/* Pharmacy Information Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2">💊</span> Pharmacy Information
            </h2>
            <button
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              onClick={() => alert('Pharmacy edit functionality needs to be implemented')}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Preferred Pharmacy</p>
              <p className="text-sm font-medium">{patient.preferred_pharmacy || 'Not specified'}</p>
            </div>
            
            {/* Removed small update button in favor of the main Edit button */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
