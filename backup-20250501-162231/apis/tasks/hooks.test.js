import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  useTasks,
  useTaskById,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMarkTaskCompleted,
  useAssignees,
  useTaskablePatients,
} from './hooks';
import { supabase } from '../../lib/supabase';

// Mock external dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock data
const mockTasks = [
  {
    id: 'task-1',
    title: 'Complete patient assessment',
    completed: false,
    user_id: 'user-1',
    patient_id: 'patient-1',
    due_date: '2025-05-01T10:00:00.000Z',
    created_at: '2025-04-20T10:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Follow-up call',
    completed: true,
    user_id: 'user-2',
    patient_id: 'patient-2',
    due_date: '2025-04-15T14:00:00.000Z',
    created_at: '2025-04-10T09:00:00.000Z',
  },
];

const mockAssignees = [
  { id: 'user-1', first_name: 'John', last_name: 'Doe' },
  { id: 'user-2', first_name: 'Jane', last_name: 'Smith' },
];

const mockPatients = [
  { id: 'patient-1', first_name: 'Robert', last_name: 'Jones' },
  { id: 'patient-2', first_name: 'Maria', last_name: 'Garcia' },
];

// Setup test wrapper for React Query
const createWrapper = () => {
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
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Task API Hooks', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTasks', () => {
    test('should fetch tasks successfully', async () => {
      // Mock the Supabase response
      const mockResponse = {
        data: mockTasks,
        error: null,
        count: mockTasks.length,
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
      };

      // Setup the chain of mocks
      supabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.range.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      // Mock the final resolved value
      jest.spyOn(Promise.prototype, 'then').mockImplementationOnce(() => Promise.resolve(mockResponse));

      // Render the hook with the wrapper
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

      // Wait for the query to resolve
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
      expect(result.current.data.data).toHaveLength(2);
      expect(result.current.data.meta.total).toBe(2);
    });

    test('should handle error when fetching tasks', async () => {
      // Mock an error response from Supabase
      const mockError = {
        message: 'Database connection error',
        code: 'PGRST500',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };

      supabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.range.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue({
        then: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      // Mock console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Render the hook
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

      // Wait for the query to fail
      await waitFor(() => expect(result.current.isError).toBe(true));

      // Assertions
      expect(console.error).toHaveBeenCalled();
      expect(result.current.error.message).toBe(mockError.message);
    });
  });

  describe('useTaskById', () => {
    test('should fetch a single task by id', async () => {
      const taskId = 'task-1';
      const mockTask = mockTasks[0];

      // Mock Supabase response
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
      });

      // Render the hook
      const { result } = renderHook(() => useTaskById(taskId), {
        wrapper: createWrapper(),
      });

      // Wait for the query to resolve
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
      expect(result.current.data).toMatchObject({
        ...mockTask,
        status: 'Pending', // Should be mapped from completed: false
      });
    });

    test('should handle non-existent task', async () => {
      const taskId = 'non-existent';
      
      // Mock Supabase response for not found
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      });

      // Mock console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Render the hook
      const { result } = renderHook(() => useTaskById(taskId), {
        wrapper: createWrapper(),
      });

      // Wait for the query to resolve
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should return null for not found
      expect(result.current.data).toBeNull();
    });
  });

  describe('useCreateTask', () => {
    test('should create a task successfully', async () => {
      const newTask = {
        title: 'New Task',
        assigneeId: 'user-1',
        patientId: 'patient-1',
        status: 'Pending',
        due_date: '2025-06-01T10:00:00.000Z',
      };

      const mockCreatedTask = {
        id: 'new-task-id',
        title: 'New Task',
        user_id: 'user-1',
        patient_id: 'patient-1',
        completed: false,
        due_date: '2025-06-01T10:00:00.000Z',
        created_at: expect.any(String),
      };

      // Mock Supabase response
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCreatedTask, error: null }),
      });

      // Render the hook
      const { result } = renderHook(() => useCreateTask(), {
        wrapper: createWrapper(),
      });

      // Execute the mutation
      result.current.mutate(newTask);

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('pb_tasks');
      expect(toast.success).toHaveBeenCalledWith('Task created successfully');
      expect(result.current.data).toEqual(mockCreatedTask);
    });

    test('should handle error when creating a task', async () => {
      const newTask = { title: 'Failed Task' };
      const mockError = { message: 'Validation error' };

      // Mock Supabase error response
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      // Mock console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Render the hook
      const { result } = renderHook(() => useCreateTask(), {
        wrapper: createWrapper(),
      });

      // Execute the mutation
      result.current.mutate(newTask);

      // Wait for the mutation to fail
      await waitFor(() => expect(result.current.isError).toBe(true));

      // Assertions
      expect(console.error).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
      expect(result.current.error.message).toBe(mockError.message);
    });
  });

  // Additional test cases for other hooks would follow a similar pattern
  describe('useAssignees & useTaskablePatients', () => {
    test('should fetch assignees successfully', async () => {
      // Mock Supabase response
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockAssignees, error: null }),
      });

      // Render the hook
      const { result } = renderHook(() => useAssignees(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to resolve
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.current.data).toEqual(mockAssignees);
    });

    test('should fetch patients successfully', async () => {
      // Mock Supabase response
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPatients, error: null }),
      });

      // Render the hook
      const { result } = renderHook(() => useTaskablePatients(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to resolve
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('patients');
      expect(result.current.data).toEqual(mockPatients);
    });
  });
});