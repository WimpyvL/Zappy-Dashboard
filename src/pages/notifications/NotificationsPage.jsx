import React, { useState, useEffect } from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationsContext';
import { 
  Bell, CheckCircle, AlertTriangle, Info, Calendar, 
  FileText, Pill, CreditCard, Settings, ChevronRight, 
  Trash2, Filter, Clock, CheckCheck, X
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';
import { formatDistanceToNow, format } from 'date-fns';

// Helper function to get icon based on notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case NOTIFICATION_TYPES.WARNING:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case NOTIFICATION_TYPES.ERROR:
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case NOTIFICATION_TYPES.FORM:
      return <FileText className="h-5 w-5 text-accent1" />;
    case NOTIFICATION_TYPES.APPOINTMENT:
      return <Calendar className="h-5 w-5 text-accent3" />;
    case NOTIFICATION_TYPES.MEDICATION:
      return <Pill className="h-5 w-5 text-primary" />;
    case NOTIFICATION_TYPES.BILLING:
      return <CreditCard className="h-5 w-5 text-accent4" />;
    case NOTIFICATION_TYPES.SYSTEM:
      return <Settings className="h-5 w-5 text-gray-500" />;
    case NOTIFICATION_TYPES.INFO:
    default:
      return <Info className="h-5 w-5 text-accent2" />;
  }
};

// Helper function to get background color based on notification type
const getNotificationBgColor = (type, read) => {
  if (read) return 'bg-white';
  
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'bg-green-50';
    case NOTIFICATION_TYPES.WARNING:
      return 'bg-yellow-50';
    case NOTIFICATION_TYPES.ERROR:
      return 'bg-red-50';
    case NOTIFICATION_TYPES.FORM:
      return 'bg-accent1/5';
    case NOTIFICATION_TYPES.APPOINTMENT:
      return 'bg-accent3/5';
    case NOTIFICATION_TYPES.MEDICATION:
      return 'bg-primary/5';
    case NOTIFICATION_TYPES.BILLING:
      return 'bg-accent4/5';
    case NOTIFICATION_TYPES.SYSTEM:
      return 'bg-gray-100';
    case NOTIFICATION_TYPES.INFO:
    default:
      return 'bg-accent2/5';
  }
};

// Helper function to get human-readable type name
const getTypeName = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'Success';
    case NOTIFICATION_TYPES.WARNING:
      return 'Warning';
    case NOTIFICATION_TYPES.ERROR:
      return 'Error';
    case NOTIFICATION_TYPES.FORM:
      return 'Form';
    case NOTIFICATION_TYPES.APPOINTMENT:
      return 'Appointment';
    case NOTIFICATION_TYPES.MEDICATION:
      return 'Medication';
    case NOTIFICATION_TYPES.BILLING:
      return 'Billing';
    case NOTIFICATION_TYPES.SYSTEM:
      return 'System';
    case NOTIFICATION_TYPES.INFO:
      return 'Information';
    default:
      return 'Notification';
  }
};

