import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
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
    medication: "bg-blue-100 text-blue-800",
    supplement: "bg-green-100 text-green-800",
    service: "bg-purple-100 text-purple-800"
  };
  
  const style = categoryStyles[category] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

const Sessions = () => {
  // Get context with defensive programming
  const context = useAppContext();
  const sessions = context?.sessions || [];
  const updateSessionStatus = context?.updateSessionStatus || (() => {});
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Determine if a session is active (needs attention)
  const isActiveSession = (session) => {
    // Sessions that need attention:
    // 1. Scheduled sessions
    // 2. Missed sessions (need to be rescheduled)
    // 3. Completed sessions that need follow-up
    return (
      session.status === 'scheduled' || 
      session.status === 'missed' || 
      (session.status === 'completed' && session.followUpNeeded)
    );
  };
  
  // Get today's date as a string for highlighting
  const today = new Date().toDateString();
  
  // Sessions that need action vs completed/cancelled sessions
  const activeSessions = sessions.filter(isActiveSession);
  const inactiveSessions = sessions.filter(session => !isActiveSession(session));
  
  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter(session => {
    // Text search matching
    const matchesSearch = session.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter matching (kept as typeFilter in state but matching against session.type)
    const matchesType = typeFilter === 'all' || session.type === typeFilter;
    
    // Status filter matching
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && isActiveSession(session)) ||
      (statusFilter === 'scheduled' && session.status === 'scheduled') ||
      (statusFilter === 'missed' && session.status === 'missed') ||
      (statusFilter === 'completed' && session.status === 'completed') ||
      (statusFilter === 'cancelled' && session.status === 'cancelled');
    
    // Provider filter matching
    const matchesProvider = providerFilter === 'all' || session.doctor === providerFilter;
    
    // Order status filter matching (requires integration with order data)
    // This is a placeholder - in a real implementation, we would need to get order
    // information associated with this session and filter based on that
    const matchesOrderStatus = orderStatusFilter === 'all';
    
    // Date range filtering
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const sessionDate = new Date(session.scheduledDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      // Set end date to the end of the day for inclusive filtering
      endDate.setHours(23, 59, 59, 999);
      
      matchesDateRange = sessionDate >= startDate && sessionDate <= endDate;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesProvider && matchesOrderStatus && matchesDateRange;
  }).sort((a, b) => {
    // Sort by scheduled date (ascending)
    return new Date(a.scheduledDate) - new Date(b.scheduledDate);
  });
  
  // Handle session status update
  const handleStatusUpdate = (sessionId, newStatus) => {
    updateSessionStatus(sessionId, newStatus);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
        <div className="flex space-x-3">
          <div className="bg-white rounded-md shadow px-4 py-2 flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-3">
              <span className="text-indigo-600">{activeSessions.length}</span> active sessions
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="medical">Medical</option>
                <option value="psych">Psych</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              >
                <option value="all">All Providers</option>
                <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                <option value="Dr. Emily Parker">Dr. Emily Parker</option>
                <option value="Dr. Lisa Wong">Dr. Lisa Wong</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
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
                  filteredSessions.map(session => {
                    const sessionDate = new Date(session.scheduledDate);
                    const isToday = sessionDate.toDateString() === today;
                    const isPast = sessionDate < new Date() && session.status === 'scheduled';
                    
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
                            <span className={`text-sm ${isToday ? 'font-bold text-blue-700' : 'text-gray-500'}`}>
                              {sessionDate.toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/patients/${session.patientId}`} className="hover:text-indigo-600">
                              {session.patientName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CategoryBadge category={session.type || 'medication'} />
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
                          {session.doctor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {session.status === 'scheduled' && (
                            <button 
                              onClick={() => handleStatusUpdate(session.id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Complete
                            </button>
                          )}
                          {session.status === 'missed' && (
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Reschedule
                            </button>
                          )}
                          {session.status === 'completed' && session.followUpNeeded && (
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Schedule Follow-Up
                            </button>
                          )}
                          {!(['scheduled'].includes(session.status)) && (
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Review Note
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No sessions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
      
      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Schedule New Session</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowScheduleModal(false)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a patient</option>
                  <option value="1">John Doe</option>
                  <option value="2">Jane Smith</option>
                  <option value="3">Robert Johnson</option>
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
                    <label htmlFor="medical" className="ml-2 block text-sm text-gray-700">
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
                    <label htmlFor="psych" className="ml-2 block text-sm text-gray-700">
                      Psych
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a doctor</option>
                  <option value="dr_johnson">Dr. Sarah Johnson</option>
                  <option value="dr_chen">Dr. Michael Chen</option>
                  <option value="dr_parker">Dr. Emily Parker</option>
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
                  // Logic to schedule the session
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