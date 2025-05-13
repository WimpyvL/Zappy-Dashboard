import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModularServiceInterface from '../../components/patient/ModularServiceInterface';
import useToast from '../../hooks/useToast';
import PatientServicesEmptyState from './PatientServicesEmptyState';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MedicationInstructionsModal from '../../components/patient/MedicationInstructionsModal';
import WeightConfirmationModal from '../../components/patient/WeightConfirmationModal';
import { usePatientServices } from '../../apis/patientServices/hooks';
import usePatientServiceModals from '../../hooks/usePatientServiceModals';
import ServicesHeader from '../../components/patient/services/ServicesHeader';
import ServicesSection from '../../components/patient/services/ServicesSection';
import WeightLoggingModal from '../../components/patient/services/WeightLoggingModal';
import SubscriptionPlanModal from '../../components/patient/services/SubscriptionPlanModal';

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

  const [greeting, setGreeting] = useState('Good morning');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const { data: enrollments, isLoading, error } = usePatientServices();

  const processedServices = enrollments?.map(enrollment => ({
    id: enrollment.id,
    serviceId: enrollment.services.id, // Keep serviceId if needed elsewhere, but ModularServiceInterface uses 'id'
    name: enrollment.services.name,
    description: enrollment.services.description,
    type: enrollment.services.service_type,
    status: enrollment.status, // Use enrollment status
    enrolledAt: enrollment.enrolled_at,
    lastActivityAt: enrollment.last_activity_at,
    settings: enrollment.settings,
    features: enrollment.services.features,
    resourceCategories: enrollment.services.resource_categories,
    productCategories: enrollment.services.product_categories,
    // Assuming medications, actionItems, and recommendations will be fetched separately or are included in the enrollment structure
    // For now, keep them as potentially undefined or empty arrays if not present in the fetched data
    medications: enrollment.medications || [], // Assuming medications might be nested
    actionItems: enrollment.action_items || [], // Assuming action items might be nested
    recommendations: enrollment.recommendations || [], // Assuming recommendations might be nested
  })) || [];

  const {
    medicationModalOpen,
    selectedMedication,
    handleViewMedicationInstructions,
    handleCloseMedicationModal,
    weightModalOpen,
    weight,
    setWeight,
    isSubmitting,
    handleLogWeight,
    submitWeight,
    handleCloseWeightModal,
    weightConfirmationOpen,
    previousWeight,
    goalWeight,
    handleCloseWeightConfirmation,
    isModalOpen,
    selectedService,
    handleViewPlanDetails,
    handleCloseModal,
    handleAddProduct,
    handleCheckIn,
    handleMessageProvider,
    handleReferral,
    handleMarkDone,
    handleTakePhotos,
  } = usePatientServiceModals(); // Call the hook here

  // State for cart - Keeping this here for now as it's not directly related to modals
  const [cartCount, setCartCount] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
  if (!isLoading && !error && (!processedServices || processedServices.length === 0)) {
    return <PatientServicesEmptyState />;
  }

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">
      <ServicesHeader greeting={greeting} cartCount={cartCount} />

      <ServicesSection
        services={processedServices}
        onViewPlanDetails={handleViewPlanDetails}
        onMessageProvider={handleMessageProvider}
        onOrderRefills={() => showToast('info', 'Navigating to refill page')}
        onLogWeight={handleLogWeight}
        onTakePhotos={handleTakePhotos}
        onAddProduct={handleAddProduct}
        onViewMedicationInstructions={handleViewMedicationInstructions}
      />

      <WeightLoggingModal
        isOpen={weightModalOpen}
        onClose={handleCloseWeightModal}
        weight={weight}
        setWeight={setWeight}
        onSubmit={submitWeight}
        isSubmitting={isSubmitting}
      />

      {selectedService && (
        <SubscriptionPlanModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedService={selectedService}
        />
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
