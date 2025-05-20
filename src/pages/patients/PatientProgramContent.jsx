import React from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Target, BookOpen, MessageSquare, BarChart2, Check, Play, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { usePatientTreatmentProgram } from '../../hooks/usePatientTreatmentProgram';
import { useRecommendedProducts } from '../../hooks/useRecommendedProducts';
import { toast } from 'react-toastify';
import ProgramSummaryCard from '../../components/patient/program/ProgramSummaryCard'; // Import ProgramSummaryCard
import ProgramGoalCard from '../../components/patient/program/ProgramGoalCard'; // Import extracted ProgramGoalCard
import WeeklyTasksSection from '../../components/patient/program/WeeklyTasksSection'; // Import extracted WeeklyTasksSection
import ProgressTrackingSection from '../../components/patient/program/ProgressTrackingSection'; // Import extracted ProgressTrackingSection
import ResourcesSection from '../../components/patient/program/ResourcesSection'; // Import extracted ResourcesSection
import ContactCoachCard from '../../components/patient/program/ContactCoachCard'; // Import extracted ContactCoachCard
import CrossSellingSection from '../../components/patient/program/CrossSellingSection';

const PatientProgramContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.id;

  // Fetch the patient's program
  const {
    data: program,
    isLoading: isLoadingProgram,
    error: programError
  } = usePatientTreatmentProgram(patientId);

  // Fetch recommended products based on the program's treatment type
  const {
    recommendedProducts,
    isLoading: isLoadingProducts
  } = useRecommendedProducts(
    patientId,
    program?.treatmentType || 'weight-management'
  );

  // Handle adding a product to cart or subscription
  const handleAddProduct = (product) => {
    // In a real implementation, this would add the product to the cart or subscription
    toast.success(`${product.name} added to your cart!`);
  };

  if (isLoadingProgram) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (programError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>Error loading program: {programError?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-bold mb-4">No Active Program</h2>
        <p className="text-gray-600 mb-6">
          You don't have an active treatment program. Subscribe to a treatment package to get started.
        </p>
        <button
          onClick={() => navigate('/my-subscription')}
          className="bg-[#F85C5C] hover:bg-[#F85C5C]/90 text-white px-6 py-3 rounded-full font-semibold"
        >
          View Subscription Options
        </button>
      </div>
    );
  }

  // Calculate program progress percentage
  const progressPercentage = Math.round((program.currentWeek / (program.duration.split(' ')[0] * 4)) * 100);

  return (
    <div className="space-y-6">
      {/* Program Card - Vibrant Style */}
      <ProgramSummaryCard
        programName={program.name}
        currentWeek={program.currentWeek}
        duration={program.duration}
        progressPercentage={progressPercentage}
      />

      {/* Program Goal Card */}
      <ProgramGoalCard goal={program.goal} />

      {/* Weekly Tasks Card */}
      <WeeklyTasksSection tasks={program.tasks} />

      {/* Progress Tracking Card */}
      <ProgressTrackingSection progress={program.progress} />

      {/* Resources Section */}
      <ResourcesSection resources={program.resources} />

      {/* Contact Coach Card */}
      <ContactCoachCard coach={program.coach} />

      {/* Cross-Selling Section */}
      <CrossSellingSection recommendedProducts={recommendedProducts} isLoadingProducts={isLoadingProducts} handleAddProduct={handleAddProduct} />
    </div>
  );
};

export default PatientProgramContent;
