import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/auth/AuthContext';
import { AppProvider } from '../../context/AppContext';
import { NotificationsProvider } from '../../contexts/NotificationsContext';
import { supabase } from '../../lib/supabase';
import App from '../../App';

// Test for a complete task management workflow
describe('Task Management E2E Workflow', () => {
  // Setup a clean test environment before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-test', email: 'test@example.com' },
          access_token: 'test-token',
        },
      },
      error: null,
    });

    supabase.auth.onAuthStateChange.mockImplementation((event, callback) => {
      callback('SIGNED_IN', {
        user: { id: 'user-test', email: 'test@example.com' },
        access_token: 'test-token',
      });
      return { data: { subscription: { unsubscribe: jest.fn() } }};
    });
    
    // Mock all relevant Supabase calls
    // These will be refined in each test as needed
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    }));
  });

  test('Complete task management workflow: login → create task → mark complete → delete', async () => {
    const user = userEvent.setup();
    
    // Mock data
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Existing Task',
        completed: false,
        status: 'pending',
        priority: 'medium',
        due_date: '2025-05-01T10:00:00Z',
        user_id: 'user-test',
        patient_id: 'patient-1',
      },
    ];
    
    const mockUsers = [
      { id: 'user-test', full_name: 'Test User', email: 'test@example.com' },
    ];
    
    const mockPatients = [
      { id: 'patient-1', first_name: 'John', last_name: 'Doe' },
    ];
    
    // Setup the mock for login success
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-test', email: 'test@example.com' },
        session: { access_token: 'test-token' },
      },
      error: null,
    });
    
    // Setup query client with disabled retries for tests
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Render the app with the necessary providers
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <NotificationsProvider>
              <MemoryRouter initialEntries={['/login']}>
                <App />
              </MemoryRouter>
            </NotificationsProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
    
    // Step 1: Log in
    await waitFor(() => {
      expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
    });
    
    // Enter login credentials
    await user.type(screen.getByPlaceholderText(/your.email@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
    
    // Click login button
    const loginButton = screen.getByRole('button', { name: /Sign in/i });
    await user.click(loginButton);
    
    // Wait for login to complete and navigate to dashboard
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    // Mock navigation to tasks page and data loading
    // Mock tasks list query for when we navigate to tasks
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: mockTasks,
            count: mockTasks.length,
            error: null,
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockUsers,
            error: null,
          }),
        };
      }
      if (table === 'patients') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockPatients,
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
    });
    
    // Step 2: Navigate to Tasks
    // Find and click on the Tasks navigation item
    const tasksNavItem = await screen.findByText(/Tasks/i);
    await user.click(tasksNavItem);
    
    // Wait for tasks page to load
    await waitFor(() => {
      expect(screen.getByText(/Existing Task/i)).toBeInTheDocument();
    });
    
    // Step 3: Create a new task
    // Mock task creation response
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'new-task-id',
              title: 'Follow up with patient',
              completed: false,
            },
            error: null,
          }),
          range: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: [...mockTasks, {
              id: 'new-task-id',
              title: 'Follow up with patient',
              completed: false,
              status: 'pending',
              priority: 'high',
              due_date: '2025-05-15T10:00:00Z',
              user_id: 'user-test',
              patient_id: 'patient-1',
            }],
            count: mockTasks.length + 1,
            error: null,
          }),
        };
      }
      return supabase.from(table);
    });
    
    // Click the "Add Task" button
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(addTaskButton);
    
    // Wait for the task modal to appear
    await waitFor(() => {
      expect(screen.getByText(/Add New Task/i)).toBeInTheDocument();
    });
    
    // Fill out the task form
    await user.type(screen.getByLabelText(/Task Title/i), 'Follow up with patient');
    await user.selectOptions(screen.getByLabelText(/Patient/i), ['patient-1']);
    await user.selectOptions(screen.getByLabelText(/Priority/i), ['high']);
    await user.selectOptions(screen.getByLabelText(/Assign To/i), ['user-test']);
    
    // Set dates using direct input since datetime-local is hard to interact with
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    const reminderDateInput = screen.getByLabelText(/Reminder Date/i);
    await user.clear(dueDateInput);
    await user.type(dueDateInput, '2025-05-15T10:00');
    await user.clear(reminderDateInput);
    await user.type(reminderDateInput, '2025-05-14T09:00');
    
    // Add task notes
    await user.type(
      screen.getByLabelText(/Notes\/Message/i), 
      'Follow up with patient about medication adherence'
    );
    
    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create Task/i });
    await user.click(createButton);
    
    // Wait for task to be created and appear in the list
    await waitFor(() => {
      expect(screen.getByText(/Follow up with patient/i)).toBeInTheDocument();
    });
    
    // Step 4: Mark task as completed
    // Mock task update response
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'new-task-id',
              title: 'Follow up with patient',
              completed: true,
            },
            error: null,
          }),
          range: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: [
              mockTasks[0],
              {
                id: 'new-task-id',
                title: 'Follow up with patient',
                completed: true,
                status: 'completed',
                priority: 'high',
                due_date: '2025-05-15T10:00:00Z',
                user_id: 'user-test',
                patient_id: 'patient-1',
              },
            ],
            count: 2,
            error: null,
          }),
        };
      }
      return supabase.from(table);
    });
    
    // Find the new task's checkbox and click it to mark as complete
    const taskItems = await screen.findAllByText(/Follow up with patient/i);
    const taskItem = taskItems[0].closest('div[role="row"]') || taskItems[0].closest('tr');
    const completeCheckbox = taskItem.querySelector('input[type="checkbox"]');
    await user.click(completeCheckbox);
    
    // Wait for task to be marked as completed
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
    });
    
    // Step 5: Delete the task
    // Mock task deletion response
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          select: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: [mockTasks[0]],  // Only the original task remains
            count: 1,
            error: null,
          }),
        };
      }
      return supabase.from(table);
    });
    
    // Find the delete button for the new task and click it
    const deleteButton = taskItem.querySelector('[aria-label="Delete task"]') || 
                         taskItem.querySelector('button[title="Delete"]');
    await user.click(deleteButton);
    
    // Confirm deletion in the confirmation dialog
    const confirmDeleteButton = await screen.findByRole('button', { name: /Confirm|Yes|Delete/i });
    await user.click(confirmDeleteButton);
    
    // Wait for task to be deleted
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
    });
    
    // Verify the task is no longer in the list
    await waitFor(() => {
      expect(screen.queryByText(/Follow up with patient/i)).not.toBeInTheDocument();
    });
    // Original task should still be there
    expect(screen.getByText(/Existing Task/i)).toBeInTheDocument();
  });
});
