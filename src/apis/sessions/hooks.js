import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService

const queryKeys = {
  all: ['sessions'],
  lists: (params) => [...queryKeys.all, 'list', params],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get sessions hook
export const useSessions = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(params),
    queryFn: () => apiService.sessions.getAll(params), // Use apiService
    // Keep previous data while fetching new data for smoother pagination/filtering
    keepPreviousData: true,
  });
};

// Get session by ID hook
export const useSessionById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: () => apiService.sessions.getById(id), // Use apiService
    enabled: !!id, // Only run query if ID is provided
    ...options,
  });
};

// Create session hook
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionData) => apiService.sessions.create(sessionData), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate the list query to refetch sessions
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      // Call original onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

// Update session hook
export const useUpdateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sessionData }) => apiService.sessions.update(id, sessionData), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate list and specific detail queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
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
    // Payload matches apiService: { id, status }
    mutationFn: ({ sessionId, status }) => apiService.sessions.updateStatus(sessionId, status), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate list and specific detail queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.sessionId) });
      options.onSuccess?.(data, variables, context);
    },
     onError: options.onError,
     onSettled: options.onSettled,
  });
};

// Delete session hook
export const useDeleteSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiService.sessions.delete(id), // Use apiService
    onSuccess: (data, variables, context) => {
      // Invalidate list query
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
        // mutationFn: ({ entityId, tagId }) => apiService.sessions.addTag(entityId, tagId), // Replace with actual API call
        mutationFn: async ({ entityId, tagId }) => {
            // Placeholder: Replace with actual API call from apiService if it exists
            console.warn("API call for adding session tag not implemented yet.");
            // Example structure: await apiService.sessions.addTag(entityId, tagId);
            return { success: true }; // Simulate success
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.entityId) });
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
        // mutationFn: ({ entityId, tagId }) => apiService.sessions.removeTag(entityId, tagId), // Replace with actual API call
         mutationFn: async ({ entityId, tagId }) => {
             // Placeholder: Replace with actual API call from apiService if it exists
             console.warn("API call for removing session tag not implemented yet.");
             // Example structure: await apiService.sessions.removeTag(entityId, tagId);
             return { success: true }; // Simulate success
         },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.entityId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
            options.onSuccess?.(data, variables, context);
        },
        onError: options.onError,
    });
};
