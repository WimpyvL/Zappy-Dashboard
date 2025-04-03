import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
  handleSessionCreation,
  handleUpdateStatus,
  handleBulkSessionCreation,
  getAssignees,
  getTaskablePatients,
} from './api';

// Get tasks hook
export const useTasks = (currentPage, tasksFilters, sortingDetails) => {
  return useQuery({
    queryKey: ['tasks', currentPage, tasksFilters, sortingDetails],
    queryFn: () =>
      getTasks(currentPage, tasksFilters, undefined, sortingDetails),
  });
};

// Get task by ID hook
export const useTaskById = (id, options = {}) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    enabled: !!id,
    ...options,
  });
};

// Create task hook
export const useCreateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData) => createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Update task hook
export const useUpdateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskData }) => updateTask(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete task hook
export const useDeleteTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Mark task completed hook
export const useMarkTaskCompleted = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markTaskCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Creating session hook
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => handleSessionCreation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Creating bulk sessions hook
export const useCreateBulkSessions = (selectedRows, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => handleBulkSessionCreation(selectedRows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Archiving data hook
export const useArchiveData = (selectedIds, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => handleUpdateStatus(selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Get assignees hook
export const useAssignees = (options = {}) => {
  return useQuery({
    queryKey: ['assignees'],
    queryFn: getAssignees,
    ...options,
  });
};

// Get taskable patients hook
export const useTaskablePatients = (options = {}) => {
  return useQuery({
    queryKey: ['taskablePatients'],
    queryFn: getTaskablePatients,
    ...options,
  });
};
