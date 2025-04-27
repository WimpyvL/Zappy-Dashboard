import React, { useState, useEffect, useCallback } from 'react';
import { usePatients } from '../../apis/patients/hooks'; 
import { useSessions } from '../../apis/sessions/hooks';
import { useOrders } from '../../apis/orders/hooks'; 
import { useConsultations, useUpdateConsultationStatus } from '../../apis/consultations/hooks';
import { useTasks } from '../../apis/tasks/hooks';
import { useForms } from '../../apis/forms/hooks';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  Check,
  AlertTriangle,
  Loader2,
  Users,
  Package,
  MessageSquare,
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';
import InitialConsultationNotes from '../consultations/InitialConsultationNotes';

// Simple status badge for consultations
const ConsultationStatusBadge = ({ status }) => {
  if (status === 'approved') {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        Approved
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        Pending
      </span>
    );
  } else if (status === 'rejected') {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
        Rejected
      </span>
    );
  } else if (status === 'needs_more_info') {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
        Needs Info
      </span>
    );
  }
  return null;
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  
  // Add state for review modal
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  
  // Add state for session refreshing
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Fetch data using React Query hooks - Moved these up to fix the initialization issue
  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    error: errorPatients,
  } = usePatients();
  
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
    refetch: refetchSessions,
  } = useSessions();
  
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
  } = useOrders();
  
  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: errorConsultations,
  } = useConsultations({}, 10);
  
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: errorTasks,
  } = useTasks(1, { status: 'Pending' }, {}, 10);
  
  const {
    data: formsData,
    isLoading: isLoadingForms,
    error: errorForms,
  } = useForms();
  
  // Consultation status update mutation
  const updateStatusMutation = useUpdateConsultationStatus({
    onSuccess: () => {
      // Refresh consultation data would go here if needed
    }
  });
  
  // Now that refetchSessions is defined, we can use it in our callback
  const handleRefreshSessions = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchSessions();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSessions]);

  // Set up automatic refresh on component mount and at regular intervals
  useEffect(() => {
    // Refresh on component mount
    handleRefreshSessions();
    
    // Set up interval for automatic refresh (every 2 minutes)
    const refreshInterval = setInterval(handleRefreshSessions, 120000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [handleRefreshSessions]);
  
  // Handle opening the consultation review modal
  const handleReviewConsultation = (consultation) => {
    const patientData = {
      id: consultation.patient_id,
      name: consultation.patientName || 'Patient',
      email: consultation.email,
      dob: consultation.patients?.date_of_birth
    };
    setSelectedConsultation({
      ...consultation,
      patient: patientData
    });
    setShowConsultationModal(true);
  };

  // Handle closing the consultation modal
  const handleCloseConsultationModal = () => {
    setShowConsultationModal(false);
    setSelectedConsultation(null);
  };

  // Use fetched data or default empty arrays
  // Note: Adjust based on the actual structure returned by usePatients, useSessions, useOrders
  const patients = patientsData?.data || patientsData || []; // Adapt based on API response structure
  const sessions = sessionsData?.data || sessionsData || []; // Adapt based on API response structure
  const orders = ordersData?.data || ordersData || []; // Adapt based on API response structure
  const consultations = consultationsData?.data || [];
  const pendingTasks = tasksData?.data || [];
  // Define forms properly from formsData
  const forms = formsData?.data || [];

  // Get pending consultations
  const pendingConsultations = consultations.filter(
    (c) => c.status === 'pending' || c.status === 'needs_more_info'
  );

  // Calculate statistics
  const scheduledSessions = sessions.filter(
    (s) => s.status === 'scheduled'
  ).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  // Get today's sessions - Using improved date comparison that handles future dates
  const getFormattedDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };
  
  // Get the current date - for debugging and comparison
  const currentDate = new Date();
  console.log('Current date:', currentDate.toISOString(), getFormattedDate(currentDate));
  
  const todayFormatted = getFormattedDate(new Date());
  const todaySessions = sessions.filter(s => {
    // Check for valid scheduledDate
    if (!s.scheduledDate) return false;
    
    // Convert and format the session date
    const sessionDate = new Date(s.scheduledDate);
    const sessionFormatted = getFormattedDate(sessionDate);
    
    // Debug info to see what's being compared
    console.log('Session date comparison:', 
      s.patientName,
      sessionDate.toISOString(), 
      sessionFormatted, 
      'matches today?', sessionFormatted === todayFormatted,
      'status:', s.status);
    
    // Consider status and date - ignore time portion for more reliable comparison
    return s.status === 'scheduled' && sessionFormatted === todayFormatted;
  });
  
  console.log('Today sessions found:', todaySessions.length, todayFormatted);

  // Handle error state (basic example)
  if (errorPatients || errorSessions || errorOrders || errorConsultations || errorTasks || errorForms) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container relative overflow-hidden pb-10">
      {/* Add childish drawing elements with lower opacity for subtle effect */}
      <ChildishDrawingElement type="watercolor" color="accent2" position="top-right" size={180} rotation={-10} opacity={0.1} />
      <ChildishDrawingElement type="doodle" color="accent4" position="bottom-left" size={150} rotation={15} opacity={0.1} />
      
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
        <p className="text-sm font-handwritten text-accent3 mt-1"></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Link to="/patients" className="block">
          <div className="bg-white rounded-lg shadow p-6 h-full hover:shadow-md transition-shadow border-t-4 border-primary">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-gray-700 text-sm font-medium">
                Total Patients
              </h3>
            </div>
            <p className="text-3xl font-bold mt-2">{patients.length}</p>
            {/* Placeholder for growth stat */}
            {/* <div className="mt-2 text-green-600 text-sm">↑ 12% from last month</div> */}
          </div>
        </Link>

        <Link to="/sessions" className="block">
          {/* Use accent3 color */}
          <div className="bg-white rounded-lg shadow p-6 h-full hover:shadow-md transition-shadow border-t-4 border-accent3">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-accent3 mr-2" />
              <h3 className="text-gray-700 text-sm font-medium">
                Upcoming Sessions
              </h3>
            </div>
            <p className="text-3xl font-bold mt-2">{scheduledSessions}</p>
            <div className="mt-2 text-accent3 text-sm">
              {todaySessions.length > 0
                ? `${todaySessions.length} sessions today`
                : 'No sessions today'}
            </div>
          </div>
        </Link>

        <Link to="/orders" className="block">
          {/* Use accent2 color */}
          <div className="bg-white rounded-lg shadow p-6 h-full hover:shadow-md transition-shadow border-t-4 border-accent2">
            <div className="flex items-center mb-2">
              <Package className="h-5 w-5 text-accent2 mr-2" />
              <h3 className="text-gray-700 text-sm font-medium">
                Pending Orders
              </h3>
            </div>
            <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
            <div className="mt-2 text-accent2 text-sm">
              {pendingOrders > 0
                ? `${pendingOrders} awaiting approval`
                : 'No pending orders'}
            </div>
          </div>
        </Link>

        <Link to="/consultations" className="block">
          {/* Use accent1 color */}
          <div className="bg-white rounded-lg shadow p-6 h-full hover:shadow-md transition-shadow border-t-4 border-accent1">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-5 w-5 text-accent1 mr-2" />
              <h3 className="text-gray-700 text-sm font-medium">
                New Consultations
              </h3>
            </div>
            <p className="text-3xl font-bold mt-2">
              {pendingConsultations.length}
            </p>
            <div className="mt-2 text-accent1 text-sm">
              {pendingConsultations.length > 0
                ? `${pendingConsultations.length} need review`
                : 'All caught up!'}
            </div>
          </div>
        </Link>
      </div>

      {/* Two column layout for Today's Sessions and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Sessions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-accent3/5">
            <h2 className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 text-accent3 mr-2" />
              Today's Sessions
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefreshSessions}
                disabled={refreshing}
                className="flex items-center text-accent3 hover:text-accent3/80 disabled:opacity-50"
                title="Refresh sessions"
              >
                <span className="text-xs mr-1">{refreshing ? "Refreshing..." : "Refresh"}</span>
                <Clock className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/sessions"
                className="text-sm text-accent3 hover:text-accent3/80"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              {refreshing && (
                <span className="text-xs text-accent3 flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Refreshing...
                </span>
              )}
            </div>
            {todaySessions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {todaySessions.map((session) => (
                  <li key={session.id} className="py-4">
                    <div className="flex items-center">
                      {/* Use accent3 color for avatar placeholder */}
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent3/10 flex items-center justify-center text-accent3">
                        {session.patientName?.charAt(0) || '?'}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {session.patientName || 'Unknown Patient'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.scheduledDate).toLocaleTimeString(
                              [],
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{session.type}</p>
                      </div>
                      {/* Use primary color for button */}
                      <button className="ml-4 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90">
                        Join
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No sessions scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-accent4/5">
            <h2 className="text-lg font-medium flex items-center">
              <Clock className="h-5 w-5 text-accent4 mr-2" />
              Tasks
            </h2>
            {/* Use accent4 color for link */}
            <Link
              to="/tasks"
              className="text-sm text-accent4 hover:text-accent4/80"
            >
              + Add Task
            </Link>
          </div>
          <div className="p-6">
            {pendingTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pendingTasks.map((task) => (
                  <li key={task.id} className="py-4">
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-5 w-5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100'
                            : task.priority === 'medium'
                              ? 'bg-yellow-100'
                              : 'bg-green-100'
                        } flex items-center justify-center ${
                          task.priority === 'high'
                            ? 'text-red-500'
                            : task.priority === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="ml-2 text-gray-400 hover:text-gray-600">
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No pending tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Initial Consultations and Pending Forms Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Initial Consultations Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-accent1/5">
            <h2 className="text-lg font-medium flex items-center">
              <UserPlus className="h-5 w-5 text-accent1 mr-2" />
              Initial Consultations
            </h2>
            {/* Use accent1 color for link */}
            <Link
              to="/consultations"
              className="text-sm text-accent1 hover:text-accent1/80"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {pendingConsultations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pendingConsultations.map((consultation) => (
                  <li key={consultation.id} className="py-4">
                    <div className="flex items-center">
                      {/* Use accent1 color for avatar placeholder */}
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent1/10 flex items-center justify-center text-accent1">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {consultation.patientName}
                          </p>
                          <ConsultationStatusBadge
                            status={consultation.status}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Submitted:{' '}
                          {new Date(
                            consultation.dateSubmitted
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Replace Link with a button that uses our handler */}
                      <button
                        onClick={() => handleReviewConsultation(consultation)}
                        className="ml-4 px-3 py-1 border border-primary text-primary text-sm rounded hover:bg-primary/5"
                      >
                        Review
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No pending consultations</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Forms Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-accent2/5">
            <h2 className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 text-accent2 mr-2" />
              Pending Forms
            </h2>
            {/* Use accent2 color for button */}
            <button className="text-sm text-accent2 hover:text-accent2/80">
              Send Reminders
            </button>
          </div>
          <div className="p-6">
            {forms.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {forms.map((form) => (
                  <li key={form.id} className="py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent2/10 flex items-center justify-center text-accent2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium">{form.title}</p>
                        <p className="text-sm text-gray-500">
                          {/* Placeholder: No patient info, just show form name */}
                        </p>
                      </div>
                      <button className="text-primary hover:text-primary/80 text-sm">
                        Remind
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No pending forms</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Consultation Review Modal */}
      {showConsultationModal && selectedConsultation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center z-50">
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            <InitialConsultationNotes
              patient={selectedConsultation.patient}
              consultationData={selectedConsultation}
              consultationId={selectedConsultation.id}
              readOnly={selectedConsultation.status === 'reviewed' || selectedConsultation.status === 'archived'}
              onClose={handleCloseConsultationModal}
              updateStatusMutation={updateStatusMutation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
