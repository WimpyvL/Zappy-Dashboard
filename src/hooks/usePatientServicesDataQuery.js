import React from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { usePatientServices } from '../apis/patientServices/hooks';
import { useResourcesByServiceType } from '../apis/educationalResources/hooks';
import { useRecommendedProducts } from './useRecommendedProducts';
import { processServiceData, createFallbackService } from '../utils/patientServicesUtils';

/**
 * Fetch service-specific data for a single service
 * @param {string} serviceType - The type of service
 * @param {string} patientId - The ID of the patient
 * @returns {Object} Object containing service data
 */
const fetchServiceData = async (serviceType, patientId) => {
  // These would be actual API calls in a production environment
  // For now, we're using placeholder data to demonstrate the pattern
  
  // Example placeholder medication
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
  
  // Example placeholder resources
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
    
  // Example placeholder action items
  const actionItems = [];
  
  return {
    medications,
    actionItems,
    resources,
    recommendations
  };
};

/**
 * React Query implementation of usePatientServicesData
 * This hook uses React Query for efficient data fetching and caching
 * 
 * @param {string} patientId - The ID of the patient
 * @returns {Object} Object containing processed services data, loading state, and error state
 */
const usePatientServicesDataQuery = (patientId) => {
  // Query for patient services
  const servicesQuery = useQuery({
    queryKey: ['patientServices', patientId],
    queryFn: () => usePatientServices().data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!patientId
  });
  
  // Extract data from the services query
  const { data: patientServices, isLoading: isLoadingServices, error: errorServices } = servicesQuery;
  
  // If we have services, create parallel queries for each service's related data
  const serviceDataQueries = useQueries({
    queries: (patientServices || []).map(service => ({
      queryKey: ['serviceData', service.id, service.type, patientId],
      queryFn: () => fetchServiceData(service.type, patientId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!patientServices && !!service.id && !!service.type && !!patientId
    }))
  });
  
  // Check if all service data queries are loading
  const isLoadingServiceData = serviceDataQueries.some(query => query.isLoading);
  
  // Check if any service data query has an error
  const serviceDataError = serviceDataQueries.find(query => query.error)?.error;
  
  // Process services with their related data
  const processedServices = React.useMemo(() => {
    if (!patientServices || patientServices.length === 0) {
      return [createFallbackService()];
    }
    
    return patientServices.map((service, index) => {
      const serviceData = serviceDataQueries[index]?.data || {
        medications: [],
        actionItems: [],
        resources: [],
        recommendations: []
      };
      
      return processServiceData(
        service,
        serviceData.medications,
        serviceData.actionItems,
        serviceData.resources,
        serviceData.recommendations
      );
    });
  }, [patientServices, serviceDataQueries]);
  
  // Combine loading and error states
  const isLoading = isLoadingServices || isLoadingServiceData;
  const error = errorServices || serviceDataError;
  
  return {
    processedServices,
    isLoading,
    error
  };
};

export default usePatientServicesDataQuery;