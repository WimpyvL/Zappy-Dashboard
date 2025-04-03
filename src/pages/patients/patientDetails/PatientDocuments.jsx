// components/patients/components/PatientDocuments.jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../../../utils/apiService';
import LoadingSpinner from './common/LoadingSpinner';

const DocumentUploadForm = ({ patientId, onCancel, onSuccess }) => {
  const [documentType, setDocumentType] = useState('id');
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('type', documentType);

      // Upload document
      await apiService.post(
        `/api/v1/admin/patients/${patientId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Document uploaded successfully');

      // Notify parent component of success
      onSuccess();

      // Reset the form
      setDocumentFile(null);
      onCancel();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
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
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <LoadingSpinner size="tiny" />
                <span className="ml-1">Uploading...</span>
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
  documents,
  loading,
  fetchDocuments,
}) => {
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await apiService.delete(
        `/api/v1/admin/patients/${patientId}/documents/${docId}`
      );
      toast.success('Document deleted successfully');
      fetchDocuments(); // Refresh documents list
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Patient Documents</h2>
        <button
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          onClick={() => setUploadingDocument(true)}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Document
        </button>
      </div>

      {uploadingDocument && (
        <DocumentUploadForm
          patientId={patientId}
          onCancel={() => setUploadingDocument(false)}
          onSuccess={fetchDocuments}
        />
      )}

      {loading ? (
        <LoadingSpinner size="small" />
      ) : documents && documents.length > 0 ? (
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
                  Uploaded
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
                    <DocumentTypeBadge type={doc.type} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {doc.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.uploadedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DocumentStatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      View
                    </a>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      Delete
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
