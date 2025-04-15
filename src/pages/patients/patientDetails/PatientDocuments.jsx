// components/patients/components/PatientDocuments.jsx - Refactored for Supabase
import React, { useState, useMemo, useEffect } from "react"; // Added useEffect
import { Upload, Trash2, Download, ChevronDown } from "lucide-react"; // Added icons
import { toast } from "react-toastify";
import {
  usePatientInsurances,
  useUploadInsuranceDocument,
  useDeleteInsuranceDocument
} from "../../../apis/insurances/hooks"; // Import insurance hooks
import { supabase } from "../../../lib/supabaseClient"; // Import for storage URL
import LoadingSpinner from "./common/LoadingSpinner";
import { useQueryClient } from '@tanstack/react-query';

// --- Document Upload Form ---
const DocumentUploadForm = ({ patientInsuranceId, onCancel, onSuccess }) => {
  const [documentFile, setDocumentFile] = useState(null);

  // Initialize the upload mutation hook
  const uploadMutation = useUploadInsuranceDocument({
      onSuccess: () => {
          toast.success("Document uploaded successfully!");
          onSuccess(); // Call parent onSuccess (e.g., invalidate query)
          onCancel(); // Close the form
      },
      onError: (error) => {
          toast.error(`Upload failed: ${error.message}`);
      }
      // No need for onSettled to manage local state if using hook's isPending
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!patientInsuranceId) {
        toast.error("Please select an insurance record to associate the document with.");
        return;
    }
    // Call the mutation
    uploadMutation.mutate({ patientInsuranceId, file: documentFile });
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-medium text-gray-900 mb-3">
        Upload New Document
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Note: Document Type selection is removed as it's not part of the new schema */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File <span className="text-red-600">*</span>
          </label>
          <input
            type="file"
            className="block w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white"
            onChange={(e) => setDocumentFile(e.target.files[0])}
            required
            disabled={uploadMutation.isPending}
          />
           {documentFile && <p className="mt-1 text-xs text-gray-500">{documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)</p>}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={onCancel}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <LoadingSpinner size="tiny" />
                <span className="ml-1">Uploading...</span>
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- Main PatientDocuments Component ---
const PatientDocuments = ({ patientId }) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState(''); // For selecting which insurance to upload to
  const queryClient = useQueryClient();

  // Fetch patient insurance records
  const {
    data: insuranceData,
    isLoading: insurancesLoading,
    error: insurancesError,
  } = usePatientInsurances(1, { patientId }, {
      // Fetch all records for this patient, disable pagination if needed by removing limit/offset in API
      // Or implement local pagination/load more if list can be very long
  });

  const patientInsurances = insuranceData?.data || [];

  // Initialize delete mutation hook
  const deleteMutation = useDeleteInsuranceDocument({
      onSuccess: (data, variables) => {
          toast.success("Document deleted successfully.");
          // Invalidate the query to refresh the list for the specific insurance record
          queryClient.invalidateQueries({ queryKey: ['patientInsurances', 1, { patientId }] });
          // Also invalidate the specific patientInsurance query if it exists elsewhere
          queryClient.invalidateQueries({ queryKey: ['patientInsurance', variables.patientInsuranceId] });
      },
      onError: (error) => {
          toast.error(`Failed to delete document: ${error.message}`);
      }
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }).format(date);
    } catch (e) {
        return "Invalid Date";
    }
  };

  const handleDeleteDocument = (patientInsuranceId, storagePath) => {
     if (!patientInsuranceId || !storagePath) {
        toast.error("Cannot delete document: Missing information.");
        return;
     }
     if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
        deleteMutation.mutate({ patientInsuranceId, storagePath });
     }
  };

   // Function to get public URL for viewing/downloading
   const getDocumentUrl = async (storagePath) => {
    const { data, error } = await supabase.storage
      .from('insurance_documents') // Use correct bucket name
      .createSignedUrl(storagePath, 300); // URL valid for 5 minutes

    if (error) {
      console.error("Error creating signed URL:", error);
      toast.error("Could not get document URL.");
      return "#";
    }
    return data.signedUrl;
  };

  // Handle selection change for upload target
  const handleInsuranceSelectChange = (e) => {
      setSelectedInsuranceId(e.target.value);
  };

  // Set default selected insurance if only one exists or reset if list changes
  useEffect(() => {
      if (patientInsurances.length === 1) {
          setSelectedInsuranceId(patientInsurances[0].id);
      } else if (!patientInsurances.find(ins => ins.id === selectedInsuranceId)) {
          // Reset if the previously selected ID is no longer valid
          setSelectedInsuranceId('');
      }
  }, [patientInsurances, selectedInsuranceId]);


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Patient Documents</h2>
        <button
          className={`px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center ${!patientInsurances || patientInsurances.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setShowUploadForm(true)}
          disabled={!patientInsurances || patientInsurances.length === 0}
          title={!patientInsurances || patientInsurances.length === 0 ? "Add an insurance record first" : "Upload new document"}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Document
        </button>
      </div>

      {showUploadForm && (
        <>
         {/* Dropdown to select insurance record if more than one exists */}
         {patientInsurances.length > 0 && ( // Show dropdown only if there are insurances
             <div className="mb-4">
                 <label htmlFor="insuranceSelect" className="block text-sm font-medium text-gray-700 mb-1">
                     Upload document for: <span className="text-red-600">*</span>
                 </label>
                 <select
                     id="insuranceSelect"
                     value={selectedInsuranceId}
                     onChange={handleInsuranceSelectChange}
                     className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     required
                 >
                     <option value="" disabled>-- Select Insurance Record --</option>
                     {patientInsurances.map(ins => (
                         <option key={ins.id} value={ins.id}>
                             {ins.insurance?.name || 'Unknown Provider'} - Policy: {ins.policy_number}
                         </option>
                     ))}
                 </select>
             </div>
         )}
         <DocumentUploadForm
           patientInsuranceId={selectedInsuranceId} // Pass selected ID
           onCancel={() => setShowUploadForm(false)}
           onSuccess={() => {
              setShowUploadForm(false);
              // Invalidate the patient insurances query to refresh
              queryClient.invalidateQueries({ queryKey: ['patientInsurances', 1, { patientId }] });
           }}
         />
        </>
      )}

      {insurancesLoading ? (
        <LoadingSpinner message="Loading insurance records..." />
      ) : insurancesError ? (
         <div className="text-center py-8 text-red-500">
            Error loading insurance records: {insurancesError.message}
         </div>
      ) : patientInsurances.length === 0 ? (
         <div className="text-center py-8 text-gray-500">
           No insurance records found for this patient. Add an insurance record via the 'Info' tab to upload documents.
         </div>
      ) : (
        // Iterate through insurance records, then documents within each
        patientInsurances.map(insuranceRecord => (
          <div key={insuranceRecord.id} className="mb-6 border rounded-lg p-4">
             <h3 className="text-md font-medium text-gray-700 mb-3">
               Insurance: {insuranceRecord.insurance?.name || 'Unknown Provider'} (Policy: {insuranceRecord.policy_number})
             </h3>
             {insuranceRecord.documents && insuranceRecord.documents.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                       <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {insuranceRecord.documents.map((doc, index) => (
                       <tr key={doc.storagePath || index} className="hover:bg-gray-50">
                         <td className="px-4 py-2 text-sm text-gray-700 font-medium">{doc.fileName}</td>
                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{(doc.size / 1024).toFixed(1)} KB</td>
                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                           {formatDate(doc.uploadedAt)}
                         </td>
                         <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                           <button
                             onClick={async () => {
                               const url = await getDocumentUrl(doc.storagePath);
                               if (url !== "#") window.open(url, '_blank');
                             }}
                             className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                           >
                             <Download className="h-4 w-4 mr-1"/> View
                           </button>
                           <button
                             className={`text-red-600 hover:text-red-900 inline-flex items-center ${deleteMutation.isPending && deleteMutation.variables?.storagePath === doc.storagePath ? 'opacity-50' : ''}`}
                             onClick={() => handleDeleteDocument(insuranceRecord.id, doc.storagePath)}
                             disabled={deleteMutation.isPending && deleteMutation.variables?.storagePath === doc.storagePath}
                           >
                             <Trash2 className="h-4 w-4 mr-1"/>
                             {deleteMutation.isPending && deleteMutation.variables?.storagePath === doc.storagePath ? 'Deleting...' : 'Delete'}
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="text-center py-4 text-gray-500 text-sm">
                 No documents uploaded for this insurance record.
               </div>
             )}
          </div>
        ))
      )}
    </div>
  );
};

export default PatientDocuments;
