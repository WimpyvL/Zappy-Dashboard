import { useState, useEffect } from 'react';
import ContentRecommendationEngine from '../utils/ContentRecommendationEngine'; // Assuming the class is exported as default

// Placeholder functions - replace with actual API calls
const getUserData = async (userId) => {
  // Fetch user data from your backend/database
  console.log(`Fetching user data for user: ${userId}`);
  return { id: userId, age: 35, gender: 'female', preferences: ['nutrition', 'exercise'] };
};

const getProgramProgress = async (userId, programId) => {
  // Fetch user's progress for a specific program
  console.log(`Fetching progress for user ${userId} in program ${programId}`);
  return { programId, currentStage: 2, completionPercentage: 40 };
};

const getContentInteractions = async (userId, programId) => {
  // Fetch user's interactions with content (views, time spent, completion)
  console.log(`Fetching content interactions for user ${userId} in program ${programId}`);
  return {}; // Placeholder
};

const getStageContent = async (programId, stage) => {
  // Fetch base content for a specific program stage
  console.log(`Fetching stage content for program ${programId}, stage ${stage}`);
  // This should fetch from your database based on the schema
  // For now, using the static structure as a fallback/example
  const programStructure = PROGRAM_CONTENT_STRUCTURE[programId];
  if (programStructure && programStructure.stages[`week${stage}`]) {
    return Object.values(programStructure.stages[`week${stage}`].sections).flat();
  }
  return [];
};

const getPersonalizationRules = async (programId) => {
  // Fetch personalization rules for a program
  console.log(`Fetching personalization rules for program ${programId}`);
  // This should fetch from your database based on the schema
  // For now, using the static rules JSON as a fallback/example
  return Object.values(PERSONALIZATION_RULES);
};

const evaluateCondition = (conditions, userData, progress) => {
  // Implement logic to evaluate personalization rule conditions
  console.log('Evaluating condition:', conditions);
  // This is a simplified example; a real implementation would need a robust rule engine
  try {
    // Basic evaluation for demonstration
    if (conditions.user_attributes && conditions.user_attributes.age) {
      if (conditions.user_attributes.age.startsWith('>=')) {
        const ageThreshold = parseInt(conditions.user_attributes.age.substring(2), 10);
        if (userData.age >= ageThreshold) return true;
      }
      // Add other condition types as needed
    }
    if (conditions.user_attributes && conditions.user_attributes.gender) {
      if (conditions.user_attributes.gender === userData.gender) return true;
    }
     if (conditions.progress && conditions.progress.stage) {
      if (conditions.progress.stage.startsWith('>=')) {
        const stageThreshold = parseInt(conditions.progress.stage.substring(2), 10);
        if (progress.currentStage >= stageThreshold) return true;
      }
    }
     if (conditions.progress && conditions.progress.completion) {
      if (conditions.progress.completion.endsWith('%')) {
        const completionThreshold = parseInt(conditions.progress.completion.slice(0, -1), 10);
        if (progress.completionPercentage < completionThreshold) return true;
      }
    }

  } catch (e) {
    console.error('Error evaluating condition:', e);
    return false;
  }
  return false; // Default to false if condition not met or evaluation fails
};

const applyContentAdjustments = (item, adjustments) => {
   console.log('Applying adjustments:', adjustments, 'to item:', item);
  // Implement logic to apply content adjustments (add, modify, prioritize)
  // This is a simplified example
  let modifiedItem = { ...item };
  if (adjustments.modify && adjustments.modify[item.id]) {
      // Example: change content based on modification rule
      modifiedItem.content_html = `<p>${adjustments.modify[item.id]} specific content for ${item.title}</p>`;
  }
  // 'add_content' and 'prioritize' logic would be handled in the engine's main flow
  return modifiedItem;
};


const getCachedContent = (programId) => {
  // Implement caching logic (e.g., using localStorage or a state management library)
  console.log(`Checking cache for program ${programId}`);
  return null; // Placeholder
};

const setCachedContent = (programId, content) => {
  // Implement caching logic
  console.log(`Setting cache for program ${programId}`);
};

const getCurrentUserId = () => {
  // Get the current logged-in user's ID
  console.log('Getting current user ID');
  return 123; // Placeholder
};

const markContentAsComplete = async (userId, programId, contentId) => {
  // API call to mark content as complete for the user
  console.log(`Marking content ${contentId} as complete for user ${userId} in program ${programId}`);
  // Implement actual API call
};

