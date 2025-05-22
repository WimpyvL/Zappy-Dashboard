import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAISummary, useGenerateAndSaveAISummary } from '../../../../apis/ai/summaryHooks';

const AIPanel = ({ 
  showAIPanel, 
  toggleAIPanel, 
  consultationId, 
  formData, 
  categoryId,
  isFollowUp = false,
  initialInsights 
}) => {
  const [insights, setInsights] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    reasoning: true
  });
  
  // Fetch existing summary if available
  const { 
    data: existingSummary, 
    isLoading: isLoadingSummary,
    isError: isSummaryError
  } = useAISummary(consultationId);
  
  // Mutation for generating and saving a summary
  const generateAndSaveSummary = useGenerateAndSaveAISummary();

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Initialize state with existing summary or initial insights when panel is shown
  useEffect(() => {
    if (!showAIPanel) return;
    
    if (existingSummary) {
      // Use existing summary from database
      setInsights(formatRecommendations(existingSummary.recommendations || []));
      setReasoning(existingSummary.reasoning || '');
    } else if (initialInsights) {
      // Use initial insights passed as props
      setInsights(formatRecommendations(initialInsights.recommendations || []));
      setReasoning(initialInsights.reasoning || '');
    } else if (formData && categoryId) {
      // Generate new summary if we have form data and category
      handleGenerateSummary();
    } else {
      // Fallback static data if no data is available
      if (isFollowUp) {
        setInsights(formatRecommendations([
          { text: 'Increase Semaglutide to 0.5mg weekly', confidence: 92 },
          { text: 'Continue Metformin 500mg daily', confidence: 90 },
          { text: 'Monthly follow-up recommended', confidence: 88 },
        ]));
        setReasoning('Patient has been on initial weight management treatment for 4 weeks. Weight loss of 5 lbs reported. No significant side effects. Increasing Semaglutide dosage is recommended to optimize weight loss. Continuing Metformin provides additional metabolic benefits.');
      } else {
        setInsights(formatRecommendations([
          { text: 'Semaglutide 0.25mg weekly', confidence: 94 },
          { text: 'Metformin 500mg daily', confidence: 91 },
          { text: 'Sildenafil 50mg PRN', confidence: 96 },
        ]));
        setReasoning('Patient has BMI of 32.4 (obese) and A1C of 5.6% (pre-diabetic). Semaglutide is recommended for weight loss with strong evidence for efficacy. Metformin is recommended for pre-diabetes management. Sildenafil is recommended based on patient\'s reported ED symptoms.');
      }
    }
  }, [showAIPanel, existingSummary, initialInsights, consultationId]);

  // Helper to format recommendations for display
  const formatRecommendations = (recommendations) => {
    return recommendations.map(rec => `${rec.text} (${rec.confidence}% confidence)`).join('\n');
  };

  // Function to generate a new summary
  const handleGenerateSummary = async () => {
    if (!formData || !categoryId || !consultationId) return;
    
    setIsGenerating(true);
    
    try {
      const result = await generateAndSaveSummary.mutateAsync({
        consultationId,
        formData,
        categoryId,
        promptType: isFollowUp ? 'followup' : 'initial'
      });
      
      if (result) {
        setInsights(formatRecommendations(result.recommendations || []));
        setReasoning(result.reasoning || '');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!showAIPanel) return null;

  return (
    <div className="ai-panel fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="ai-panel-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="panel-header flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">AI</span>
            {isFollowUp ? 'Follow-up Insights' : 'Initial Treatment Insights'}
          </h3>
          <div className="flex items-center">
            {isGenerating && (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            )}
            <button
              className="close-button ml-auto text-gray-500 hover:text-gray-700"
              onClick={toggleAIPanel}
              aria-label="Close AI panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {isLoadingSummary ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin h-6 w-6 mr-2" />
              <p>Loading AI insights...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                AI-generated {isFollowUp ? 'follow-up' : 'treatment'} recommendations based on patient data.
                These recommendations are for reference only and should be reviewed by a healthcare provider.
              </p>
              
              <div className="mb-4">
                <div 
                  className="flex justify-between items-center bg-purple-50 p-3 rounded-t-md cursor-pointer"
                  onClick={() => toggleSection('recommendations')}
                >
                  <h4 className="font-medium text-purple-800">Recommendations</h4>
                  {expandedSections.recommendations ? (
                    <ChevronUp className="h-4 w-4 text-purple-800" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-800" />
                  )}
                </div>
                
                {expandedSections.recommendations && (
                  <div className="border border-purple-100 border-t-0 rounded-b-md p-3 bg-white">
                    <ul className="list-disc pl-5 space-y-1">
                      {insights.split('\n').map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div 
                  className="flex justify-between items-center bg-blue-50 p-3 rounded-t-md cursor-pointer"
                  onClick={() => toggleSection('reasoning')}
                >
                  <h4 className="font-medium text-blue-800">Reasoning</h4>
                  {expandedSections.reasoning ? (
                    <ChevronUp className="h-4 w-4 text-blue-800" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-800" />
                  )}
                </div>
                
                {expandedSections.reasoning && (
                  <div className="border border-blue-100 border-t-0 rounded-b-md p-3 bg-white">
                    <p className="text-sm text-gray-700">
                      {reasoning}
                    </p>
                  </div>
                )}
              </div>
              
              {formData && categoryId && consultationId && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Regenerate Insights
                  </button>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                <p>
                  AI insights are generated based on the patient's data and medical history.
                  The recommendations are not a substitute for professional medical judgment.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
