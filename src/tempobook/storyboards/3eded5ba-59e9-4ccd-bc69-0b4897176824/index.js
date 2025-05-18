import React from 'react';
import PatientSubscriptionDetails from '@/components/subscriptions/PatientSubscriptionDetails';

export default function PatientSubscriptionDetailsStoryboard() {
  // Mock the hooks that would normally be used in the component
  // This allows us to view the component in isolation
  const mockPatientId = '123';

  // Mock the hooks by overriding them in the component's scope
  // This is just for the storyboard visualization
  const originalModule = require('@/apis/subscriptionPlans/hooks');

  // Mock subscription data
  const mockSubscription = {
    id: 'sub_123',
    stripeSubscriptionId: 'sub_stripe123',
    packageName: 'Premium Health Plan',
    packageCondition: 'Weight Management',
    durationName: 'Quarterly',
    durationMonths: 3,
    status: 'active',
    currentPeriodStart: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentPeriodEnd: new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000
    ).toISOString(),
    basePrice: 99.99,
    discountPercent: 15,
  };

  // Override the hooks
  originalModule.useMySubscriptionDetails = () => ({
    data: mockSubscription,
    isLoading: false,
    refetch: () => console.log('Refetch called'),
  });

  originalModule.usePauseSubscription = () => ({
    mutate: () => console.log('Pause subscription called'),
    isLoading: false,
  });

  originalModule.useCancelSubscription = () => ({
    mutate: () => console.log('Cancel subscription called'),
    isLoading: false,
  });

  originalModule.useCreateCustomerPortalSession = () => ({
    mutate: () => console.log('Open portal called'),
    isLoading: false,
  });

  return (
    <div className="bg-white p-4">
      <PatientSubscriptionDetails patientId={mockPatientId} />
    </div>
  );
}
