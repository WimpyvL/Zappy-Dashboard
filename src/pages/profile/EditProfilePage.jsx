import React, { useState, useEffect } from 'react'; // Added useEffect
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Save, X } from 'lucide-react';

// Placeholder hook for fetching profile data (replace with actual hook)
const usePatientProfile = (patientId) => {
    // Simulate fetching existing data
    const { currentUser } = useAuth();
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
    };
    // Simulate loaded state for mock data
    return { data: mockData, isLoading: false, error: null };
};

// Placeholder hook for updating profile data (replace with actual hook)
const useUpdatePatientProfile = (options = {}) => {
    // Simulate mutation
    const [isLoading, setIsLoading] = useState(false);
    const mutate = async (profileData) => {
        setIsLoading(true);
        console.log("Simulating update profile:", profileData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        alert("Profile update simulation successful!"); // Placeholder feedback
        options.onSuccess?.();
    };
    return { mutate, isLoading };
};


const EditProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const patientId = currentUser?.id || 'dev-patient-id';

  // Fetch existing profile data (using placeholder hook)
  const { data: initialProfileData, isLoading: profileLoading, error: profileError } = usePatientProfile(patientId);

  // State for form fields, initialized with fetched data or defaults
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '', // Usually not editable, but include for display
    phone: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Update form state when initial data loads
  useEffect(() => { // Changed React.useEffect to useEffect
    if (initialProfileData) {
      setFormData({
        firstName: initialProfileData.firstName || '',
        lastName: initialProfileData.lastName || '',
        email: initialProfileData.email || '',
        phone: initialProfileData.phone || '',
        dob: initialProfileData.dob || '',
        address: initialProfileData.address || '',
        city: initialProfileData.city || '',
        state: initialProfileData.state || '',
        zip: initialProfileData.zip || '',
      });
    }
  }, [initialProfileData]);

  // Mutation hook for updating
  const updateProfileMutation = useUpdatePatientProfile({
      onSuccess: () => navigate('/profile'), // Navigate back on success
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add validation
    updateProfileMutation.mutate(formData);
  };

  if (profileLoading) {
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
        <p>Error loading profile data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Update your personal information.</p>
      </div>

      {/* Edit Form Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          {/* Form Fields Section */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              {/* Email (Read Only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
               {/* Phone */}
               <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
               {/* Date of Birth */}
               <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>

            {/* Address Fields */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
               <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
               <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input type="text" id="zip" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
          </div> {/* Closing tag for form fields section */}

          {/* Action Buttons Section */}
          <div className="p-4 bg-gray-50 flex justify-end space-x-3">
             <button
               type="button"
               onClick={() => navigate('/profile')} // Navigate back to profile view
               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
             >
                <X className="h-4 w-4 mr-1" /> Cancel
             </button>
             <button
               type="submit"
               disabled={updateProfileMutation.isLoading}
               className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
             >
                {updateProfileMutation.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-1" />}
                Save Changes
             </button>
          </div>
        </form> {/* Closing tag for form */}
      </div> {/* Closing tag for card */}
    </div> // Closing tag for main container
  );
};

export default EditProfilePage;
