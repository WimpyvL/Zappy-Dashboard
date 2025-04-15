// src/pages/insurance/InsuranceDocumentation.jsx - Refactored for Supabase
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  ChevronLeft,
  ChevronRight,
  Loader
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';
import { Link } from "react-router-dom";

// Import React Query hooks with correct names
import {
  usePatientInsurances,       // Corrected
  usePatientInsuranceById,    // Corrected
  useCreatePatientInsurance,  // Corrected
  useUpdatePatientInsurance,  // Corrected
  useUploadInsuranceDocument,
  useDeleteInsuranceDocument,
} from "../../apis/insurances/hooks";
import LoadingSpinner from "../patients/patientDetails/common/LoadingSpinner";
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { supabase } from "../../lib/supabaseClient";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  let icon = <Clock className="h-3 w-3 mr-1" />;
  let style = "bg-yellow-100 text-yellow-800"; // Default pending

  if (lowerStatus === "verified" || lowerStatus === "prior_auth_approved") {
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    style = "bg-green-100 text-green-800";
  } else if (lowerStatus === "denied" || lowerStatus === "prior_auth_denied") {
    icon = <X className="h-3 w-3 mr-1" />;
    style = "bg-red-100 text-red-800";
  } else if (lowerStatus === "not_applicable") {
    icon = <Info className="h-3 w-3 mr-1" />;
    style = "bg-gray-100 text-gray-800";
  } else if (lowerStatus === "initiated" || lowerStatus === "prior_auth_initiated") {
     // Keep pending style for initiated
  } else if (lowerStatus !== "pending") {
     icon = null; // Unknown status
     style = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {icon}
      {status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
    </span>
  );
};

// Helper to format date string (YYYY-MM-DD) for input type="date"
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try { return format(parseISO(dateString), 'yyyy-MM-dd'); }
    catch (e) { console.error("Error formatting date for input:", e); return ''; }
};

// Helper to format date for display
const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try { return format(parseISO(dateString), 'MMM d, yyyy'); }
    catch (e) { console.error("Error formatting date for display:", e); return "Invalid Date"; }
};

