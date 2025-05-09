import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  FORM: 'form',
  APPOINTMENT: 'appointment',
  MEDICATION: 'medication',
  BILLING: 'billing',
  SYSTEM: 'system'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false
};

// Action types
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const MARK_AS_READ = 'MARK_AS_READ';
const MARK_ALL_AS_READ = 'MARK_ALL_AS_READ';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const TOGGLE_NOTIFICATIONS = 'TOGGLE_NOTIFICATIONS';
const CLOSE_NOTIFICATIONS = 'CLOSE_NOTIFICATIONS';

// Reducer function
function notificationsReducer(state, action) {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification.id === action.payload 
            ? { ...notification, read: true } 
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      };
    case REMOVE_NOTIFICATION:
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: notificationToRemove && !notificationToRemove.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };
    case TOGGLE_NOTIFICATIONS:
      return {
        ...state,
        isOpen: !state.isOpen
      };
    case CLOSE_NOTIFICATIONS:
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}

// Create context
const NotificationsContext = createContext();

// Provider component
export function NotificationsProvider({ children }) {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  // Add a notification
  const addNotification = (notification) => {
    const id = Date.now().toString();
    dispatch({
      type: ADD_NOTIFICATION,
      payload: {
        id,
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      }
    });
    return id;
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    dispatch({ type: MARK_AS_READ, payload: id });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    dispatch({ type: MARK_ALL_AS_READ });
  };

  // Remove a notification
  const removeNotification = (id) => {
    dispatch({ type: REMOVE_NOTIFICATION, payload: id });
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    dispatch({ type: TOGGLE_NOTIFICATIONS });
  };

  // Close notifications panel
  const closeNotifications = () => {
    dispatch({ type: CLOSE_NOTIFICATIONS });
  };

  // Auto-close notifications panel when clicking outside
  useEffect(() => {
    if (!state.isOpen) return;

    const handleClickOutside = (event) => {
      // Check if the click is outside the notifications panel
      if (event.target.closest('.notifications-panel') === null) {
        closeNotifications();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state.isOpen]);

  // Value to be provided to consumers
  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isOpen: state.isOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    toggleNotifications,
    closeNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Custom hook for using the notifications context
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
