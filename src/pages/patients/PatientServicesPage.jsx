import React from 'react';
import { Card } from '../../components/ui';

/**
 * PatientServicesPage Component
 * 
 * Displays the patient's active services and subscriptions.
 */
const PatientServicesPage = () => {
  // Mock data for services
  const services = [
    {
      id: 1,
      name: 'Weight Management Program',
      description: 'Personalized weight management program with regular check-ins and medication management.',
      status: 'active',
      nextRenewal: '2025-06-15',
      category: 'weight-management'
    },
    {
      id: 2,
      name: 'Mental Health Support',
      description: 'Regular therapy sessions and medication management for mental health.',
      status: 'active',
      nextRenewal: '2025-06-22',
      category: 'mental-health'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Services</h1>
      
      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map(service => (
            <Card 
              key={service.id}
              accentColor={service.category === 'weight-management' ? 'accent2' : 'accent4'}
              title={service.name}
              action={
                <button className="text-primary hover:text-primary/80 text-sm font-medium">
                  Manage
                </button>
              }
            >
              <div className="space-y-3">
                <p className="text-gray-700">{service.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Next renewal: {new Date(service.nextRenewal).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have any active services.</p>
            <button className="btn btn-primary">
              Browse Services
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientServicesPage;
