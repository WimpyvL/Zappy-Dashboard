import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Select } from 'antd';
import { X, CheckCircle } from 'lucide-react'; 
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { usePatients } from '../../../apis/patients/hooks';
import { useCreateInsuranceRecord } from '../../../apis/insurances/hooks';

// Custom Spinner component using primary color
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

const AddInsuranceRecordModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patientId: null,
    provider: '',
    policy_number: '',
    group_number: '',
    verification_status: 'pending',
    coverage_type: 'Medical',
    coverage_details: '',
    prior_auth_status: null,
    prior_auth_expiry_date: null,
    notes: '',
    selectedPatient: null, // Store the complete patient object
  });
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [debouncedPatientSearchTerm, setDebouncedPatientSearchTerm] = useState('');

  // Debounce handler for patient search with shorter delay for better UX
  const debouncePatientSearch = useMemo(
    () => debounce((value) => {
      setDebouncedPatientSearchTerm(value);
    }, 300),
    []
  );

  // Handle raw search input change
  const handlePatientSearchInputChange = (value) => {
    setPatientSearchTerm(value);
    debouncePatientSearch(value);
  };

  // Fetch Patients for dropdown using debounced search term - explicitly fetch with search parameter
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(
    1, 
    { search: debouncedPatientSearchTerm || undefined }, 
    20
  );
  
  // Make sure we extract the data correctly depending on the API response structure
  const patientOptions = useMemo(() => {
    const patients = patientsData?.data || patientsData || [];
    return patients.map(patient => ({
      id: patient.id,
      value: patient.id,
      label: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `ID: ${patient.id}`,
      ...patient // Keep all patient data for reference
    }));
  }, [patientsData]);

  // Create mutation
  const createRecordMutation = useCreateInsuranceRecord({
    onSuccess: () => {
      toast.success('Insurance record created successfully');
      onSuccess(); // Call the onSuccess prop passed from parent
      onClose(); // Close the modal
    },
    onError: (error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });

  // Reset form when modal opens/closes or patientId changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        patientId: null,
        provider: '',
        policy_number: '',
        group_number: '',
        verification_status: 'pending',
        coverage_type: 'Medical',
        coverage_details: '',
        prior_auth_status: null,
        prior_auth_expiry_date: null,
        notes: '',
        selectedPatient: null,
      });
      setSelectedPatientName('');
      setPatientSearchTerm('');
      setDebouncedPatientSearchTerm('');
    }
  }, [isOpen]);

  // Handle form input changes (for non-patient fields)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle patient selection from dropdown
  const handlePatientSelect = (value) => {
    const selectedPatient = patientOptions.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      patientId: value,
      selectedPatient: selectedPatient || null,
    }));
    setSelectedPatientName(selectedPatient ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() : '');
    // Clear search term after selection
    setPatientSearchTerm('');
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.patientId) {
      toast.error("Please select a patient.");
      return;
    }
    // Prepare data for API (map field names to DB column names)
    const apiData = {
      patient_id: formData.patientId,
      provider_name: formData.provider,
      policy_number: formData.policy_number,
      group_number: formData.group_number,
      status: formData.verification_status, // Map verification_status to status
      coverage_type: formData.coverage_type,
      coverage_details: formData.coverage_details,
      notes: formData.notes,
      ...(formData.coverage_type === 'Self-Pay' && {
        status: 'not_applicable',
        provider_name: 'N/A',
        policy_number: 'N/A',
        group_number: 'N/A',
      }),
    };
    createRecordMutation.mutate(apiData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Add Insurance Record
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Left Column */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Search or Select Patient"
                value={formData.patientId}
                onChange={handlePatientSelect}
                onSearch={handlePatientSearchInputChange}
                filterOption={false} // Use server-side filtering
                loading={isLoadingPatients}
                options={patientOptions}
                notFoundContent={isLoadingPatients ? <Spinner /> : "No patients found"}
                defaultActiveFirstOption={false}
                allowClear={true}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name (Display Only)
              </label>
              <input
                type="text"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-100 sm:text-sm rounded-md"
                value={selectedPatientName}
                readOnly
              />
            </div>

            {/* Patient Information Card - Show when patient is selected */}
            {formData.selectedPatient && (
              <div className="mb-4 bg-blue-50 border border-blue-100 rounded-md p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Patient Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.selectedPatient.email || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.selectedPatient.phone || formData.selectedPatient.mobile_phone || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">
                      {formData.selectedPatient.date_of_birth 
                        ? new Date(formData.selectedPatient.date_of_birth).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right">
                      {formData.selectedPatient.address || formData.selectedPatient.city || formData.selectedPatient.state
                        ? `${formData.selectedPatient.address || ''} ${formData.selectedPatient.city || ''}, ${formData.selectedPatient.state || ''} ${formData.selectedPatient.zip || ''}`.trim().replace(/,\s*$/, '')
                        : 'No address on file'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Type
              </label>
              <select
                name="coverage_type"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.coverage_type}
                onChange={handleInputChange}
              >
                <option value="Medical">Medical Insurance</option>
                <option value="Pharmacy">Pharmacy Benefit</option>
                <option value="Self-Pay">Self-Pay</option>
              </select>
            </div>

            {formData.coverage_type !== 'Self-Pay' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="provider"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.provider}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    name="policy_number"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.policy_number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Number
                  </label>
                  <input
                    type="text"
                    name="group_number"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.group_number}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div>
            {formData.coverage_type === 'Self-Pay' ? (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-4">
                  Patient has opted for self-pay. No further insurance verification is needed.
                </p>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Self-Pay Option Selected
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Insurance information will be marked as not applicable.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    name="verification_status"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.verification_status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage Details
                  </label>
                  <textarea
                    name="coverage_details"
                    rows="3"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.coverage_details}
                    onChange={handleInputChange}
                    placeholder="Enter details about coverage, co-pays, deductibles, etc."
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="priorAuthRequired"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.prior_auth_status !== null}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prior_auth_status: e.target.checked ? 'pending' : null,
                        })
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Prior Authorization Required
                    </span>
                  </label>
                </div>

                {formData.prior_auth_status !== null && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prior Authorization Status
                    </label>
                    <select
                      name="prior_auth_status"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={formData.prior_auth_status || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Not Started</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows="4"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes about the verification process"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!formData.patientId || createRecordMutation.isPending}
          >
            {createRecordMutation.isPending ? (
              <Spinner />
            ) : formData.coverage_type === 'Self-Pay' ? (
              'Mark as Self-Pay'
            ) : (
              'Add Insurance Record'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddInsuranceRecordModal;
