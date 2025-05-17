import { useState, useEffect } from 'react';
import { usePatientServices } from '../apis/patientServices/hooks';
import { useResourcesByServiceType } from '../apis/educationalResources/hooks'; // Assuming this hook exists

const usePatientServicesData = (patientId) => {
  // If patientId is null, don't try to fetch data
  const { data: patientServices, isLoading: isLoadingServices, error: errorServices } = usePatientServices();

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
      if (patientServices && patientServices.length > 0) {
        setIsLoading(true);
        setError(null);
        try {
          // Simulate fetching related data for each service with more structured placeholder data
          const servicesWithDetails = patientServices.map((service) => {
            // Using more structured placeholder data
            const medications = [
                // Example placeholder medication
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
                },
                // Add other placeholder medications as needed
            ];
            const actionItems = []; // Placeholder
            const resources = [
                // Example placeholder resources
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
                },
                // Add other placeholder resources as needed
            ];
            const recommendations = serviceRecommendations[service.service_type] || [];

            // Placeholder data for service progress and status
            const progressTitle = `${service.name} Progress`;
            const progressSubtitle = 'Updates';
            const progressStatus = 'Active';
            const progressToGoalText = 'Progress to goal';
            const progressPercentage = 0; // Example

            // Placeholder data for status bar
            const nextRefillDate = 'N/A'; // Should come from medications
            const upcomingRefills = []; // Should come from medications
            const nextCheckinDate = 'N/A'; // Should come from action items or service data
            const checkinStatus = 'normal'; // 'overdue', 'due-today', 'due-tomorrow', 'due-in-two-days', 'normal'

            // Placeholder for priority task
            const priorityTask = {
                text: `Your ${service.name} task is due`,
                taskId: null // Link to a task if applicable
            };


            return {
              ...service,
              medications,
              actionItems,
              resources,
              recommendations,
              progressTitle,
              progressSubtitle,
              progressStatus,
              progressToGoalText,
              progressPercentage,
              nextRefillDate,
              upcomingRefills,
              nextCheckinDate,
              checkinStatus,
              priorityTask
            };
          });
          setProcessedServices(servicesWithDetails);
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      } else if (!isLoadingServices) {
         // If no patientServices are fetched and not loading, provide fallback placeholder data
         setProcessedServices([
             {
                id: 'fallback-service-1',
                name: 'Placeholder Program',
                service_type: 'placeholder',
                medications: [],
                actionItems: [],
                resources: [],
                recommendations: [],
                progressTitle: 'Progress N/A',
                progressSubtitle: 'No data available',
                progressStatus: 'Inactive',
                progressToGoalText: 'N/A',
                progressPercentage: 0,
                nextRefillDate: 'N/A',
                upcomingRefills: [],
                nextCheckinDate: 'N/A',
                checkinStatus: 'normal',
                priorityTask: null
             }
         ]);
         setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [patientServices, isLoadingServices, serviceRecommendations]); // Depend on patientServices, isLoadingServices, and serviceRecommendations

  return {
    processedServices,
    isLoading: isLoading || isLoadingServices, // Combine loading states
    error: error || errorServices, // Combine error states
  };
};

export default usePatientServicesData;
