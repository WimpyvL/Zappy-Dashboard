import React, { useState, useEffect } from 'react';
import PatientServicesEmptyState from './PatientServicesEmptyState';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientServicesHeader from '../../components/patient/services/PatientServicesHeader';
import PriorityActionCard from '../../components/patient/services/PriorityActionCard';
import PatientServicesTabs from '../../components/patient/services/PatientServicesTabs';
import TreatmentsTabContent from '../../components/patient/services/TreatmentsTabContent';
import MessagesTabContent from '../../components/patient/services/MessagesTabContent'; // Assuming this component will be created later
import InsightsTabContent from '../../components/patient/services/InsightsTabContent'; // Assuming this component will be created later
import './services/PatientServicesPage.css';

const PatientServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('treatments');
  const [greeting, setGreeting] = useState('Good morning');
  const [hasActiveTreatments, setHasActiveTreatments] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Handler functions
  const handleAddProduct = (product) => toast.success(`${product} added to cart`);
  const handleCheckIn = () => toast.success('Check-in initiated for weight treatment');
  const handleMessageProvider = () => {
    navigate('/messaging');
    toast.info('Messaging provider');
  };
  const handleReferral = () => toast.info('Referral link copied to clipboard!');
  const handleMarkDone = () => toast.success('Medication marked as taken!');
  const handleTakePhotos = () => {
    navigate('/patients/progress-photos');
    toast.info('Taking progress photos');
  };

  // Toggle between empty state and active treatments view (for demo purposes)
  const toggleView = () => {
    setHasActiveTreatments(!hasActiveTreatments);
  };

  // Custom CSS
  const customStyles = `
    .status-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      text-transform: capitalize;
    }
    .status-active {
      background-color: #DCFCE7;
      color: #166534;
    }
    .card-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .scroll-snap-x {
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .scroll-snap-x > div {
      scroll-snap-align: start;
    }
    .tabs-wrapper::-webkit-scrollbar {
      display: none;
    }
  `;

  // If user has no active treatments, show the empty state
  if (!hasActiveTreatments) {
    return <PatientServicesEmptyState />;
  }

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">

      {/* Header Section */}
      <PatientServicesHeader greeting={greeting} />

      {/* Priority Action Card */}
      <PriorityActionCard handleMarkDone={handleMarkDone} />

      {/* Main Tabs */}
      <PatientServicesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'treatments' && (
        <TreatmentsTabContent
          handleAddProduct={handleAddProduct}
          handleCheckIn={handleCheckIn}
          handleMessageProvider={handleMessageProvider}
          handleReferral={handleReferral}
          handleTakePhotos={handleTakePhotos}
        />
      )}

      {activeTab === 'messages' && (
        <MessagesTabContent />
      )}

      {activeTab === 'insights' && (
        <InsightsTabContent />
      )}

      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default PatientServicesPage;
