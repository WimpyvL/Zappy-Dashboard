import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabaseHelper } from '../lib/supabase';

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

  // Fetch initial notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const fetchOptions = {
        select: '*',
        order: { column: 'created_at', ascending: false },
      };
      // Assuming notifications are user-specific, you might need to filter by user_id
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   fetchOptions.filters = [{ column: 'user_id', operator: 'eq', value: user.id }];
      // }

      const { data, error } = await supabaseHelper.fetch('notifications', fetchOptions);

      if (error) {
        console.error('Error fetching initial notifications:', error);
        // Handle error appropriately, maybe show a toast
      } else {
        // Dispatch action to set initial notifications in state
        // Need a new action type for setting initial state
        // For now, we'll just add them one by one (less efficient but works with existing reducer)
        data?.forEach(notification => {
            // Need to adjust payload structure if DB columns differ from state structure
            dispatch({
                type: ADD_NOTIFICATION,
                payload: {
                    id: notification.id,
                    title: notification.type, // Assuming type can be used as title
                    message: notification.message,
                    type: notification.type,
                    timestamp: notification.created_at,
                    read: notification.read_status, // Assuming read_status column
                    actionUrl: notification.action_url, // Assuming action_url column
                    actionText: notification.action_text, // Assuming action_text column
                }
            });
        });
      }
    };

    fetchNotifications();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabaseHelper.subscribe('notifications', (payload) => {
      console.log('Notification change received:', payload);
      // Handle different event types (INSERT, UPDATE, DELETE)
      if (payload.eventType === 'INSERT') {
        // Add the new notification to state
         dispatch({
             type: ADD_NOTIFICATION,
             payload: {
                 id: payload.new.id,
                 title: payload.new.type, // Assuming type can be used as title
                 message: payload.new.message,
                 type: payload.new.type,
                 timestamp: payload.new.created_at,
                 read: payload.new.read_status, // Assuming read_status column
                 actionUrl: payload.new.action_url, // Assuming action_url column
                 actionText: payload.new.action_text, // Assuming action_text column
             }
         });
      } else if (payload.eventType === 'UPDATE') {
        // Update existing notification in state (e.g., read status changed)
        // Need a new action type for updating a notification
        // For now, we'll just invalidate and refetch (less efficient but simpler)
        // dispatch({ type: UPDATE_NOTIFICATION, payload: payload.new });
        console.warn("Real-time update for notifications received. Consider implementing UPDATE_NOTIFICATION action.");
        // Invalidate or refetch if needed
        // fetchNotifications(); // This would refetch all, not ideal
      } else if (payload.eventType === 'DELETE') {
        // Remove notification from state
        dispatch({ type: REMOVE_NOTIFICATION, payload: payload.old.id });
      }
    });

    // Cleanup the subscription on component unmount
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // Add a notification (this function might be less needed if notifications come from DB)
  const addNotification = async (notification) => {
    // Insert the new notification into the database
    const dataToInsert = {
        // Assuming user_id is required and available (e.g., from auth context)
        // user_id: supabase.auth.user()?.id, 
        type: notification.type,
        message: notification.message,
        read_status: false, // Default to unread
        action_url: notification.actionUrl,
        action_text: notification.actionText,
        // created_at and id will be generated by the database
    };
    const { data, error } = await supabaseHelper.insert('notifications', dataToInsert, { returning: 'representation' });

    if (error) {
        console.error('Error adding notification to DB:', error);
        // Handle error, maybe show a toast
        return null;
    }
    // The real-time subscription will add this to the state, so no need to dispatch here
    return data ? data[0].id : null; // Return the new notification ID
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    // Update the read_status in the database
    const { data, error } = await supabaseHelper.update('notifications', id, { read_status: true, updated_at: new Date().toISOString() });

    if (error) {
        console.error(`Error marking notification ${id} as read in DB:`, error);
        // Handle error
    } else {
        // Update state only after successful DB update (optional, real-time might handle this)
        dispatch({ type: MARK_AS_READ, payload: id });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Update all unread notifications for the current user in the database
    // Assuming notifications are user-specific and you have the user ID
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user) {
        const { data, error } = await supabaseHelper.update('notifications', null, { read_status: true, updated_at: new Date().toISOString() }, {
            filters: [
                // { column: 'user_id', operator: 'eq', value: user.id }, // Filter by user
                { column: 'read_status', operator: 'eq', value: false } // Filter by unread
            ]
        });

        if (error) {
            console.error('Error marking all notifications as read in DB:', error);
            // Handle error
        } else {
            // Update state only after successful DB update (optional, real-time might handle this)
            dispatch({ type: MARK_ALL_AS_READ });
        }
    // }
  };

  // Remove a notification
  const removeNotification = async (id) => {
    // Delete the notification from the database
    const { data, error } = await supabaseHelper.delete('notifications', id);

    if (error) {
        console.error(`Error removing notification ${id} from DB:`, error);
        // Handle error
    } else {
        // Remove from state only after successful DB delete (optional, real-time might handle this)
        dispatch({ type: REMOVE_NOTIFICATION, payload: id });
    }
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
    addNotification, // This now adds to DB
    markAsRead, // This now updates DB
    markAllAsRead, // This now updates DB
    removeNotification, // This now deletes from DB
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
