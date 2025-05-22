import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMySubscriptionDetails } from '../../apis/subscriptionPlans/hooks';
import { toast } from 'react-toastify';

// Components
import PatientSubscriptionDetails from '../../components/subscriptions/PatientSubscriptionDetails';
import SubscriptionPlanSelection from '../../components/subscriptions/SubscriptionPlanSelection';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientSubscriptionPage = () => {
  const { user } = useAuth();
  const patientId = user?.id;
  
  // Fetch patient's active subscription
  const { 
    data: subscription, 
    isLoading,
    isError,
    error 
  } = useMySubscriptionDetails(patientId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="My Subscription" />
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="My Subscription" />
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>Error loading subscription: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="My Subscription" />
      
      {subscription ? (
        <PatientSubscriptionDetails patientId={patientId} />
      ) : (
        <div>
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">No Active Subscription</h2>
            <p className="text-gray-600 mb-4">
              You don't have an active subscription plan. Select a subscription plan below to subscribe to our telehealth services.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4">
              <h3 className="font-bold">Benefits of subscribing:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Unlimited access to telehealth consultations</li>
                <li>Discounted rates for longer subscription periods</li>
                <li>Personalized care for your specific health needs</li>
                <li>Cancel or pause anytime</li>
              </ul>
            </div>
          </div>
          
          <SubscriptionPlanSelection patientId={patientId} />
        </div>
      )}
    </div>
  );
};

export default PatientSubscriptionPage;
