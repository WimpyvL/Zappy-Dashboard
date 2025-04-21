import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
// Removed useAppContext import
import { useSessions, useUpdateSessionStatus } from '../../apis/sessions/hooks'; // Assuming hooks exist
import {
  Search,
  Filter,
  Plus,
  // Calendar, // Removed unused import
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2, // Added for loading state
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'completed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </span>
    );
  } else if (status === 'scheduled') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3 mr-1" />
        Scheduled
      </span>
    );
  } else if (status === 'missed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Missed
      </span>
    );
  } else if (status === 'cancelled') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Cancelled
      </span>
    );
  }
  return null;
};

// Using product category styling from reusable components
const CategoryBadge = ({ category }) => {
  // Map the category to appropriate style
  const categoryStyles = {
    medication: 'bg-blue-100 text-blue-800',
    supplement: 'bg-green-100 text-green-800',
    service: 'bg-purple-100 text-purple-800',
    // Add more categories as needed
  };

  const style = categoryStyles[category] || 'bg-gray-100 text-gray-800';
  const displayCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Unknown';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {displayCategory}
    </span>
  );
};

const Sessions = () => {
  // State management for filters and modals
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Default to show active/needs attention
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // Placeholder
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Fetch data using React Query hooks
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useSessions(); // Assuming useSessions fetches all sessions or handles pagination/filtering

  // Mutation hook for updating status
  const updateSessionStatusMutation = useUpdateSessionStatus({
    onSuccess: () => {
      // console.log('Session status updated successfully'); // Removed log
      // Invalidation likely handled within the hook
      toast.success('Session status updated.'); // Add toast feedback
    },
    onError: (error) => {
      console.error('Failed to update session status:', error);
      // Show error notification
    },
  });

  // Use fetched data or default empty arrays
  const allSessions = sessionsData?.data || sessionsData || []; // Adapt based on API response structure

  // Determine if a session is active (needs attention)
  const isActiveSession = (session) => {
    return (
      session.status === 'scheduled' ||
      session.status === 'missed' ||
      (session.status === 'completed' && session.followUpNeeded)
    );
  };

  // Get today's date as a string for highlighting
  const today = new Date().toDateString();

  // Filter sessions based on search and filters
  const filteredSessions = allSessions
    .filter((session) => {
      const patientName = session.patientName || '';
      const matchesSearch = patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || session.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActiveSession(session)) ||
        (statusFilter === 'scheduled' && session.status === 'scheduled') ||
        (statusFilter === 'missed' && session.status === 'missed') ||
        (statusFilter === 'completed' && session.status === 'completed') ||
        (statusFilter === 'cancelled' && session.status === 'cancelled');
      const matchesProvider =
        providerFilter === 'all' || session.doctor === providerFilter;
      const matchesOrderStatus = orderStatusFilter === 'all'; // Placeholder logic
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        try {
          const sessionDate = new Date(session.scheduledDate);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Inclusive end date
          matchesDateRange = sessionDate >= startDate && sessionDate <= endDate;
        } catch (e) {
          console.error('Error parsing date for filtering:', e);
          matchesDateRange = false; // Exclude if date is invalid
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesProvider &&
        matchesOrderStatus &&
        matchesDateRange
      );
    })
    .sort((a, b) => {
      // Sort by scheduled date (ascending)
      try {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      } catch (e) {
        return 0; // Keep original order if dates are invalid
      }
    });

  // Calculate active sessions count based on *all* sessions before filtering UI
  const activeSessionsCount = allSessions.filter(isActiveSession).length;

  // Handle session status update using the mutation hook
  const handleStatusUpdate = (sessionId, newStatus) => {
    // Pass data as expected by the mutation hook
    updateSessionStatusMutation.mutate({ sessionId, status: newStatus });
  };

  // Handle loading state
  if (isLoadingSessions) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle error state
  if (errorSessions) {
    return (
      <div className="text-center py-10 text-red-600">
        <RefreshCw className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading session data.</p>
        {/* <p>{errorSessions?.message}</p> */}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
        <div className="flex space-x-3">
          <div className="bg-white rounded-md shadow px-4 py-2 flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-3">
              <span className="text-indigo-600">{activeSessionsCount}</span>{' '}
              active sessions
            </span>
          </div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
            onClick={() => setShowScheduleModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patient name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Needs Attention</option>
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="missed">Missed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Type
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="medical">Medical</option>
                <option value="psych">Psych</option>
                {/* Add other types dynamically if needed */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              >
                <option value="all">All Providers</option>
                {/* TODO: Populate providers dynamically */}
                <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                <option value="Dr. Emily Parker">Dr. Emily Parker</option>
                <option value="Dr. Lisa Wong">Dr. Lisa Wong</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status (Placeholder)
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => {
                  // Reset all filters
                  setStatusFilter('active');
                  setTypeFilter('all');
                  setProviderFilter('all');
                  setOrderStatusFilter('all');
                  setDateRange({ start: '', end: '' });
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  let sessionDate;
                  try {
                    sessionDate = new Date(session.scheduledDate);
                  } catch (e) {
                    sessionDate = null; // Handle invalid date
                  }
                  const isToday = sessionDate?.toDateString() === today;
                  const isPast =
                    sessionDate &&
                    sessionDate < new Date() &&
                    session.status === 'scheduled';
                  const isCompleting =
                    updateSessionStatusMutation.isLoading &&
                    updateSessionStatusMutation.variables?.sessionId ===
                      session.id &&
                    updateSessionStatusMutation.variables?.status ===
                      'completed';
                  const isMutating =
                    updateSessionStatusMutation.isLoading &&
                    updateSessionStatusMutation.variables?.sessionId ===
                      session.id;

                  return (
                    <tr
                      key={session.id}
                      className={`
                          hover:bg-gray-50
                          ${isToday ? 'bg-blue-50' : ''}
                          ${isPast ? 'bg-yellow-50' : ''}
                        `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm ${isToday ? 'font-bold text-blue-700' : 'text-gray-500'}`}
                          >
                            {sessionDate
                              ? sessionDate.toLocaleDateString()
                              : 'Invalid Date'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {sessionDate
                              ? sessionDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link
                            to={`/patients/${session.patientId}`} // Assuming patientId exists
                            className="hover:text-indigo-600"
                          >
                            {session.patientName || 'N/A'}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge category={session.type || 'unknown'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <StatusBadge status={session.status} />
                          {session.followUpNeeded && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Follow-Up Needed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.doctor || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(session.id, 'completed')
                            }
                            className={`text-green-600 hover:text-green-900 ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isMutating}
                          >
                            {isCompleting ? (
                              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                            ) : null}
                            Complete
                          </button>
                        )}
                        {session.status === 'missed' && (
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Reschedule{' '}
                            {/* TODO: Implement Reschedule Modal/Logic */}
                          </button>
                        )}
                        {session.status === 'completed' &&
                          session.followUpNeeded && (
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Schedule Follow-Up{' '}
                              {/* TODO: Implement Follow-up Logic */}
                            </button>
                          )}
                        {/* Always show Review Note button? Adjust logic as needed */}
                        <button className="text-gray-600 hover:text-gray-900">
                          Review Note{' '}
                          {/* TODO: Link to note or implement review logic */}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6" // Adjusted colspan
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sessions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Session Modal - Placeholder */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Schedule New Session
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowScheduleModal(false)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* TODO: Replace with actual form using react-hook-form and fetch data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select a patient</option>
                  {/* Populate with fetched patients */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="medical"
                      name="sessionType"
                      type="radio"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      defaultChecked
                    />
                    <label
                      htmlFor="medical"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Medical
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="psych"
                      name="sessionType"
                      type="radio"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="psych"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Psych
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select a doctor</option>
                  {/* Populate with fetched providers */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Add any relevant notes about this session..."
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                onClick={() => {
                  // TODO: Implement session scheduling logic using useCreateSession mutation hook
                  setShowScheduleModal(false);
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
