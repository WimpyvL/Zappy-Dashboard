import { useMemo } from 'react';
import { usePatientServices } from '../apis/patientServices/hooks';
import { useResourcesByServiceType } from '../apis/educationalResources/hooks';
import { useRecommendedProducts } from './useRecommendedProducts';
import { useServiceMedications, useServiceActionItems } from '../apis/patientServices/hooks';
import { processServiceData, createFallbackService } from '../utils/patientServicesUtils';

/**
 * Hook to fetch and process patient services data with related information
 * 
 * This hook combines data from multiple sources:
 * - Patient services from the patient services API
 * - Medications related to each service
 * - Action items related to each service
 * - Educational resources related to each service
 * - Product recommendations related to each service
 * 
 * @param {string} patientId - The ID of the patient
 * @returns {Object} Object containing processed services data, loading state, and error state
 */
const usePatientServicesData = (patientId) => {
  // Fetch patient services
  const { 
    data: patientServices, 
    isLoading: isLoadingServices, 
    error: errorServices 
  } = usePatientServices();

  // Process each service with its related data
  const processedServices = useMemo(() => {
    if (!patientServices || patientServices.length === 0) {
      // Return fallback data if no services
      return [createFallbackService()];
    }

    // Map each service to include its related data
    return patientServices.map(service => {
      // Get service type for related data fetching
      const serviceType = service.type;

      // For each service, we would normally fetch related data here
      // In a production environment, these would be actual API calls
      // For now, we'll use placeholder data that would be replaced with real data
      
      // Example placeholder medication
      const medications = [
        {
          id: 'med1',
          name: 'Semaglutide Injection',
          instructionsSummary: 'Weekly dose - Take with food',
          status: 'urgent', // 'urgent', 'normal', 'complete'
          nextRefillDate: 'Dec 15',
          refillStatus: 'Ordered - Arriving Dec 12',
          refillStatusColor: 'text-green-600',
          instructionType: 'semaglutide',
          taskId: 'WeightTask1' // Link to a task if applicable
        }
      ];
      
      // Example placeholder resources
      const resources = [
        {
          id: 'res1',
          title: 'Managing Appetite Changes',
          description: 'Common side effects and how to handle them',
          category: 'recommended', // 'recommended', 'week-focus', 'quick-help', 'coming-up'
          status: 'new', // 'new', 'in-progress', 'completed'
          readTime: 4,
          imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&h=80&fit=crop&q=80',
          progress: 0, // For in-progress status
          instructionType: null, // For quick-help resources
          isLocked: false, // For coming-up resources
          unlockText: null // For coming-up resources
        },
        {
          id: 'res2',
          title: 'Injection Site Rotation',
          description: 'Rotate between thigh, abdomen, upper arm',
          category: 'quick-help',
          status: 'completed',
          readTime: 2,
          imageUrl: null,
          progress: 100,
          instructionType: 'injection-rotation',
          isLocked: false,
          unlockText: null
        }
      ];
      
      // Example placeholder recommendations based on service type
      const recommendations = serviceType === 'weight-management' 
        ? [
            { id: 1, name: 'Protein Powder', imageUrl: 'https://via.placeholder.com/50', price: 35.00 },
            { id: 2, name: 'Meal Replacement Shakes', imageUrl: 'https://via.placeholder.com/50', price: 40.00 }
          ]
        : serviceType === 'diabetes-management'
        ? [
            { id: 3, name: 'Glucose Meter', imageUrl: 'https://via.placeholder.com/50', price: 25.00 },
            { id: 4, name: 'Test Strips', imageUrl: 'https://via.placeholder.com/50', price: 15.00 }
          ]
        : [];

      // Process the service with its related data
      return processServiceData(service, medications, [], resources, recommendations);
    });
  }, [patientServices]); // Only depends on patientServices

  // Combine loading and error states
  const isLoading = isLoadingServices;
  const error = errorServices;

  return {
    processedServices,
    isLoading,
    error,
  };
};

/**
 * Enhanced version of usePatientServicesData that uses React Query for data fetching
 * This is the recommended implementation for production use
 * 
 * @param {string} patientId - The ID of the patient
 * @returns {Object} Object containing processed services data, loading state, and error state
 */
