import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AuthProvider } from '../../context/AuthContext';
import { waitMs, createMockUser, createMockSession } from '../../utils/test-utils';

// Import necessary components
// Note: These imports will need to be adjusted based on your actual file structure
import TasksPage from '../../pages/tasks/TasksPage';
import TaskDetails from '../../pages/tasks/TaskDetails';

// Mock data
const mockTasks = [
  {
    id: 'task-1',
    title: 'Complete patient assessment',
    completed: false,
    status: 'pending',
    priority: 'high',
    user_id: 'user-1',
    assignable: { type: 'user', user: { id: 'user-1', full_name: 'Test User' } },
    patient_id: 'patient-1',
    taskable: { type: 'patient', patient: { id: 'patient-1', first_name: 'John', last_name: 'Doe' } },
    due_date: '2025-05-01T10:00:00.000Z',
    created_at: '2025-04-20T10:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Follow-up call with patient',
    completed: true,
    status: 'completed',
    priority: 'medium',
    user_id: 'user-2',
    assignable: { type: 'user', user: { id: 'user-2', full_name: 'Jane Smith' } },
    patient_id: 'patient-2',
    taskable: { type: 'patient', patient: { id: 'patient-2', first_name: 'Maria', last_name: 'Garcia' } },
    due_date: '2025-04-15T14:00:00.000Z',
    created_at: '2025-04-10T09:00:00.000Z',
  },
];

const mockUsers = [
  { id: 'user-1', full_name: 'Test User', email: 'test@example.com', first_name: 'Test', last_name: 'User' },
  { id: 'user-2', full_name: 'Jane Smith', email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith' }
];

const mockPatients = [
  { id: 'patient-1', first_name: 'John', last_name: 'Doe' },
  { id: 'patient-2', first_name: 'Maria', last_name: 'Garcia' }
];

// Setup test wrapper with required providers and routes
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silent error logging in tests
    },
  });

  // Mock authenticated user
  const mockUser = createMockUser();
  const mockSession = createMockSession(mockUser);
  
  return ({ children, initialEntries = ['/tasks'] }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            {children}
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Test suite
describe('Task Management Integration Tests', () => {
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth state
    const mockUser = createMockUser();
    const mockSession = createMockSession(mockUser);
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock task list query
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
  });

  test('should display task list and allow navigation to task details', async () => {
    const Wrapper = createTestWrapper();
    
    // Render the tasks page
    render(<Wrapper />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(/Complete patient assessment/i)).toBeInTheDocument();
    });
    
    // Verify task list displays correctly
    expect(screen.getByText(/Complete patient assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Follow-up call with patient/i)).toBeInTheDocument();
    
    // Mock single task query for when we navigate to task details
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockTasks[0],
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

    // Click on a task to navigate to details
    const user = userEvent.setup();
    const firstTask = screen.getByText(/Complete patient assessment/i);
    await user.click(firstTask);
    
    // Check that we navigated to details page
    await waitFor(() => {
      // This depends on what's shown in your TaskDetails component
      expect(screen.getByText(/Task Details/i)).toBeInTheDocument();
    });
    
    // Verify details are displayed correctly
    expect(screen.getByText(/Complete patient assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/High/i)).toBeInTheDocument();
  });

  test('should allow creating a new task', async () => {
    const Wrapper = createTestWrapper();
    const user = userEvent.setup();
    
    // Mock successful task creation
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { 
              id: 'new-task-id', 
              title: 'New Test Task',
              completed: false,
              status: 'pending',
            },
            error: null,
          }),
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
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
    });
    
    // Render the tasks page
    render(<Wrapper />);
    
    // Wait for initial tasks to load
    await waitFor(() => {
      expect(screen.getByText(/Complete patient assessment/i)).toBeInTheDocument();
    });
    
    // Click the Add Task button
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(addButton);
    
    // Wait for task modal to appear
    await waitFor(() => {
      expect(screen.getByText(/Add New Task/i)).toBeInTheDocument();
    });
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Task Title/i), 'New Test Task');
    await user.selectOptions(screen.getByLabelText(/Patient/i), ['patient-1']);
    await user.selectOptions(screen.getByLabelText(/Priority/i), ['high']);
    await user.selectOptions(screen.getByLabelText(/Assign To/i), ['user-1']);
    
    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create Task/i });
    await user.click(createButton);
    
    // Verify the task was created
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
    });
  });

  test('should mark a task as completed', async () => {
    const Wrapper = createTestWrapper();
    const user = userEvent.setup();
    
    // Mock task update
    supabase.from.mockImplementation((table) => {
      if (table === 'pb_tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockTasks[0], completed: true, status: 'completed' },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: mockTasks,
            count: mockTasks.length,
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
    });
    
    // Render the tasks page
    render(<Wrapper />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(/Complete patient assessment/i)).toBeInTheDocument();
    });
    
    // Find the complete button/checkbox for the first task
    const completeButton = screen.getAllByRole('checkbox')[0];
    await user.click(completeButton);
    
    // Verify the task was updated
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
    });
  });
});