import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  Building,
} from 'lucide-react';
// Removed apiService import
import { toast } from 'react-toastify';
// Removed LoadingSpinner import as we won't show loading state for mock data
import { useAppContext } from '../../context/AppContext'; // Import context hook

// Accept editingPatientId prop
const PatientModal = ({ isOpen, onClose, editingPatientId, onSuccess }) => {
  const { patients, updatePatient, createPatient } = useAppContext(); // Get patients and potentially mock update/create functions
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed isLoadingData state
  const [formData, setFormData] = useState({ // Initial empty state
    // Use consistent naming if possible, matching context data structure helps
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Assuming address fields are flat in mock data or handle nested if needed
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '', // Keep as string YYYY-MM-DD
    status: 'Active', // Match mock data status values
    // Add fields if they exist in mock data, otherwise remove
    // preferredPharmacy: '',
    // assignedDoctor: '',
    // medicalNotes: '',
  });

  const isEditMode = !!editingPatientId;

  // Effect to load mock data in edit mode or reset form in add mode
  useEffect(() => {
    const resetForm = () => {
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', address: '', city: '',
        state: '', zipCode: '', dateOfBirth: '', status: 'Active',
        // Reset other fields if added
      });
    };

    const loadMockPatientData = () => {
      if (!editingPatientId) return;

      console.log(`Finding mock data for patient ID: ${editingPatientId}`);
      const patientToEdit = patients.find(p => p.id === editingPatientId);

      if (patientToEdit) {
        console.log("Found Mock Patient Data:", patientToEdit);
        // Map mock data fields to formData state
        // Handle potential date formatting if mock data has full ISO strings
        let formattedDob = '';
        if (patientToEdit.dateOfBirth) { // Assuming mock data has dateOfBirth field
           try {
             formattedDob = new Date(patientToEdit.dateOfBirth).toISOString().split('T')[0];
             if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDob)) formattedDob = '';
           } catch { formattedDob = ''; }
        }

        setFormData({
          firstName: patientToEdit.firstName || '',
          lastName: patientToEdit.lastName || '',
          email: patientToEdit.email || '',
          phone: patientToEdit.phone || '', // Add if exists in mock
          address: patientToEdit.address || '', // Add if exists in mock
          city: patientToEdit.city || '', // Add if exists in mock
          state: patientToEdit.state || '', // Add if exists in mock
          zipCode: patientToEdit.zipCode || '', // Add if exists in mock
          dateOfBirth: formattedDob,
          status: patientToEdit.status || 'Active',
          // Map other fields if they exist in mock data
        });
      } else {
        toast.error(`Mock patient data not found for ID: ${editingPatientId}`);
        onClose(); // Close modal if patient not found in mock data
      }
    };

    if (isOpen) {
      if (isEditMode) {
        loadMockPatientData();
      } else {
        resetForm(); // Reset for Add mode
      }
    }
  }, [editingPatientId, isOpen, onClose, patients]); // Add patients to dependency array

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Updated handleSubmit to use mock context functions or log
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Removed isLoadingData check
    setIsSubmitting(true);

    try {
      // Prepare payload based on formData state
      // Ensure keys match what mock update/create functions expect (if they exist)
      // Or just use the formData directly if functions aren't implemented
      const patientPayload = {
        id: isEditMode ? editingPatientId : `p${Date.now()}`, // Generate mock ID for new patients
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        dateOfBirth: formData.dateOfBirth || null,
        status: formData.status,
        tags: isEditMode ? patients.find(p => p.id === editingPatientId)?.tags || [] : [], // Preserve existing tags or default to empty
        // Add other fields if needed
      };

      let result;
      if (isEditMode) {
        console.log('Attempting to update mock patient:', editingPatientId, patientPayload);
        if (typeof updatePatient === 'function') {
          // Assuming updatePatient modifies the context state
          await updatePatient(editingPatientId, patientPayload); // Use await if it's async
          result = patientPayload; // Assume success returns the updated data
          toast.success('Mock Patient updated successfully');
        } else {
          console.warn('updatePatient function not available in context for mock update.');
          toast.info('Mock update logged to console (no context function).');
          result = patientPayload; // Simulate success
        }
      } else {
        console.log('Attempting to create mock patient:', patientPayload);
        if (typeof createPatient === 'function') {
          // Assuming createPatient modifies the context state
          await createPatient(patientPayload); // Use await if it's async
          result = patientPayload; // Assume success returns the created data
          toast.success('Mock Patient created successfully');
        } else {
          console.warn('createPatient function not available in context for mock creation.');
          toast.info('Mock creation logged to console (no context function).');
          result = patientPayload; // Simulate success
        }
      }

      if (onSuccess) {
        onSuccess(result); // Pass mock result data back
      }
      onClose(); // Close the modal

    } catch (error) {
      // This catch block might not be reached if context functions don't throw
      console.error('Error saving mock patient:', error);
      toast.error('Failed to save mock patient (check console).');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  const modalTitle = isEditMode ? 'Edit Patient (Mock)' : 'Add New Patient (Mock)'; // Update title
  const submitButtonText = isEditMode ? 'Save Changes' : 'Add Patient';

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={!isSubmitting ? onClose : undefined} // Allow closing if not submitting
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            type="button"
            disabled={isSubmitting} // Only disable based on submission state
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
           {/* Removed Loader Overlay */}
           {/* Form Fields Container */}
          <div className={`p-6 space-y-4 max-h-[70vh] overflow-y-auto`}> {/* Removed conditional styling */}
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="h-4 w-4 text-gray-400" />
                   </div>
                   <input type="text" name="firstName" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.firstName || ''} onChange={handleChange} placeholder="First Name" required />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                 <div className="relative">
                   {/* No icon needed for last name usually */}
                   <input type="text" name="lastName" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.lastName || ''} onChange={handleChange} placeholder="Last Name" required />
                 </div>
               </div>
             </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input type="email" name="email" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.email || ''} onChange={handleChange} placeholder="patient@example.com" required />
              </div>
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input type="tel" name="phone" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.phone || ''} onChange={handleChange} placeholder="(XXX) XXX-XXXX" />
              </div>
            </div>
            {/* DOB and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="date" name="dateOfBirth" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.dateOfBirth || ''} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  {/* Update options to match mock data statuses */}
                  <select name="status" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.status || 'Active'} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    {/* Add other statuses if present in mock data */}
                    {/* <option value="Suspended">Suspended</option> */}
                    {/* <option value="Pending">Pending</option> */}
                  </select>
                </div>
              </div>
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" name="address" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.address || ''} onChange={handleChange} placeholder="Street Address" />
            </div>
            {/* City, State, Zip */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.city || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" name="state" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.state || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input type="text" name="zipCode" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.zipCode || ''} onChange={handleChange} />
              </div>
            </div>
            {/* Remove Preferred Pharmacy, Assigned Doctor, Medical Notes if not in mock data */}
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