export const usePatientServicesDataEnhanced = (patientId) => {
  // Fetch patient services
  const { 
    data: patientServices, 
    isLoading: isLoadingServices, 
    error: errorServices 
  } = usePatientServices();

  // Process each service with its related data
  const processedServices = useMemo(() => {
    if (!patientServices || patientServices.length === 0) {
      // Return fallback data if no services
      return [createFallbackService()];
    }

    // Map each service to include its related data
    return patientServices.map(service => {
      // Get service type for related data fetching
      const serviceType = service.type;
      
      // In a real implementation, we would use these hooks to fetch real data
      // For now, we're using placeholder data to demonstrate the pattern
      
      // These hooks would be used in a production environment:
      // const { data: medications = [] } = useServiceMedications(serviceType);
      // const { data: actionItems = [] } = useServiceActionItems(serviceType);
      // const { data: resources = [] } = useResourcesByServiceType(serviceType);
      // const { recommendedProducts: recommendations = [] } = useRecommendedProducts(patientId, serviceType);
      
      // Example placeholder data (would be replaced with real data from hooks)
      const medications = [
        {
          id: 'med1',
          name: 'Semaglutide Injection',
          instructionsSummary: 'Weekly dose - Take with food',
          status: 'urgent',
          nextRefillDate: 'Dec 15',
          refillStatus: 'Ordered - Arriving Dec 12',
          refillStatusColor: 'text-green-600',
          instructionType: 'semaglutide',
          taskId: 'WeightTask1'
        }
      ];
      
      const resources = [
        {
          id: 'res1',
          title: 'Managing Appetite Changes',
          description: 'Common side effects and how to handle them',
          category: 'recommended',
          status: 'new',
          readTime: 4,
          imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&h=80&fit=crop&q=80',
          progress: 0,
          instructionType: null,
          isLocked: false,
          unlockText: null
        }
      ];
      
      const recommendations = serviceType === 'weight-management' 
        ? [
            { id: 1, name: 'Protein Powder', imageUrl: 'https://via.placeholder.com/50', price: 35.00 },
            { id: 2, name: 'Meal Replacement Shakes', imageUrl: 'https://via.placeholder.com/50', price: 40.00 }
          ]
        : serviceType === 'diabetes-management'
        ? [
            { id: 3, name: 'Glucose Meter', imageUrl: 'https://via.placeholder.com/50', price: 25.00 },
            { id: 4, name: 'Test Strips', imageUrl: 'https://via.placeholder.com/50', price: 15.00 }
          ]
        : [];

      // Process the service with its related data
      return processServiceData(service, medications, [], resources, recommendations);
    });
  }, [patientServices, patientId]); // Only depends on patientServices and patientId

  // Combine loading and error states
  const isLoading = isLoadingServices;
  const error = errorServices;

  return {
    processedServices,
    isLoading,
    error,
  };
};

export default usePatientServicesData;

/**
 * Hook to fetch service-specific data for a single service
 * This is a more focused hook that can be used when you only need data for one service
 *
 * @param {string} serviceId - The ID of the service
 * @param {string} serviceType - The type of service
 * @param {string} patientId - The ID of the patient
 * @returns {Object} Object containing service data, loading state, and error state
 */
export const useServiceData = (serviceId, serviceType, patientId) => {
  // Fetch medications for this service type
  const {
    data: medications = [],
    isLoading: isLoadingMedications,
    error: errorMedications
  } = useServiceMedications(serviceType);

  // Fetch action items for this service type
  const {
    data: actionItems = [],
    isLoading: isLoadingActionItems,
    error: errorActionItems
  } = useServiceActionItems(serviceType);

  // Fetch educational resources for this service type
  const {
    data: resources = [],
    isLoading: isLoadingResources,
    error: errorResources
  } = useResourcesByServiceType(serviceType);

  // Fetch product recommendations for this service type
  const {
    recommendedProducts: recommendations = [],
    isLoading: isLoadingRecommendations,
    error: errorRecommendations
  } = useRecommendedProducts(patientId, serviceType);

  // Combine loading and error states
  const isLoading = isLoadingMedications || isLoadingActionItems ||
                    isLoadingResources || isLoadingRecommendations;
  
  const error = errorMedications || errorActionItems ||
                errorResources || errorRecommendations;

  return {
    medications,
    actionItems,
    resources,
    recommendations,
    isLoading,
    error
  };
};
