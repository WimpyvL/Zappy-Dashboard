import React, { useState, useEffect } from 'react';
import { Bell, Check, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { getPatientNotifications, markNotificationAsRead } from '../../../services/notificationService';
import { toast } from 'react-toastify';

/**
 * Patient Notifications Component
 * 
 * Displays notifications for the patient in the portal.
 * Shows unread notifications with the ability to mark them as read.
 */
const PatientNotifications = ({ patientId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  
  // Fetch notifications on mount and when patientId changes
  useEffect(() => {
    if (!patientId) return;
    
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getPatientNotifications(patientId);
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [patientId]);
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_note':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'email':
        return <Mail className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Filter notifications based on showAll flag
  const filteredNotifications = showAll 
    ? notifications 
    : notifications.filter(notification => !notification.is_read);
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.is_read).length;
  
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAll ? 'Show Unread' : 'Show All'}
        </button>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {showAll ? 'No notifications' : 'No unread notifications'}
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                    <span>
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* If this is a consultation note notification, add a view button */}
              {notification.reference_type === 'consultation_note' && (
                <div className="mt-3 flex justify-end">
                  <button
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                    onClick={() => {
                      // Navigate to consultation note
                      // This would typically use a router, but we'll just log for now
                      console.log(`Navigate to consultation note: ${notification.reference_id}`);
                      
                      // Mark as read if not already
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    View Note
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
          <button
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => {
              // Mark all as read
              const unreadNotifications = notifications.filter(n => !n.is_read);
              
              if (unreadNotifications.length === 0) {
                toast.info('No unread notifications');
                return;
              }
              
              Promise.all(
                unreadNotifications.map(n => markNotificationAsRead(n.id))
              )
                .then(() => {
                  setNotifications(prev => 
                    prev.map(notification => ({ 
                      ...notification, 
                      is_read: true,
                      read_at: new Date().toISOString()
                    }))
                  );
                  toast.success(`Marked ${unreadNotifications.length} notifications as read`);
                })
                .catch(err => {
                  console.error('Error marking all as read:', err);
                  toast.error('Failed to mark all notifications as read');
                });
            }}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientNotifications;
