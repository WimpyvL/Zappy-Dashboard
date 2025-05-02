import React, { useState, useEffect } from 'react';
import ModularServiceInterface from '../../components/patient/ModularServiceInterface';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import { usePatientServices, useServiceMedications, useServiceActionItems } from '../../apis/patientServices/hooks';
import { useRecommendedProducts } from '../../hooks/useRecommendedProducts';

/**
 * PatientServicesPage - A page component that displays a patient's enrolled services
 * using the modular interface design.
 */
const PatientServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { data: patientServices, isLoading: servicesLoading, error: servicesError } = usePatientServices();
  const { data: recommendedProducts, isLoading: productsLoading } = useRecommendedProducts();
  
  useEffect(() => {
    // Process data when patient services and recommended products are loaded
    if (!servicesLoading && !productsLoading && patientServices) {
      try {
        // Transform patient services data into the format expected by ModularServiceInterface
        const formattedServices = patientServices.map(service => {
          // Find recommendations for this service
          const serviceRecommendations = recommendedProducts?.filter(
            product => service.productCategories?.includes(product.category)
          ) || [];
          
          return {
            id: service.id,
            name: service.name,
            type: service.type,
            status: service.status,
            // We'll fetch medications and action items separately in the component
            // This is just the initial structure
            medications: [],
            actionItems: [],
            recommendations: serviceRecommendations.map(product => ({
              name: product.name,
              description: product.description,
              price: product.price.toFixed(2),
              imageUrl: product.imageUrl
            }))
          };
        });
        
        setServices(formattedServices);
        setLoading(false);
      } catch (err) {
        console.error('Error formatting service data:', err);
        setError('Failed to process service data');
        setLoading(false);
      }
    }
  }, [patientServices, recommendedProducts, servicesLoading, productsLoading]);
  
  // Handle error states
  useEffect(() => {
    if (servicesError) {
      setError('Failed to load your services data');
      setLoading(false);
    }
  }, [servicesError]);
  
  // Sample data for development/testing
  const sampleServices = [
    {
      id: '1',
      name: 'Hair Loss Treatment',
      type: 'hair-loss',
      status: 'Active',
      medications: [
        {
          name: 'Finasteride 1mg',
          instructions: 'Take 1 tablet daily',
          imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Minoxidil 5% Solution',
          instructions: 'Apply 1ml to affected areas twice daily',
          imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        }
      ],
      actionItems: [
        {
          title: 'Scalp Check-in',
          description: 'Take photos of your scalp to track progress',
          icon: 'camera',
          buttonText: 'Start'
        },
        {
          title: 'Monthly Assessment',
          description: 'Complete your monthly hair loss questionnaire',
          icon: 'assessment',
          buttonText: 'Complete'
        }
      ],
      recommendations: [
        {
          name: 'Biotin Supplement',
          description: 'Supports healthy hair growth and strength.',
          price: '24.99',
          imageUrl: 'https://images.unsplash.com/photo-1607185073253-f0cb7b3d1654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Hair Growth Shampoo',
          description: 'Strengthens hair and reduces breakage.',
          price: '18.99',
          imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    {
      id: '2',
      name: 'Weight Management',
      type: 'weight-management',
      status: 'Active',
      medications: [
        {
          name: 'Semaglutide Injection',
          instructions: 'Inject 0.25mg once weekly',
          imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        }
      ],
      actionItems: [
        {
          title: 'Weekly Weigh-in',
          description: 'Record your weight to track progress',
          icon: 'weight',
          buttonText: 'Log Weight'
        },
        {
          title: 'Food Journal',
          description: 'Log your meals for the day',
          icon: 'food',
          buttonText: 'Start'
        }
      ],
      recommendations: [
        {
          name: 'Fiber Supplement',
          description: 'Improves fullness & digestive health.',
          price: '19.99',
          imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
        }
      ]
    }
  ];
  
  // Create state for medications and action items
  const [serviceTypes, setServiceTypes] = useState([]);
  
  // Extract service types when services are loaded
  useEffect(() => {
    if (services.length > 0) {
      const types = services.map(service => service.type);
      setServiceTypes(types);
    }
  }, [services]);
  
  // Fetch medications for each service type
  const { data: hairLossMedications, isLoading: hairLossMedsLoading } = useServiceMedications('hair-loss');
  const { data: weightManagementMedications, isLoading: weightManagementMedsLoading } = useServiceMedications('weight-management');
  const { data: edMedications, isLoading: edMedsLoading } = useServiceMedications('ed-treatment');
  
  // Fetch action items for each service type
  const { data: hairLossActionItems, isLoading: hairLossActionsLoading } = useServiceActionItems('hair-loss');
  const { data: weightManagementActionItems, isLoading: weightManagementActionsLoading } = useServiceActionItems('weight-management');
  const { data: edActionItems, isLoading: edActionsLoading } = useServiceActionItems('ed-treatment');
  
  // Update services with medications and action items
  useEffect(() => {
    if (services.length === 0) return;
    
    const medicationsMap = {
      'hair-loss': hairLossMedications,
      'weight-management': weightManagementMedications,
      'ed-treatment': edMedications
    };
    
    const actionItemsMap = {
      'hair-loss': hairLossActionItems,
      'weight-management': weightManagementActionItems,
      'ed-treatment': edActionItems
    };
    
    const updatedServices = services.map(service => {
      return {
        ...service,
        medications: medicationsMap[service.type] || [],
        actionItems: actionItemsMap[service.type] || []
      };
    });
    
    setServices(updatedServices);
  }, [
    services, 
    hairLossMedications, weightManagementMedications, edMedications,
    hairLossActionItems, weightManagementActionItems, edActionItems
  ]);
  
  // Determine whether to show services or empty state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('view') || 'default';
    
    if (process.env.NODE_ENV === 'development') {
      if (viewMode === 'empty') {
        // Force empty state for testing
        setServices([]);
        setLoading(false);
      } else if (!patientServices && !servicesLoading && viewMode !== 'empty') {
        // Use sample data in development mode when not explicitly showing empty state
        setServices(sampleServices);
        setLoading(false);
      }
    } else {
      // In production, only show services if they exist in the database
      if (!servicesLoading && patientServices) {
        if (patientServices.length === 0) {
          setServices([]);
        }
        setLoading(false);
      }
    }
  }, [patientServices, servicesLoading]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        title="My Health Services" 
        description="Manage all your health services in one place"
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Explore Available Health Services</h3>
              <p className="text-gray-600 mb-6">Discover our range of personalized health services designed to meet your specific needs.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hair Loss Treatment Card */}
                <div className="bg-blue-50 rounded-lg overflow-hidden border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="h-3 bg-blue-500"></div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </span>
                      <h4 className="font-semibold text-blue-800">Hair Loss Treatment</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Personalized treatment plans to prevent hair loss and promote regrowth.</p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-4">
                      <li className="flex items-start">
                        <svg className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        FDA-approved medications
                      </li>
                      <li className="flex items-start">
                        <svg className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Regular progress tracking
                      </li>
                    </ul>
                    <a 
                      href="/marketplace?service=hair-loss" 
                      className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
                
                {/* Weight Management Card */}
                <div className="bg-red-50 rounded-lg overflow-hidden border border-red-100 hover:shadow-md transition-shadow">
                  <div className="h-3 bg-red-500"></div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <h4 className="font-semibold text-red-800">Weight Management</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Comprehensive programs to help you achieve and maintain a healthy weight.</p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-4">
                      <li className="flex items-start">
                        <svg className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Medically supervised programs
                      </li>
                      <li className="flex items-start">
                        <svg className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Nutritional guidance included
                      </li>
                    </ul>
                    <a 
                      href="/marketplace?service=weight-management" 
                      className="block w-full text-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
                
                {/* ED Treatment Card */}
                <div className="bg-purple-50 rounded-lg overflow-hidden border border-purple-100 hover:shadow-md transition-shadow">
                  <div className="h-3 bg-purple-500"></div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <h4 className="font-semibold text-purple-800">ED Treatment</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Effective treatments for erectile dysfunction with discreet care.</p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-4">
                      <li className="flex items-start">
                        <svg className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Discreet packaging
                      </li>
                      <li className="flex items-start">
                        <svg className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Ongoing provider support
                      </li>
                    </ul>
                    <a 
                      href="/marketplace?service=ed-treatment" 
                      className="block w-full text-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Not sure which service is right for you?
              </p>
              <div className="flex gap-3">
                <a 
                  href="/marketplace" 
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View All Services
                </a>
                <a 
                  href="/support" 
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Resources</h3>
            <p className="text-gray-600 mb-4">Explore our library of educational resources to learn more about various health topics.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <a href="/resources?category=hair-health" className="group block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Hair Health</h4>
                <p className="text-sm text-gray-600 mt-1">Learn about maintaining healthy hair and preventing hair loss.</p>
              </a>
              <a href="/resources?category=weight-management" className="group block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Weight Management</h4>
                <p className="text-sm text-gray-600 mt-1">Discover healthy approaches to weight management and nutrition.</p>
              </a>
              <a href="/resources?category=mens-health" className="group block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Men's Health</h4>
                <p className="text-sm text-gray-600 mt-1">Explore topics related to men's health and wellness.</p>
              </a>
            </div>
            
            <div className="mt-4 text-center">
              <a href="/resources" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                View All Resources
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <ModularServiceInterface services={services} />
      )}
      
      {/* Educational Resources Section would go here */}
      
      {/* Recommended Products Section would go here */}
    </div>
  );
};

export default PatientServicesPage;
