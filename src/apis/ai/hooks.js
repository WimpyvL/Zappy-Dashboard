import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPrompts,
  fetchPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  testPrompt,
  fetchAISettings,
  updateAISettings,
  fetchAILogs,
  fetchAIMetrics
} from './api';

// Define query keys
const queryKeys = {
  all: ['ai'],
  prompts: () => [...queryKeys.all, 'prompts'],
  prompt: (id) => [...queryKeys.prompts(), id],
  settings: () => [...queryKeys.all, 'settings'],
  logs: (options) => [...queryKeys.all, 'logs', options],
  metrics: () => [...queryKeys.all, 'metrics'],
};

// Prompts hooks
export const useAIPrompts = () => {
  return useQuery({
    queryKey: queryKeys.prompts(),
    queryFn: fetchPrompts,
  });
};

export const useAIPrompt = (promptId) => {
  return useQuery({
    queryKey: queryKeys.prompt(promptId),
    queryFn: () => fetchPromptById(promptId),
    enabled: !!promptId,
  });
};

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts() });
    },
  });
};

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePrompt,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompt(data.id) });
    },
  });
};

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts() });
    },
  });
};

export const useTestPrompt = () => {
  return useMutation({
    mutationFn: testPrompt,
  });
};

// Settings hooks
export const useAISettings = () => {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: fetchAISettings,
  });
};

export const useUpdateAISettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAISettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
    },
  });
};

// Logs hooks
export const useAILogs = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.logs(options),
    queryFn: () => fetchAILogs(options),
  });
};

// Metrics hooks
export const useAIMetrics = () => {
  return useQuery({
    queryKey: queryKeys.metrics(),
    queryFn: fetchAIMetrics,
  });
};
