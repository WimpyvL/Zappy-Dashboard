import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import apiService from '../../utils/apiService'; // Removed unused import
import { toast } from 'react-toastify'; // Added for mock feedback

// --- Mock Data (Using sample from AppContext for consistency) ---
const sampleSessionsData = [
  {
    id: 's001',
    patientId: 'p001',
    patientName: 'John Smith',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'scheduled',
    type: 'Follow-up',
    tags: [],
    doctor: 'Dr. Johnson', // Added doctor
    notes: 'Discussed medication side effects.', // Added notes
    followUpNeeded: false, // Added followUpNeeded
  },
  {
    id: 's002',
    patientId: 'p002',
    patientName: 'Emily Davis',
    scheduledDate: new Date().toISOString(), // Today
    status: 'scheduled',
    type: 'Initial Consultation',
    tags: [],
    doctor: 'Dr. Chen',
    notes: null,
    followUpNeeded: true,
  },
  {
    id: 's003',
    patientId: 'p003',
    patientName: 'Robert Wilson',
    scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'completed',
    type: 'Follow-up',
    tags: [],
    doctor: 'Dr. Johnson',
    notes: 'Patient progress is good. Continue current plan.',
    followUpNeeded: false,
  },
  {
    id: 's004',
    patientId: 'p001',
    patientName: 'John Smith',
    scheduledDate: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
    status: 'missed',
    type: 'Follow-up',
    tags: [],
    doctor: 'Dr. Johnson',
    notes: 'Patient did not attend scheduled session.',
    followUpNeeded: true,
  },
];
// --- End Mock Data ---

const queryKeys = {
  all: ['sessions'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get sessions hook (Mocked)
export const useSessions = (params = {}) => {
  console.log('Using mock sessions data in useSessions hook');
  return useQuery({
    queryKey: queryKeys.lists(params),
    // queryFn: () => apiService.sessions.getAll(params), // Original API call
    queryFn: () =>
      Promise.resolve({
        data: sampleSessionsData, // Return mock data
        // Add meta if needed
      }),
    keepPreviousData: true,
    staleTime: Infinity,
  });
};

// Get session by ID hook (Mocked)
export const useSessionById = (id, options = {}) => {
  console.log(`Using mock session data for ID: ${id} in useSessionById hook`);
  return useQuery({
    queryKey: queryKeys.details(id),
    // queryFn: () => apiService.sessions.getById(id), // Original API call
    queryFn: () =>
      Promise.resolve(
        sampleSessionsData.find((s) => s.id === id) || sampleSessionsData[0]
      ), // Find mock session or return first
    enabled: !!id,
    staleTime: Infinity,
    ...options,
  });
};

// Create session hook (Mocked)
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (sessionData) => apiService.sessions.create(sessionData), // Original API call
    mutationFn: async (sessionData) => {
      console.log('Mock Creating session:', sessionData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      const newSession = {
        id: `s${Date.now()}`, // Generate mock ID
        ...sessionData,
        status: 'scheduled', // Default status
      };
      // Note: Doesn't actually add to sampleSessionsData
      return { data: newSession }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the list query to refetch sessions
      toast.success('Session created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Call original onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

// Update session hook (Mocked)
export const useUpdateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ id, sessionData }) => apiService.sessions.update(id, sessionData), // Original API call
    mutationFn: async ({ id, sessionData }) => {
      console.log(`Mock Updating session ${id}:`, sessionData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { data: { id, ...sessionData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate list and specific detail queries
      toast.success('Session updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

// Update session status hook
export const useUpdateSessionStatus = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ sessionId, status }) => apiService.sessions.updateStatus(sessionId, status), // Original API call
    mutationFn: async ({ sessionId, status }) => {
      console.log(`Mock Updating session ${sessionId} status to: ${status}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true, id: sessionId, status: status }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate list and specific detail queries
      toast.success('Session status updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.sessionId),
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

// Delete session hook (Mocked)
export const useDeleteSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (id) => apiService.sessions.delete(id), // Original API call
    mutationFn: async (id) => {
      console.log(`Mock Deleting session ${id}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      // Invalidate list query
      toast.success('Session deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Optionally remove the specific detail query from cache
      // queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

// Hook for adding a tag to a session (Example - adjust based on actual API)
export const useAddSessionTag = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ entityId, tagId }) => apiService.sessions.addTag(entityId, tagId), // Original API call
    mutationFn: async ({ entityId, tagId }) => {
      console.log(`Mock Adding tag ${tagId} to session ${entityId}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate success
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.entityId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
};

// Hook for removing a tag from a session (Example - adjust based on actual API)
export const useRemoveSessionTag = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ entityId, tagId }) => apiService.sessions.removeTag(entityId, tagId), // Original API call
    mutationFn: async ({ entityId, tagId }) => {
      console.log(`Mock Removing tag ${tagId} from session ${entityId}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      return { success: true }; // Simulate success
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.entityId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
};
