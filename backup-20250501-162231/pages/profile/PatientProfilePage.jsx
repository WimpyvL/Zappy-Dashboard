import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, AlertTriangle, User, Bell, Lock, Edit, 
  CreditCard, FileText, ChevronRight, ShieldCheck, Building
} from 'lucide-react'; 
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';
import { useGetProfile } from '../../apis/users/hooks';
import { toast } from 'react-toastify';
import { formatPhoneNumber } from '../../utils/formatters';

const PatientProfilePage = () => {
  const { currentUser, authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Get detailed profile information using the react-query hook
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    error: profileError 
  } = useGetProfile();
  
  // State for modal visibility (for future password change modal)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#F85C5C]" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading your profile.</p>
        <p className="text-sm">{profileError.message}</p>
      </div>
    );
  }
  
  // Extract user metadata and other profile information
  const metadata = profileData?.user_metadata || {};
  const displayData = {
      firstName: metadata.firstName || metadata.first_name || '',
      lastName: metadata.lastName || metadata.last_name || '',
      email: profileData?.email || '',
      phone: formatPhoneNumber(metadata.phone || ''),
      dob: metadata.dob || '',
      address: metadata.address || '',
      city: metadata.city || '',
      state: metadata.state || '',
      zip: metadata.zip || '',
      // Insurance info
      insuranceProvider: metadata.insuranceProvider || '',
      insurancePolicyId: metadata.insurancePolicyId || '',
      insuranceGroupId: metadata.insuranceGroupId || '',
      // Pharmacy info
      preferredPharmacy: metadata.preferredPharmacy || '',
  };

  const handleChangePassword = () => {
    // For now, navigate to the change password page
    // In future PR we could implement a modal for this
    navigate('/profile/change-password');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="watercolor" color="accent4" position="top-right" size={150} rotation={-10} opacity={0.15} />
      <ChildishDrawingElement type="scribble" color="accent3" position="bottom-left" size={120} rotation={15} opacity={0.1} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-sm font-handwritten text-accent4 mt-1">Manage your profile, billing, and settings</p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-accent4">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" /> Personal Information
          </h2>
          <button 
            onClick={() => navigate('/profile/edit')}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center"
          >
            <Edit className="h-3 w-3 mr-1" /> Edit Profile
          </button>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="sm:col-span-1">
              <dt className="font-medium text-gray-500">First Name</dt>
              <dd className="mt-1 text-gray-900">{displayData.firstName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="font-medium text-gray-500">Last Name</dt>
              <dd className="mt-1 text-gray-900">{displayData.lastName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="font-medium text-gray-500">Email Address</dt>
              <dd className="mt-1 text-gray-900">{displayData.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-gray-900">{displayData.phone || 'Not provided'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-gray-900">{displayData.dob || 'Not provided'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-gray-900">
                {displayData.address ? 
                  `${displayData.address}, ${displayData.city}, ${displayData.state} ${displayData.zip}` : 
                  'Not provided'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200">
           <h2 className="text-lg font-medium flex items-center">
             <Bell className="h-5 w-5 mr-2 text-yellow-600" /> Notification Preferences
           </h2>
         </div>
         <div className="p-6">
           <p className="text-gray-500 text-sm mb-4">Manage how you receive updates.</p>
           {/* TODO: Add notification toggles (e.g., Email, SMS for appointments, messages) */}
           <div className="space-y-2">
              <p className="text-gray-400 italic text-sm">(Notification settings coming soon)</p>
           </div>
         </div>
      </div>

      {/* Security Settings Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200">
           <h2 className="text-lg font-medium flex items-center">
             <Lock className="h-5 w-5 mr-2 text-red-600" /> Security
           </h2>
         </div>
         <div className="p-6">
           <button 
             onClick={handleChangePassword}
             className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
           >
             Change Password
           </button>
         </div>
      </div>

      {/* Billing & Subscription Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200">
           <h2 className="text-lg font-medium flex items-center">
             <CreditCard className="h-5 w-5 mr-2 text-accent1" /> Billing & Subscription
           </h2>
         </div>
         <div className="p-6 space-y-4">
           {/* Link to My Plan */}
           <Link 
             to="/billing" 
             className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
           >
             <div className="flex items-center">
               <FileText className="h-5 w-5 mr-3 text-accent1" />
               <div>
                 <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent3">My Plan</h3>
                 <p className="text-xs text-gray-500">View your current subscription and benefits</p>
               </div>
             </div>
             <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-accent3" />
           </Link>
           
           {/* Link to Payment Methods */}
           <Link 
             to="/payment-methods" 
             className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
           >
             <div className="flex items-center">
               <CreditCard className="h-5 w-5 mr-3 text-accent2" /> 
               <div>
                 <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent3">Payment Methods</h3>
                 <p className="text-xs text-gray-500">Manage your saved cards</p>
               </div>
             </div>
             <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-accent3" />
           </Link>
         </div>
      </div>

      {/* Insurance Information Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
           <h2 className="text-lg font-medium flex items-center">
             <ShieldCheck className="h-5 w-5 mr-2 text-accent2" /> Insurance Information
           </h2>
           <button 
             onClick={() => navigate('/profile/insurance')}
             className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center"
           >
             <Edit className="h-3 w-3 mr-1" /> Edit Insurance
           </button>
         </div>
         <div className="p-6">
           {displayData.insuranceProvider ? (
             <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
               <div className="sm:col-span-1">
                 <dt className="font-medium text-gray-500">Provider</dt>
                 <dd className="mt-1 text-gray-900">{displayData.insuranceProvider}</dd>
               </div>
               <div className="sm:col-span-1">
                 <dt className="font-medium text-gray-500">Policy ID</dt>
                 <dd className="mt-1 text-gray-900">{displayData.insurancePolicyId}</dd>
               </div>
               <div className="sm:col-span-1">
                 <dt className="font-medium text-gray-500">Group ID</dt>
                 <dd className="mt-1 text-gray-900">{displayData.insuranceGroupId}</dd>
               </div>
             </dl>
           ) : (
             <p className="text-sm text-gray-500">No insurance information on file.</p>
           )}
         </div>
      </div>

      {/* Preferred Pharmacy Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
           <h2 className="text-lg font-medium flex items-center">
             <Building className="h-5 w-5 mr-2 text-accent2" /> Preferred Pharmacy 
           </h2>
           <button 
             onClick={() => navigate('/profile/pharmacy')}
             className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center"
           >
             <Edit className="h-3 w-3 mr-1" /> Edit Pharmacy
           </button>
         </div>
         <div className="p-6">
           {displayData.preferredPharmacy ? (
             <p className="text-sm text-gray-900">{displayData.preferredPharmacy}</p>
           ) : (
             <p className="text-sm text-gray-500">No preferred pharmacy specified.</p>
           )}
         </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;
