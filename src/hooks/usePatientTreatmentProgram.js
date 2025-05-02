import { useState, useEffect } from 'react';
import { usePatientSubscription } from '../apis/treatmentPackages/hooks';

/**
 * Hook to get a patient's treatment program details
 * @param {string} patientId - The patient ID
 * @returns {Object} Object containing program data and loading state
 */
export const usePatientTreatmentProgram = (patientId) => {
  const [program, setProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch the patient's subscription
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription,
    error: subscriptionError
  } = usePatientSubscription(patientId);
  
  useEffect(() => {
    // If subscription is still loading, wait
    if (isLoadingSubscription) return;
    
    // If there was an error fetching the subscription
    if (subscriptionError) {
      setError(subscriptionError);
      setIsLoading(false);
      return;
    }
    
    // If no subscription, set program to null
    if (!subscription) {
      setProgram(null);
      setIsLoading(false);
      return;
    }
    
    // For now, we'll create a mock program based on the subscription data
    // In a real implementation, this would fetch the actual program data from the API
    const mockProgram = {
      name: subscription.packageName || "Weight Management Program - Phase 1",
      goal: "Lose 5-10% of body weight in 3 months.",
      duration: `${subscription.durationMonths || 3} Months`,
      currentWeek: Math.min(Math.floor(Math.random() * 10) + 1, subscription.durationMonths * 4 || 12),
      tasks: [
        { id: 't1', description: "Log meals daily", completed: true },
        { id: 't2', description: "Complete 30 min walk (Mon, Wed, Fri)", completed: true },
        { id: 't3', description: "Attend weekly check-in call", completed: false },
        { id: 't4', description: "Read 'Healthy Eating Guide'", completed: false },
      ],
      progress: [ // Example progress data points
        { week: 1, metric: 'Weight', value: 210, unit: 'lbs' },
        { week: 2, metric: 'Weight', value: 208, unit: 'lbs' },
        { week: 3, metric: 'Weight', value: 207, unit: 'lbs' },
        { week: 4, metric: 'Weight', value: 205, unit: 'lbs' },
      ],
      resources: [
        { id: 'r1', title: "Healthy Eating Guide", type: "PDF" },
        { id: 'r2', title: "Exercise Video: Low Impact Cardio", type: "Video" },
      ],
      coach: { name: "Dr. Emily Carter", id: "provider-1" },
      treatmentType: subscription.packageCondition || "weight-management"
    };
    
    setProgram(mockProgram);
    setIsLoading(false);
  }, [patientId, subscription, isLoadingSubscription, subscriptionError]);
  
  return {
    data: program,
    isLoading,
    error
  };
};
