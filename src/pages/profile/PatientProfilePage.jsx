import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { 
  Loader2, AlertTriangle, User, Bell, Lock, Edit, 
  CreditCard, FileText, ChevronRight, ShieldCheck, Building // Added ShieldCheck, Building
} from 'lucide-react'; 
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element

// Placeholder hook for fetching profile data (replace with actual hook)
const usePatientProfile = (patientId) => {
    // Simulate fetching existing data
    const { currentUser } = useAuth(); // Get currentUser inside the hook
    const mockData = {
        firstName: currentUser?.user_metadata?.firstName || 'Anthony',
        lastName: currentUser?.user_metadata?.lastName || 'Stark',
        email: currentUser?.email || 'anthony.stark@example.com',
        phone: currentUser?.phone || '555-123-4567',
        dob: '1970-05-29', // Example
        address: '10880 Malibu Point', // Example
        city: 'Malibu', // Example
        state: 'CA', // Example
        zip: '90265', // Example
        // Add mock insurance and pharmacy data
        preferredPharmacy: 'CVS Pharmacy - 123 Main St, Malibu, CA 90265',
        insuranceProvider: 'Blue Cross Blue Shield',
        insurancePolicyId: 'XG123456789',
        insuranceGroupId: 'BCBSGRP1',
    };
    // Simulate loaded state for mock data
    return { data: mockData, isLoading: false, error: null }; 
};


const PatientProfilePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Initialize navigate
  // Use default for testing if currentUser is null
  const patientId = currentUser?.id || 'dev-patient-id'; 

  // Fetch profile data using placeholder hook
  const { data: profileData, isLoading: profileLoading, error: profileError } = usePatientProfile(patientId);

  const isLoading = authLoading || profileLoading; // Combine auth loading and profile loading

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
  
  // Use mock data if real data isn't loaded (for dev purposes)
  const displayData = profileData || {
      firstName: currentUser?.user_metadata?.firstName || 'Anthony',
      lastName: currentUser?.user_metadata?.lastName || 'Stark',
      email: currentUser?.email || 'anthony.stark@example.com',
      phone: currentUser?.phone || '555-123-4567',
      dob: '1970-05-29', // Example
      address: '10880 Malibu Point', // Example
      city: 'Malibu', // Example
      state: 'CA', // Example
      zip: '90265', // Example
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
            onClick={() => navigate('/profile/edit')} // Navigate to edit route
            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center" // Use secondary style
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
              <dd className="mt-1 text-gray-900">{displayData.phone}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-gray-900">{displayData.dob}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-gray-900">
                {displayData.address ? `${displayData.address}, ${displayData.city}, ${displayData.state} ${displayData.zip}` : 'N/A'}
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
           {/* TODO: Implement Change Password page/modal */}
           <button 
             onClick={() => navigate('/profile/change-password')} // Navigate to placeholder route
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
               {/* Changed icon color from primary (Red) to accent2 (Green) */}
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
           {/* TODO: Link to actual edit page/modal */}
           <button 
             onClick={() => alert('Edit Insurance functionality not yet implemented.')} 
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
             {/* Changed icon color from primary (Red) to accent2 (Green) */}
             <Building className="h-5 w-5 mr-2 text-accent2" /> Preferred Pharmacy 
           </h2>
           {/* TODO: Link to actual edit page/modal */}
           <button 
             onClick={() => alert('Edit Pharmacy functionality not yet implemented.')} 
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
