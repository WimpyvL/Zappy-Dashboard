import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Tag, // Keep one Tag import
  // Building, // Removed unused icon
  Briefcase, // For Doctor
  Ticket, // For Subscription Plan
  Loader2, // Added Loader icon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreatePatient, useUpdatePatient, usePatientById } from '../../apis/patients/hooks'; // Import patient hooks
import { useTags } from '../../apis/tags/hooks'; // Import tags hook
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks'; // Import subscription plans hook
import { useGetUsers } from '../../apis/users/hooks'; // Corrected import name
import { Select } from 'antd'; // Import Select component from Ant Design

// Accept editingPatientId prop
const PatientModal = ({ isOpen, onClose, editingPatientId, onSuccess }) => {
  // Use actual mutation hooks
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();

  // Fetch patient data if in edit mode
  const { data: patientDataForEdit, isLoading: isLoadingData } = usePatientById(editingPatientId, {
    enabled: !!editingPatientId && isOpen, // Only fetch when modal is open and in edit mode
  });

  // Fetch data for dropdowns
  const { data: tagsData, isLoading: isLoadingTags } = useTags();
  const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlans();
  // Assuming useGetUsers fetches users who can be assigned as doctors (e.g., practitioners)
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers({ role: 'practitioner' }); // Corrected hook name

  const allTags = tagsData || [];
  const allPlans = plansData || [];
  const allDoctors = usersData || [];

  // Combined loading state for dropdown data
  const isLoadingDropdownData = isLoadingTags || isLoadingPlans || isLoadingUsers;

  // Use mutation loading state instead of local isSubmitting
  const isSubmitting = createPatientMutation.isPending || updatePatientMutation.isPending;

  const [formData, setFormData] = useState({ // Initial empty state - use snake_case for DB consistency
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city_name: '', // Changed from city
    state: '',
    zip_code: '',
    date_of_birth: '', // Keep as string YYYY-MM-DD
    status: 'active', // Use lowercase status consistent with DB/API
    related_tags: [], // Add state for selected tags
    subscription_plan_id: null, // Add state for selected plan ID
    assigned_doctor_id: null, // Add state for selected doctor ID
  });

  const isEditMode = !!editingPatientId;

  // Effect to load patient data in edit mode or reset form in add mode
  useEffect(() => {
    const resetForm = () => {
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', street_address: '', city_name: '',
        state: '', zip_code: '', date_of_birth: '', status: 'active',
        related_tags: [], subscription_plan_id: null, assigned_doctor_id: null, // Reset new fields
      });
    };

    if (isOpen) {
      if (isEditMode) {
        if (patientDataForEdit) {
          // Map fetched data fields to formData state
          let formattedDob = '';
          if (patientDataForEdit.date_of_birth) {
             try {
               formattedDob = new Date(patientDataForEdit.date_of_birth).toISOString().split('T')[0];
               if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDob)) formattedDob = '';
             } catch { formattedDob = ''; }
          }
          // Populate form data from fetched patient, accessing profile fields
          setFormData({
            first_name: patientDataForEdit.first_name || '',
            last_name: patientDataForEdit.last_name || '',
            email: patientDataForEdit.email || '',
            phone: patientDataForEdit.mobile_phone || patientDataForEdit.phone || '', // Prefer mobile_phone
            street_address: patientDataForEdit.profile?.address || '', // Access profile.address
            city_name: patientDataForEdit.profile?.city || '',       // Access profile.city
            state: patientDataForEdit.profile?.state || '',         // Access profile.state
            zip_code: patientDataForEdit.profile?.zip || '',         // Access profile.zip
            date_of_birth: patientDataForEdit.profile?.dob || formattedDob, // Access profile.dob (Note: form uses date_of_birth)
            status: patientDataForEdit.status || 'active',
            related_tags: patientDataForEdit.related_tags || [], // Populate tags
            subscription_plan_id: patientDataForEdit.subscription_plan_id || null, // Populate plan
            assigned_doctor_id: patientDataForEdit.assigned_doctor_id || null, // Populate doctor
          });
        } else if (!isLoadingData) {
          // Handle case where data is loaded but null (patient not found)
          toast.error(`Patient data not found for ID: ${editingPatientId}`);
          onClose();
        }
        // If isLoadingData is true, we wait for data or error
      } else {
        resetForm(); // Reset for Add mode
      }
    }
  }, [isOpen, isEditMode, editingPatientId, patientDataForEdit, isLoadingData, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Updated handleSubmit to use mutation hooks
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission

    // Prepare payload - ensure keys match DB columns
    const patientPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null, // Handle empty phone
      street_address: formData.street_address || null,
      city_name: formData.city_name || null, // Changed from city
      state: formData.state || null,
      zip_code: formData.zip_code || null,
      date_of_birth: formData.date_of_birth || null, // Ensure null if empty
      status: formData.status,
      related_tags: formData.related_tags || [], // Include selected tags
      subscription_plan_id: formData.subscription_plan_id || null, // Include selected plan
      assigned_doctor_id: formData.assigned_doctor_id || null, // Include selected doctor
    };

    try {
      let result;
      if (isEditMode) {
        result = await updatePatientMutation.mutateAsync({ id: editingPatientId, patientData: patientPayload });
        toast.success('Patient updated successfully');
      } else {
        result = await createPatientMutation.mutateAsync(patientPayload);
        toast.success('Patient created successfully');
      }

      if (onSuccess) {
        onSuccess(result); // Pass back the result from the mutation
      }
      onClose(); // Close the modal

    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(`Failed to save patient: ${error.message}`);
      // No finally block needed as isSubmitting comes from mutation state
    }
  };

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  const modalTitle = isEditMode ? 'Edit Patient' : 'Add New Patient';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Add Patient';

  return (
    // Modal container with backdrop
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={!isSubmitting ? onClose : undefined}></div>

      {/* Modal Content */}
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full relative transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          <button className="text-gray-400 hover:text-gray-500" onClick={onClose} type="button" disabled={isSubmitting}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Form Fields Container */}
          <div className={`p-6 space-y-4 max-h-[70vh] overflow-y-auto ${isLoadingData ? 'opacity-50' : ''}`}>
            {isLoadingData && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                {/* Simple loading text or spinner */}
                <p>Loading patient data...</p>
              </div>
            )}
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                   <input type="text" name="first_name" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.first_name || ''} onChange={handleChange} placeholder="First Name" required disabled={isLoadingData} />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                 <div className="relative">
                   <input type="text" name="last_name" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.last_name || ''} onChange={handleChange} placeholder="Last Name" required disabled={isLoadingData} />
                 </div>
               </div>
             </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                <input type="email" name="email" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.email || ''} onChange={handleChange} placeholder="patient@example.com" required disabled={isLoadingData} />
              </div>
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                <input type="tel" name="phone" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.phone || ''} onChange={handleChange} placeholder="(XXX) XXX-XXXX" disabled={isLoadingData} />
              </div>
            </div>
            {/* DOB and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="date_of_birth" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.date_of_birth || ''} onChange={handleChange} disabled={isLoadingData} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className="h-4 w-4 text-gray-400" /></div>
                  <select name="status" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.status || 'active'} onChange={handleChange} disabled={isLoadingData}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="blacklisted">Blacklisted</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label> {/* Changed label */}
              <input type="text" name="street_address" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.street_address || ''} onChange={handleChange} placeholder="Street Address" disabled={isLoadingData} /> {/* Changed name and value */}
            </div>
            {/* City, State, Zip */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city_name" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.city_name || ''} onChange={handleChange} disabled={isLoadingData} /> {/* Changed name and value */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" name="state" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.state || ''} onChange={handleChange} disabled={isLoadingData} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input type="text" name="zip_code" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.zip_code || ''} onChange={handleChange} disabled={isLoadingData} />
              </div>
            </div>

            {/* Assigned Doctor Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Doctor</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Doctor"
                value={formData.assigned_doctor_id}
                onChange={(value) => setFormData(prev => ({ ...prev, assigned_doctor_id: value }))}
                loading={isLoadingUsers}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
              >
                {allDoctors.map(doc => (
                  <Select.Option key={doc.id} value={doc.id}>
                    {`${doc.first_name} ${doc.last_name}`}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Subscription Plan Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Plan"
                value={formData.subscription_plan_id}
                onChange={(value) => setFormData(prev => ({ ...prev, subscription_plan_id: value }))}
                loading={isLoadingPlans}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
              >
                {allPlans.map(plan => (
                  <Select.Option key={plan.id} value={plan.id}>
                    {plan.name} (${plan.price}/{plan.billing_cycle})
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Tags Multi-Select Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Tags"
                value={formData.related_tags}
                onChange={(values) => setFormData(prev => ({ ...prev, related_tags: values }))}
                loading={isLoadingTags}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
              >
                {allTags.map(tag => (
                  <Select.Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Removed unused fields */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pharmacy</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" name="preferredPharmacy" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.preferredPharmacy || ''} onChange={handleChange} placeholder="Preferred Pharmacy" />
              </div>
            </div> */}
             {/* Optional: Add Medical Notes Textarea if needed in modal */}
             {/* <div>
               <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                 Medical Notes
               </label>
               <Textarea
                 id="medicalNotes"
                 name="medicalNotes"
                 rows={3}
                 className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 placeholder="Add any relevant medical notes..."
                 value={formData.medicalNotes || ''}
                 onChange={handleChange}
               />
             </div> */}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting} // Only disable based on submission state
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSubmitting} // Only disable based on submission state
            >
              {isSubmitting ? 'Saving...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
