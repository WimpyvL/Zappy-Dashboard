// components/patients/components/PatientForms.jsx
import React, { useState, useMemo } from "react"; // Added useMemo
import { Link } from "react-router-dom"; // Added Link
import { Plus, Eye } from "lucide-react"; // Changed icons
// import { toast } from "react-toastify"; // Keep if needed for future actions
// import apiService from "../../../utils/apiService"; // Removed
import { useFormSubmissions } from "../../../apis/forms/hooks"; // Import correct hook
import LoadingSpinner from "./common/LoadingSpinner";

// Remove FormStatusBadge as submission status isn't directly stored this way

const PatientForms = ({ patientId }) => { // Removed forms, loading props
  const [currentPage, setCurrentPage] = useState(1); // Add pagination state if needed

  // Memoize filters
  const filters = useMemo(() => ({ patientId }), [patientId]);

  // Fetch form submissions using the hook
  const {
    data: submissionsData,
    isLoading,
    error,
    isFetching,
  } = useFormSubmissions(null, currentPage, filters); // Pass null for formId initially if fetching all for patient

  const submissions = submissionsData?.data || [];
  const pagination = submissionsData?.pagination || { totalPages: 1 }; // Add pagination handling later if needed

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Remove filtering logic based on old status
  // const filteredForms = ...

  // Remove reminder/resend handlers as they are backend-dependent
  // const handleSendFormReminder = ...
  // const handleResendForm = ...

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Submitted Forms</h2>
        {/* Remove filter dropdown and Send Form button */}
        {/* Add button to assign/send a new form if needed, linking elsewhere */}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading submitted forms..." />
      ) : error ? (
         <div className="text-center py-8 text-red-500">
            Error loading form submissions: {error.message}
         </div>
      ) : submissions && submissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Name {/* TODO: Need to join form name */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                {/* Remove Sent, Deadline, Status columns */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {submission.form?.title || submission.form_id} {/* Display form title if joined, else ID */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(submission.created_at)}
                  </td>
                  {/* Remove Sent, Deadline, Status, Completed columns */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Link to view the specific submission details */}
                     <Link
                       to={`/forms/submissions/${submission.id}`} // Example route
                       className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                     >
                       <Eye className="h-4 w-4 mr-1"/> View Submission
                     </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TODO: Add pagination controls if needed */}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No forms have been submitted by this patient.
        </div>
      )}
    </div>
  );
};

export default PatientForms;
