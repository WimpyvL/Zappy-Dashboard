import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Select } from 'antd';
import { X, Loader2, CheckCircle } from 'lucide-react'; // Added CheckCircle
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
  });
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [patientSearchInput, setPatientSearchInput] = useState('');
  const [debouncedPatientSearchTerm, setDebouncedPatientSearchTerm] = useState('');

  // Debounce handler for patient search
  const debouncePatientSearch = useMemo(
    () => debounce((value) => {
      setDebouncedPatientSearchTerm(value);
    }, 500),
    []
  );

  // Handle raw search input change
  const handlePatientSearchInputChange = (value) => {
    setPatientSearchInput(value);
    debouncePatientSearch(value);
  };

  // Fetch Patients for dropdown using debounced search term
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(1, { search: debouncedPatientSearchTerm }, 100);
  const patientOptions = patientsData?.data || [];
  // Add console log to check fetched options based on search term
  useEffect(() => {
    console.log('Patient Options (search term:', debouncedPatientSearchTerm, '):', patientOptions);
  }, [patientOptions, debouncedPatientSearchTerm]);

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
      });
      setSelectedPatientName('');
      setPatientSearchInput('');
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
    }));
    setSelectedPatientName(selectedPatient ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() : '');
    setPatientSearchInput(''); // Clear search input after selection
    setDebouncedPatientSearchTerm(''); // Clear debounced term
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
      // prior_auth_status: // Needs mapping based on schema
      // prior_auth_expiry_date: formData.prior_auth_expiry_date, // Needs mapping
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
                onSearch={handlePatientSearchInputChange} // Use debounced search handler
                filterOption={false} // Disable client-side filtering
                loading={isLoadingPatients}
                options={patientOptions.map(p => ({
                  value: p.id,
                  label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `ID: ${p.id}`
                }))}
                required
                notFoundContent={isLoadingPatients ? <Spinner /> : null} // Show spinner while loading search results
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
