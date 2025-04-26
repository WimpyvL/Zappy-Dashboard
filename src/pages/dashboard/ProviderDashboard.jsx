import React from 'react';
import { usePatients } from '../../apis/patients/hooks'; // Assuming this path is correct
import { useSessions } from '../../apis/sessions/hooks'; // Assuming this hook exists and path is correct
import { useOrders } from '../../apis/orders/hooks'; // Assuming this hook exists and path is correct
import { useConsultations } from '../../apis/consultations/hooks'; // Add this import
import { useTasks } from '../../apis/tasks/hooks';
import { useForms } from '../../apis/forms/hooks';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  Check,
  AlertTriangle,
  Loader2, // Added for loading state
  Users,
  Package,
  MessageSquare,
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element

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
  // Fetch data using React Query hooks
  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    error: errorPatients,
  } = usePatients(); // Assuming usePatients fetches all needed patients for the count
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useSessions(); // Assuming useSessions fetches all needed sessions
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
  } = useOrders(); // Assuming useOrders fetches all needed orders
  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: errorConsultations,
  } = useConsultations({}, 10); // Fetch first 10 consultations
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: errorTasks,
  } = useTasks(1, { status: 'Pending' }, {}, 10); // Fetch first 10 pending tasks
  const {
    data: formsData,
    isLoading: isLoadingForms,
    error: errorForms,
  } = useForms(); // Fetch all forms (questionnaires) as a placeholder
  const forms = formsData?.data || [];

  // Use fetched data or default empty arrays
  // Note: Adjust based on the actual structure returned by usePatients, useSessions, useOrders
  const patients = patientsData?.data || patientsData || []; // Adapt based on API response structure
  const sessions = sessionsData?.data || sessionsData || []; // Adapt based on API response structure
  const orders = ordersData?.data || ordersData || []; // Adapt based on API response structure
  const consultations = consultationsData?.data || [];
  const pendingTasks = tasksData?.data || [];

  // Get pending consultations
  const pendingConsultations = consultations.filter(
    (c) => c.status === 'pending' || c.status === 'needs_more_info'
  );

  // Calculate statistics
  const scheduledSessions = sessions.filter(
    (s) => s.status === 'scheduled'
  ).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  // Get today's sessions
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) =>
      new Date(s.scheduledDate).toDateString() === today &&
      s.status === 'scheduled'
  );

  // Handle loading state
  if (isLoadingPatients || isLoadingSessions || isLoadingOrders || isLoadingConsultations || isLoadingTasks || isLoadingForms) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* Use primary color for spinner */}
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

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
        <p className="text-sm font-handwritten text-accent3 mt-1">Supporting your patients' health journey</p>
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
            {/* Use accent3 color for link */}
            <Link
              to="/sessions"
              className="text-sm text-accent3 hover:text-accent3/80"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
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
                      {/* Use primary color for button */}
                      <Link
                        to={`/consultations/${consultation.id}`}
                        className="ml-4 px-3 py-1 border border-primary text-primary text-sm rounded hover:bg-primary/5"
                      >
                        Review
                      </Link>
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
    </div>
  );
};

export default ProviderDashboard;
