import React from 'react';
import SubscriptionPlanSelection from '@/components/subscriptions/SubscriptionPlanSelection';

export default function SubscriptionPlanSelectionStoryboard() {
  // Mock the hooks that would normally be used in the component
  const mockPatientId = '123';

  // Mock the hooks by overriding them in the component's scope
  const originalPlansModule = require('@/apis/subscriptionPlans/hooks');
  const originalDurationsModule = require('@/apis/subscriptionDurations/hooks');

  // Mock subscription plans data
  const mockPlans = [
    {
      id: 'plan_1',
      name: 'Basic Plan',
      category: 'Weight Management',
      price: 49.99,
      description: 'Essential weight management support with basic features',
      features: ['Monthly check-ins', 'Basic meal planning', 'Email support'],
    },
    {
      id: 'plan_2',
      name: 'Premium Plan',
      category: 'Weight Management',
      price: 99.99,
      description:
        'Comprehensive weight management program with advanced features',
      features: [
        'Weekly check-ins',
        'Custom meal planning',
        '24/7 chat support',
        'Progress tracking',
      ],
    },
    {
      id: 'plan_3',
      name: 'Hair Loss Treatment',
      category: 'Hair Loss',
      price: 79.99,
      description: 'Effective hair loss treatment with proven results',
      features: [
        'Personalized treatment plan',
        'Monthly consultations',
        'Progress tracking',
      ],
    },
  ];

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

  // Override the hooks
  originalPlansModule.useSubscriptionPlans = () => ({
    data: mockPlans,
    isLoading: false,
  });

  originalDurationsModule.useSubscriptionDurations = () => ({
    data: mockDurations,
    isLoading: false,
  });

  return (
    <div className="bg-white p-4">
      <SubscriptionPlanSelection patientId={mockPatientId} />
    </div>
  );
}
