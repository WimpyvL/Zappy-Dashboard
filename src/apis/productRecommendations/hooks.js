import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  return useQuery(
    ['recommendationRules'],
    fetchRecommendationRules,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );
};

/**
 * Hook to create a new recommendation rule
 * @returns {Object} Mutation result
 */
export const useCreateRecommendationRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    createRecommendationRule,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recommendationRules']);
      }
    }
  );
};

/**
 * Hook to update an existing recommendation rule
 * @returns {Object} Mutation result
 */
export const useUpdateRecommendationRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    updateRecommendationRule,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recommendationRules']);
      }
    }
  );
};

/**
 * Hook to delete a recommendation rule
 * @returns {Object} Mutation result
 */
export const useDeleteRecommendationRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    deleteRecommendationRule,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recommendationRules']);
      }
    }
  );
};
