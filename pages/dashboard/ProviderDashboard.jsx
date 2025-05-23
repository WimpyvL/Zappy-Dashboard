import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, CheckCircle, FileText, UserPlus, 
  Check, AlertTriangle, Loader2, Users, Package, 
  MessageSquare, RefreshCw 
} from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useSessionRefresh } from '../../hooks/useSessionRefresh';
import InitialConsultationNotes from '../consultations/InitialConsultationNotes';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Memoized components for better performance
const StatCard = React.memo(({ 
  title, 
  count, 
  icon: Icon, 
  color, 
  link, 
  subtitle 
}) => (
  <Link to={link} className="block">
    <div className={`bg-white rounded-lg shadow p-6 h-full hover:shadow-md transition-shadow border-t-4 border-${color}`}>
      <div className="flex items-center mb-2">
        <Icon className={`h-5 w-5 text-${color} mr-2`} />
        <h3 className="text-gray-700 text-sm font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold mt-2">{count}</p>
      {subtitle && (
        <div className={`mt-2 text-${color} text-sm`}>{subtitle}</div>
      )}
    </div>
  </Link>
));

StatCard.displayName = 'StatCard';

const SessionItem = React.memo(({ session, onJoin }) => (
  <li className="py-4">
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent3/10 flex items-center justify-center text-accent3">
        {session.patientName?.charAt(0) || '?'}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {session.patientName || 'Unknown Patient'}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(session.scheduledDate).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <p className="text-sm text-gray-500">{session.type}</p>
      </div>
      <button 
        onClick={() => onJoin(session)}
        className="ml-4 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
      >
        Join
      </button>
    </div>
  </li>
));

SessionItem.displayName = 'SessionItem';

const ConsultationItem = React.memo(({ consultation, onReview }) => (
  <li className="py-4">
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent1/10 flex items-center justify-center text-accent1">
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
      <button
        onClick={() => onReview(consultation)}
        className="ml-4 px-3 py-1 border border-primary text-primary text-sm rounded hover:bg-primary/5"
      >
        Review
      </button>
    </div>
  </li>
));

ConsultationItem.displayName = 'ConsultationItem';

const ConsultationStatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-blue-100 text-blue-800',
    needs_more_info: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  
  const labels = {
    pending: 'Pending',
    needs_more_info: 'Needs Info',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

const ProviderDashboard = () => {
  // State management
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  
  // Custom hooks
  const {
    patients,
    sessions,
    orders,
    consultations,
    pendingTasks,
    forms,
    isLoading,
    hasError,
    errors,
    refetch
  } = useDashboardData();
  
  const {
    isRefreshing,
    lastRefresh,
    refreshSessions
  } = useSessionRefresh(refetch.sessions);
  
  // Derived data
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const pendingConsultations = consultations.filter(
    c => c.status === 'pending' || c.status === 'needs_more_info'
  );
  
  // Get today's sessions
  const todaySessions = React.useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return sessions.filter(s => {
      if (!s.scheduledDate || s.status !== 'scheduled') return false;
      const sessionDate = new Date(s.scheduledDate).toISOString().split('T')[0];
      return sessionDate === todayStr;
    });
  }, [sessions]);
  
  // Handlers
  const handleJoinSession = useCallback((session) => {
    // TODO: Implement session join logic
    console.log('Joining session:', session);
  }, []);
  
  const handleReviewConsultation = useCallback((consultation) => {
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
  }, []);
  
  const handleCloseConsultationModal = useCallback(() => {
    setShowConsultationModal(false);
    setSelectedConsultation(null);
  }, []);
  
  // Error state
  if (hasError) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading dashboard data.</p>
        <button 
          onClick={() => refetch.all()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <ErrorBoundary>
      <div className="dashboard-container relative overflow-hidden pb-10">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Patients"
            count={patients.length}
            icon={Users}
            color="primary"
            link="/patients"
          />
          
          <StatCard
            title="Upcoming Sessions"
            count={scheduledSessions}
            icon={Calendar}
            color="accent3"
            link="/sessions"
            subtitle={todaySessions.length > 0 
              ? `${todaySessions.length} sessions today` 
              : 'No sessions today'}
          />
          
          <StatCard
            title="Pending Orders"
            count={pendingOrders}
            icon={Package}
            color="accent2"
            link="/orders"
            subtitle={pendingOrders > 0 
              ? `${pendingOrders} awaiting approval` 
              : 'No pending orders'}
          />
          
          <StatCard
            title="New Consultations"
            count={pendingConsultations.length}
            icon={MessageSquare}
            color="accent1"
            link="/consultations"
            subtitle={pendingConsultations.length > 0 
              ? `${pendingConsultations.length} need review` 
              : 'All caught up!'}
          />
        </div>
        
        {/* Two column layout */}
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
                  onClick={refreshSessions}
                  disabled={isRefreshing}
                  className="flex items-center text-accent3 hover:text-accent3/80 disabled:opacity-50"
                  title="Refresh sessions"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <Link to="/sessions" className="text-sm text-accent3 hover:text-accent3/80">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {lastRefresh && (
                <div className="text-xs text-gray-500 mb-2">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
              
              {todaySessions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {todaySessions.map(session => (
                    <SessionItem 
                      key={session.id} 
                      session={session} 
                      onJoin={handleJoinSession}
                    />
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
              <Link to="/tasks" className="text-sm text-accent4 hover:text-accent4/80">
                + Add Task
              </Link>
            </div>
            <div className="p-6">
              {pendingTasks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {pendingTasks.map(task => (
                    <li key={task.id} className="py-4">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100' : 
                          task.priority === 'medium' ? 'bg-yellow-100' : 
                          'bg-green-100'
                        } flex items-center justify-center ${
                          task.priority === 'high' ? 'text-red-500' : 
                          task.priority === 'medium' ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
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
        
        {/* Initial Consultations and Pending Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Initial Consultations */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-accent1/5">
              <h2 className="text-lg font-medium flex items-center">
                <UserPlus className="h-5 w-5 text-accent1 mr-2" />
                Initial Consultations
              </h2>
              <Link to="/consultations" className="text-sm text-accent1 hover:text-accent1/80">
                View All
              </Link>
            </div>
            <div className="p-6">
              {pendingConsultations.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {pendingConsultations.map(consultation => (
                    <ConsultationItem
                      key={consultation.id}
                      consultation={consultation}
                      onReview={handleReviewConsultation}
                    />
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
          
          {/* Pending Forms */}
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
                  {forms.map(form => (
                    <li key={form.id} className="py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent2/10 flex items-center justify-center text-accent2">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium">{form.title}</p>
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
                readOnly={
                  selectedConsultation.status === 'reviewed' || 
                  selectedConsultation.status === 'archived'
                }
                onClose={handleCloseConsultationModal}
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProviderDashboard;
