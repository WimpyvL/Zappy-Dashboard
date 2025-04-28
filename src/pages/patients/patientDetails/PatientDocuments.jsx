// components/patients/components/PatientDocuments.jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, Clock, XCircle, Loader2, FileWarning } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePatientDocuments, useUploadPatientDocument, useDeletePatientDocument } from '../../../apis/documents/hooks';
import LoadingSpinner from './common/LoadingSpinner';

// Document upload form using our new patient document API
const DocumentUploadForm = ({ patientId, onCancel, onSuccess }) => {
  const [documentType, setDocumentType] = useState('id');
  const [documentFile, setDocumentFile] = useState(null);
  const [notes, setNotes] = useState('');
  
  const uploadMutation = useUploadPatientDocument({
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      onSuccess(); // Refresh the list in the parent
      setDocumentFile(null); // Reset file input
      onCancel(); // Close the form
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documentFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!patientId) {
      toast.error('Cannot upload: Patient ID is missing.');
      return;
    }
    
    uploadMutation.mutate({ 
      patientId, 
      file: documentFile,
      documentType,
      notes
    }); 
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-md font-medium text-gray-900 mb-3">
        Upload New Document
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            >
              <option value="id">Photo ID</option>
              <option value="address">Proof of Address</option>
              <option value="insurance">Insurance Card</option>
              <option value="lab">Lab Results</option>
              <option value="prescription">Prescription</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
              onChange={(e) => setDocumentFile(e.target.files[0])}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information about this document..."
            rows={2}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={onCancel}
            disabled={uploadMutation.isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            disabled={uploadMutation.isLoading || !patientId}
          >
            {uploadMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Document type badge component - unchanged
const DocumentTypeBadge = ({ type }) => {
  const typeConfig = {
    id: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: 'Photo ID',
    },
    address: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'Proof of Address',
    },
    insurance: {
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      label: 'Insurance Card',
    },
    lab: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Lab Results',
    },
    prescription: {
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-800',
      label: 'Prescription',
    },
    other: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: 'Other',
    },
  };

  const config = typeConfig[type] || typeConfig.other;
  if (
    type !== 'id' &&
    type !== 'address' &&
    type !== 'insurance' &&
    type !== 'lab' &&
    type !== 'prescription' &&
    type !== 'other'
  ) {
    config.label = type.charAt(0).toUpperCase() + type.slice(1);
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
};

// Document status badge component - unchanged
const DocumentStatusBadge = ({ status }) => {
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        status === 'verified'
          ? 'bg-green-100 text-green-800'
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'verified' ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : status === 'pending' ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PatientDocuments = ({
  patientId,
}) => {
  const [isUploadingFormVisible, setIsUploadingFormVisible] = useState(false);
  
  // Use our new patient documents hook
  const { 
    data: documentsData, 
    isLoading, 
    error,
    refetch: refreshDocuments 
  } = usePatientDocuments(patientId);
  
  // Get documents from the API response
  const documents = documentsData?.data || [];

  const deleteDocumentMutation = useDeletePatientDocument({
    onSuccess: () => {
        toast.success('Document deleted successfully');
        refreshDocuments();
    },
    onError: (error) => {
        toast.error(`Failed to delete document: ${error.message}`);
    }
  });

  // Format date helper function - unchanged
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Handle document deletion
  const handleDeleteDocument = (doc) => {
    if (!doc || !doc.id || !doc.storage_path) {
        toast.error("Cannot delete document: Missing required information.");
        console.error("Missing info for deletion:", doc);
        return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${doc.file_name || 'this document'}?`)) {
        deleteDocumentMutation.mutate({
            patientId,
            documentId: doc.id,
            storagePath: doc.storage_path
        });
    }
  };

  // Show the upload form
  const handleShowUploadForm = () => {
    if (!patientId) {
      toast.error("Patient ID is required to upload documents.");
      return;
    }
    
    setIsUploadingFormVisible(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Patient Documents</h2>
        <button
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
          onClick={handleShowUploadForm}
          disabled={!patientId}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Document
        </button>
      </div>

      {isUploadingFormVisible && (
        <DocumentUploadForm
          patientId={patientId}
          onCancel={() => setIsUploadingFormVisible(false)}
          onSuccess={refreshDocuments}
        />
      )}

      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : error ? (
        <div className="text-center py-8 text-red-500">
            <FileWarning className="h-8 w-8 mx-auto mb-2" />
            Error loading documents: {error.message}
        </div>
      ) : documents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DocumentTypeBadge type={doc.document_type || 'other'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {doc.file_name}
                    {doc.notes && <span className="text-xs block text-gray-400">{doc.notes}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DocumentStatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      View
                    </a>
                    <button
                      className={`text-red-600 hover:text-red-900 ${deleteDocumentMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleDeleteDocument(doc)}
                      disabled={deleteDocumentMutation.isLoading}
                    >
                      {deleteDocumentMutation.isLoading && deleteDocumentMutation.variables?.documentId === doc.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No documents found for this patient.
        </div>
      )}
    </div>
  );
};

export default PatientDocuments;
