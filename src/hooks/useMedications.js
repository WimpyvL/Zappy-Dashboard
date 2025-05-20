import { useState, useEffect, useMemo } from 'react';
import * as medicationService from '../services/medicationService';

/**
 * Hook to fetch and manage medications
 * @param {string} categoryId - Optional category ID to filter by
 * @returns {Object} Object containing medications data and state
 */
export const useMedications = (categoryId = null) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let medications;
        if (categoryId) {
          medications = await medicationService.fetchMedicationsByCategory(categoryId);
        } else {
          medications = await medicationService.fetchMedications();
        }
        
        setData(medications);
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);
  
  // Transform array to object format for easier access
  const medicationsMap = useMemo(() => {
    return data.reduce((acc, medication) => {
      acc[medication.id] = medication;
      return acc;
    }, {});
  }, [data]);
  
  return { 
    medications: data, 
    medicationsMap,
    isLoading, 
    error 
  };
};

export default useMedications;
