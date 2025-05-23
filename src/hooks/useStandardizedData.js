import { useMemo } from 'react';

/**
 * A hook that standardizes data from various API hooks
 * This helps normalize data structures across different API responses
 * 
 * @param {Function} useApiHook - The API hook to use (e.g., useProducts, useServices)
 * @param {Object} params - Optional parameters to pass to the API hook
 * @returns {Object} - Standardized data object with data, isLoading, error, and refetch
 */
export const useStandardizedData = (useApiHook, params = {}) => {
  // Call the API hook with the provided parameters
  const apiResult = useApiHook(params);
  
  // Extract the data, loading state, error, and refetch function
  const { 
    data: rawData, 
    isLoading, 
    error, 
    refetch 
  } = apiResult;
  
  // Standardize the data format
  const data = useMemo(() => {
    if (!rawData) return [];
    
    // Handle different data structures
    if (Array.isArray(rawData)) {
      return rawData;
    }
    
    // Handle data wrapped in a data property
    if (rawData.data && Array.isArray(rawData.data)) {
      return rawData.data;
    }
    
    // Handle data as an object with items
    if (rawData.items && Array.isArray(rawData.items)) {
      return rawData.items;
    }
    
    // Handle data as an object with results
    if (rawData.results && Array.isArray(rawData.results)) {
      return rawData.results;
    }
    
    // If we can't determine the structure, return an empty array
    console.warn('Unable to determine data structure for standardization', rawData);
    return [];
  }, [rawData]);
  
  return {
    data,
    isLoading,
    error,
    refetch,
    rawData
  };
};

export default useStandardizedData;
