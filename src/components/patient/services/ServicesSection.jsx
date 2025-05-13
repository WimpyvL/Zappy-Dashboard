import React from 'react';
import ModularServiceInterface from '../ModularServiceInterface';

const ServicesSection = ({
  services,
  onViewPlanDetails,
  onMessageProvider,
  onOrderRefills,
  onLogWeight,
  onTakePhotos,
  onAddProduct,
  onViewMedicationInstructions,
}) => {
  return (
    <div className="px-4 pt-6">
      {/* Services Section */}
      <div className="space-y-8">
        <ModularServiceInterface
          services={services}
          onViewPlanDetails={onViewPlanDetails}
          onMessageProvider={onMessageProvider}
          onOrderRefills={onOrderRefills}
          onLogWeight={onLogWeight}
          onTakePhotos={onTakePhotos}
          onAddProduct={onAddProduct}
          onViewMedicationInstructions={onViewMedicationInstructions}
        />
      </div>
    </div>
  );
};

export default ServicesSection;
