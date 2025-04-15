import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
  handleSessionCreation,
  handleUpdateStatus,
  // handleSessionCreation, // Omitted from API
  // handleUpdateStatus, // Omitted from API
  // handleBulkSessionCreation, // Omitted from API
  getAssignees,
  getTaskablePatients
} from './api';
import { toast } from 'react-toastify'; // Assuming toast notifications

// Get tasks hook
export const useTasks = (currentPage = 1, filters = {}, sortingDetails = {}) => {
  return useQuery({
    queryKey: ['tasks', currentPage, filters, sortingDetails],
    queryFn: () => getTasks(currentPage, filters, sortingDetails),
    keepPreviousData: true,
  });
};

// Get task by ID hook
export const useTaskById = (id, options = {}) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    enabled: !!id,
    ...options
  });
};

// Create task hook
export const useCreateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData) => createTask(taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
        toast.error(`Error creating task: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Update task hook
export const useUpdateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskData }) => updateTask(id, taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] }); // Invalidate specific task
      toast.success('Task updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error updating task: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Delete task hook
export const useDeleteTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: ['task', variables] });
      toast.success('Task deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error deleting task: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Mark task completed hook
export const useMarkTaskCompleted = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markTaskCompleted(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
      toast.success('Task marked as completed.');
      options.onSuccess && options.onSuccess(data, variables);
    },
     onError: (error) => {
        toast.error(`Error marking task as completed: ${error.message}`);
        options.onError && options.onError(error);
    }
  });
};

// Hooks for session creation and status updates are removed as API functions were commented out.
// Implement specific hooks if/when those API functions are implemented with Supabase logic.

// Get assignees hook (fetches users)
export const useAssignees = (options = {}) => {
  return useQuery({
    queryKey: ['assignees'], // Consider more specific key if filters are added
    queryFn: getAssignees,
    staleTime: 5 * 60 * 1000, // Cache assignees for 5 minutes
    ...options
  });
};

// Get taskable patients hook (fetches patients)
export const useTaskablePatients = (options = {}) => {
  return useQuery({
    queryKey: ['taskablePatients'], // Consider more specific key if filters are added
    queryFn: getTaskablePatients,
    staleTime: 5 * 60 * 1000, // Cache patients for 5 minutes
    ...options
  });
};
