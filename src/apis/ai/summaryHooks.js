import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  generateIntakeSummary, 
  generateAssessment, 
  generatePlan, 
  saveSummary, 
  getSummary 
} from './summaryService';
import { toast } from 'react-toastify';

// Query keys for AI summaries
const summaryKeys = {
  all: ['aiSummaries'],
  byConsultation: (consultationId) => [...summaryKeys.all, consultationId],
};

/**
 * Hook to get an AI summary for a consultation
 * @param {string} consultationId - The consultation ID
 * @returns {Object} The query result
 */
export const useAISummary = (consultationId) => {
  return useQuery({
    queryKey: summaryKeys.byConsultation(consultationId),
    queryFn: () => getSummary(consultationId),
    enabled: !!consultationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to generate an AI summary from intake form data
 * @returns {Object} The mutation result
 */
export const useGenerateAISummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ formData, categoryId, promptType = 'initial' }) => {
      return generateIntakeSummary(formData, categoryId, promptType);
    },
    onSuccess: (data, variables) => {
      toast.success('AI summary generated successfully');
    },
    onError: (error) => {
      console.error('Error generating AI summary:', error);
      toast.error('Failed to generate AI summary');
    },
  });
};

/**
 * Hook to generate an AI assessment from intake form data
 * @returns {Object} The mutation result
 */
export const useGenerateAIAssessment = () => {
  return useMutation({
    mutationFn: async ({ formData, categoryId, promptType = 'initial' }) => {
      return generateAssessment(formData, categoryId, promptType);
    },
    onSuccess: (data, variables) => {
      toast.success('AI assessment generated successfully');
    },
    onError: (error) => {
      console.error('Error generating AI assessment:', error);
      toast.error('Failed to generate AI assessment');
    },
  });
};

/**
 * Hook to generate an AI plan from intake form data
 * @returns {Object} The mutation result
 */
export const useGenerateAIPlan = () => {
  return useMutation({
    mutationFn: async ({ formData, categoryId, promptType = 'initial' }) => {
      return generatePlan(formData, categoryId, promptType);
    },
    onSuccess: (data, variables) => {
      toast.success('AI plan generated successfully');
    },
    onError: (error) => {
      console.error('Error generating AI plan:', error);
      toast.error('Failed to generate AI plan');
    },
  });
};

/**
 * Hook to save an AI summary to the database
 * @returns {Object} The mutation result
 */
export const useSaveAISummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ consultationId, summary }) => {
      return saveSummary(consultationId, summary);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(summaryKeys.byConsultation(variables.consultationId));
      toast.success('AI summary saved successfully');
    },
    onError: (error) => {
      console.error('Error saving AI summary:', error);
      toast.error('Failed to save AI summary');
    },
  });
};

/**
 * Hook to generate and save an AI summary in one step
 * @returns {Object} The mutation result
 */
export const useGenerateAndSaveAISummary = () => {
  const queryClient = useQueryClient();
  const generateSummary = useGenerateAISummary();
  const saveSummaryMutation = useSaveAISummary();
  
  return useMutation({
    mutationFn: async ({ consultationId, formData, categoryId, promptType = 'initial' }) => {
      // First generate the summary
      const summary = await generateSummary.mutateAsync({ 
        formData, 
        categoryId,
        promptType
      });
      
      // Then save it
      const savedSummary = await saveSummaryMutation.mutateAsync({ 
        consultationId, 
        summary 
      });
      
      return savedSummary;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(summaryKeys.byConsultation(variables.consultationId));
      toast.success('AI summary generated and saved');
    },
    onError: (error) => {
      console.error('Error generating and saving AI summary:', error);
      toast.error('Failed to generate and save AI summary');
    },
  });
};

/**
 * Hook to generate all AI content for a consultation in one step
 * @returns {Object} The mutation result
 */
export const useGenerateAllAIContent = () => {
  const generateSummary = useGenerateAISummary();
  const generateAssessmentMutation = useGenerateAIAssessment();
  const generatePlanMutation = useGenerateAIPlan();
  
  return useMutation({
    mutationFn: async ({ formData, categoryId, promptType = 'initial' }) => {
      // Generate all content in parallel
      const [summary, assessment, plan] = await Promise.all([
        generateSummary.mutateAsync({ formData, categoryId, promptType }),
        generateAssessmentMutation.mutateAsync({ formData, categoryId, promptType }),
        generatePlanMutation.mutateAsync({ formData, categoryId, promptType })
      ]);
      
      return {
        summary,
        assessment,
        plan
      };
    },
    onSuccess: (data, variables) => {
      toast.success('AI content generated successfully');
    },
    onError: (error) => {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    },
  });
};