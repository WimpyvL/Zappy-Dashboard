import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/auth/AuthContext';

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
        
        // Generate recommendation based on health profile
        const recommendation = generateRecommendation(healthProfile);
        setRecommendation(recommendation);
      } catch (err) {
        console.error('Error fetching health profile:', err);
        setError('Unable to load personalized recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchHealthProfile();
    } else {
      // Default recommendation for non-logged in users
      setRecommendation({
        title: 'Complete Weight Management Bundle',
        description: 'Includes GLP-1 medication, nutrition coaching, and progress tracking.',
        reason: 'Popular choice for new customers'
      });
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Generate a recommendation based on health profile
   * @param {Object} profile - User health profile
   * @returns {Object} Recommendation object
   */
  const generateRecommendation = (profile) => {
    // Logic to determine the best recommendation based on health profile
    if (profile.bmi > 25 && profile.goals.includes('weight_loss')) {
      return {
        title: 'Complete Weight Management Bundle',
        description: 'Includes GLP-1 medication, nutrition coaching, and progress tracking.',
        reason: 'Based on your BMI and weight loss goals'
      };
    } else if (profile.conditions.includes('hypertension')) {
      return {
        title: 'Heart Health Bundle',
        description: 'Includes blood pressure monitoring, supplements, and dietary guidance.',
        reason: 'Tailored for your cardiovascular health needs'
      };
    } else if (profile.goals.includes('energy')) {
      return {
        title: 'Energy & Vitality Pack',
        description: 'Includes vitamin B complex, adaptogenic herbs, and sleep improvement guide.',
        reason: 'Designed to boost your energy levels'
      };
    } else {
      return {
        title: 'Wellness Essentials Bundle',
        description: 'A comprehensive package for overall health maintenance.',
        reason: 'Great for general wellness support'
      };
    }
  };

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
