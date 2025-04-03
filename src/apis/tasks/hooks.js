import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { // Commented out unused API functions
//   // getTasks,
//   getTaskById,
//   createTask,
//   updateTask,
//   deleteTask,
//   markTaskCompleted,
//   handleSessionCreation,
//   handleUpdateStatus,
//   handleBulkSessionCreation,
//   // getAssignees,
//   // getTaskablePatients
// } from './api';
import { toast } from 'react-toastify'; // Added missing import

// --- Mock Data ---
const sampleTasks = [
  {
    id: 't001',
    title: 'Review lab results for Jane Smith',
    priority: 'high',
    dueDate: '2025-03-11',
    status: 'Pending',
    assigneeId: 'u001',
    patientId: 'p001',
  },
  {
    id: 't002',
    title: 'Complete prior authorization for Robert Johnson',
    priority: 'medium',
    dueDate: '2025-03-12',
    status: 'Pending',
    assigneeId: 'u002',
    patientId: 'p003',
  },
  {
    id: 't003',
    title: 'Follow-up on prescription renewal',
    priority: 'low',
    dueDate: '2025-03-15',
    status: 'Completed',
    assigneeId: 'u001',
    patientId: 'p002',
  },
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
  console.log('Using mock tasks data');
  return useQuery({
    queryKey: ['tasks', currentPage, tasksFilters, sortingDetails],
    // queryFn: () => getTasks(currentPage, tasksFilters, undefined, sortingDetails), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleTasks,
        meta: {
          total: sampleTasks.length,
          per_page: 10,
          current_page: currentPage,
        },
      }), // Return mock data with pagination structure
    staleTime: Infinity,
  });
};

// Get task by ID hook (Mocked)
export const useTaskById = (id, options = {}) => {
  console.log(`Using mock task data for ID: ${id} in useTaskById hook`);
  return useQuery({
    queryKey: ['task', id],
    // queryFn: () => getTaskById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleTasks.find((t) => t.id === id) || sampleTasks[0]
      ), // Find mock task or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create task hook (Mocked)
export const useCreateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (taskData) => createTask(taskData), // Original API call
    mutationFn: async (taskData) => {
      console.log('Mock Creating task:', taskData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newTask = {
        id: `t${Date.now()}`, // Generate mock ID
        ...taskData,
        status: taskData.status || 'pending', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Note: Doesn't actually add to sampleTasks
      return { data: newTask }; // Simulate API response
    },
    onSuccess: (data) => { // Adjust to potentially use data from mock response
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully'); // Added feedback
      options.onSuccess && options.onSuccess();
    },
  });
};

// Update task hook (Mocked)
export const useUpdateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: ({ id, taskData }) => updateTask(id, taskData), // Original API call
    mutationFn: async ({ id, taskData }) => {
      console.log(`Mock Updating task ${id}:`, taskData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...taskData } }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] }); // Invalidate specific task
      toast.success('Task updated successfully'); // Added feedback
      options.onSuccess && options.onSuccess();
    },
  });
};

// Delete task hook (Mocked)
export const useDeleteTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => deleteTask(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Deleting task ${id}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id if needed
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] }); // Invalidate specific task
      toast.success('Task deleted successfully'); // Added feedback
      options.onSuccess && options.onSuccess();
    },
  });
};

// Mark task completed hook (Mocked)
export const useMarkTaskCompleted = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => markTaskCompleted(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Marking task ${id} as completed`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id, status: 'completed' }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access id
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] }); // Invalidate specific task
      toast.success('Task marked as completed'); // Added feedback
      options.onSuccess && options.onSuccess();
    },
  });
};

// Creating session hook (Mocked - Simulates session creation based on task)
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (id) => handleSessionCreation(id), // Original API call
    mutationFn: async (taskId) => {
      console.log(`Mock Creating session from task ${taskId}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Potentially update the task status as well
      return { success: true, taskId }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables to access taskId
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] }); // Invalidate specific task
      toast.success('Session created from task'); // Added feedback
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Creating bulk sessions hook (Mocked)
export const useCreateBulkSessions = (selectedRows, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: () => handleBulkSessionCreation(selectedRows), // Original API call
    mutationFn: async () => {
      console.log('Mock Creating bulk sessions for tasks:', selectedRows);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, count: selectedRows.length }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables if needed
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Invalidate specific tasks if possible/needed
      selectedRows.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ['task', id] })
      );
      toast.success(`Bulk sessions created for ${data.count} tasks`); // Added feedback
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Archiving data hook (Mocked - Assuming this updates task status)
export const useArchiveData = (selectedIds, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: () => handleUpdateStatus(selectedIds), // Original API call (assuming it updates status)
    mutationFn: async () => {
      console.log('Mock Archiving tasks:', selectedIds);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Simulate updating status to 'archived' or similar
      return { success: true, count: selectedIds.length }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables if needed
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Invalidate specific tasks
      selectedIds.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ['task', id] })
      );
      toast.success(`${data.count} tasks archived`); // Added feedback
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Get assignees hook (Mocked)
export const useAssignees = (options = {}) => {
  console.log('Using mock assignees data');
  return useQuery({
    queryKey: ['assignees'],
    // queryFn: getAssignees, // Original API call
    queryFn: () => Promise.resolve({ data: sampleAssignees }), // Return mock data
    staleTime: Infinity,
    ...options,
  });
};

// Get taskable patients hook (Mocked)
export const useTaskablePatients = (options = {}) => {
  console.log('Using mock taskable patients data');
  return useQuery({
    queryKey: ['taskablePatients'],
    // queryFn: getTaskablePatients, // Original API call
    queryFn: () => Promise.resolve({ data: sampleTaskablePatients }), // Return mock data
    staleTime: Infinity,
    ...options,
  });
};
