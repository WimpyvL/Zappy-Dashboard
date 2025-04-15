import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Select, DatePicker, Radio } from 'antd'; // Removed unused TimePicker, Input, Form
import dayjs from 'dayjs'; // Import dayjs for Ant Design DatePicker v5+
import { toast } from 'react-toastify'; // Import toast for notifications
import { usePatients, usePatientById } from '../../apis/patients/hooks';
import { useGetUsers } from '../../apis/users/hooks';
// Removed useAppContext import
import { useSessions, useUpdateSessionStatus, useCreateSession } from '../../apis/sessions/hooks'; // Import create hook
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
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element

const StatusBadge = ({ status }) => {
  if (status === 'completed') {
    return (
      // Use accent2 for completed
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent2/10 text-accent2">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </span>
    );
  } else if (status === 'scheduled') {
    return (
      // Use accent3 for scheduled
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent3/10 text-accent3">
        <Clock className="h-3 w-3 mr-1" />
        Scheduled
      </span>
    );
  } else if (status === 'missed') {
    return (
      // Use accent1 for missed
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent1/10 text-accent1">
        <XCircle className="h-3 w-3 mr-1" />
        Missed
      </span>
    );
  } else if (status === 'cancelled') {
    return (
      // Keep gray for cancelled
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Cancelled
      </span>
    );
  }
  return null;
};

