import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Tag, // Keep one Tag import
  // Building, // Removed unused icon
  // Briefcase, // Removed unused icon
  // Ticket, // Removed unused icon
  // Loader2, // Removed unused icon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreatePatient, useUpdatePatient, usePatientById } from '../../apis/patients/hooks'; // Import patient hooks
// Removed unused hooks for tags, plans, users, pharmacies
import { Select } from 'antd'; // Keep Select for Status dropdown

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
  // Removed fetching for tags, plans, users, pharmacies
  const isLoadingDropdownData = false; // Set to false as dropdowns are removed

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
    // Removed fields not in client_record: related_tags, subscription_plan_id, assigned_doctor_id, preferred_pharmacy
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
          // Populate form data from fetched patient data (client_record)
          setFormData({
            first_name: patientDataForEdit.first_name || '',
            last_name: patientDataForEdit.last_name || '',
            email: patientDataForEdit.email || '',
            phone: patientDataForEdit.phone || '', // Use direct phone field
            street_address: patientDataForEdit.address || '', // Use direct address field
            city_name: patientDataForEdit.city || '',       // Use direct city field
            state: patientDataForEdit.state || '',         // Use direct state field
            zip_code: patientDataForEdit.zip || '',         // Use direct zip field
            date_of_birth: formattedDob, // Use formatted DOB from client_record.date_of_birth
            status: 'active', // Status is not in client_record, default to active
            // Removed population for fields not in client_record
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

    // Prepare payload - only include fields the hooks expect for client_record mapping
    const patientPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null, // Mapped to 'phone' in hooks
      street_address: formData.street_address || null, // Mapped to 'address' in hooks
      city_name: formData.city_name || null, // Mapped to 'city' in hooks
      state: formData.state || null, // Mapped to 'state' in hooks
      zip_code: formData.zip_code || null, // Mapped to 'zip' in hooks
      date_of_birth: formData.date_of_birth || null, // Mapped to 'date_of_birth' in hooks
      // Removed fields not belonging to client_record from payload
    };

    // Remove undefined fields before sending
    Object.keys(patientPayload).forEach(key => patientPayload[key] === undefined && delete patientPayload[key]);


    try {
      let result;
      if (isEditMode) {
        console.log('[PatientModal handleSubmit] Payload for update:', JSON.stringify(patientPayload, null, 2)); // ADDED LOG
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
            {/* Removed Assigned Doctor, Subscription Plan, Tags, Preferred Pharmacy dropdowns */}
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
