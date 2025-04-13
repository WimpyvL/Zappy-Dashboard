import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Download,
  Info,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import React Query hooks
import {
  useInsuranceRecordById,
  useUpdateInsuranceRecord,
  useUploadInsuranceDocument,
  useDeleteInsuranceDocument,
} from '../../../apis/insurances/hooks';

// Custom Spinner component using primary color
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

// Define StatusBadge locally or import from a shared location
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


const ViewInsuranceRecordModal = ({ isOpen, onClose, recordId }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [newLog, setNewLog] = useState({ status: 'pending', notes: '' });

  // Fetch selected record details
  const {
    data: selectedRecord, // Renamed from selectedRecordData
    isLoading: isRecordLoading,
    error: recordError,
    refetch: refetchRecord, // Added refetch
  } = useInsuranceRecordById(recordId, {
    enabled: !!recordId && isOpen, // Only fetch when modal is open and ID is present
    onSuccess: (data) => {
      console.log('Successfully fetched record details:', data);
    },
    onError: (error) => {
      console.error('Error fetching record details:', error);
      toast.error('Failed to load record details');
    },
  });

  // Set up mutations
  const updateRecordMutation = useUpdateInsuranceRecord({
    onSuccess: () => {
      toast.success('Insurance record updated successfully');
      refetchRecord(); // Refetch details after update
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  const uploadDocumentMutation = useUploadInsuranceDocument({
    recordId: recordId,
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      refetchRecord(); // Refetch details after upload
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });

  const deleteDocumentMutation = useDeleteInsuranceDocument({
    recordId: recordId,
    onSuccess: () => {
      toast.success('Document deleted successfully');
      refetchRecord(); // Refetch details after delete
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  // Parse verification history from API
  const parseVerificationHistory = (historyString) => {
    if (!historyString) return [];
    try {
      // Assuming history is stored as JSON string in DB
      const history = JSON.parse(historyString);
      return history.map((log, index) => ({
        id: `v${index}`, // Generate temporary ID
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

  // Handle new log input changes
  const handleLogInputChange = (e) => {
    const { name, value } = e.target;
    setNewLog({ ...newLog, [name]: value });
  };

  // Handle adding a new verification log
  const handleAddLog = () => {
    if (!newLog.notes.trim() || !recordId) return;

    const currentHistory = selectedRecord?.verification_history
      ? parseVerificationHistory(selectedRecord.verification_history)
      : [];

    const newLogEntry = {
      status: newLog.status,
      user: 'Current User', // Replace with actual user info later
      notes: newLog.notes,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = JSON.stringify([...currentHistory, newLogEntry]);

    let statusUpdates = {};
    // Map log status to main record status if applicable (adjust logic as needed)
    if (['verified', 'denied', 'not_applicable'].includes(newLog.status)) {
      statusUpdates = {
        status: newLog.status,
        verification_date: new Date().toISOString(),
      };
    }
    // TODO: Handle prior auth status updates based on actual schema columns

    updateRecordMutation.mutate({
      id: recordId,
      recordData: {
        verification_history: updatedHistory, // Assuming this column exists
        ...statusUpdates,
      },
    });

    setNewLog({ status: 'pending', notes: '' }); // Reset log form
  };

  // Handle document upload
  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !recordId) return;
    uploadDocumentMutation.mutate({ recordId, file });
  };

  // Handle document deletion
  const handleDeleteDocument = (documentId, storagePath) => {
    if (!documentId || !recordId || !storagePath) return;
    deleteDocumentMutation.mutate({ recordId, documentId, storagePath });
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      }).format(date);
    } catch (e) { return 'Invalid Date Format'; }
  };

  if (!isOpen) return null;

  // Prepare data for display (use selectedRecord directly)
  const displayRecord = selectedRecord || {};
  const verificationLogs = parseVerificationHistory(displayRecord.verification_history);
  const documents = displayRecord.documents || []; // Assuming documents are fetched with the record or available

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Insurance Details
            {/* TODO: Fetch and display patient name if needed */}
            {/* {displayRecord.patientName && ` - ${displayRecord.patientName}`} */}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isRecordLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
            <p className="text-gray-500">Loading record details...</p>
          </div>
        ) : recordError ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 font-medium">Error loading record details</p>
            <p className="text-gray-500 mt-1">{recordError.message || 'Please try again'}</p>
          </div>
        ) : !displayRecord.id ? ( // Check if record has loaded
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
                  className={`py-4 px-6 text-sm font-medium ${activeTab === 'info' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Insurance Info
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-4 px-6 text-sm font-medium ${activeTab === 'documents' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Documents ({documents.length})
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`py-4 px-6 text-sm font-medium ${activeTab === 'logs' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Verification Log ({verificationLogs.length})
                </button>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Insurance Info Tab */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ... (Display logic for Insurance Info based on displayRecord) ... */}
                   <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Patient Information</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs text-gray-500">Patient ID</label><p className="text-sm font-medium">{displayRecord.patient_id || 'N/A'}</p></div>
                          {/* Add Patient Name display if fetched */}
                          {/* <div><label className="block text-xs text-gray-500">Patient Name</label><p className="text-sm font-medium">{displayRecord.patientName || 'N/A'}</p></div> */}
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Insurance Details</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        {/* ... Display provider_name, policy_number, group_number, status, coverage_type, coverage_details ... */}
                         <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-xs text-gray-500">Coverage Type</label><p className="text-sm font-medium">{displayRecord.coverage_type || 'N/A'}</p></div>
                            <div><label className="block text-xs text-gray-500">Status</label><StatusBadge status={displayRecord.status} /></div>
                         </div>
                         {displayRecord.coverage_type !== 'Self-Pay' && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div><label className="block text-xs text-gray-500">Insurance Provider</label><p className="text-sm font-medium">{displayRecord.provider_name || 'N/A'}</p></div>
                                    <div><label className="block text-xs text-gray-500">Verification Date</label><p className="text-sm">{formatDate(displayRecord.verification_date)}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div><label className="block text-xs text-gray-500">Policy Number</label><p className="text-sm">{displayRecord.policy_number || 'N/A'}</p></div>
                                    <div><label className="block text-xs text-gray-500">Group Number</label><p className="text-sm">{displayRecord.group_number || 'N/A'}</p></div>
                                </div>
                                <div className="mb-4"><label className="block text-xs text-gray-500">Coverage Details</label><p className="text-sm">{displayRecord.coverage_details || 'No details available'}</p></div>
                            </>
                         )}
                      </div>
                   </div>
                   <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Prior Authorization</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                        {/* ... Display prior auth details ... */}
                         <p className="text-sm text-gray-500">(Prior Auth details not fully implemented)</p>
                      </div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Notes</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                        <p className="text-sm">{displayRecord.notes || 'No notes available'}</p>
                      </div>
                   </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Insurance Documents</h4>
                    <div>
                      <input type="file" id="document-upload-view" className="hidden" onChange={handleDocumentUpload} disabled={uploadDocumentMutation.isPending} />
                      <label htmlFor="document-upload-view" className={`px-3 py-1.5 ${uploadDocumentMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm rounded flex items-center cursor-pointer`}>
                        {uploadDocumentMutation.isPending ? 'Uploading...' : <><Upload className="h-4 w-4 mr-1" /> Upload Document</>}
                      </label>
                    </div>
                  </div>
                  {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center">
                          <div className="p-2 bg-indigo-100 rounded mr-3"><FileText className="h-5 w-5 text-indigo-600" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 capitalize">{doc.document_type || 'document'}</span>
                              <span className="text-xs text-gray-400">{formatDate(doc.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex">
                            {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-600"><Download className="h-4 w-4" /></a>}
                            <button className="p-1 text-gray-400 hover:text-red-600" onClick={() => handleDeleteDocument(doc.id, doc.storage_path)} disabled={deleteDocumentMutation.isPending}><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded border border-gray-200 text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Verification Logs Tab */}
              {activeTab === 'logs' && (
                <div>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Status Update</h4>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <div className="flex space-x-4 mb-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Status</label>
                          <select name="status" className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md" value={newLog.status} onChange={handleLogInputChange}>
                            <option value="pending">Pending Verification</option>
                            <option value="verified">Verified</option>
                            <option value="denied">Denied</option>
                            {/* TODO: Add prior auth statuses based on schema */}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">Notes</label>
                        <textarea name="notes" rows="3" className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md" value={newLog.notes} onChange={handleLogInputChange} placeholder="Enter details about this status update"></textarea>
                      </div>
                      <div className="flex justify-end">
                        <button className={`px-3 py-1.5 ${updateRecordMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm rounded`} onClick={handleAddLog} disabled={!newLog.notes.trim() || updateRecordMutation.isPending}>
                          {updateRecordMutation.isPending ? 'Adding...' : 'Add Log Entry'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Verification History</h4>
                  {verificationLogs.length > 0 ? (
                    <div className="space-y-4">
                      {verificationLogs.slice().reverse().map((log) => (
                        <div key={log.id} className="bg-gray-50 p-4 rounded border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <StatusBadge status={log.status} />
                              <span className="text-xs font-medium text-gray-500 ml-2">{log.user}</span>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm">{log.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
                      <p className="text-sm text-gray-500">No verification logs available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ViewInsuranceRecordModal;