// Using Zappy accent colors for CategoryBadge
const CategoryBadge = ({ category }) => {
  // Map the category to Zappy accent colors
  const categoryStyles = {
    medical: 'bg-accent1/10 text-accent1', // Example: accent1 for medical
    psych: 'bg-accent4/10 text-accent4', // Example: accent4 for psych
    service: 'bg-accent2/10 text-accent2', // Example: accent2 for service
    // Add more categories as needed, cycling through accent1-4
  };

  const style = categoryStyles[category?.toLowerCase()] || 'bg-gray-100 text-gray-800'; // Use lowercase category for matching
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
  const [preselectedPatientId, setPreselectedPatientId] = useState(null); // State to hold patient ID from URL
  // State for the schedule session modal form
  const [scheduleFormData, setScheduleFormData] = useState({
    patientId: null,
    sessionType: 'medical',
    doctorId: null,
    dateTime: null,
    notes: '',
  });

  // Get location and query parameters
  const location = useLocation();

  // Effect to check for patientId in query params and open modal
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const patientIdFromUrl = queryParams.get('patientId');
    if (patientIdFromUrl) {
      setPreselectedPatientId(patientIdFromUrl); // Store the ID
      setShowScheduleModal(true); // Open the modal
      // Optional: Clear the patientId from URL after processing to prevent modal reopening on refresh
      // This might have unintended side effects if the user navigates back/forward.
      // Consider the desired UX carefully before uncommenting.
      // window.history.replaceState({}, document.title, location.pathname);
    } else {
      // Reset if navigating to the page without a patientId
      setPreselectedPatientId(null);
      // Ensure modal doesn't stay open if navigated away and back without ID
      // setShowScheduleModal(false); // Be careful with this, might close modal unexpectedly
    }
  }, [location.search]); // Re-run if the search query changes


  // Fetch data using React Query hooks
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useSessions({ searchTerm }); // Pass searchTerm to hook

  // Mutation hook for updating status
  const updateSessionStatusMutation = useUpdateSessionStatus({
    onSuccess: () => {
      console.log('Session status updated successfully');
      // Invalidation likely handled within the hook
    },
    onError: (error) => {
      console.error('Failed to update session status:', error);
      // Show error notification
    },
  });

  // Fetch patients for the dropdown
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(); // Fetch all patients
  const allPatients = patientsData?.data || [];

  // Fetch doctors/providers for the dropdown
  const { data: providersData /*, isLoading: _isLoadingProviders */ } = useGetUsers({ role: 'practitioner' }); // Removed unused isLoadingProviders
  // const allProviders = providersData || []; // Removed unused allProviders

  // Create session mutation
  const createSessionMutation = useCreateSession({
    onSuccess: () => {
      setShowScheduleModal(false); // Close modal on success
      // Optionally reset form state here if needed
      setScheduleFormData({ patientId: null, sessionType: 'medical', doctorId: null, dateTime: null, notes: '' });
    },
    // onError handled globally by the hook (toast)
  });

  // Fetch details of the preselected patient if an ID exists
  const { data: preselectedPatientDetails, isLoading: isLoadingPreselectedPatient } = usePatientById(preselectedPatientId, {
    enabled: !!preselectedPatientId, // Only fetch if preselectedPatientId is truthy
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

  // Filter sessions based on filters (status, type, provider, date) - Search is now handled server-side
  const filteredSessions = allSessions
    .filter((session) => {
      // const patientName = session.patientName || ''; // No longer needed for search
      // const matchesSearch = patientName // Removed frontend search logic
      //   .toLowerCase()
      //   .includes(searchTerm.toLowerCase());
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

      // Return based on filters only
      return (
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
        {/* Use primary color for spinner */}
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
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
    <div className="relative overflow-hidden pb-10"> {/* Add relative positioning and padding */}
      {/* Add childish drawing elements */}
      <ChildishDrawingElement type="scribble" color="accent3" position="top-right" size={110} rotation={5} opacity={0.1} />
      <ChildishDrawingElement type="watercolor" color="accent1" position="bottom-left" size={130} rotation={-10} opacity={0.1} />

      <div className="flex justify-between items-center mb-6 relative z-10"> {/* Added z-index */}
        <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
        <div className="flex space-x-3">
          <div className="bg-white rounded-md shadow px-4 py-2 flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-3">
              {/* Use primary color for count */}
              <span className="text-primary">{activeSessionsCount}</span>{' '}
              active sessions
            </span>
          </div>
          {/* Use primary color for Schedule Session button */}
          <button
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
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
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
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
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
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
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
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
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
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
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
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
                          {/* Use primary color for link hover */}
                          <Link
                            to={`/patients/${session.patientId}`} // Assuming patientId exists
                            className="hover:text-primary"
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
                        {/* Use accent2 for Complete button */}
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(session.id, 'completed')
                            }
                            className={`text-accent2 hover:text-accent2/80 ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isMutating}
                          >
                            {isCompleting ? (
                              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                            ) : null}
                            Complete
                          </button>
                        )}
                        {/* Use accent3 for Reschedule/Follow-up buttons */}
                        {session.status === 'missed' && (
                          <button className="text-accent3 hover:text-accent3/80">
                            Reschedule{' '}
                            {/* TODO: Implement Reschedule Modal/Logic */}
                          </button>
                        )}
                        {session.status === 'completed' &&
                          session.followUpNeeded && (
                            <button className="text-accent3 hover:text-accent3/80">
                              Schedule Follow-Up{' '}
                              {/* TODO: Implement Follow-up Logic */}
                            </button>
                          )}
                        {/* Keep Review Note gray */}
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
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder={preselectedPatientId ? (isLoadingPreselectedPatient ? "Loading..." : (preselectedPatientDetails?.name || `ID: ${preselectedPatientId}`)) : "Search or Select Patient"}
                  optionFilterProp="children"
                  value={preselectedPatientId || undefined} // Use undefined for placeholder to show
                  onChange={(value) => {
                     // Handle patient selection only if not pre-selected
                     if (!preselectedPatientId) {
                       setScheduleFormData(prev => ({ ...prev, patientId: value }));
                     }
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isLoadingPatients || (preselectedPatientId && isLoadingPreselectedPatient)}
                  disabled={!!preselectedPatientId} // Disable if pre-selected from URL
                  options={
                    preselectedPatientId && preselectedPatientDetails
                      ? [{ value: preselectedPatientId, label: preselectedPatientDetails.name || `ID: ${preselectedPatientId}` }] // Show only preselected if available
                      : allPatients.map(p => ({
                          value: p.id,
                          // Combine first and last name for label
                          label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `ID: ${p.id}`
                        }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                {/* Use Ant Design Radio Group */}
                <Radio.Group
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, sessionType: e.target.value }))}
                  value={scheduleFormData.sessionType}
                >
                  <Radio value="medical">Medical</Radio>
                  <Radio value="psych">Psych</Radio>
                </Radio.Group>
                {/* <div className="flex space-x-4"> */}
                  {/* <div className="flex items-center"> */}
                    {/* <input
                      id="medical"
                      name="sessionType"
                      type="radio"
                      value="medical" // Add value
                      checked={scheduleFormData.sessionType === 'medical'} // Connect to state
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, sessionType: e.target.value }))} // Add onChange
                      className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    /> */}
                    {/* <label
                      htmlFor="medical"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Medical */}
                    {/* </label> */}
                  {/* </div> */}
                  {/* <div className="flex items-center"> */}
                    {/* <input
                      id="psych"
                      name="sessionType"
                      type="radio"
                      value="psych" // Add value
                      checked={scheduleFormData.sessionType === 'psych'} // Connect to state
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, sessionType: e.target.value }))} // Add onChange
                      className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    /> */}
                    {/* <label
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
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Select Doctor"
                  optionFilterProp="children"
                  value={scheduleFormData.doctorId} // Connect to state
                  onChange={(value) => setScheduleFormData(prev => ({ ...prev, doctorId: value }))} // Add onChange
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isLoadingProviders}
                  options={allProviders.map(p => ({
                    value: p.id,
                    label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `ID: ${p.id}`
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                {/* Use Ant Design DatePicker */}
                <DatePicker
                  showTime // Enable time selection
                  style={{ width: '100%' }}
                  // Use dayjs object for value if available, otherwise null
                  value={scheduleFormData.dateTime ? dayjs(scheduleFormData.dateTime) : null}
                  onChange={(date) => {
                    // Store the date as an ISO string for Supabase compatibility
                    const isoString = date ? date.toISOString() : null;
                    setScheduleFormData(prev => ({ ...prev, dateTime: isoString }));
                  }}
                  format="YYYY-MM-DD HH:mm" // Display format
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" // Adjusted padding
                  placeholder="Add any relevant notes about this session..."
                  value={scheduleFormData.notes} // Connect to state
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, notes: e.target.value }))} // Add onChange
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
              {/* Use primary color for Schedule button */}
              <button
                className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                onClick={() => {
                  const finalData = {
                    patient_id: preselectedPatientId || scheduleFormData.patientId, // Use patient_id based on schema
                    type: scheduleFormData.sessionType,
                    provider_id: scheduleFormData.doctorId, // Use provider_id based on schema
                    scheduled_date: scheduleFormData.dateTime, // Use scheduled_date based on schema
                    session_notes: scheduleFormData.notes, // Use session_notes based on schema
                    status: 'scheduled', // Default status
                  };
                  // Basic validation
                  if (!finalData.patient_id || !finalData.provider_id || !finalData.scheduled_date) {
                      toast.error("Please select patient, doctor, and date/time.");
                      return;
                  }
                  console.log("Scheduling session with data:", finalData);
                  createSessionMutation.mutate(finalData);
                  // Modal closing is handled by onSuccess in mutation hook
                }}
                disabled={createSessionMutation.isLoading} // Disable while creating
              >
                {createSessionMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
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
