import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  Check,
  AlertTriangle
} from 'lucide-react';

// Simple status badge for consultations
const ConsultationStatusBadge = ({ status }) => {
  if (status === 'approved') {
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
  } else if (status === 'pending') {
    return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Pending</span>;
  } else if (status === 'rejected') {
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
  } else if (status === 'needs_more_info') {
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Needs Info</span>;
  }
  return null;
};

const Dashboard = () => {
  console.log("Dashboard component rendering!");
  const context = useAppContext();

  // Use default empty arrays if context is not available
  const patients = context?.patients || [];
  const sessions = context?.sessions || [];
  const orders = context?.orders || [];

  // Placeholder for consultations data - in real app, get from context
  const consultations = [
    {
      id: 'c1',
      patientName: 'John Smith',
      patientId: 'p001',
      dateSubmitted: '2025-02-25',
      status: 'pending',
      provider: 'Dr. Sarah Johnson',
      category: 'medication'
    },
    {
      id: 'c2',
      patientName: 'Emily Davis',
      patientId: 'p002',
      dateSubmitted: '2025-02-23',
      status: 'approved',
      provider: 'Dr. Michael Chen',
      category: 'medication'
    },
    {
      id: 'c3',
      patientName: 'Robert Wilson',
      patientId: 'p003',
      dateSubmitted: '2025-02-21',
      status: 'needs_more_info',
      provider: 'Dr. Lisa Wong',
      category: 'service'
    }
  ];

  // Get pending consultations
  const pendingConsultations = consultations.filter(c => c.status === 'pending' || c.status === 'needs_more_info');

  // Calculate statistics
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Get today's sessions
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s =>
    new Date(s.scheduledDate).toDateString() === today &&
    s.status === 'scheduled'
  );

  // Get pending tasks (this would come from a tasks collection in a real app)
  const pendingTasks = [
    { id: 1, title: "Review lab results for Jane Smith", priority: "high", dueDate: "2025-03-11" },
    { id: 2, title: "Complete prior authorization for Robert Johnson", priority: "medium", dueDate: "2025-03-12" },
    { id: 3, title: "Follow-up on prescription renewal", priority: "low", dueDate: "2025-03-15" }
  ];

  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>

      {/* Stats Cards */}
      <Link to="/patients"><div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
          <p className="text-3xl font-bold mt-2">{patients.length}</p>
          <div className="mt-2 text-green-600 text-sm">
            ↑ 12% from last month
          </div>
        </div>

        <Link to="/sessions"> <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Upcoming Sessions</h3>
          <p className="text-3xl font-bold mt-2">{scheduledSessions}</p>
          <div className="mt-2 text-gray-600 text-sm">
            {todaySessions.length > 0 ? `${todaySessions.length} sessions today` : 'No sessions today'}
          </div>
        </div></Link>

        <Link to="/orders"> <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
          <div className="mt-2 text-yellow-600 text-sm">
            {pendingOrders > 0 ? `${pendingOrders} awaiting approval` : 'No pending orders'}

          </div>
        </div></Link>

        <Link to="/consultations" className=""><div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">New Consultations</h3>
          <p className="text-3xl font-bold mt-2">{pendingConsultations.length}</p>
          <div className="mt-2 text-blue-600 text-sm">
            {pendingConsultations.length > 0 ? `${pendingConsultations.length} need review` : 'All caught up!'}
          </div>
        </div></Link>

      </div></Link>

      {/* Two column layout for Today's Sessions and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Sessions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Today's Sessions</h2>
            <Link to="/sessions" className="text-sm text-indigo-600 hover:text-indigo-900">View All</Link>
          </div>
          <div className="p-6">
            {todaySessions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {todaySessions.map(session => (
                  <li key={session.id} className="py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                        {session.patientName.charAt(0)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{session.patientName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{session.type}</p>
                      </div>
                      <button className="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Tasks</h2>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-900">+ Add Task</Link>
          </div>
          <div className="p-6">
            {pendingTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pendingTasks.map(task => (
                  <li key={task.id} className="py-4">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 rounded-full ${task.priority === 'high' ? 'bg-red-100' :
                        task.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        } flex items-center justify-center ${task.priority === 'high' ? 'text-red-500' :
                          task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                        <Clock className="h-3 w-3" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Initial Consultations</h2>
            <Link to="/consultations" className="text-sm text-indigo-600 hover:text-indigo-900">View All</Link>
          </div>
          <div className="p-6">
            {pendingConsultations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pendingConsultations.map(consultation => (
                  <li key={consultation.id} className="py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{consultation.patientName}</p>
                          <ConsultationStatusBadge status={consultation.status} />
                        </div>
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(consultation.dateSubmitted).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/consultations/${consultation.id}`}
                        className="ml-4 px-3 py-1 border border-indigo-500 text-indigo-500 text-sm rounded hover:bg-indigo-50"
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Pending Forms</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-900">Send Reminders</button>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              <li className="py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium">Monthly Questionnaire</p>
                    <p className="text-sm text-gray-500">Jane Smith - Due in 2 days</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    Remind
                  </button>
                </div>
              </li>
              <li className="py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium">ID Verification</p>
                    <p className="text-sm text-gray-500">Robert Johnson - Overdue</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    Remind
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;