const PROGRAM_CONTENT_STRUCTURE = {
  weightLoss: {
    id: 'weight-loss',
    name: 'Weight Loss',
    category: 'medications',
    stages: {
      week1: {
        title: 'Getting Started',
        sections: {
          recommended: [
            {
              id: 'understanding-glp1',
              title: 'Understanding GLP-1 Medications',
              description: 'How these medications work in your body',
              contentType: 'medication_guide',
              readingTime: 4,
              priority: 1,
              tags: ['semaglutide', 'mechanism', 'basics']
            }
          ],
          weekFocus: [
            {
              id: 'injection-basics',
              title: 'Injection Basics',
              description: 'Step-by-step guide for your first injection',
              contentType: 'usage_guide',
              readingTime: 5,
              priority: 1
            }
          ],
          quickHelp: [
            {
              id: 'injection-rotation',
              title: 'Injection Site Rotation',
              description: 'Rotate between thigh, abdomen, upper arm',
              contentType: 'quick_tip'
            },
            {
              id: 'missed-dose',
              title: 'What if I miss a dose?',
              description: 'Guidelines for delayed injections',
              contentType: 'quick_tip'
            }
          ]
        }
      },
      week2: {
        title: 'Building Habits',
        sections: {
          recommended: [
            {
              id: 'managing-appetite',
              title: 'Managing Appetite Changes',
              description: 'Common side effects and how to handle them',
              contentType: 'side_effect',
              readingTime: 4,
              isNew: true
            }
          ],
          weekFocus: [
            {
              id: 'nutrition-basics',
              title: 'Nutrition Basics',
              description: 'How to read labels and make healthy choices',
              contentType: 'usage_guide',
              readingTime: 5,
              isCompleted: true
            }
          ]
        }
      }
      // ... more weeks
    }
  },
  
  hairLoss: {
    id: 'hair-loss',
    name: 'Hair Loss Treatment',
    category: 'medications',
    stages: {
      month1: {
        title: 'Starting Treatment',
        sections: {
          recommended: [
            {
              id: 'minoxidil-guide',
              title: 'Understanding Minoxidil',
              description: 'How this treatment promotes hair growth',
              contentType: 'medication_guide',
              readingTime: 6
            }
          ],
          weekFocus: [
            {
              id: 'application-technique',
              title: 'Proper Application Technique',
              description: 'Getting the most from your treatment',
              contentType: 'usage_guide',
              readingTime: 4
            }
          ]
        }
      }
    }
  },

  antiAging: {
    id: 'anti-aging',
    name: 'Anti-Aging',
    category: 'wellness',
    stages: {
      week1: {
        title: 'Skin Health Fundamentals',
        sections: {
          recommended: [
            {
              id: 'retinoid-science',
              title: 'The Science of Retinoids',
              description: 'How retinoids improve skin texture and appearance',
              contentType: 'condition_info',
              readingTime: 7
            }
          ]
        }
      }
    }
  }
};

const PERSONALIZATION_RULES = {
  "age_based": {
    "condition": "user.age >= 50",
    "adjustments": {
      "add_content": ["metabolism-after-50", "joint-friendly-exercise"],
      "prioritize": ["gradual-weight-loss"]
    }
  },
  
  "gender_based": {
    "condition": "user.gender === 'female'",
    "adjustments": {
      "add_content": ["womens-health-considerations", "menstrual-cycle-weight"],
      "modify": {
        "exercise-recommendations": "female-focused-content"
      }
    }
  },
  
  "progress_based": {
    "condition": "user.progress.stage >= 4 && user.progress.completion < 50%",
    "adjustments": {
      "add_content": ["motivation-strategies", "overcoming-plateaus"],
      "prioritize": ["quick-wins"]
    }
  }
};


export const useProgramContent = (programId, options = {}) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const recommendationEngine = new ContentRecommendationEngine();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Check for cached content first
        const cached = getCachedContent(programId);
        if (cached && !options.forceRefresh) {
          setContent(cached);
          setLoading(false);
          return;
        }
        
        // Fetch personalized content
        const personalizedContent = await recommendationEngine.getPersonalizedContent(
          getCurrentUserId(),
          programId,
          options
        );
        
        // Cache the result
        setCachedContent(programId, personalizedContent);
        setContent(personalizedContent);
        
      } catch (err) {
        setError(err);
        // Fallback to static content if personalization fails
        const fallbackContent = PROGRAM_CONTENT_STRUCTURE[programId];
        setContent(fallbackContent);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [programId, options.forceRefresh]);
  
  const refreshContent = () => {
    setContent(null);
    setError(null);
    fetchContent();
  };
  
  const markContentComplete = async (contentId) => {
    try {
      await markContentAsComplete(getCurrentUserId(), programId, contentId);
      refreshContent(); // Refresh to update recommendations
    } catch (err) {
      console.error('Error marking content complete:', err);
    }
  };
  
  return {
    content,
    loading,
    error,
    refreshContent,
    markContentComplete
  };
};
