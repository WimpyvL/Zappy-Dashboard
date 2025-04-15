wimport React from 'react';
// import { Link } from 'react-router-dom'; // Removed unused Link
import { CheckCircle, Clock, X, Info } from 'lucide-react'; // Import necessary icons

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


const InsuranceRecordTable = ({ records, isLoading, onSort, sortConfig, onViewDetails }) => {
  // Helper function to format date (could also be moved to utils)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        // Add check for invalid date object after parsing
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date Format';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Add sorting handlers if needed */}
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
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : records.length > 0 ? (
              records.map((record) => (
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
                        {formatDate(record.priorAuthExpiryDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.verificationLogs &&
                    record.verificationLogs.length > 0
                      ? formatDate(record.verificationLogs[record.verificationLogs.length - 1].timestamp)
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => onViewDetails(record)} // Use prop handler
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No insurance records found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsuranceRecordTable;
