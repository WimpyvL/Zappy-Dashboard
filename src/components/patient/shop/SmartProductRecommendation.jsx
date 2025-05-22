import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { evaluateHealthProfile } from '../../../services/recommendationService';

// Mock recommendation rules for development/testing
const mockRules = [
  {
    id: '1',
    name: 'Overweight BMI Rule',
    description: 'Recommends weight management bundle for patients with BMI over 25',
    condition_type: 'bmi',
    condition_value: { operator: 'gt', value: 25 },
    priority: 100,
    product_title: 'Weight Management Bundle',
    product_description: 'Includes GLP-1 medication, nutrition coaching, and progress tracking.',
    reason_text: 'Based on your BMI, our weight management program could help you reach your health goals'
  },
  {
    id: '2',
    name: 'Heart Health Rule',
    description: 'Recommends heart health bundle for patients with hypertension',
    condition_type: 'condition',
    condition_value: { operator: 'includes', value: 'hypertension' },
    priority: 90,
    product_title: 'Heart Health Bundle',
    product_description: 'Includes blood pressure monitoring, medication management, and lifestyle coaching.',
    reason_text: 'This bundle is designed to support your heart health needs'
  },
  {
    id: '3',
    name: 'Energy Boost Rule',
    description: 'Recommends energy bundle for patients with energy goals',
    condition_type: 'goal',
    condition_value: { operator: 'includes', value: 'energy' },
    priority: 80,
    product_title: 'Energy Boost Bundle',
    product_description: 'Includes vitamin B complex, iron supplements, and sleep improvement coaching.',
    reason_text: 'This bundle is designed to help with your energy goals'
  }
];

/**
 * SmartProductRecommendation component that provides personalized product recommendations
 * based on the user's health profile and goals
 * 
 * @param {Object} props - Component props
 * @param {Function} props.handleViewBundle - Handler for viewing the recommended bundle
 * @param {Function} props.handleSkip - Handler for skipping the recommendation
 */
const SmartProductRecommendation = ({ handleViewBundle, handleSkip }) => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use mock rules for now - in production this would use useRecommendationRules()
  const rules = mockRules;
  const isLoadingRules = false;

  // Fetch user health profile and generate recommendation
  useEffect(() => {
    const fetchHealthProfile = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would fetch from an API
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock health profile data
        const healthProfile = {
          bmi: 28.5,
          goals: ['weight_loss', 'energy'],
          conditions: ['hypertension'],
          age: 42
        };
        
        // Generate recommendation based on health profile and rules
        const recommendation = evaluateHealthProfile(healthProfile, rules);
        setRecommendation(recommendation);
      } catch (err) {
        console.error('Error fetching health profile:', err);
        setError('Unable to load personalized recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch health profile if rules are loaded and user is logged in
    if (user && !isLoadingRules) {
      fetchHealthProfile();
    } else if (!user) {
      // Default recommendation for non-logged in users
      setRecommendation({
        title: 'Complete Weight Management Bundle',
        description: 'Includes GLP-1 medication, nutrition coaching, and progress tracking.',
        reason: 'Popular choice for new customers'
      });
      setLoading(false);
    }
  }, [user, rules, isLoadingRules]);

  if (loading) {
    return (
      <div className="ai-recommendation ai-recommendation-loading">
        <div className="ai-recommendation-title">
          <Sparkles />
          <span>Personalizing Recommendations...</span>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-recommendation ai-recommendation-error">
        <div className="ai-recommendation-title text-red-500">
          <AlertCircle />
          <span>Recommendation Unavailable</span>
        </div>
        <div className="ai-recommendation-content">
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-recommendation">
      <div className="ai-recommendation-title">
        <Sparkles />
        <span>AI Recommended for You</span>
      </div>
      <div className="ai-recommendation-content">
        <p className="text-gray-800 font-medium mb-2">
          {recommendation?.reason || 'Based on your health profile and goals:'}
        </p>
        <p className="text-gray-700">
          Our AI suggests the <strong>{recommendation?.title}</strong> which {recommendation?.description}
        </p>
      </div>
      <div className="ai-recommendation-actions">
        <button onClick={handleViewBundle}>View Bundle</button>
        <button onClick={handleSkip}>Skip</button>
      </div>
    </div>
  );
};

export default SmartProductRecommendation;
