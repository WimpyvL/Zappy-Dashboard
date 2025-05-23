import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRecommendationRules,
  createRecommendationRule,
  updateRecommendationRule,
  deleteRecommendationRule
} from './api';

/**
 * Hook to fetch all recommendation rules
 * @returns {Object} Query result
 */
export const useRecommendationRules = () => {
  return useQuery({
    queryKey: ['recommendationRules'],
    queryFn: fetchRecommendationRules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook to create a new recommendation rule
 * @returns {Object} Mutation result
 */
export const useCreateRecommendationRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRecommendationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendationRules'] });
    }
  });
};

/**
 * Hook to update an existing recommendation rule
 * @returns {Object} Mutation result
 */
export const useUpdateRecommendationRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateRecommendationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendationRules'] });
    }
  });
};

/**
 * Hook to delete a recommendation rule
 * @returns {Object} Mutation result
 */
export const useDeleteRecommendationRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRecommendationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendationRules'] });
    }
  });
};
