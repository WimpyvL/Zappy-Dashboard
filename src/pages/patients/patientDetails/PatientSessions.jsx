// components/patients/components/PatientSessions.jsx
import React from 'react';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react'; // Removed unused Loader2
import { useSessions } from '../../../apis/sessions/hooks'; // Import the hook
import LoadingSpinner from './common/LoadingSpinner';

const SessionTypeTag = ({ type }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        type === 'medical'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-purple-100 text-purple-800'
      }`}
    >
      {type === 'medical' ? 'Medical' : 'Psych'}
    </span>
  );
};

const SessionStatusBadge = ({ status }) => {
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        status === 'completed'
          ? 'bg-green-100 text-green-800'
          : status === 'scheduled'
            ? 'bg-blue-100 text-blue-800'
            : status === 'missed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'completed' ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : status === 'scheduled' ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PatientSessions = ({ patientId, onOpenFollowupNotes }) => { // Removed sessions and loading props
  // Fetch sessions using the hook, filtering by patientId
  const { data: sessionsData, isLoading: loading /*, error: _error */ } = useSessions({ patientId: patientId }); // Removed unused error
  const sessions = sessionsData?.data || []; // Use fetched data or default to empty array
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Session History</h2>
        <button
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          onClick={() =>
            (window.location.href = `/sessions/new?patientId=${patientId}`)
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Schedule New Session
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="small" />
      ) : sessions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
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
                    {/* Use start_time from DB */}
                    {new Date(session.start_time).toLocaleDateString()} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {/* Use service_id or consultation_type if available, fallback */}
                    <SessionTypeTag type={session.consultation_type || 'medical'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {/* TODO: Fetch and display provider name based on provider_id */}
                    {session.provider_id ? `Provider: ${session.provider_id.substring(0,6)}...` : 'N/A'} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SessionStatusBadge status={session.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {session.session_notes || 'No notes'} {/* Use session_notes */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => onOpenFollowupNotes(session)}
                    >
                      {session.status === 'completed'
                        ? 'Add Follow-up'
                        : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No sessions found for this patient.
        </div>
      )}
    </div>
  );
};

export default PatientSessions;
