import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  // getTasks, // Mocked
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
  handleSessionCreation,
  handleUpdateStatus,
  handleBulkSessionCreation,
  // getAssignees, // Mocked
  // getTaskablePatients // Mocked
} from './api'; // Keep imports for other hooks

// --- Mock Data ---
const sampleTasks = [
  { id: 't001', title: 'Review lab results for Jane Smith', priority: 'high', dueDate: '2025-03-11', status: 'Pending', assigneeId: 'u001', patientId: 'p001' },
  { id: 't002', title: 'Complete prior authorization for Robert Johnson', priority: 'medium', dueDate: '2025-03-12', status: 'Pending', assigneeId: 'u002', patientId: 'p003' },
  { id: 't003', title: 'Follow-up on prescription renewal', priority: 'low', dueDate: '2025-03-15', status: 'Completed', assigneeId: 'u001', patientId: 'p002' },
];
const sampleAssignees = [
  { id: 'u001', firstName: 'Dr. Sarah', lastName: 'Johnson' },
  { id: 'u002', firstName: 'Nurse Michael', lastName: 'Chen' },
];
const sampleTaskablePatients = [
  { id: 'p001', firstName: 'John', lastName: 'Smith' },
  { id: 'p002', firstName: 'Emily', lastName: 'Davis' },
  { id: 'p003', firstName: 'Robert', lastName: 'Wilson' },
];
// --- End Mock Data ---

// Get tasks hook (Mocked)
export const useTasks = (currentPage, tasksFilters, sortingDetails) => {
  console.log("Using mock tasks data");
  return useQuery({
    queryKey: ['tasks', currentPage, tasksFilters, sortingDetails],
    // queryFn: () => getTasks(currentPage, tasksFilters, undefined, sortingDetails), // Original API call
    queryFn: () => Promise.resolve({ data: sampleTasks, meta: { total: sampleTasks.length, per_page: 10, current_page: currentPage } }), // Return mock data with pagination structure
    staleTime: Infinity,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  });
};

// Get assignees hook (Mocked)
export const useAssignees = (options = {}) => {
  console.log("Using mock assignees data");
  return useQuery({
    queryKey: ['assignees'],
    // queryFn: getAssignees, // Original API call
    queryFn: () => Promise.resolve({ data: sampleAssignees }), // Return mock data
    staleTime: Infinity,
    ...options
  });
};

// Get taskable patients hook (Mocked)
export const useTaskablePatients = (options = {}) => {
  console.log("Using mock taskable patients data");
  return useQuery({
    queryKey: ['taskablePatients'],
    // queryFn: getTaskablePatients, // Original API call
    queryFn: () => Promise.resolve({ data: sampleTaskablePatients }), // Return mock data
    staleTime: Infinity,
    ...options
  });
};
