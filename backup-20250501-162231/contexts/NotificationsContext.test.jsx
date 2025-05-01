import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationsProvider, useNotifications, NOTIFICATION_TYPES } from './NotificationsContext';

// Helper component to access context in tests
function TestComponent() {
  const {
    notifications,
    unreadCount,
    isOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    toggleNotifications,
    closeNotifications
  } = useNotifications();

  return (
    <div>
      <div data-testid="notifications">
        {JSON.stringify(notifications)}
      </div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="is-open">{isOpen.toString()}</div>
      
      <button data-testid="add-info" onClick={() => 
        addNotification({ 
          type: NOTIFICATION_TYPES.INFO, 
          title: 'Info Notification', 
          message: 'This is an info message' 
        })}>
        Add Info
      </button>
      
      <button data-testid="add-error" onClick={() => 
        addNotification({ 
          type: NOTIFICATION_TYPES.ERROR, 
          title: 'Error Notification', 
          message: 'This is an error message' 
        })}>
        Add Error
      </button>
      
      <button data-testid="mark-read" onClick={() => {
        if (notifications.length > 0) {
          markAsRead(notifications[0].id);
        }
      }}>
        Mark First As Read
      </button>
      
      <button data-testid="mark-all-read" onClick={markAllAsRead}>
        Mark All As Read
      </button>
      
      <button data-testid="remove" onClick={() => {
        if (notifications.length > 0) {
          removeNotification(notifications[0].id);
        }
      }}>
        Remove First
      </button>
      
      <button data-testid="toggle" onClick={toggleNotifications}>
        Toggle Panel
      </button>
      
      <button data-testid="close" onClick={closeNotifications}>
        Close Panel
      </button>
      
      <div className="notifications-panel">
        <span>Notifications Panel</span>
      </div>
    </div>
  );
}

// Wrap our test component with the provider
function renderWithProvider() {
  return render(
    <NotificationsProvider>
      <TestComponent />
    </NotificationsProvider>
  );
}

describe('NotificationsContext', () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = '';
    
    // Mock Date.now() for consistent IDs
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567890);
    
    // Mock new Date().toISOString() for consistent timestamps
    const mockDate = new Date('2025-04-27T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('provides initial state', () => {
    renderWithProvider();
    
    expect(screen.getByTestId('notifications')).toHaveTextContent('[]');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  test('adds a notification with the correct structure', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByTestId('add-info'));
    
    const notifications = JSON.parse(screen.getByTestId('notifications').textContent);
    
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      id: '1234567890',
      type: NOTIFICATION_TYPES.INFO,
      title: 'Info Notification',
      message: 'This is an info message',
      read: false,
      timestamp: '2025-04-27T12:00:00.000Z'
    });
    
    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
  });

  test('adds multiple notifications in correct order (newest first)', () => {
    renderWithProvider();
    
    // Add first notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // Add second notification
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567891);
    fireEvent.click(screen.getByTestId('add-error'));
    
    const notifications = JSON.parse(screen.getByTestId('notifications').textContent);
    
    expect(notifications).toHaveLength(2);
    expect(notifications[0].id).toBe('1234567891'); // Latest notification should be first
    expect(notifications[0].type).toBe(NOTIFICATION_TYPES.ERROR);
    expect(notifications[1].id).toBe('1234567890');
    expect(notifications[1].type).toBe(NOTIFICATION_TYPES.INFO);
    
    expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
  });

  test('marks a notification as read', () => {
    renderWithProvider();
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // Mark it as read
    fireEvent.click(screen.getByTestId('mark-read'));
    
    const notifications = JSON.parse(screen.getByTestId('notifications').textContent);
    
    expect(notifications[0].read).toBe(true);
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });

  test('marks all notifications as read', () => {
    renderWithProvider();
    
    // Add multiple notifications
    fireEvent.click(screen.getByTestId('add-info'));
    
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567891);
    fireEvent.click(screen.getByTestId('add-error'));
    
    // Mark all as read
    fireEvent.click(screen.getByTestId('mark-all-read'));
    
    const notifications = JSON.parse(screen.getByTestId('notifications').textContent);
    
    expect(notifications[0].read).toBe(true);
    expect(notifications[1].read).toBe(true);
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });

  test('removes a notification', () => {
    renderWithProvider();
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // Remove it
    fireEvent.click(screen.getByTestId('remove'));
    
    expect(screen.getByTestId('notifications')).toHaveTextContent('[]');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });

  test('handles removing an unread notification correctly', () => {
    renderWithProvider();
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // Remove it
    fireEvent.click(screen.getByTestId('remove'));
    
    expect(screen.getByTestId('notifications')).toHaveTextContent('[]');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });

  test('handles removing a read notification correctly', () => {
    renderWithProvider();
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // Mark it as read
    fireEvent.click(screen.getByTestId('mark-read'));
    
    // Remove it
    fireEvent.click(screen.getByTestId('remove'));
    
    expect(screen.getByTestId('notifications')).toHaveTextContent('[]');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0'); // Should remain 0
  });

  test('toggles notifications panel', () => {
    renderWithProvider();
    
    // Panel starts closed
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    
    // Toggle open
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    
    // Toggle closed
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  test('closes notifications panel', () => {
    renderWithProvider();
    
    // Open panel
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    
    // Close panel
    fireEvent.click(screen.getByTestId('close'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  test('closes panel when clicking outside', () => {
    renderWithProvider();
    
    // Open panel
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    
    // Click outside the panel
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });
      document.body.dispatchEvent(event);
    });
    
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  test('keeps panel open when clicking inside', () => {
    renderWithProvider();
    
    // Open panel
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    
    // Click inside the panel
    act(() => {
      const panelElement = document.querySelector('.notifications-panel');
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });
      panelElement.dispatchEvent(event);
    });
    
    // Panel should still be open
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });

  test('throws error when hook is used outside provider', () => {
    // Silence error output from React
    const originalError = console.error;
    console.error = jest.fn();
    
    // Try to render test component without provider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNotifications must be used within a NotificationsProvider');
    
    console.error = originalError;
  });

  test('supports all notification types', () => {
    renderWithProvider();
    
    // Test each notification type
    Object.values(NOTIFICATION_TYPES).forEach((type, index) => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1234567890 + index);
      
      act(() => {
        // Directly call addNotification with the context helper
        const { addNotification } = screen.getByTestId('add-info').onclick();
        addNotification({ 
          type, 
          title: `${type} notification`, 
          message: `This is a ${type} message` 
        });
      });
    });
    
    const notifications = JSON.parse(screen.getByTestId('notifications').textContent);
    
    // Check if all notification types were added
    expect(notifications.length).toBe(Object.values(NOTIFICATION_TYPES).length);
    
    // Check if types are correct (in reverse order because newest is first)
    Object.values(NOTIFICATION_TYPES).reverse().forEach((type, index) => {
      expect(notifications[index].type).toBe(type);
    });
  });
});