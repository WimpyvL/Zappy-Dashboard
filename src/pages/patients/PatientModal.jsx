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
import apiService from '../../utils/apiService';
import { toast } from 'react-toastify';
import LoadingSpinner from './patientDetails/common/LoadingSpinner'; // Import a spinner

// Accept editingPatientId instead of patientData
const PatientModal = ({ isOpen, onClose, editingPatientId, onSuccess }) => {
  console.log('PatientModal rendering. isOpen:', isOpen, 'editingPatientId:', editingPatientId); // Add log
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false); // State for loading patient data in edit mode
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    status: 'active',
    preferredPharmacy: '',
    assignedDoctor: '',
    medicalNotes: '',
  });

  const isEditMode = !!editingPatientId;

  // Effect to fetch data in edit mode or reset form in add mode
  useEffect(() => {
    const resetForm = () => {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        dateOfBirth: '',
        status: 'active',
        preferredPharmacy: '',
        assignedDoctor: '',
        medicalNotes: '',
      });
    };

    const fetchAndSetPatientData = async () => {
      if (!editingPatientId) return;

      setIsLoadingData(true);
      setFormData({ // Reset form slightly before fetch to clear old data if modal reopens quickly
        full_name: '', email: '', phone: '', address: '', city: '', state: '',
        zipCode: '', dateOfBirth: '', status: 'active', preferredPharmacy: '',
        assignedDoctor: '', medicalNotes: '',
      });

      try {
        console.log(`Fetching data for patient ID: ${editingPatientId}`);
        const fetchedPatientData = await apiService.patients.getById(editingPatientId);
        console.log("Fetched Patient Data:", fetchedPatientData);

        if (fetchedPatientData) {
           // Explicitly map fields from fetchedPatientData to formData
           // Ensure dateOfBirth is formatted correctly for the input type="date" (YYYY-MM-DD)
           const dob = fetchedPatientData.dob || fetchedPatientData.date_of_birth || fetchedPatientData.dateOfBirth || '';
           const formattedDob = dob ? new Date(dob).toISOString().split('T')[0] : '';

           setFormData({
             full_name: fetchedPatientData.full_name || `${fetchedPatientData.firstName || ''} ${fetchedPatientData.lastName || ''}`.trim() || '',
             email: fetchedPatientData.email || '',
             phone: fetchedPatientData.phone || '',
             address: fetchedPatientData.address?.street || fetchedPatientData.address || '',
             city: fetchedPatientData.address?.city || fetchedPatientData.city || '',
             state: fetchedPatientData.address?.state || fetchedPatientData.state || '',
             zipCode: fetchedPatientData.address?.zip || fetchedPatientData.zip_code || fetchedPatientData.zipCode || '',
             dateOfBirth: formattedDob, // Use formatted date
             status: fetchedPatientData.status || 'active',
             preferredPharmacy: fetchedPatientData.preferred_pharmacy || fetchedPatientData.preferredPharmacy || '',
             assignedDoctor: fetchedPatientData.assigned_doctor || fetchedPatientData.assignedDoctor || '',
             medicalNotes: fetchedPatientData.medical_notes || fetchedPatientData.medicalNotes || '',
           });
        } else {
           toast.error(`Patient data not found for ID: ${editingPatientId}`);
           resetForm(); // Reset if patient not found
           onClose(); // Close modal if patient not found
        }
      } catch (error) {
        console.error('Error fetching patient data for edit:', error);
        toast.error('Failed to load patient data for editing.');
        resetForm(); // Reset form on error
        onClose(); // Close modal on error
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      if (isEditMode) {
        fetchAndSetPatientData();
      } else {
        resetForm(); // Reset for Add mode
      }
    }
  }, [editingPatientId, isOpen]); // Depend on ID and open state

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoadingData) return; // Prevent submission while loading data
    setIsSubmitting(true);

    try {
      // Format data for API (ensure keys match backend expectations)
      const patientPayload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode, // Use snake_case for API
        date_of_birth: formData.dateOfBirth, // Use snake_case for API
        status: formData.status,
        preferred_pharmacy: formData.preferredPharmacy, // Use snake_case for API
        assigned_doctor: formData.assignedDoctor, // Use snake_case for API
        medical_notes: formData.medicalNotes, // Use snake_case for API
      };

      let response;
      if (isEditMode) {
        // Update existing patient
        response = await apiService.patients.update(
          editingPatientId, // Use the ID passed as prop
          patientPayload
        );
        toast.success('Patient updated successfully');
      } else {
        // Create new patient
        response = await apiService.patients.create(patientPayload);
        toast.success('Patient created successfully');
      }

      if (onSuccess) {
        onSuccess(response); // Pass response data back if needed
      }
      onClose(); // Close the modal

    } catch (error) {
      console.error('Error saving patient:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save patient';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the modal is not open, render nothing
  console.log('PatientModal: Checking if isOpen is false. isOpen:', isOpen); // Add log
  if (!isOpen) {
    console.log('PatientModal: isOpen is false, returning null.'); // Add log
    return null;
  }

  const modalTitle = isEditMode ? 'Edit Patient' : 'Add New Patient';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Add Patient';

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={!isLoadingData && !isSubmitting ? onClose : undefined} // Prevent closing while loading/submitting
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            type="button"
            disabled={isLoadingData || isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
           {/* Show loader overlay inside modal while fetching data for edit */}
           {isLoadingData && isEditMode && (
             <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
               <LoadingSpinner message="Loading patient data..." />
             </div>
           )}
          {/* Dim form while loading, ensure enough padding */}
          <div className={`p-6 space-y-4 max-h-[70vh] overflow-y-auto ${isLoadingData && isEditMode ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Patient Personal Info Section */}
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="(XXX) XXX-XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.dateOfBirth || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="status"
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Street Address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.state || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.zipCode || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Pharmacy
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="preferredPharmacy"
                  className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.preferredPharmacy || ''}
                  onChange={handleChange}
                  placeholder="Preferred Pharmacy"
                />
              </div>
            </div>
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

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting || isLoadingData} // Disable cancel while loading data too
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSubmitting || isLoadingData} // Disable submit while loading data
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
