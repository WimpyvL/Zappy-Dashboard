import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsCenter from './NotificationsCenter';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';

// Mock dependencies
jest.mock('../../contexts/NotificationsContext');
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn().mockReturnValue('5 minutes ago'),
}));

describe('NotificationsCenter Component', () => {
  // Mock notification data
  const mockNotifications = [
    {
      id: '1',
      title: 'Appointment Reminder',
      message: 'You have an appointment with Dr. Smith tomorrow at 10am',
      type: NOTIFICATION_TYPES.APPOINTMENT,
      timestamp: '2025-04-26T10:00:00.000Z',
      read: false,
      actionUrl: '/appointments/123',
      actionText: 'View appointment',
    },
    {
      id: '2',
      title: 'Form Completed',
      message: 'Patient intake form has been submitted',
      type: NOTIFICATION_TYPES.FORM,
      timestamp: '2025-04-25T15:30:00.000Z',
      read: true,
      actionUrl: '/forms/456',
      actionText: 'View form',
    },
  ];

  // Mock notification context functions
  const mockToggleNotifications = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockMarkAllAsRead = jest.fn();
  const mockRemoveNotification = jest.fn();
  const mockCloseNotifications = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useNotifications
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isOpen: false,
      toggleNotifications: mockToggleNotifications,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      removeNotification: mockRemoveNotification,
      closeNotifications: mockCloseNotifications,
    });
  });

  test('renders notification bell with correct unread count', () => {
    render(<NotificationsCenter />);
    
    // Check that the bell icon is rendered
    const bellButton = screen.getByLabelText('Toggle notifications');
    expect(bellButton).toBeInTheDocument();
    
    // Check that the unread count badge is displayed
    const unreadBadge = screen.getByText('1');
    expect(unreadBadge).toBeInTheDocument();
  });

  test('does not show badge when there are no unread notifications', () => {
    useNotifications.mockReturnValue({
      ...useNotifications(),
      unreadCount: 0,
    });
    
    render(<NotificationsCenter />);
    
    // Check that no badge is displayed
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('shows 9+ when there are more than 9 unread notifications', () => {
    useNotifications.mockReturnValue({
      ...useNotifications(),
      unreadCount: 15,
    });
    
    render(<NotificationsCenter />);
    
    // Check that the badge shows "9+"
    const unreadBadge = screen.getByText('9+');
    expect(unreadBadge).toBeInTheDocument();
  });

  test('toggles notification panel when bell is clicked', () => {
    render(<NotificationsCenter />);
    
    // Click the bell button
    const bellButton = screen.getByLabelText('Toggle notifications');
    fireEvent.click(bellButton);
    
    // Check that toggleNotifications was called
    expect(mockToggleNotifications).toHaveBeenCalledTimes(1);
  });

  test('renders notification panel when isOpen is true', () => {
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Check that the panel header is displayed
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('You have 1 unread notification')).toBeInTheDocument();
    
    // Check that notifications are displayed
    expect(screen.getByText('Appointment Reminder')).toBeInTheDocument();
    expect(screen.getByText('Form Completed')).toBeInTheDocument();
    
    // Check for action texts
    expect(screen.getByText('View appointment')).toBeInTheDocument();
    expect(screen.getByText('View form')).toBeInTheDocument();
  });

  test('calls markAsRead when clicking a notification', async () => {
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Click on the unread notification
    const notification = screen.getByText('Appointment Reminder').closest('div[role="button"]') || 
                         screen.getByText('Appointment Reminder').closest('div');
    fireEvent.click(notification);
    
    // Check that markAsRead was called with the correct ID
    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  test('does not call markAsRead when clicking already read notification', () => {
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Click on the read notification
    const notification = screen.getByText('Form Completed').closest('div[role="button"]') ||
                         screen.getByText('Form Completed').closest('div');
    fireEvent.click(notification);
    
    // Check that markAsRead was not called
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  test('calls removeNotification when clicking the X button', async () => {
    const user = userEvent.setup();
    
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Find all X buttons (there should be one for each notification)
    const removeButtons = screen.getAllByRole('button', { name: /x/i });
    
    // Click on the first X button (for the unread notification)
    await user.click(removeButtons[0]);
    
    // Check that removeNotification was called with the correct ID
    expect(mockRemoveNotification).toHaveBeenCalledWith('1');
  });

  test('calls markAllAsRead when clicking "Mark all as read" button', async () => {
    const user = userEvent.setup();
    
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Click on the "Mark all as read" button
    const markAllButton = screen.getByText('Mark all as read');
    await user.click(markAllButton);
    
    // Check that markAllAsRead was called
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  test('does not show "Mark all as read" button when no unread notifications', () => {
    // Mock panel as open with no unread notifications
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
      unreadCount: 0,
    });
    
    render(<NotificationsCenter />);
    
    // Check that the "Mark all as read" button is not displayed
    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });

  test('shows empty state when there are no notifications', () => {
    // Mock panel as open with no notifications
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
      notifications: [],
      unreadCount: 0,
    });
    
    render(<NotificationsCenter />);
    
    // Check that the empty state is displayed
    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  test('closes notification panel when clicking outside', async () => {
    const user = userEvent.setup();
    
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Click on the backdrop (outside the panel)
    const backdrop = screen.getByRole('presentation', { hidden: true }) || 
                    document.querySelector('.bg-black.bg-opacity-25');
    if (backdrop) {
      await user.click(backdrop);
    }
    
    // Check that closeNotifications was called
    expect(mockCloseNotifications).toHaveBeenCalledTimes(1);
  });

  test('closes notification panel when clicking the X button', async () => {
    const user = userEvent.setup();
    
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Find the close button in the header
    const closeButtons = screen.getAllByRole('button');
    const headerCloseButton = Array.from(closeButtons).find(button => 
      button.querySelector('svg') && button.closest('.px-4.py-3')
    );
    
    // Click the close button
    if (headerCloseButton) {
      await user.click(headerCloseButton);
    }
    
    // Check that closeNotifications was called
    expect(mockCloseNotifications).toHaveBeenCalledTimes(1);
  });

  test('navigates to all notifications page when clicking "View all notifications"', () => {
    // Mock window.location.href setter
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Click on the "View all notifications" button
    const viewAllButton = screen.getByText('View all notifications');
    fireEvent.click(viewAllButton);
    
    // Check that the href was set correctly
    expect(window.location.href).toBe('/notifications');
    
    // Restore window.location
    window.location = originalLocation;
  });

  test('calls closeNotifications when ESC key is pressed', () => {
    // Mock panel as open
    useNotifications.mockReturnValue({
      ...useNotifications(),
      isOpen: true,
    });
    
    render(<NotificationsCenter />);
    
    // Simulate pressing the ESC key
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Check that closeNotifications was called
    expect(mockCloseNotifications).toHaveBeenCalledTimes(1);
  });
});
