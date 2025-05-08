import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModularServiceInterface from '../../components/patient/ModularServiceInterface';
import { usePatientServices, useServiceMedications, useServiceActionItems } from '../../apis/patientServices/hooks';
import useToast from '../../hooks/useToast';
import PatientServicesEmptyState from './PatientServicesEmptyState';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MedicationInstructionsModal from '../../components/patient/MedicationInstructionsModal';
import WeightConfirmationModal from '../../components/patient/WeightConfirmationModal';

/**
 * ModularPatientServicesPage - A category-first approach to displaying patient services
 * 
 * This component implements the modular patient interface design as shown in the mockups.
 * It organizes services by health categories and displays them in a modular format.
 */
const ModularPatientServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: patientServices, isLoading, error } = usePatientServices();
  const [greeting, setGreeting] = useState('Good morning');
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for medication instructions modal
  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  
  // Handler for viewing medication instructions
  const handleViewMedicationInstructions = (medication) => {
    setSelectedMedication(medication);
    setMedicationModalOpen(true);
  };
  
  // Handler for closing medication instructions modal
  const handleCloseMedicationModal = () => {
    setMedicationModalOpen(false);
    setSelectedMedication(null);
  };

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch medications for weight management service
  const { data: weightMedications } = useServiceMedications('weight-management');
  
  // Fetch medications for hair loss service
  const { data: hairMedications } = useServiceMedications('hair-loss');
  
  // Fetch medications for ED service
  const { data: edMedications } = useServiceMedications('ed-treatment');
  
  // Fetch action items for weight management service
  const { data: weightActionItems } = useServiceActionItems('weight-management');
  
  // Fetch action items for hair loss service
  const { data: hairActionItems } = useServiceActionItems('hair-loss');
  
  // Fetch action items for ED service
  const { data: edActionItems } = useServiceActionItems('ed-treatment');
  
  // Sample product recommendations for each service type
  const serviceRecommendations = {
    'weight-management': [
      {
        id: 'fiber-supplement',
        name: 'Fiber Supplement',
        description: 'Improves fullness & digestive health.',
        price: 19.99,
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'protein-powder',
        name: 'Protein Powder',
        description: 'High-quality protein for muscle recovery.',
        price: 29.99,
        imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'multivitamin',
        name: 'Daily Multivitamin',
        description: 'Essential vitamins and minerals for daily health.',
        price: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      }
    ],
    'hair-loss': [
      {
        id: 'biotin-supplement',
        name: 'Biotin Supplement',
        description: 'Supports healthy hair growth.',
        price: 24.99,
        imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'scalp-massager',
        name: 'Scalp Massager',
        description: 'Stimulates blood flow to the scalp.',
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      }
    ],
    'ed-treatment': [
      {
        id: 'l-arginine',
        name: 'L-Arginine Supplement',
        description: 'Supports healthy blood flow.',
        price: 22.99,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'vitamin-d',
        name: 'Vitamin D3',
        description: 'Essential for overall health and hormone production.',
        price: 18.99,
        imageUrl: 'https://images.unsplash.com/photo-1584017121259-3f432d15a6c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
      }
    ]
  };
  
  // Process services data to include medications and action items
  const [processedServices, setProcessedServices] = useState([]);
  
  useEffect(() => {
    if (!patientServices || patientServices.length === 0) return;
    
    const servicesWithDetails = patientServices.map(service => {
      let medications = [];
      let actionItems = [];
      let recommendations = [];
      
      // Assign medications based on service type
      if (service.type === 'weight-management') {
        medications = weightMedications || [];
        actionItems = weightActionItems || [];
        recommendations = serviceRecommendations['weight-management'] || [];
      } else if (service.type === 'hair-loss') {
        medications = hairMedications || [];
        actionItems = hairActionItems || [];
        recommendations = serviceRecommendations['hair-loss'] || [];
      } else if (service.type === 'ed-treatment') {
        medications = edMedications || [];
        actionItems = edActionItems || [];
        recommendations = serviceRecommendations['ed-treatment'] || [];
      }
      
      // Return service with medications and action items
      return {
        ...service,
        medications,
        actionItems,
        recommendations
      };
    });
    
    setProcessedServices(servicesWithDetails);
  }, [
    patientServices, 
    weightMedications, hairMedications, edMedications,
    weightActionItems, hairActionItems, edActionItems,
    serviceRecommendations
  ]);

  // State for cart
  const [cartCount, setCartCount] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Handler functions
  const handleAddProduct = async (product, service) => {
    try {
      setIsAddingToCart(true);
      
      // In a real implementation, this would save to the database
      // await cartApi.addToCart({
      //   productId: product.id,
      //   quantity: 1,
      //   userId: user.id,
      //   price: product.price // Store the displayed price to ensure consistency
      // });
      
      // Update cart count in UI
      setCartCount(prevCount => prevCount + 1);
      
      showToast('success', `${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showToast('error', 'Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleCheckIn = () => {
    showToast('success', 'Check-in initiated for weight treatment');
  };
  
  const handleMessageProvider = () => {
    navigate('/messaging');
    showToast('info', 'Messaging provider');
  };
  
  const handleReferral = () => {
    showToast('info', 'Referral link copied to clipboard!');
  };
  
  const handleMarkDone = () => {
    showToast('success', 'Medication marked as taken!');
  };
  
  const handleTakePhotos = () => {
    navigate('/patients/progress-photos');
    showToast('info', 'Taking progress photos');
  };
  
  // State for weight logging
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for weight confirmation modal
  const [weightConfirmationOpen, setWeightConfirmationOpen] = useState(false);
  const [previousWeight, setPreviousWeight] = useState(null);
  const [goalWeight, setGoalWeight] = useState(180); // Example goal weight
  
  const handleLogWeight = (action, service) => {
    // Open weight input modal
    setWeightModalOpen(true);
  };
  
  const submitWeight = async () => {
    if (!weight || isNaN(parseFloat(weight))) {
      showToast('error', 'Please enter a valid weight');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would save to the database and get the previous weight
      // const response = await patientServicesApi.logPatientWeight(user.id, weight, new Date().toISOString());
      // const previousWeight = response.previousWeight;
      
      // For demo purposes, we'll simulate a previous weight
      const previousWeightValue = 195.5; // This would come from the API in a real implementation
      setPreviousWeight(previousWeightValue);
      
      // Update local state to reflect the change
      const updatedServices = [...processedServices];
      const weightServiceIndex = updatedServices.findIndex(s => s.type === 'weight-management');
      
      if (weightServiceIndex >= 0) {
        const service = updatedServices[weightServiceIndex];
        if (service.actionItems) {
          const actionItemIndex = service.actionItems.findIndex(item => item.icon === 'weight');
          
          if (actionItemIndex >= 0) {
            service.actionItems[actionItemIndex] = {
              ...service.actionItems[actionItemIndex],
              lastCompleted: new Date().toISOString(),
              status: 'completed'
            };
          }
        }
      }
      
      setProcessedServices(updatedServices);
      setWeightModalOpen(false);
      
      // Show the weight confirmation modal
      setWeightConfirmationOpen(true);
    } catch (error) {
      console.error('Error logging weight:', error);
      showToast('error', 'Failed to save weight data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for closing weight confirmation modal
  const handleCloseWeightConfirmation = () => {
    setWeightConfirmationOpen(false);
    setWeight('');
    showToast('success', 'Weight logged successfully');
  };
  
  const handleCloseWeightModal = () => {
    setWeightModalOpen(false);
    setWeight('');
  };
  
  const handleViewPlanDetails = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading your services. Please try again later.</p>
        </div>
      </div>
    );
  }

  // If no services, show empty state
  if (!patientServices || patientServices.length === 0) {
    return <PatientServicesEmptyState />;
  }

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">My Health Services</h1>
            <p className="text-teal-100 text-sm">Manage all your health services in one place</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                onClick={() => navigate('/cart')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
        <p className="text-teal-100 text-sm">{greeting}, {user?.first_name || 'there'}</p>
      </div>
      
      <div className="px-4 pt-6">
        {/* Services Section */}
        <div className="space-y-8">
          <ModularServiceInterface 
            services={processedServices} 
            onViewPlanDetails={handleViewPlanDetails}
            onMessageProvider={handleMessageProvider}
            onOrderRefills={() => showToast('info', 'Navigating to refill page')}
            onLogWeight={handleLogWeight}
            onTakePhotos={handleTakePhotos}
            onAddProduct={handleAddProduct}
            onViewMedicationInstructions={handleViewMedicationInstructions}
          />
        </div>
      </div>

      {/* Weight Logging Modal */}
      <Modal
        isOpen={weightModalOpen}
        onClose={handleCloseWeightModal}
        title="Log Your Weight"
        size="sm"
      >
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your weight (lbs)
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter weight in pounds"
              min="1"
              max="999"
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              onClick={handleCloseWeightModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              onClick={submitWeight}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Weight'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Subscription Plan Modal */}
      {selectedService && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`${selectedService.name} Plan`}
          size="md"
        >
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Plan Details</h3>
              <p className="text-gray-600 mb-2">
                Your {selectedService.name.toLowerCase()} plan includes personalized treatment and ongoing provider support.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Monthly cost</span>
                  <span className="text-sm font-medium text-gray-800">$99.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Next billing date</span>
                  <span className="text-sm font-medium text-gray-800">May 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">What's Included</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Personalized medication plan</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Unlimited provider messaging</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Regular progress tracking</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Automatic refills</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 mr-2"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleCloseModal();
                  navigate('/subscription-details');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Manage Plan
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Medication Instructions Modal */}
      <MedicationInstructionsModal
        isOpen={medicationModalOpen}
        onClose={handleCloseMedicationModal}
        medication={selectedMedication}
      />
      
      {/* Weight Confirmation Modal */}
      <WeightConfirmationModal
        isOpen={weightConfirmationOpen}
        onClose={handleCloseWeightConfirmation}
        weight={parseFloat(weight)}
        previousWeight={previousWeight}
        goalWeight={goalWeight}
      />
    </div>
  );
};

export default ModularPatientServicesPage;
