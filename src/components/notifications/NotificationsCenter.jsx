import React, { useEffect } from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationsContext';
import { 
  Bell, X, CheckCircle, AlertTriangle, Info, Calendar, 
  FileText, Pill, CreditCard, Settings, ChevronRight, 
  CheckCheck, Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  if (read) return 'bg-gray-50';
  
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
      className={`p-4 ${getNotificationBgColor(type, read)} border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-100`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getNotificationIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className={`text-sm font-medium ${read ? 'text-gray-600' : 'text-gray-900'}`}>
              {title}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              {!read && (
                <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
              )}
            </div>
          </div>
          <p className={`text-sm mt-1 ${read ? 'text-gray-500' : 'text-gray-700'}`}>
            {message}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </p>
            {actionText && (
              <button 
                className="text-xs font-medium text-accent3 hover:text-accent3/80 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!read) onMarkAsRead(id);
                  window.location.href = actionUrl;
                }}
              >
                {actionText}
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </button>
            )}
          </div>
        </div>
        <button 
          className="ml-2 text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyNotifications = () => (
  <div className="py-12 text-center">
    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 font-medium">No notifications</p>
    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
  </div>
);

// Main NotificationsCenter component
const NotificationsCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    isOpen, 
    toggleNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    closeNotifications
  } = useNotifications();

  // Close notifications panel when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeNotifications();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeNotifications]);

  return (
    <>
      {/* Notification Bell Button */}
      <button 
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={toggleNotifications}
        aria-label="Toggle notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={closeNotifications}></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-md notifications-panel">
              <div className="h-full flex flex-col bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button 
                          className="text-xs text-accent3 hover:text-accent3/80 flex items-center"
                          onClick={markAllAsRead}
                        >
                          <CheckCheck className="h-3 w-3 mr-1" /> Mark all as read
                        </button>
                      )}
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={closeNotifications}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex mt-1 text-sm">
                    <span className="text-gray-500">
                      {unreadCount === 0 
                        ? 'You have no unread notifications' 
                        : `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>
                
                {/* Notification List */}
                <div className="flex-1 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {notifications.map(notification => (
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
                
                {/* Footer */}
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Updated just now
                    </span>
                    <button 
                      className="text-xs text-accent3 hover:text-accent3/80"
                      onClick={() => window.location.href = '/notifications'}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsCenter;
