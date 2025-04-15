// src/pages/sessions/Sessions.js - Refactored for Supabase
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSessions, useUpdateSession, useCreateSession } from '../../apis/sessions/hooks'; // Import hooks
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { format, parseISO, isAfter } from 'date-fns';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle, // Added
  X // Added
} from 'lucide-react';
import LoadingSpinner from '../patients/patientDetails/common/LoadingSpinner'; // Adjust path if needed

// ErrorAlert Component (Re-added)
const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-red-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  let icon = <Clock className="h-3 w-3 mr-1" />;
  let style = "bg-yellow-100 text-yellow-800"; // Default scheduled

  if (lowerStatus === 'completed') {
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    style = "bg-green-100 text-green-800";
  } else if (lowerStatus === 'cancelled' || lowerStatus === 'no_show') {
    icon = <XCircle className="h-3 w-3 mr-1" />;
    style = "bg-red-100 text-red-800";
  } else if (lowerStatus !== 'scheduled') {
     icon = null;
     style = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {icon}
      {status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
    </span>
  );
};

// SessionTypeTag Component
const SessionTypeTag = ({ type }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let label = type ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';

  if (type?.includes('consultation')) { bgColor = "bg-blue-100"; textColor = "text-blue-800"; }
  else if (type?.includes('follow_up')) { bgColor = "bg-green-100"; textColor = "text-green-800"; }
  else if (type?.includes('virtual')) { bgColor = "bg-purple-100"; textColor = "text-purple-800"; }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

// Main Sessions Component
const Sessions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('scheduled');
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const filters = useMemo(() => {
      const activeFilters = {};
      if (searchTerm) activeFilters.patientName = searchTerm;
      if (statusFilter !== 'all') activeFilters.status = statusFilter;
      if (typeFilter !== 'all') activeFilters.session_type = typeFilter;
      if (providerFilter !== 'all') activeFilters.userId = providerFilter;
      if (dateRange.start) activeFilters.startDate = dateRange.start;
      if (dateRange.end) activeFilters.endDate = dateRange.end;
      return activeFilters;
  }, [searchTerm, statusFilter, typeFilter, providerFilter, dateRange]);

  // TODO: Add sorting state
  const {
      data: sessionsQueryResult,
      isLoading,
      error: queryError,
      isFetching
  } = useSessions(currentPage, filters);

  const sessions = sessionsQueryResult?.data || [];
  const pagination = sessionsQueryResult?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 };

  // --- Mutations ---
  const updateSessionMutation = useUpdateSession({
      onSuccess: (data, variables) => {
          toast.success(`Session status updated to ${variables.sessionData.status}.`);
          queryClient.invalidateQueries({ queryKey: ['sessions', currentPage, filters] });
          queryClient.invalidateQueries({ queryKey: ['session', variables.id] });
      },
      onError: (error) => toast.error(`Error updating session: ${error.message}`)
  });

  // TODO: Add createSessionMutation

  // --- Handlers ---
  const handleStatusUpdate = (sessionId, newStatus) => {
    updateSessionMutation.mutate({ id: sessionId, sessionData: { status: newStatus } });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
     try { return format(parseISO(dateString), 'MMM d, yyyy, p'); }
     catch (e) { return "Invalid Date"; }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  const error = queryError?.message || null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700" onClick={() => setShowScheduleModal(true)}>
          <Plus className="h-5 w-5 mr-2" /> Schedule Session
        </button>
      </div>

      {error && ( <ErrorAlert message={ error } /> )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Search patient name..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="scheduled">Scheduled</option>
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2 text-gray-500" /> {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input type="date" className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input type="date" className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="initial_consultation">Initial Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="virtual_checkin">Virtual Check-in</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
                <option value="all">All Providers</option>
                {/* TODO: Populate providers dynamically */}
              </select>
            </div>
            {/* Removed Order Status Filter */}
            <div className="md:col-span-3 flex items-end justify-end"> {/* Adjusted span */}
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" onClick={() => { setStatusFilter('scheduled'); setTypeFilter('all'); setProviderFilter('all'); setDateRange({ start: '', end: '' }); setSearchTerm(''); }}>Reset Filters</button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(isLoading || isFetching) && !sessionsQueryResult ? (
                   <tr><td colSpan="6" className="text-center py-10"><LoadingSpinner message="Loading sessions..." /></td></tr>
                ) : sessions.length > 0 ? (
                  sessions.map(session => {
                    const sessionDate = session.session_date ? parseISO(session.session_date) : null;
                    const isToday = sessionDate ? format(sessionDate, 'yyyy-MM-dd') === today : false;
                    const isPast = sessionDate ? isAfter(new Date(), sessionDate) && session.status === 'scheduled' : false;

                    return (
                      <tr key={session.id} className={`hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''} ${isPast ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(session.session_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/patients/${session.patient_id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                            {session.patient?.first_name} {session.patient?.last_name || ''}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><SessionTypeTag type={session.session_type} /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={session.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.practitioner?.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          {session.status === 'scheduled' && (
                            <button onClick={() => handleStatusUpdate(session.id, 'completed')} className="text-green-600 hover:text-green-900 disabled:opacity-50" disabled={updateSessionMutation.isPending}>Complete</button>
                          )}
                           {/* TODO: Add Reschedule/Review Note logic/links */}
                           <Link to={`/sessions/${session.id}`} className="text-indigo-600 hover:text-indigo-900">Details</Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No sessions found matching criteria.</td></tr>
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
      </div>

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Schedule New Session</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowScheduleModal(false)}>
                <X className="h-5 w-5" /> {/* Use X icon */}
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* TODO: Implement form state and inputs for scheduling */}
              <p className="text-center text-gray-600">Schedule Session form needs implementation.</p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700" onClick={() => { toast.info("Scheduling functionality not yet implemented."); setShowScheduleModal(false); }}>
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
