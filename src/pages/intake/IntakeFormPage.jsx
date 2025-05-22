import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useSubmitForm } from '../../apis/formSubmissions/hooks';
import { useCreateOrder } from '../../apis/orders/hooks';
import { useCreateConsultation, useAssignProvider } from '../../apis/consultations/hooks';
import { toast } from 'react-toastify';

// Import steps
import IntroductionStep from './steps/IntroductionStep';
import BasicInfoStep from './steps/BasicInfoStep';
import IDVerificationStep from './steps/IDVerificationStep';
import HealthHistoryStep from './steps/HealthHistoryStep';
import TreatmentPreferencesStep from './steps/TreatmentPreferencesStep';
import ReviewStep from './steps/ReviewStep';
import ShippingAddressStep from './steps/ShippingAddressStep';
import CheckoutStep from './steps/CheckoutStep';
import OrderConfirmationStep from './steps/OrderConfirmationStep';

const IntakeFormPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const submitFormMutation = useSubmitForm();
  const createOrderMutation = useCreateOrder();
  const createConsultationMutation = useCreateConsultation();
  const assignProviderMutation = useAssignProvider();
  
  // Get data from location state
  const prescriptionItems = location.state?.prescriptionItems || [];
  const initialStep = location.state?.step || 'introduction';
  
  // Determine product category from location state or items
  const determineProductCategory = () => {
    // If productCategory is provided in location state, use it
    if (location.state?.productCategory) {
      return location.state.productCategory;
    }
    
    // Otherwise determine from prescription items
    if (prescriptionItems.length === 0) return 'general';
    
    const firstItem = prescriptionItems[0];
    if (firstItem.category === 'weight_management' || firstItem.name?.toLowerCase().includes('weight')) {
      return 'weight_management';
    } else if (firstItem.category === 'ed' || firstItem.name?.toLowerCase().includes('viagra') || firstItem.name?.toLowerCase().includes('cialis')) {
      return 'ed';
    } else if (firstItem.category === 'hair_loss' || firstItem.name?.toLowerCase().includes('hair')) {
      return 'hair_loss';
    }
    
    return 'general';
  };
  
  const productCategory = determineProductCategory();
  
  // Form steps
  const steps = [
    'introduction',
    'basic_info',
    'id_verification',
    'health_history',
    'treatment_preferences',
    'review',
    'shipping_address',
    'checkout',
    'confirmation'
  ];
  
  // Find step index from step name
  const getStepIndex = (stepName) => {
    const index = steps.indexOf(stepName);
    return index >= 0 ? index : 0;
  };
  
  // State
  const [currentStep, setCurrentStep] = useState(getStepIndex(initialStep));
  const [formData, setFormData] = useState({
    basicInfo: {
      height: '',
      weight: '',
      weightUnit: 'lbs',
      goalWeight: '',
      bmi: '',
      hairLossPattern: ''
    },
    healthHistory: {
      medicalConditions: [],
      previousTreatments: [],
      medicationsText: '',
      allergiesText: '',
      edDuration: ''
    },
    treatmentPreferences: {
      selectedProductId: prescriptionItems.length > 0 ? prescriptionItems[0].id : ''
    },
    shippingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    },
    checkout: {
      paymentMethodId: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [consultationId, setConsultationId] = useState(null);
  
  // Update form data
  const updateFormData = (section, data) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        ...data
      }
    }));
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit form data
      const formSubmission = await submitFormMutation.mutateAsync({
        patientId: user?.id || 'p1', // Use mock patient ID if user is not available
        categoryId: productCategory,
        formData: formData,
      });
      
      // Create order
      const selectedProduct = prescriptionItems.find(
        item => item.id === formData.treatmentPreferences.selectedProductId
      ) || prescriptionItems[0];
      
      const order = await createOrderMutation.mutateAsync({
        patientId: user?.id || 'p1',
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: 1,
            price: selectedProduct.price,
            dosage: selectedProduct.dosage || '0.25mg',
            frequency: selectedProduct.frequency || 'daily'
          }
        ],
        formSubmissionId: formSubmission.id,
        shippingAddress: formData.shippingAddress,
        paymentMethodId: formData.checkout.paymentMethodId
      });
      
      // Create consultation
      const consultation = await createConsultationMutation.mutateAsync({
        patient_id: user?.id || 'p1',
        form_submission_id: formSubmission.id,
        status: 'pending_review',
        order_id: order.id,
        category_id: productCategory,
        notes: {
          hpi: `Patient submitted intake form for ${selectedProduct.name}`,
          pmh: formData.healthHistory.medicalConditions?.join(', ') || '',
          contraindications: formData.healthHistory.allergiesText || 'None reported'
        }
      });
      
      // Assign provider based on patient's state
      const patientState = formData.shippingAddress.state;
      if (patientState) {
        try {
          const assignmentResult = await assignProviderMutation.mutateAsync({
            consultationId: consultation.id,
            patientState: patientState,
            categoryId: productCategory
          });
          
          console.log(`Consultation assigned to ${assignmentResult.provider.name}`);
        } catch (assignError) {
          console.error('Error assigning provider:', assignError);
          // Don't fail the whole process if provider assignment fails
          toast.warning('Provider assignment pending. A provider will be assigned shortly.');
        }
      }
      
      // Set IDs for confirmation step
      setOrderId(order.id);
      setConsultationId(consultation.id);
      
      // Move to confirmation step
      handleNext();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigate to home
  const navigateToHome = () => {
    navigate('/');
  };
  
  // Navigate to order details
  const navigateToOrderDetails = () => {
    navigate(`/my-orders/${orderId}`);
  };
  
  // Render current step
  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'introduction':
        return (
          <IntroductionStep 
            productCategory={productCategory}
            onNext={handleNext}
          />
        );
      case 'basic_info':
        return (
          <BasicInfoStep 
            formData={formData}
            updateFormData={updateFormData}
            productCategory={productCategory}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'id_verification':
        return (
          <IDVerificationStep 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'health_history':
        return (
          <HealthHistoryStep 
            formData={formData}
            updateFormData={updateFormData}
            productCategory={productCategory}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'treatment_preferences':
        return (
          <TreatmentPreferencesStep 
            formData={formData}
            updateFormData={updateFormData}
            prescriptionItems={prescriptionItems}
            productCategory={productCategory}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            formData={formData}
            prescriptionItems={prescriptionItems}
            productCategory={productCategory}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'shipping_address':
        return (
          <ShippingAddressStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'checkout':
        return (
          <CheckoutStep
            formData={formData}
            updateFormData={updateFormData}
            prescriptionItems={prescriptionItems}
            productCategory={productCategory}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        );
      case 'confirmation':
        return (
          <OrderConfirmationStep 
            orderId={orderId}
            consultationId={consultationId}
            navigateToHome={navigateToHome}
            navigateToOrderDetails={navigateToOrderDetails}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Progress bar */}
      {currentStep < steps.length - 1 && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length - 1}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round((currentStep / (steps.length - 2)) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Math.round((currentStep / (steps.length - 2)) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Current step */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default IntakeFormPage;
