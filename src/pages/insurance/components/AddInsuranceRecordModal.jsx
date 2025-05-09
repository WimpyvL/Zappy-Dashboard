import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Select } from 'antd';
import { X, CheckCircle, UserPlus } from 'lucide-react'; 
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { usePatients, useCreatePatient } from '../../../apis/patients/hooks';
import { useCreateInsuranceRecord } from '../../../apis/insurances/hooks';
import CreatePatientForm from '../../../components/insurance/CreatePatientForm';

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
  const { data: patientsData, isLoading: isLoadingPatients, refetch: refetchPatients } = usePatients(
    1, 
    { search: debouncedPatientSearchTerm || undefined }, 
    50 // Increased page size to show more results
  );
  
  // Force refetch when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      refetchPatients();
      console.log("Modal opened, refetching patients data");
    }
  }, [isOpen, refetchPatients]);
  
  // State for showing the create patient form
  const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
  const [isCreatingTestPatient, setIsCreatingTestPatient] = useState(false);
  
  // Create patient mutation for test patient
  const createPatientMutation = useCreatePatient({
    onSuccess: (data) => {
      console.log("Test patient created successfully:", data);
      toast.success(`Test patient created: ${data.first_name} ${data.last_name}`);
      setIsCreatingTestPatient(false);
      refetchPatients();
    },
    onError: (error) => {
      console.error("Error creating test patient:", error);
      toast.error(`Failed to create test patient: ${error.message}`);
      setIsCreatingTestPatient(false);
    }
  });
  
  // Function to create a test patient
  const createTestPatient = () => {
    setIsCreatingTestPatient(true);
    const randomNum = Math.floor(Math.random() * 10000);
    const testPatient = {
      first_name: `Test${randomNum}`,
      last_name: `Patient${randomNum}`,
      email: `test.patient${randomNum}@example.com`,
      phone: `555-${randomNum}`,
      date_of_birth: '1990-01-01',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    };
    
    createPatientMutation.mutate(testPatient);
  };

  // Make sure we extract the data correctly depending on the API response structure
  const patientOptions = useMemo(() => {
    // Safely extract patients data with fallbacks
    const patients = patientsData?.data || patientsData || [];
    
    // Log the patients data for debugging
    console.log('Patient data received:', patients);
    
    // Map patients to dropdown options with more detailed labels
    const patientOpts = patients.map(patient => {
      // Create a more detailed label that includes more patient information
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
      const emailInfo = patient.email ? ` (${patient.email})` : '';
      const idInfo = ` - ID: ${patient.id.substring(0, 8)}`;
      
      const label = fullName ? `${fullName}${emailInfo}${idInfo}` : `ID: ${patient.id}`;
      
      return {
        id: patient.id,
        value: patient.id,
        label: label,
        searchTerms: [
          patient.first_name, 
          patient.last_name, 
          patient.email,
          fullName,
          patient.id
        ].filter(Boolean).join(' ').toLowerCase(),
        ...patient // Keep all patient data for reference
      };
    });

    // Add "Create New Patient" option at the top
    return [
      {
        id: 'create-new',
        value: 'create-new',
        label: (
          <div className="flex items-center text-indigo-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Create New Patient
          </div>
        ),
      },
      ...patientOpts
    ];
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
    if (value === 'create-new') {
      setShowCreatePatientForm(true);
      return;
    }
    
    const selectedPatient = patientOptions.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      patientId: value,
      selectedPatient: selectedPatient || null,
    }));
    setSelectedPatientName(selectedPatient ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() : '');
    // Don't clear search term after selection
    // setPatientSearchTerm('');
  };

  // Handle successful patient creation
  const handlePatientCreated = (newPatient) => {
    if (newPatient && newPatient.id) {
      toast.success(`Patient ${newPatient.first_name} ${newPatient.last_name} created successfully`);
      
      // Select the newly created patient
      setFormData(prev => ({
        ...prev,
        patientId: newPatient.id,
        selectedPatient: newPatient,
      }));
      setSelectedPatientName(`${newPatient.first_name || ''} ${newPatient.last_name || ''}`.trim());
      
      // Hide the create form
      setShowCreatePatientForm(false);
    }
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

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Enter key press prevented');
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onKeyDown={handleKeyDown}>
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

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {showCreatePatientForm ? (
            <CreatePatientForm 
              onSuccess={handlePatientCreated} 
              onCancel={() => setShowCreatePatientForm(false)} 
            />
          ) : (
            <>
              {/* Debug section */}
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Debug Tools</h4>
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-600 rounded-md text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={createTestPatient}
                    disabled={isCreatingTestPatient}
                  >
                    {isCreatingTestPatient ? 'Creating...' : 'Create Test Patient'}
                  </button>
                </div>
                <div className="text-xs text-gray-600">
                  <p>Search term: "{patientSearchTerm}"</p>
                  <p>Debounced search term: "{debouncedPatientSearchTerm}"</p>
                  <p>Patients found: {patientsData?.data?.length || 0}</p>
                  <p>Loading: {isLoadingPatients ? 'Yes' : 'No'}</p>
                  <p className="mt-1 text-gray-500">If you can't find patients, click the button above to create a test patient.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient *
                    </label>
                    <div className="space-y-2">
                      <Select
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Search or Select Patient"
                        value={formData.patientId}
                        onChange={handlePatientSelect}
                        onSearch={handlePatientSearchInputChange}
                        onKeyDown={(e) => {
                          // Prevent form submission on Enter key in the Select component
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log('Enter key press in Select prevented');
                          }
                        }}
                        // Don't filter options client-side, rely on server-side search
                        filterOption={false}
                        loading={isLoadingPatients}
                        options={patientOptions}
                        notFoundContent={
                          isLoadingPatients ? 
                            <Spinner /> : 
                            <div className="p-2 text-center">
                              <p className="text-gray-500 mb-2">No patients found</p>
                              <p className="text-sm text-indigo-600">Try a different search or select "Create New Patient"</p>
                            </div>
                        }
                        defaultActiveFirstOption={false}
                        allowClear={true}
                        searchValue={patientSearchTerm}
                        showArrow={true}
                        optionFilterProp="label"
                        optionLabelProp="label"
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        dropdownMatchSelectWidth={true}
                        listHeight={250}
                        virtual={true}
                      />
                      
                      {patientSearchTerm && patientSearchTerm.length > 0 && !isLoadingPatients && patientOptions.length <= 1 && (
                        <div className="text-sm text-indigo-600 cursor-pointer hover:underline" 
                            onClick={() => setShowCreatePatientForm(true)}>
                          No matches found. Click here to create a new patient.
                        </div>
                      )}
                    </div>
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

                      <div className="mb-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Prior Authorization</h4>
                        
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
                          <div className="space-y-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                            <div>
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
                                <option value="initiated">Initiated</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="denied">Denied</option>
                              </select>
                            </div>
                            
                            {formData.prior_auth_status === 'approved' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Expiration Date
                                </label>
                                <input
                                  type="date"
                                  name="prior_auth_expiry_date"
                                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                  value={formData.prior_auth_expiry_date || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                            )}
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Number
                              </label>
                              <input
                                type="text"
                                name="prior_auth_reference"
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={formData.prior_auth_reference || ''}
                                onChange={handleInputChange}
                                placeholder="Authorization reference number"
                              />
                            </div>
                          </div>
                        )}
                      </div>
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
            </>
          )}
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