// Individual notification item component
const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  const { id, title, message, type, timestamp, read, actionUrl, actionText } = notification;
  
  const handleClick = () => {
    if (!read) {
      onMarkAsRead(id);
    }
    
    // If there's an action URL, navigate to it
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };
  
  return (
    <div 
      className={`p-5 ${getNotificationBgColor(type, read)} border border-gray-200 rounded-lg mb-3 transition-colors hover:bg-gray-50`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getNotificationIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${read ? 'text-gray-600' : 'text-gray-900'}`}>
                {title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {getTypeName(type)} • {format(new Date(timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              {!read && (
                <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
              )}
              <div className="flex space-x-1">
                {!read && (
                  <button 
                    className="p-1 text-gray-400 hover:text-accent3 rounded-full hover:bg-gray-100"
                    onClick={() => onMarkAsRead(id)}
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button 
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                  onClick={() => onRemove(id)}
                  title="Remove notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <p className={`text-sm mt-2 ${read ? 'text-gray-500' : 'text-gray-700'}`}>
            {message}
          </p>
          {actionText && actionUrl && (
            <div className="mt-3">
              <a 
                href={actionUrl}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-accent3 text-white hover:bg-accent3/90"
                onClick={(e) => {
                  e.preventDefault();
                  if (!read) onMarkAsRead(id);
                  window.location.href = actionUrl;
                }}
              >
                {actionText}
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyNotifications = () => (
  <div className="py-12 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-700 font-medium">No notifications</p>
    <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
  </div>
);

// Demo notification generator
const NotificationDemo = ({ onAddNotification }) => {
  const [title, setTitle] = useState('New notification');
  const [message, setMessage] = useState('This is a sample notification message.');
  const [type, setType] = useState(NOTIFICATION_TYPES.INFO);
  const [actionText, setActionText] = useState('');
  const [actionUrl, setActionUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddNotification({
      title,
      message,
      type,
      actionText: actionText || undefined,
      actionUrl: actionUrl || undefined
    });
    
    // Reset form
    setTitle('New notification');
    setMessage('This is a sample notification message.');
    setType(NOTIFICATION_TYPES.INFO);
    setActionText('');
    setActionUrl('');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Test Notification System</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
            >
              {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {getTypeName(value)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="actionText" className="block text-sm font-medium text-gray-700 mb-1">
                Action Text (Optional)
              </label>
              <input
                id="actionText"
                type="text"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="e.g., View Details"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
              />
            </div>
            <div>
              <label htmlFor="actionUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Action URL (Optional)
              </label>
              <input
                id="actionUrl"
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g., /forms"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-accent3 text-white rounded-md hover:bg-accent3/90"
            >
              Send Test Notification
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Filter component
const NotificationFilter = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex items-center mb-3">
        <Filter className="h-4 w-4 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Filter Notifications</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1.5 text-xs font-medium rounded-full ${
            activeFilter === 'all' ? 'bg-accent3 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onFilterChange('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-medium rounded-full ${
            activeFilter === 'unread' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onFilterChange('unread')}
        >
          Unread
        </button>
        {Object.values(NOTIFICATION_TYPES).map(type => (
          <button
            key={type}
            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
              activeFilter === type 
                ? 'bg-accent2 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onFilterChange(type)}
          >
            <span className="mr-1">{getNotificationIcon(type)}</span>
            {getTypeName(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main NotificationsPage component
const NotificationsPage = () => {
  const { 
    notifications, 
    unreadCount, 
    addNotification,
    markAsRead, 
    markAllAsRead, 
    removeNotification
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  // Add some demo notifications on first load if there are none
  useEffect(() => {
    if (notifications.length === 0) {
      // Add some demo notifications
      addNotification({
        title: 'Welcome to Zappy Health',
        message: 'Thank you for joining our platform. We\'re excited to help you on your healthcare journey.',
        type: NOTIFICATION_TYPES.SUCCESS,
        actionText: 'Explore Dashboard',
        actionUrl: '/dashboard'
      });
      
      setTimeout(() => {
        addNotification({
          title: 'Complete Your Health Profile',
          message: 'Please take a moment to fill out your health profile to help us provide better care.',
          type: NOTIFICATION_TYPES.FORM,
          actionText: 'Start Now',
          actionUrl: '/forms'
        });
      }, 500);
      
      setTimeout(() => {
        addNotification({
          title: 'Upcoming Appointment',
          message: 'You have a follow-up appointment scheduled for tomorrow at 10:00 AM with Dr. Sharma.',
          type: NOTIFICATION_TYPES.APPOINTMENT,
          actionText: 'View Details',
          actionUrl: '/appointments'
        });
      }, 1000);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="watercolor" color="accent1" position="top-right" size={180} rotation={-10} />
      <ChildishDrawingElement type="doodle" color="accent4" position="bottom-left" size={150} rotation={15} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm font-handwritten text-accent3 mt-1">Stay updated on your healthcare journey</p>
      </div>
      
      {/* Demo section */}
      <NotificationDemo onAddNotification={addNotification} />
      
      {/* Filter and actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <NotificationFilter activeFilter={filter} onFilterChange={setFilter} />
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button 
              className="px-4 py-2 bg-accent3 text-white text-sm font-medium rounded-md hover:bg-accent3/90 flex items-center"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" /> Mark All as Read
            </button>
          )}
        </div>
      </div>
      
      {/* Notifications list */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Bell className="h-5 w-5 mr-2 text-accent2" />
            {filter === 'all' ? 'All Notifications' : 
             filter === 'unread' ? 'Unread Notifications' : 
             `${getTypeName(filter)} Notifications`}
            {filter === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
          </p>
        </div>
        
        {filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            ))}
          </div>
        ) : (
          <EmptyNotifications />
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
