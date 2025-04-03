import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Download,
  Info,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import React Query hooks
import {
  useInsuranceRecords,
  useInsuranceRecordById,
  useCreateInsuranceRecord,
  useUpdateInsuranceRecord,
  useUploadInsuranceDocument,
  useDeleteInsuranceDocument,
} from '../../apis/insurances/hooks';

const StatusBadge = ({ status }) => {
  if (status === 'verified' || status === 'prior_auth_approved') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Approved
      </span>
    );
  } else if (
    status === 'pending' ||
    status === 'initiated' ||
    status === 'prior_auth_initiated'
  ) {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  } else if (status === 'denied' || status === 'prior_auth_denied') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        <X className="h-3 w-3 mr-1" />
        Denied
      </span>
    );
  } else if (status === 'not_applicable') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        <Info className="h-3 w-3 mr-1" />
        N/A
      </span>
    );
  }
  return null;
};

const InsuranceDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    patient_id: '',
    patientName: '', // For display purposes only
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
  const [newLog, setNewLog] = useState({
    status: 'pending',
    notes: '',
  });

  // Fetch insurance records with React Query
  const { data: insuranceRecordsData, isLoading } = useInsuranceRecords({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const insuranceRecords = insuranceRecordsData?.data || [];

  // Fetch selected record details
  const {
    data: selectedRecordData,
    isLoading: isRecordLoading,
    error: recordError,
  } = useInsuranceRecordById(selectedRecordId, {
    enabled: !!selectedRecordId,
    onSuccess: (data) => {
      console.log('Successfully fetched record details:', data);
    },
    onError: (error) => {
      console.error('Error fetching record details:', error);
      toast.error('Failed to load record details');
    },
  });

  const selectedRecord = selectedRecordData ?? {};

  // Add debug useEffect for modal state
  useEffect(() => {
    if (showViewModal) {
      console.log('Modal state:', {
        showViewModal,
        selectedRecordId,
        hasSelectedRecordData: !!selectedRecordData?.data,
      });
    }
  }, [showViewModal, selectedRecordId, selectedRecordData]);

  // Set up mutations
  const createRecordMutation = useCreateInsuranceRecord({
    onSuccess: () => {
      toast.success('Insurance record created successfully');
      setShowRecordModal(false);
    },
    onError: (error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });

  const updateRecordMutation = useUpdateInsuranceRecord({
    onSuccess: () => {
      toast.success('Insurance record updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  const uploadDocumentMutation = useUploadInsuranceDocument(selectedRecordId, {
    onSuccess: () => {
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });

  const deleteDocumentMutation = useDeleteInsuranceDocument(selectedRecordId, {
    onSuccess: () => {
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  // Transform API data to component format if needed
  const transformApiData = (apiRecord) => {
    if (!apiRecord) return null;

    try {
      return {
        id: apiRecord.id,
        patientId: apiRecord.patient_id?.toString() || '',
        patientName:
          apiRecord.patient_name || `Patient ID: ${apiRecord.patient_id}`,
        insuranceProvider: apiRecord.provider || 'N/A',
        policyNumber: apiRecord.policy_number || 'N/A',
        groupNumber: apiRecord.group_number || 'N/A',
        verificationStatus: apiRecord.verification_status || 'pending',
        verificationDate: apiRecord.verified_at || new Date().toISOString(),
        coverageType: apiRecord.coverage_type || 'Medical',
        coverageDetails: apiRecord.coverage_details || '',
        priorAuthRequired: apiRecord.prior_auth_status !== null,
        priorAuthStatus: apiRecord.prior_auth_status || null,
        priorAuthExpiryDate: apiRecord.prior_auth_expiry_date || null,
        notes: apiRecord.notes || '',
        documents: apiRecord.documents || [],
        verificationLogs:
          parseVerificationHistory(apiRecord.verification_history) || [],
      };
    } catch (error) {
      console.error('Error transforming record:', error);
      return null;
    }
  };

  // Parse verification history from API
  const parseVerificationHistory = (historyString) => {
    if (!historyString) return [];

    try {
      const history = JSON.parse(historyString);
      return history.map((log, index) => ({
        id: `v${index}`,
        status: log.status || 'pending',
        timestamp: log.timestamp || new Date().toISOString(),
        user: log.user || 'System',
        notes: log.notes || '',
      }));
    } catch (e) {
      console.error('Error parsing verification history:', e);
      return [];
    }
  };

  // Filter insurance records based on search and status
  const filteredRecords = insuranceRecords
    .map(transformApiData)
    .filter((record) => {
      if (!record) return false;

      const matchesSearch = searchTerm
        ? record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.insuranceProvider
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus =
        statusFilter === 'all' || record.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle new log input changes
  const handleLogInputChange = (e) => {
    const { name, value } = e.target;
    setNewLog({
      ...newLog,
      [name]: value,
    });
  };

  // Handle adding a new insurance record
  const handleAddRecord = () => {
    setFormData({
      patient_id: '',
      patientName: '',
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
    setShowRecordModal(true);
  };

  // Handle viewing a record
  const handleViewRecord = (record) => {
    console.log('Opening modal for record:', record);

    // First set the record ID to trigger the query
    setSelectedRecordId(record.id);

    // Set default tab
    setActiveTab('info');

    // Add small delay to ensure states are updated
    setTimeout(() => {
      setShowViewModal(true);
      console.log('Modal should be visible now');
    }, 10);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Prepare data for API
    const apiData = {
      patient_id: formData.patient_id,
      provider: formData.provider,
      policy_number: formData.policy_number,
      group_number: formData.group_number,
      verification_status: formData.verification_status,
      coverage_type: formData.coverage_type,
      coverage_details: formData.coverage_details,
      prior_auth_status:
        formData.verification_status === 'not_applicable'
          ? null
          : formData.prior_auth_status,
      prior_auth_expiry_date: formData.prior_auth_expiry_date,
      notes: formData.notes,
      // Handle self-pay option
      ...(formData.coverage_type === 'Self-Pay' && {
        verification_status: 'not_applicable',
        provider: 'N/A',
        policy_number: 'N/A',
        group_number: 'N/A',
      }),
    };

    // Send to API using mutation
    createRecordMutation.mutate(apiData);
  };

  // Handle adding a new verification log
  const handleAddLog = () => {
    if (!newLog.notes.trim() || !selectedRecordId) return;

    // Get current verification history and add new log
    const currentHistory = selectedRecord?.verification_history
      ? parseVerificationHistory(selectedRecord.verification_history)
      : [];

    const newLogEntry = {
      status: newLog.status,
      user: 'Current User', // In a real app, this would be the logged-in user
      notes: newLog.notes,
      timestamp: new Date().toISOString(),
    };

    // Prepare updated history for API
    const updatedHistory = JSON.stringify([...currentHistory, newLogEntry]);

    // Determine if status should be updated based on log entry
    let statusUpdates = {};
    if (['verified', 'denied', 'not_applicable'].includes(newLog.status)) {
      statusUpdates = {
        verification_status: newLog.status,
        verified_at: new Date().toISOString(),
      };
    }

    // Handle prior auth status updates
    if (['prior_auth_approved', 'prior_auth_denied'].includes(newLog.status)) {
      statusUpdates = {
        ...statusUpdates,
        prior_auth_status:
          newLog.status === 'prior_auth_approved' ? 'approved' : 'denied',
      };
    }

    // Update record via API using mutation
    updateRecordMutation.mutate({
      id: selectedRecordId,
      recordData: {
        verification_history: updatedHistory,
        ...statusUpdates,
      },
    });

    // Clear form
    setNewLog({
      status: 'pending',
      notes: '',
    });
  };

  // Handle document upload
  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !selectedRecordId) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', 'card'); // Default type, can be made selectable

    uploadDocumentMutation.mutate(formData);
  };

  // Handle document deletion
  const handleDeleteDocument = (documentId) => {
    if (!documentId || !selectedRecordId) return;
    deleteDocumentMutation.mutate(documentId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-600">Loading insurance records...</p>
      </div>
    );
  }

  // Get the formatted selected record
  let formattedSelectedRecord = null;
  if (selectedRecord) {
    try {
      formattedSelectedRecord = transformApiData(selectedRecord);
      console.log('Successfully transformed record:', formattedSelectedRecord);
    } catch (error) {
      console.error('Error transforming record:', error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Insurance Documentation
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={handleAddRecord}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Insurance Record
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by patient name, insurance provider, or policy number..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="denied">Denied</option>
            <option value="not_applicable">Self-Pay</option>
          </select>
        </div>
      </div>

      {/* Insurance Records Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insurance Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Policy/Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prior Authorization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.patientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.coverageType === 'Self-Pay'
                        ? 'Self-Pay'
                        : record.insuranceProvider}
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.coverageType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.coverageType === 'Self-Pay' ? (
                      <span className="text-sm text-gray-500">N/A</span>
                    ) : (
                      <>
                        <div className="text-sm text-gray-900">
                          {record.policyNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.groupNumber}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={record.verificationStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.priorAuthRequired ? (
                      <StatusBadge
                        status={
                          record.priorAuthStatus
                            ? `prior_auth_${record.priorAuthStatus}`
                            : 'pending'
                        }
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        Not Required
                      </span>
                    )}
                    {record.priorAuthExpiryDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expires:{' '}
                        {new Date(
                          record.priorAuthExpiryDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.verificationLogs &&
                    record.verificationLogs.length > 0
                      ? new Date(
                          record.verificationLogs[
                            record.verificationLogs.length - 1
                          ].timestamp
                        ).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleViewRecord(record)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No insurance records found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Record Modal */}
      {showRecordModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Add Insurance Record
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowRecordModal(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID *
                    </label>
                    <input
                      type="text"
                      name="patient_id"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={formData.patient_id}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name (Display Only)
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={formData.patientName}
                      onChange={handleInputChange}
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

                <div>
                  {formData.coverage_type === 'Self-Pay' ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Patient has opted for self-pay instead of using
                        insurance. No further insurance verification is needed.
                      </p>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="flex items-center mb-4">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Self-Pay Option Selected
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Insurance information will be marked as not
                          applicable.
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
                                prior_auth_status: e.target.checked
                                  ? 'pending'
                                  : null,
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowRecordModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={handleSubmit}
                  disabled={
                    !formData.patient_id || createRecordMutation.isPending
                  }
                >
                  {createRecordMutation.isPending
                    ? 'Submitting...'
                    : formData.coverage_type === 'Self-Pay'
                      ? 'Mark as Self-Pay'
                      : 'Add Insurance Record'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* View Record Modal */}
      {showViewModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Insurance Details
                  {formattedSelectedRecord &&
                    ` - ${formattedSelectedRecord.patientName}`}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Show loading indicator if record is still loading */}
              {isRecordLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
                  <p className="text-gray-500">Loading record details...</p>
                </div>
              ) : recordError ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500 font-medium">
                    Error loading record details
                  </p>
                  <p className="text-gray-500 mt-1">
                    {recordError.message || 'Please try again'}
                  </p>
                </div>
              ) : !formattedSelectedRecord ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No record details available</p>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-6 text-sm font-medium ${
                          activeTab === 'info'
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Insurance Info
                      </button>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`py-4 px-6 text-sm font-medium ${
                          activeTab === 'documents'
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Documents (
                        {formattedSelectedRecord.documents
                          ? formattedSelectedRecord.documents.length
                          : 0}
                        )
                      </button>
                      <button
                        onClick={() => setActiveTab('logs')}
                        className={`py-4 px-6 text-sm font-medium ${
                          activeTab === 'logs'
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Verification Log (
                        {formattedSelectedRecord.verificationLogs
                          ? formattedSelectedRecord.verificationLogs.length
                          : 0}
                        )
                      </button>
                    </nav>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Insurance Info Tab */}
                    {activeTab === 'info' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-3">
                            Patient Information
                          </h4>
                          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500">
                                  Patient ID
                                </label>
                                <p className="text-sm font-medium">
                                  {formattedSelectedRecord.patientId}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">
                                  Patient Name
                                </label>
                                <p className="text-sm font-medium">
                                  {formattedSelectedRecord.patientName}
                                </p>
                              </div>
                            </div>
                          </div>

                          <h4 className="text-sm font-medium text-gray-500 mb-3">
                            Insurance Details
                          </h4>
                          <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-xs text-gray-500">
                                  Coverage Type
                                </label>
                                <p className="text-sm font-medium">
                                  {formattedSelectedRecord.coverageType}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">
                                  Status
                                </label>
                                <StatusBadge
                                  status={
                                    formattedSelectedRecord.verificationStatus
                                  }
                                />
                              </div>
                            </div>

                            {formattedSelectedRecord.coverageType !==
                              'Self-Pay' && (
                              <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-xs text-gray-500">
                                      Insurance Provider
                                    </label>
                                    <p className="text-sm font-medium">
                                      {
                                        formattedSelectedRecord.insuranceProvider
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500">
                                      Verification Date
                                    </label>
                                    <p className="text-sm">
                                      {formattedSelectedRecord.verificationDate
                                        ? new Date(
                                            formattedSelectedRecord.verificationDate
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-xs text-gray-500">
                                      Policy Number
                                    </label>
                                    <p className="text-sm">
                                      {formattedSelectedRecord.policyNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500">
                                      Group Number
                                    </label>
                                    <p className="text-sm">
                                      {formattedSelectedRecord.groupNumber}
                                    </p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <label className="block text-xs text-gray-500">
                                    Coverage Details
                                  </label>
                                  <p className="text-sm">
                                    {formattedSelectedRecord.coverageDetails ||
                                      'No details available'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-3">
                            Prior Authorization
                          </h4>
                          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                            {formattedSelectedRecord.priorAuthRequired ? (
                              <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-xs text-gray-500">
                                      Status
                                    </label>
                                    <StatusBadge
                                      status={
                                        formattedSelectedRecord.priorAuthStatus
                                          ? `prior_auth_${formattedSelectedRecord.priorAuthStatus}`
                                          : 'pending'
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500">
                                      Expiry Date
                                    </label>
                                    <p className="text-sm">
                                      {formattedSelectedRecord.priorAuthExpiryDate
                                        ? new Date(
                                            formattedSelectedRecord.priorAuthExpiryDate
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                {/* Action buttons for prior auth */}
                                <div className="flex space-x-2 mt-4">
                                  <button
                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-200"
                                    onClick={() => setActiveTab('logs')}
                                  >
                                    Update Status
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-200"
                                    onClick={() => setActiveTab('documents')}
                                  >
                                    Add Documents
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center">
                                <Info className="h-5 w-5 text-gray-400 mr-2" />
                                <p className="text-sm text-gray-500">
                                  Prior authorization not required
                                </p>
                              </div>
                            )}
                          </div>

                          <h4 className="text-sm font-medium text-gray-500 mb-3">
                            Notes
                          </h4>
                          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                            <p className="text-sm">
                              {formattedSelectedRecord.notes ||
                                'No notes available'}
                            </p>
                          </div>

                          <h4 className="text-sm font-medium text-gray-500 mb-3">
                            Recent Activity
                          </h4>
                          <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            {formattedSelectedRecord.verificationLogs &&
                            formattedSelectedRecord.verificationLogs.length >
                              0 ? (
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {formattedSelectedRecord.verificationLogs
                                  .slice(-3)
                                  .reverse()
                                  .map((log) => (
                                    <div
                                      key={log.id}
                                      className="border-l-2 border-indigo-500 pl-3"
                                    >
                                      <div className="flex justify-between">
                                        <span className="text-xs font-medium">
                                          {log.user}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {new Date(
                                            log.timestamp
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <StatusBadge status={log.status} />
                                      <p className="text-sm mt-1">
                                        {log.notes}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No activity logs available
                              </p>
                            )}

                            <button
                              className="mt-3 text-xs text-indigo-600 hover:text-indigo-900"
                              onClick={() => setActiveTab('logs')}
                            >
                              View all activity
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Insurance Documents
                          </h4>
                          <div>
                            <input
                              type="file"
                              id="document-upload"
                              className="hidden"
                              onChange={handleDocumentUpload}
                              disabled={uploadDocumentMutation.isPending}
                            />
                            <label
                              htmlFor="document-upload"
                              className={`px-3 py-1.5 ${
                                uploadDocumentMutation.isPending
                                  ? 'bg-indigo-400'
                                  : 'bg-indigo-600 hover:bg-indigo-700'
                              } text-white text-sm rounded flex items-center cursor-pointer`}
                            >
                              {uploadDocumentMutation.isPending ? (
                                <>Uploading...</>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload Document
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        {formattedSelectedRecord.documents &&
                        formattedSelectedRecord.documents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formattedSelectedRecord.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center"
                              >
                                <div className="p-2 bg-indigo-100 rounded mr-3">
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {doc.name || doc.filename}
                                  </p>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500 capitalize">
                                      {doc.type ||
                                        doc.document_type ||
                                        'document'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {doc.date
                                        ? new Date(
                                            doc.date
                                          ).toLocaleDateString()
                                        : doc.created_at
                                          ? new Date(
                                              doc.created_at
                                            ).toLocaleDateString()
                                          : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex">
                                  {doc.url && (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                      <Download className="h-4 w-4" />
                                    </a>
                                  )}
                                  <button
                                    className="p-1 text-gray-400 hover:text-red-600"
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    disabled={deleteDocumentMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-8 rounded border border-gray-200 text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No documents
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Get started by uploading a document.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Logs Tab */}
                    {activeTab === 'logs' && (
                      <div>
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Add New Status Update
                          </h4>
                          <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <div className="flex space-x-4 mb-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                  Status
                                </label>
                                <select
                                  name="status"
                                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                  value={newLog.status}
                                  onChange={handleLogInputChange}
                                >
                                  <option value="pending">
                                    Pending Verification
                                  </option>
                                  <option value="verified">Verified</option>
                                  <option value="denied">Denied</option>
                                  {formattedSelectedRecord.priorAuthRequired && (
                                    <>
                                      <option value="prior_auth_initiated">
                                        Prior Auth Initiated
                                      </option>
                                      <option value="prior_auth_pending">
                                        Prior Auth Pending
                                      </option>
                                      <option value="prior_auth_approved">
                                        Prior Auth Approved
                                      </option>
                                      <option value="prior_auth_denied">
                                        Prior Auth Denied
                                      </option>
                                    </>
                                  )}
                                </select>
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="block text-xs text-gray-500 mb-1">
                                Notes
                              </label>
                              <textarea
                                name="notes"
                                rows="3"
                                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                value={newLog.notes}
                                onChange={handleLogInputChange}
                                placeholder="Enter details about this status update"
                              ></textarea>
                            </div>

                            <div className="flex justify-end">
                              <button
                                className={`px-3 py-1.5 ${
                                  updateRecordMutation.isPending
                                    ? 'bg-indigo-400'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                } text-white text-sm rounded`}
                                onClick={handleAddLog}
                                disabled={
                                  !newLog.notes.trim() ||
                                  updateRecordMutation.isPending
                                }
                              >
                                {updateRecordMutation.isPending
                                  ? 'Adding...'
                                  : 'Add Log Entry'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Verification History
                        </h4>
                        {formattedSelectedRecord.verificationLogs &&
                        formattedSelectedRecord.verificationLogs.length > 0 ? (
                          <div className="space-y-4">
                            {formattedSelectedRecord.verificationLogs
                              .slice()
                              .reverse()
                              .map((log) => (
                                <div
                                  key={log.id}
                                  className="bg-gray-50 p-4 rounded border border-gray-200"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div>
                                      <StatusBadge status={log.status} />
                                      <span className="text-xs font-medium text-gray-500 ml-2">
                                        {log.user}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{log.notes}</p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
                            <p className="text-sm text-gray-500">
                              No verification logs available
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default InsuranceDocumentation;
