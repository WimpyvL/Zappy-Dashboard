import { useState, useEffect } from 'react';
import { usePatientServices } from '../apis/patientServices/hooks';
import { useServiceMedications } from '../apis/serviceMedications/hooks'; // Assuming this hook exists
import { useServiceActionItems } from '../apis/serviceActionItems/hooks'; // Assuming this hook exists
import { useResourcesByServiceType } from '../apis/educationalResources/hooks'; // Assuming this hook exists

const usePatientServicesData = (patientId) => {
  const { data: patientServices, isLoading: isLoadingServices, error: errorServices } = usePatientServices(patientId);

  // Assuming hooks for medications, action items, and resources exist and accept serviceId
  // You might need to fetch these for each service, which could be done inside this hook
  // or passed in if fetched elsewhere. For simplicity, let's assume fetching within this hook
  // based on service IDs from patientServices. This would require more complex logic
  // and potentially multiple hook calls or a single API call that fetches related data.
  // For now, let's simulate fetching and processing.

  const [processedServices, setProcessedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded sample recommendations - this should ideally come from an API
  const serviceRecommendations = {
    'weight-management': [
      { id: 1, name: 'Protein Powder', imageUrl: 'https://via.placeholder.com/50', price: 35.00 },
      { id: 2, name: 'Meal Replacement Shakes', imageUrl: 'https://via.placeholder.com/50', price: 40.00 },
    ],
    'diabetes-management': [
      { id: 3, name: 'Glucose Meter', imageUrl: 'https://via.placeholder.com/50', price: 25.00 },
      { id: 4, name: 'Test Strips', imageUrl: 'https://via.placeholder.com/50', price: 15.00 },
    ],
  };


  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (patientServices) {
        setIsLoading(true);
        setError(null);
        try {
          // Simulate fetching related data for each service
          const servicesWithDetails = await Promise.all(patientServices.map(async (service) => {
            // In a real application, you would fetch medications, action items, etc. here
            // const medications = await fetchMedicationsForService(service.id);
            // const actionItems = await fetchActionItemsForService(service.id);
            // const resources = await fetchResourcesForService(service.id);

            // Using placeholder data for now
            const medications = []; // Placeholder
            const actionItems = []; // Placeholder
            const resources = []; // Placeholder
            const recommendations = serviceRecommendations[service.service_type] || [];

            return {
              ...service,
              medications,
              actionItems,
              resources,
              recommendations,
            };
          }));
          setProcessedServices(servicesWithDetails);
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      } else if (!isLoadingServices) {
         setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [patientServices, isLoadingServices]); // Depend on patientServices and its loading state

  return {
    processedServices,
    isLoading: isLoading || isLoadingServices, // Combine loading states
    error: error || errorServices, // Combine error states
  };
};

export default usePatientServicesData;
