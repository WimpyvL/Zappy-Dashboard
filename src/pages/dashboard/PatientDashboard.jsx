import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../../apis/patients/hooks';
import { useSessions } from '../../apis/sessions/hooks';
import { useOrders } from '../../apis/orders/hooks';
import { useTasks } from '../../apis/tasks/hooks';
import { useForms } from '../../apis/forms/hooks';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

// Simple status badge for tasks
const TaskStatusBadge = ({ status }) => {
  if (status === 'completed') {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        Completed
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        Pending
      </span>
    );
  }
  return null;
};

// Custom hook to load all dashboard data efficiently in parallel
const useDashboardData = () => {
  // Use individual hooks at the top level, not inside queryFn functions
  const patientsQuery = usePatients();
  const sessionsQuery = useSessions();
  const ordersQuery = useOrders();
  const tasksQuery = useTasks(1, { status: 'Pending' }, {}, 10);
  const formsQuery = useForms();

  // Extract data from query results
  const patients = patientsQuery.data?.data || patientsQuery.data || [];
  const sessions = sessionsQuery.data?.data || sessionsQuery.data || [];
  const orders = ordersQuery.data?.data || ordersQuery.data || [];
  const pendingTasks = tasksQuery.data?.data || [];
  const forms = formsQuery.data?.data || formsQuery.data || [];

  // Check if any query is still loading
  const isLoading = [
    patientsQuery.isLoading,
    sessionsQuery.isLoading,
    ordersQuery.isLoading,
    tasksQuery.isLoading,
    formsQuery.isLoading,
  ].some(Boolean);

  // Collect all errors
  const errors = [
    patientsQuery.error,
    sessionsQuery.error,
    ordersQuery.error,
    tasksQuery.error,
    formsQuery.error,
  ].filter(Boolean);

  const hasError = errors.length > 0;

  // Return organized data with loading/error states
  return {
    patients,
    sessions,
    orders,
    pendingTasks,
    forms,
    isLoading,
    hasError,
    errors,
  };
};

const PatientDashboard = () => {
  // Use our optimized custom hook to fetch all data in parallel
  const {
    patients,
    sessions,
    orders,
    pendingTasks,
    forms,
    isLoading,
    hasError,
    errors,
  } = useDashboardData();

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

  // Get the current date - for comparison only
  const currentDate = new Date();
  const todayFormatted = getFormattedDate(currentDate);

  const todaySessions = sessions.filter(s => {
    // Check for valid scheduledDate
    if (!s.scheduledDate) return false;

    // Convert and format the session date
    const sessionDate = new Date(s.scheduledDate);
    const sessionFormatted = getFormattedDate(sessionDate);

    // Consider status and date - ignore time portion for more reliable comparison
    return s.status === 'scheduled' && sessionFormatted === todayFormatted;
  });

  // Handle error state
  if (hasError) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading dashboard data.</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container relative overflow-hidden pb-10">

      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
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

        <Link to="/tasks" className="block">
          {/* Use accent4 color */}
          <div className="bg-white rounded-lg shadow p-6 h-full hover:shadow-md transition-shadow border-t-4 border-accent4">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-accent4 mr-2" />
              <h3 className="text-gray-700 text-sm font-medium">Tasks</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{pendingTasks.length}</p>
            <div className="mt-2 text-accent4 text-sm">
              {pendingTasks.length > 0
                ? `${pendingTasks.length} pending tasks`
                : 'No pending tasks'}
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
            <Link
              to="/consultations"
              className="text-sm text-accent1 hover:text-accent1/80"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {/* Placeholder for consultations list */}
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No pending consultations</p>
            </div>
          </div>
        </div>

        {/* Pending Forms Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-accent2/5">
            <h2 className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 text-accent2 mr-2" />
              Pending Forms
            </h2>
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

export default PatientDashboard;
