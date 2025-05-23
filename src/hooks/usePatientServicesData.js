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
  // This implementation is deprecated
  // Use usePatientServicesDataEnhanced instead which properly handles real data fetching
  
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

    // Return the services with minimal processing
    // Note: For full data integration, use usePatientServicesDataEnhanced
    return patientServices.map(service => {
      return processServiceData(service, [], [], [], []);
    });
  }, [patientServices]);

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

  // Get the primary service type (typically the first one)
  // In a real app, we might want to fetch data for all service types
  // but that would require a more complex implementation
  const primaryServiceType = useMemo(() => {
    if (!patientServices || patientServices.length === 0) return null;
    return patientServices[0].type;
  }, [patientServices]);

  // Fetch data for the primary service type
  const { 
    data: medications = [], 
    isLoading: isLoadingMeds 
  } = useServiceMedications(primaryServiceType);
  
  const { 
    data: actionItems = [], 
    isLoading: isLoadingActions 
  } = useServiceActionItems(primaryServiceType);
  
  const { 
    data: resources = [], 
    isLoading: isLoadingResources 
  } = useResourcesByServiceType(primaryServiceType);
  
  const { 
    recommendedProducts: recommendations = [], 
    isLoading: isLoadingRecommendations 
  } = useRecommendedProducts(patientId, primaryServiceType);

  // Process the services with their related data
  const processedServices = useMemo(() => {
    if (!patientServices || patientServices.length === 0) {
      // Return fallback data if no services
      return [createFallbackService()];
    }

    // Map each service to include its related data
    return patientServices.map(service => {
      // We're only fetching data for the primary service type,
      // so only include the detailed data for that service
      if (service.type === primaryServiceType) {
        return processServiceData(
          service, 
          medications, 
          actionItems, 
          resources, 
          recommendations
        );
      } 
      
      // For other service types, use empty arrays
      return processServiceData(service, [], [], [], []);
    });
  }, [patientServices, primaryServiceType, medications, actionItems, resources, recommendations]);

  // Combine loading and error states from all queries
  const isLoading = isLoadingServices || isLoadingMeds || isLoadingActions || 
                    isLoadingResources || isLoadingRecommendations;
  
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
