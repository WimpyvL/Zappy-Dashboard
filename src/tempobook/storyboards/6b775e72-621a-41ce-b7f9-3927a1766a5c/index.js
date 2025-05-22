import React from 'react';
import TreatmentPackageSelection from '@/components/subscriptions/TreatmentPackageSelection';

export default function TreatmentPackageSelectionStoryboard() {
  // Mock the hooks that would normally be used in the component
  const mockPatientId = '123';

  // Mock the hooks by overriding them in the component's scope
  const originalDurationsModule = require('@/apis/subscriptionDurations/hooks');
  const originalPackagesModule = require('@/apis/treatmentPackages/hooks');

  // Mock subscription durations data
  const mockDurations = [
    {
      id: 'dur_1',
      name: 'Monthly',
      duration_months: 1,
      discount_percent: 0,
    },
    {
      id: 'dur_2',
      name: 'Quarterly',
      duration_months: 3,
      discount_percent: 10,
    },
    {
      id: 'dur_3',
      name: 'Annual',
      duration_months: 12,
      discount_percent: 20,
    },
  ];

  // Mock treatment packages data
  const mockPackages = {
    data: [
      {
        id: 'pkg_1',
        name: 'Weight Management Basic',
        condition: 'Weight Management',
        base_price: 49.99,
        description: 'Essential weight management support with basic features',
      },
      {
        id: 'pkg_2',
        name: 'Weight Management Premium',
        condition: 'Weight Management',
        base_price: 99.99,
        description:
          'Comprehensive weight management program with advanced features',
      },
      {
        id: 'pkg_3',
        name: 'Hair Loss Treatment',
        condition: 'Hair Loss',
        base_price: 79.99,
        description: 'Effective hair loss treatment with proven results',
      },
    ],
  };

  // Override the hooks
  originalDurationsModule.useSubscriptionDurations = () => ({
    data: mockDurations,
    isLoading: false,
  });

  originalPackagesModule.useTreatmentPackages = () => ({
    data: mockPackages,
    isLoading: false,
  });

  originalPackagesModule.useSubscribePatient = () => ({
    mutate: () => console.log('Subscribe patient called'),
    isLoading: false,
  });

  return (
    <div className="bg-white p-4">
      <TreatmentPackageSelection patientId={mockPatientId} />
    </div>
  );
}
