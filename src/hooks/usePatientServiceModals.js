import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Assuming navigation is needed in handlers

const usePatientServiceModals = () => {
  const navigate = useNavigate(); // Assuming navigation is used in handlers

  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [weightConfirmationOpen, setWeightConfirmationOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleAddProduct = (productId) => {
    // Logic to add product to cart
    toast.success(`Product ${productId} added to cart!`);
  };

  const handleCheckIn = (serviceId) => {
    // Logic for service check-in
    toast.info(`Checking in for service ${serviceId}`);
  };

  const handleMessageProvider = (providerId) => {
    // Logic to message provider
    toast.info(`Messaging provider ${providerId}`);
  };

  const handleReferral = (serviceId) => {
    // Logic for referral
    toast.info(`Referring for service ${serviceId}`);
  };

  const handleMarkDone = (actionItemId) => {
    // Logic to mark action item as done
    toast.success(`Action item ${actionItemId} marked as done!`);
  };

  const handleTakePhotos = (actionItemId) => {
    // Logic to take photos for action item
    toast.info(`Taking photos for action item ${actionItemId}`);
  };

  const handleLogWeight = (serviceId) => {
    setSelectedService({ id: serviceId }); // Assuming serviceId is needed for context
    setWeightConfirmationOpen(true);
  };

  const submitWeight = () => {
    // Logic to submit weight
    toast.success(`Weight ${weight} submitted for service ${selectedService.id}!`);
    setWeight('');
    setWeightConfirmationOpen(false);
  };

  const handleCloseWeightConfirmation = () => {
    setWeightConfirmationOpen(false);
    setWeight('');
  };

  const handleCloseWeightModal = () => {
     setWeightConfirmationOpen(false);
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

  const handleViewMedicationInstructions = (medication) => {
    setSelectedMedication(medication);
    setMedicationModalOpen(true);
  };

  const handleCloseMedicationModal = () => {
    setMedicationModalOpen(false);
    setSelectedMedication(null);
  };

  return {
    medicationModalOpen,
    selectedMedication,
    weightConfirmationOpen,
    weight,
    isModalOpen,
    selectedService,
    setWeight,
    handleAddProduct,
    handleCheckIn,
    handleMessageProvider,
    handleReferral,
    handleMarkDone,
    handleTakePhotos,
    handleLogWeight,
    submitWeight,
    handleCloseWeightConfirmation,
    handleCloseWeightModal,
    handleViewPlanDetails,
    handleCloseModal,
    handleViewMedicationInstructions,
    handleCloseMedicationModal,
  };
};

export default usePatientServiceModals;
