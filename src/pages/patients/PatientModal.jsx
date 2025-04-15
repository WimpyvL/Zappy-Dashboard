import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Building,
  Loader // Added Loader icon
} from "lucide-react";
// import apiService from "../../utils/apiService"; // Removed
import { toast } from "react-toastify";
import { useCreatePatient, useUpdatePatient } from "../../apis/patients/hooks"; // Import hooks
import { useQueryClient } from '@tanstack/react-query'; // Import query client

const PatientModal = ({ isOpen, onClose, patientData, onSuccess }) => {
  // Removed local isSubmitting state, will use mutation hook state

  // Initial form state matching DB schema more closely
  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    // Removed conflicting top-level address fields
    dob: "", // Use dob
    status: "active",
    // preferredPharmacy: "", // TODO: Link to pharmacies table
    // assignedDoctor: "", // TODO: Link to users table
    // medicalNotes: "", // TODO: Link to notes table or handle differently
    address: { street: '', city: '', state: '', zip_code: '' } // Address as object
  };
  const [formData, setFormData] = useState(initialFormData);
  const queryClient = useQueryClient();

  // Initialize form data when patientData changes or modal opens
  useEffect(() => {
    if (isOpen) {
        if (patientData) {
            // Map existing patient data to form state
            const [firstName, ...lastNameParts] = (patientData.full_name || '').split(' ');
            const lastName = lastNameParts.join(' ');
            setFormData({
                first_name: firstName || "",
                last_name: lastName || "",
                email: patientData.email || "",
                phone: patientData.phone || "",
                // Assuming address was stored as a single string previously
                // Adapt based on actual old structure if different
                address: {
                    street: patientData.address || '',
                    city: patientData.city || '',
                    state: patientData.state || '',
                    zip_code: patientData.zipCode || '', // Map zipCode
                },
                dob: patientData.dateOfBirth || "", // Map dateOfBirth
                status: patientData.status || "active",
                // preferredPharmacy: patientData.preferredPharmacy || "",
                // assignedDoctor: patientData.assignedDoctor || "",
                // medicalNotes: patientData.medicalNotes || "",
                is_active: patientData.status === 'active' // Map status to is_active if needed by update hook
            });
        } else {
            // Reset form for new patient
            setFormData(initialFormData);
        }
    }
  }, [patientData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

   const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        address: {
            ...prev.address,
            [name]: value
        }
    }));
  };


  // --- Mutations ---
  const createPatientMutation = useCreatePatient({
      onSuccess: (data) => {
          toast.success("Patient created successfully");
          queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate patient list
          onSuccess && onSuccess(data); // Call original onSuccess if provided
          onClose(); // Close modal
      },
      onError: (error) => {
          console.error("Error creating patient:", error);
          toast.error(error.message || "Failed to create patient");
      }
  });

  const updatePatientMutation = useUpdatePatient({
       onSuccess: (data, variables) => {
          toast.success("Patient updated successfully");
          queryClient.invalidateQueries({ queryKey: ['patients'] }); // Invalidate list
          queryClient.invalidateQueries({ queryKey: ['patient', variables.id] }); // Invalidate specific patient
          onSuccess && onSuccess(data);
          onClose();
      },
      onError: (error) => {
          console.error("Error updating patient:", error);
          toast.error(error.message || "Failed to update patient");
      }
  });


  const handleSubmit = (e) => { // No longer async
    e.preventDefault();

    // Prepare data matching Supabase schema
    const patientPayload = {
        first_name: formData.first_name?.trim(),
        last_name: formData.last_name?.trim(),
        email: formData.email?.trim(),
        // phone: formData.phone?.trim() || null, // Field not in schema
        // Correctly construct address object
        address: {
            street: formData.address?.street?.trim() || null,
            city: formData.address?.city?.trim() || null,
            state: formData.address?.state?.trim() || null,
            zip_code: formData.address?.zip_code?.trim() || null,
         },
         dob: formData.dob || null, // Use null if empty
         // status: formData.status, // Removed status field from payload for create
         // TODO: Add preferred_pharmacy_id, assigned_doctor_id if implemented
         // preferred_pharmacy_id: formData.preferredPharmacyId || null,
         // assigned_doctor_id: formData.assignedDoctorId || null,
         // medical_notes: formData.medicalNotes?.trim() || null, // If notes are directly on patient table
         // is_active: formData.status === 'active', // REMOVED - Field not in schema
     };

     // Basic Validation
    if (!patientPayload.first_name || !patientPayload.last_name || !patientPayload.email) {
        toast.error("First Name, Last Name, and Email are required.");
        return;
    }


    if (patientData && patientData.id) {
      // Update existing patient
      updatePatientMutation.mutate({ id: patientData.id, patientData: patientPayload });
    } else {
      // Create new patient
      createPatientMutation.mutate(patientPayload);
    }
  };

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  const isEditMode = !!patientData?.id; // Simpler check
  const modalTitle = isEditMode ? "Edit Patient" : "Add New Patient";
  const submitButtonText = isEditMode ? "Save Changes" : "Add Patient";
  const isSubmitting = createPatientMutation.isPending || updatePatientMutation.isPending; // Use mutation state

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
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
                    name="first_name" // Use first_name
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* Optional: Add different icon or remove */}
                  </div>
                  <input
                    type="text"
                    name="last_name" // Use last_name
                    className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    placeholder="Last Name"
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
                  value={formData.email || ""}
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
                  value={formData.phone || ""}
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
                    name="dob" // Use dob
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.dob || ""}
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
                    value={formData.status || "active"}
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
                Street Address
              </label>
              <input
                type="text"
                name="street" // Use address.street
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.address?.street || ""}
                onChange={handleAddressChange} // Use specific handler
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
                  name="city" // Use address.city
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.address?.city || ""}
                  onChange={handleAddressChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                 {/* TODO: Consider using a dropdown for states */}
                <input
                  type="text"
                  name="state" // Use address.state
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.address?.state || ""}
                  onChange={handleAddressChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip_code" // Use address.zip_code
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.address?.zip_code || ""}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
             {/* Removed Preferred Pharmacy, Assigned Doctor, Medical Notes - handle separately */}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                    Saving...
                  </>
              ) : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
