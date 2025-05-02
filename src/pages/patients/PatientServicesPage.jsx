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
        <div className="space-y-8">
          {/* Simple Empty State - Hims-inspired */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden text-center py-12 px-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Health Goals?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Let's see if we can help.</p>
            
            <a 
              href="/marketplace" 
              className="inline-block px-8 py-4 bg-black text-white text-base font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-md"
            >
              + Add Treatment
            </a>
          </div>
          
          {/* Featured Treatment Cards - Full Background with Text Overlay */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hair Loss Card */}
            <div className="rounded-xl overflow-hidden shadow-sm group h-64 relative">
              <img 
                src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Hair Loss Treatment" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white text-xl">Hair Loss</h4>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Rx</span>
                </div>
                <div>
                  <p className="text-white/80 text-sm mb-3">Clinically proven treatments to prevent hair loss and promote regrowth.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">from $39/month</span>
                    <a 
                      href="/marketplace?service=hair-loss" 
                      className="text-white text-sm font-medium bg-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weight Management Card */}
            <div className="rounded-xl overflow-hidden shadow-sm group h-64 relative">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Weight Management" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white text-xl">Weight Management</h4>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Rx</span>
                </div>
                <div>
                  <p className="text-white/80 text-sm mb-3">Medically supervised program with personalized support.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">from $99/month</span>
                    <a 
                      href="/marketplace?service=weight-management" 
                      className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full hover:bg-red-700 transition-colors"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ED Treatment Card */}
            <div className="rounded-xl overflow-hidden shadow-sm group h-64 relative">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="ED Treatment" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white text-xl">ED Treatment</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Rx</span>
                </div>
                <div>
                  <p className="text-white/80 text-sm mb-3">Effective treatments with discreet, professional care.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">from $49/month</span>
                    <a 
                      href="/marketplace?service=ed-treatment" 
                      className="text-white text-sm font-medium bg-blue-600 px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Content - Visual Focus */}
          <div className="bg-amber-100 rounded-xl overflow-hidden shadow-sm">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Doctor with patient" 
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Lose the weight, keep the results</h3>
                <p className="text-white/90 mb-4 max-w-lg">Medically-supervised weight loss program with proven results.</p>
                <a 
                  href="/marketplace?service=weight-management" 
                  className="inline-block px-6 py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-100 transition-colors self-start"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
          
          {/* Patient Success Stories - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Success Story 1 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" 
                  alt="James T." 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">James T.</h4>
                  <p className="text-xs text-gray-500">Weight Management</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">"I've lost 30 pounds in 6 months. The medical support made all the difference."</p>
            </div>
            
            {/* Success Story 2 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" 
                  alt="Robert M." 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Robert M.</h4>
                  <p className="text-xs text-gray-500">Hair Loss Treatment</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">"After 4 months, I'm seeing significant regrowth. The personalized approach keeps me on track."</p>
            </div>
            
            {/* Success Story 3 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" 
                  alt="David K." 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">David K.</h4>
                  <p className="text-xs text-gray-500">ED Treatment</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">"The discreet, professional care has made a tremendous difference in my quality of life."</p>
            </div>
          </div>
          
          {/* Popular Products Section - Carousel Style */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-3 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center">
                <div className="p-1.5 rounded-full mr-2 bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-gray-900">Popular Products</h4>
                <div className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center text-xs font-medium">
                  Trending
                </div>
              </div>
              <a href="/marketplace" className="text-blue-600 text-sm font-medium">View all →</a>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto -mx-4 px-4 product-scroll">
                <div className="flex space-x-4 pb-2 snap-x snap-mandatory">
                  {/* Product 1 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1607185073253-f0cb7b3d1654?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Biotin Supplement" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Biotin Supplement</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Supports healthy hair growth and strength.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$24.99</span>
                        <button className="text-xs text-white px-2 py-1 rounded-full bg-black">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product 2 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Hair Growth Shampoo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Hair Growth Shampoo</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Strengthens hair and reduces breakage.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$18.99</span>
                        <button className="text-xs text-white px-2 py-1 rounded-full bg-black">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product 3 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Fiber Supplement" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Fiber Supplement</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Improves fullness & digestive health.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$19.99</span>
                        <button className="text-xs text-white px-2 py-1 rounded-full bg-black">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product 4 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Daily Multivitamin" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Daily Multivitamin</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">Essential vitamins and minerals for daily health.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$15.99</span>
                        <button className="text-xs text-white px-2 py-1 rounded-full bg-black">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product 5 */}
                  <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Protein Powder" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">Protein Powder</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">High-quality protein for muscle recovery.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">$29.99</span>
                        <button className="text-xs text-white px-2 py-1 rounded-full bg-black">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ModularServiceInterface services={services} />
      )}
    </div>
  );
};

export default PatientServicesPage;
