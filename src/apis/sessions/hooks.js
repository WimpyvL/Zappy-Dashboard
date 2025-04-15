// src/apis/sessions/hooks.js - React Query hooks for sessions
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
} from './api';
import { toast } from 'react-toastify';

// Hook to fetch sessions with pagination and filtering
export const useSessions = (currentPage = 1, filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['sessions', currentPage, filters],
    queryFn: () => getSessions(currentPage, filters),
    keepPreviousData: true,
    ...options,
  });
};

// Hook to fetch a specific session by ID
export const useSessionById = (id, options = {}) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id),
    enabled: !!id, // Only run if id is provided
    ...options,
  });
};

// Hook to create a new session
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionData) => createSession(sessionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      // Optionally invalidate sessions for a specific patient if patientId is available
      if (variables?.patient_id) {
          queryClient.invalidateQueries({ queryKey: ['sessions', 1, { patientId: variables.patient_id }] });
      }
      toast.success('Session created successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error creating session: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};

// Hook to update an existing session
export const useUpdateSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sessionData }) => updateSession(id, sessionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.id] });
       // Optionally invalidate sessions for a specific patient if patientId is available
      if (variables?.sessionData?.patient_id) {
          queryClient.invalidateQueries({ queryKey: ['sessions', 1, { patientId: variables.sessionData.patient_id }] });
      }
      toast.success('Session updated successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error updating session: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};

// Hook to delete a session
export const useDeleteSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSession(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.removeQueries({ queryKey: ['session', variables] });
      // Optionally invalidate sessions for a specific patient if patientId was known
      toast.success('Session deleted successfully.');
      options.onSuccess && options.onSuccess(data, variables);
    },
    onError: (error) => {
      toast.error(`Error deleting session: ${error.message}`);
      options.onError && options.onError(error);
    },
    ...options,
  });
};