// --- Document Upload Form Component ---
const DocumentUploadForm = ({ patientInsuranceId, onCancel, onSuccess }) => {
  const [documentFile, setDocumentFile] = useState(null);

  const uploadDocumentMutation = useUploadInsuranceDocument({
      onSuccess: () => {
          toast.success("Document uploaded successfully!");
          onSuccess();
          onCancel();
      },
      onError: (error) => {
          toast.error(`Upload failed: ${error.message}`);
      }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documentFile) { toast.error("Please select a file to upload"); return; }
    if (!patientInsuranceId) { toast.error("Cannot upload: Insurance record ID is missing."); return; }
    uploadDocumentMutation.mutate({ patientInsuranceId, file: documentFile });
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-medium text-gray-900 mb-3">Upload New Document</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File <span className="text-red-600">*</span></label>
          <input type="file" className="block w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white" onChange={(e) => setDocumentFile(e.target.files[0])} required disabled={uploadDocumentMutation.isPending} />
           {documentFile && <p className="mt-1 text-xs text-gray-500">{documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)</p>}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50" onClick={onCancel} disabled={uploadDocumentMutation.isPending}>Cancel</button>
          <button type="submit" className={`px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center ${uploadDocumentMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={uploadDocumentMutation.isPending}>
            {uploadDocumentMutation.isPending ? ( <><LoadingSpinner size="tiny" /><span className="ml-1">Uploading...</span></> ) : ( "Upload" )}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- Main InsuranceDocumentation Component ---
const InsuranceDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");
  const [addFormData, setAddFormData] = useState({
    patient_id: "", insurance_id: "", policy_number: "", group_number: "", notes: "",
  });
  const [newLog, setNewLog] = useState({ status: "pending", notes: "" });

  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const filters = useMemo(() => {
      const activeFilters = {};
      // TODO: Implement API-side search if needed
      if (statusFilter !== 'all') activeFilters.verification_status = statusFilter;
      return activeFilters;
  }, [statusFilter]);

  const {
      data: patientInsurancesData,
      isLoading,
      error: queryError,
      isFetching
  } = usePatientInsurances(currentPage, filters); // Use correct hook

  const patientInsurances = patientInsurancesData?.data || [];
  const pagination = patientInsurancesData?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 };

  const {
    data: selectedRecord,
    isLoading: isRecordLoading,
    error: recordError,
  } = usePatientInsuranceById(selectedRecordId, { // Use correct hook
    enabled: !!selectedRecordId && showViewModal,
  });

  // --- Mutations ---
  const createRecordMutation = useCreatePatientInsurance({ // Use correct hook
    onSuccess: () => {
      toast.success("Insurance record created successfully");
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ['patientInsurances'] });
    },
    onError: (error) => toast.error(`Failed to create record: ${error.message}`),
  });

  const updateRecordMutation = useUpdatePatientInsurance({ // Use correct hook
    onSuccess: (data, variables) => {
      toast.success("Insurance record updated successfully");
      queryClient.invalidateQueries({ queryKey: ['patientInsurances'] });
      queryClient.invalidateQueries({ queryKey: ['patientInsurance', variables.id] });
    },
    onError: (error) => toast.error(`Failed to update record: ${error.message}`),
  });

  const deleteDocumentMutation = useDeleteInsuranceDocument({
     onSuccess: (data, variables) => {
      toast.success("Document deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['patientInsurance', variables.patientInsuranceId] });
      queryClient.invalidateQueries({ queryKey: ['patientInsurances', 1, { patientId: selectedRecord?.patient_id }] });
    },
    onError: (error) => toast.error(`Failed to delete document: ${error.message}`),
  });

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = () => {
    setAddFormData({ patient_id: "", insurance_id: "", policy_number: "", group_number: "", notes: "" });
    setShowAddModal(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecordId(record.id);
    setActiveTab("documents");
    setShowViewModal(true);
  };

  const handleAddSubmit = () => {
    if (!addFormData.patient_id || !addFormData.insurance_id || !addFormData.policy_number) {
        toast.error("Patient, Insurance Provider, and Policy Number are required.");
        return;
    }
    createRecordMutation.mutate(addFormData);
  };

  // Handle adding a new verification log (Needs refactoring)
  const handleAddLog = () => {
      console.warn("handleAddLog needs refactoring. Verification history is not stored this way.");
      toast.info("Log adding functionality needs update.");
      // Example: Update the status on the main record
      // if (selectedRecordId && ['verified', 'denied', 'not_applicable'].includes(newLog.status)) {
      //     updateRecordMutation.mutate({
      //         id: selectedRecordId,
      //         recordData: { verification_status: newLog.status, verified_at: new Date().toISOString() }
      //     });
      // }
      setNewLog({ status: "pending", notes: "" });
  };

  const handleDeleteDocument = (patientInsuranceId, storagePath) => {
    if (!patientInsuranceId || !storagePath) return;
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate({ patientInsuranceId, storagePath });
    }
  };

   const getDocumentUrl = async (storagePath) => {
    const { data, error } = await supabase.storage
      .from('insurance_documents')
      .createSignedUrl(storagePath, 300);

    if (error) {
      console.error("Error creating signed URL:", error);
      toast.error("Could not get document URL.");
      return "#";
    }
    return data.signedUrl;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const error = queryError?.message || null;

  // --- Render ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Insurance Documentation</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700" onClick={handleAddRecord}>
          <Plus className="h-5 w-5 mr-2" /> Add Insurance Record
        </button>
      </div>

      {error && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md"><div className="flex"><div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm text-red-700">{error}</p></div></div></div> )}

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" placeholder="Search..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="denied">Denied</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>
      </div>

      {/* Insurance Records Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {(isLoading || isFetching) && !patientInsurancesData ? (
             <div className="flex justify-center items-center p-8"><LoadingSpinner message="Loading insurance records..." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy / Group #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patientInsurances.length > 0 ? (
                    patientInsurances.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.patient?.first_name} {record.patient?.last_name || ''}</div>
                          <div className="text-xs text-gray-500">ID: {record.patient_id.substring(0,8)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.insurance?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{record.policy_number}</div>
                           <div className="text-xs text-gray-500">{record.group_number || 'N/A'}</div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {record.documents?.length || 0} file(s)
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleViewRecord(record)}>View/Manage Docs</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No insurance records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
             {/* Pagination */}
             {pagination.totalPages > 1 && (
                 <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                     <div className="flex-1 flex justify-between sm:hidden">{/* Mobile Pagination */}</div>
                     <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                         <div><p className="text-sm text-gray-700">Showing <span className="font-medium">{pagination.totalCount > 0 ? (currentPage - 1) * pagination.itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * pagination.itemsPerPage, pagination.totalCount)}</span> of <span className="font-medium">{pagination.totalCount}</span> results</p></div>
                         <div>
                             <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                 <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}><ChevronLeft className="h-5 w-5" /></button>
                                 <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Page {currentPage} of {pagination.totalPages}</span>
                                 <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= pagination.totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage < pagination.totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}><ChevronRight className="h-5 w-5" /></button>
                             </nav>
                         </div>
                     </div>
                 </div>
             )}
          </>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Add Insurance Record</h3>
                <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowAddModal(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                 {/* TODO: Add Patient Selector */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
                    <input type="text" name="patient_id" className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" value={addFormData.patient_id} onChange={handleInputChange} required />
                 </div>
                 {/* TODO: Add Insurance Provider Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider ID *</label>
                    <input type="text" name="insurance_id" className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" value={addFormData.insurance_id} onChange={handleInputChange} required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                    <input type="text" name="policy_number" className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" value={addFormData.policy_number} onChange={handleInputChange} required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                    <input type="text" name="group_number" className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" value={addFormData.group_number} onChange={handleInputChange} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea name="notes" rows="3" className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" value={addFormData.notes} onChange={handleInputChange}></textarea>
                 </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50" onClick={handleAddSubmit} disabled={createRecordMutation.isPending}>
                  {createRecordMutation.isPending ? 'Adding...' : 'Add Record'}
                </button>
              </div>
            </div>
          </div>,
          document.body
      )}

      {/* View/Manage Documents Modal */}
      {showViewModal && selectedRecord && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Manage Documents for {selectedRecord.patient?.first_name} {selectedRecord.patient?.last_name} ({selectedRecord.insurance?.name} - {selectedRecord.policy_number})</h3>
                <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowViewModal(false)}><X className="h-5 w-5" /></button>
              </div>

              {isRecordLoading ? (
                 <div className="p-12 text-center"><LoadingSpinner message="Loading details..." /></div>
              ) : recordError ? (
                 <div className="p-8 text-center text-red-500">Error: {recordError.message}</div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                   {/* Document Upload Section */}
                   <DocumentUploadForm
                       patientInsuranceId={selectedRecordId}
                       onCancel={() => {}} // No action needed on cancel from here
                       onSuccess={() => {
                           // Invalidate the specific record query to refresh documents
                           queryClient.invalidateQueries({ queryKey: ['patientInsurance', selectedRecordId] });
                       }}
                   />

                   {/* Document List */}
                   <h4 className="text-md font-medium text-gray-900 mb-3 mt-6">Uploaded Documents</h4>
                   {selectedRecord.documents && selectedRecord.documents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRecord.documents.map((doc, index) => (
                          <div key={doc.storagePath || index} className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center overflow-hidden mr-2">
                               <FileText className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                               <div className="overflow-hidden">
                                   <p className="text-sm font-medium text-gray-800 truncate" title={doc.fileName}>{doc.fileName}</p>
                                   <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB - Uploaded: {formatDateForDisplay(doc.uploadedAt)}</p>
                               </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-2">
                               <button onClick={async () => { const url = await getDocumentUrl(doc.storagePath); if (url !== "#") window.open(url, '_blank'); }} className="text-indigo-600 hover:text-indigo-900 p-1" title="View/Download"><Download className="h-4 w-4"/></button>
                               <button onClick={() => handleDeleteDocument(selectedRecord.id, doc.storagePath)} className={`text-red-600 hover:text-red-900 p-1 ${deleteDocumentMutation.isPending && deleteDocumentMutation.variables?.storagePath === doc.storagePath ? 'opacity-50' : ''}`} title="Delete" disabled={deleteDocumentMutation.isPending && deleteDocumentMutation.variables?.storagePath === doc.storagePath}>
                                   {deleteDocumentMutation.isPending && deleteDocumentMutation.variables?.storagePath === doc.storagePath ? <Loader className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                               </button>
                            </div>
                          </div>
                        ))}
                      </div>
                   ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">No documents uploaded yet.</div>
                   )}
                </div>
              )}

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default InsuranceDocumentation;
