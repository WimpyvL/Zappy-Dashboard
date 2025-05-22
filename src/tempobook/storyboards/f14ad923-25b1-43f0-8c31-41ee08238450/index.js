import React, { useState } from 'react';
import ServiceMedicationOrderSection from '@/pages/consultations/components/ServiceMedicationOrderSection';

export default function ServiceMedicationOrderSectionStoryboard() {
  // Sample data
  const sampleServices = [
    { id: 'serv_1', name: 'Hair Loss Treatment' },
    { id: 'serv_2', name: 'Weight Management' },
    { id: 'serv_3', name: 'Skin Care' },
  ];

  const sampleProducts = [
    {
      id: 'prod_1',
      name: 'Finasteride 1mg',
      serviceIds: ['serv_1'],
      doses: [
        { id: 'dose_1_1', value: '1mg daily' },
        { id: 'dose_1_2', value: '1mg every other day' },
      ],
    },
    {
      id: 'prod_2',
      name: 'Minoxidil 5% Solution',
      serviceIds: ['serv_1'],
      doses: [
        { id: 'dose_2_1', value: '1ml twice daily' },
        { id: 'dose_2_2', value: '1ml once daily' },
      ],
    },
    {
      id: 'prod_3',
      name: 'Phentermine 37.5mg',
      serviceIds: ['serv_2'],
      doses: [
        { id: 'dose_3_1', value: '37.5mg daily' },
        { id: 'dose_3_2', value: '18.75mg daily' },
      ],
    },
    {
      id: 'prod_4',
      name: 'Tretinoin 0.025% Cream',
      serviceIds: ['serv_3'],
      doses: [
        { id: 'dose_4_1', value: 'Apply nightly' },
        { id: 'dose_4_2', value: 'Apply every other night' },
      ],
    },
  ];

  const samplePlans = [
    { id: 'plan_1', name: 'Hair Loss Basic Plan' },
    { id: 'plan_2', name: 'Hair Loss Premium Plan' },
    { id: 'plan_3', name: 'Weight Management Plan' },
    { id: 'plan_4', name: 'Skin Care Plan' },
  ];

  // State
  const [selectedServiceId, setSelectedServiceId] = useState('serv_1');
  const [treatmentApproach, setTreatmentApproach] = useState('Maintenance');
  const [selectedMedications, setSelectedMedications] = useState([
    { productId: 'prod_1', doseId: 'dose_1_1', planId: 'plan_1' },
  ]);

  // Derived data
  const plansForSelectedService = [
    { planId: 'plan_1', duration: '1 month' },
    { planId: 'plan_2', duration: '3 months' },
  ];

  const availableMedications = sampleProducts.filter((product) =>
    product.serviceIds.includes(selectedServiceId)
  );

  // Handlers
  const handleServiceChange = (e) => {
    const newServiceId = e.target.value;
    setSelectedServiceId(newServiceId);
    // Reset medications when service changes
    setSelectedMedications([]);
  };

  const handleTreatmentApproachChange = (value) => {
    setTreatmentApproach(value);
  };

  const handleMedicationSelectionChange = (product) => {
    const isSelected = selectedMedications.some(
      (med) => med.productId === product.id
    );

    if (isSelected) {
      // Remove medication
      setSelectedMedications((prev) =>
        prev.filter((med) => med.productId !== product.id)
      );
    } else {
      // Add medication with default dose
      setSelectedMedications((prev) => [
        ...prev,
        { productId: product.id, doseId: product.doses[0].id, planId: '' },
      ]);
    }
  };

  const handleDosageChange = (productId, doseId) => {
    setSelectedMedications((prev) =>
      prev.map((med) =>
        med.productId === productId ? { ...med, doseId } : med
      )
    );
  };

  const handlePlanChangeForMedication = (productId, planId) => {
    setSelectedMedications((prev) =>
      prev.map((med) =>
        med.productId === productId ? { ...med, planId } : med
      )
    );
  };

  return (
    <div className="bg-white p-4">
      <h2 className="text-xl font-bold mb-4">
        Service & Medication Order Section
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Editable Mode</h3>
        <ServiceMedicationOrderSection
          allServices={sampleServices}
          allProducts={sampleProducts}
          allPlans={samplePlans}
          selectedServiceId={selectedServiceId}
          treatmentApproach={treatmentApproach}
          selectedMedications={selectedMedications}
          plansForSelectedService={plansForSelectedService}
          availableMedications={availableMedications}
          onServiceChange={handleServiceChange}
          onTreatmentApproachChange={handleTreatmentApproachChange}
          onMedicationSelectionChange={handleMedicationSelectionChange}
          onDosageChange={handleDosageChange}
          onPlanChangeForMedication={handlePlanChangeForMedication}
          readOnly={false}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Read-only Mode</h3>
        <ServiceMedicationOrderSection
          allServices={sampleServices}
          allProducts={sampleProducts}
          allPlans={samplePlans}
          selectedServiceId={selectedServiceId}
          treatmentApproach={treatmentApproach}
          selectedMedications={selectedMedications}
          plansForSelectedService={plansForSelectedService}
          availableMedications={availableMedications}
          onServiceChange={() => {}}
          onTreatmentApproachChange={() => {}}
          onMedicationSelectionChange={() => {}}
          onDosageChange={() => {}}
          onPlanChangeForMedication={() => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}
