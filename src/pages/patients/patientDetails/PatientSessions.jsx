// components/patients/components/PatientSessions.jsx
import React, { useState, useMemo } from "react"; // Added state/memo
import { Plus, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react"; // Added pagination icons
import { Link } from "react-router-dom";
import LoadingSpinner from "./common/LoadingSpinner";
import { useSessions } from "../../../apis/sessions/hooks"; // Import the hook

// Updated SessionTypeTag to handle different types from schema
const SessionTypeTag = ({ type }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let label = type ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'; // Format type

  if (type?.includes('consultation')) {
    bgColor = "bg-blue-100"; textColor = "text-blue-800";
  } else if (type?.includes('follow_up')) {
    bgColor = "bg-green-100"; textColor = "text-green-800";
  } else if (type?.includes('virtual')) {
     bgColor = "bg-purple-100"; textColor = "text-purple-800";
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

const SessionStatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        lowerStatus === "completed"
          ? "bg-green-100 text-green-800"
          : lowerStatus === "scheduled"
          ? "bg-blue-100 text-blue-800"
          : lowerStatus === "cancelled" || lowerStatus === "no_show" // Updated statuses
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800" // Default for 'in_progress' or unknown
      }`}
    >
      {lowerStatus === "completed" ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : lowerStatus === "scheduled" ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : lowerStatus === "cancelled" || lowerStatus === "no_show" ? (
        <XCircle className="h-3 w-3 mr-1" />
      ) : null /* Icon for in_progress? */}
      {status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
    </span>
  );
};

const PatientSessions = ({ patientId, onOpenFollowupNotes }) => { // Removed sessions, loading props
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize filters
  const filters = useMemo(() => ({ patientId }), [patientId]);

  // Fetch sessions using the hook
  const {
    data: sessionsData,
    isLoading,
    error,
    isFetching,
  } = useSessions(currentPage, filters);

  const sessions = sessionsData?.data || [];
  const pagination = sessionsData?.pagination || { totalPages: 1 };

   // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
     try {
        const date = new Date(dateString);
        // Include time for sessions
        return new Intl.DateTimeFormat("en-US", {
          year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }).format(date);
    } catch (e) {
        return "Invalid Date";
    }
  };

   const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Session History</h2>
        {/* Use Link component for navigation */}
        <Link
          to={`/sessions/new?patientId=${patientId}`} // Adjust route if needed
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Schedule New Session
        </Link>
      </div>

      {isLoading ? ( // Use hook's loading state
        <LoadingSpinner message="Loading sessions..." />
      ) : error ? ( // Use hook's error state
         <div className="text-center py-8 text-red-500">
            Error loading sessions: {error.message}
         </div>
      ) : sessions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Practitioner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(session.session_date)} {/* Use correct field */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SessionTypeTag type={session.session_type} /> {/* Use correct field */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.practitioner?.email || 'N/A'} {/* Display practitioner email */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SessionStatusBadge status={session.status} /> {/* Use correct field */}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"> {/* Keep truncate */}
                    {session.notes || "No summary"} {/* Use correct field */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* TODO: Update button logic - maybe link to session detail or open modal */}
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => onOpenFollowupNotes(session)} // Keep existing prop call
                    >
                      {session.status === "completed"
                        ? "Add/View Notes" // Changed label
                        : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
           {/* Pagination Controls */}
           {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t mt-4">
               <span className="text-sm text-gray-700">
                 Page {currentPage} of {pagination.totalPages}
               </span>
               <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`relative inline-flex items-center px-2 py-1 rounded border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-1 rounded border border-gray-300 bg-white text-sm font-medium ${currentPage < pagination.totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
               </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No sessions found for this patient.
        </div>
      )}
    </div>
  );
};

export default PatientSessions;
