import React from 'react';

const ServiceMedicationOrderSection = ({
  allServices,
  allProducts,
  allPlans, // Needed for getPlanName
  selectedServiceId,
  treatmentApproach,
  selectedMedications,
  plansForSelectedService, // Derived plans for the selected service
  availableMedications, // Pre-filtered medications
  onServiceChange,
  onTreatmentApproachChange,
  onMedicationSelectionChange,
  onDosageChange,
  onPlanChangeForMedication,
  readOnly,
}) => {

  // Helper to get plan name (consider moving to utils)
  const getPlanName = (planId) =>
    allPlans.find((p) => p.id === planId)?.name || `Plan ID ${planId}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xl font-medium">
          Service & Medication Order
        </h3>
        <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
          Provider only
        </span>
      </div>
      <div className="p-4 space-y-4">
        {/* Service Type, Treatment Approach */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
              value={selectedServiceId}
              onChange={onServiceChange} // Use passed handler
              disabled={readOnly}
            >
              {allServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Approach
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
              value={treatmentApproach}
              onChange={(e) => onTreatmentApproachChange(e.target.value)} // Use passed handler
              disabled={readOnly}
            >
              <option value="Maintenance">Maintenance</option>
              <option value="Escalation">Escalation</option>
            </select>
          </div>
        </div>

        {/* Medication Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Medications for Order
          </label>
          <div className="border border-gray-200 rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
            {availableMedications.map((product) => (
              <div key={product.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`med-${product.id}`}
                  checked={selectedMedications.some(
                    (m) => m.productId === product.id
                  )}
                  onChange={() => onMedicationSelectionChange(product)} // Use passed handler
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`med-${product.id}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {product.name}
                </label>
              </div>
            ))}
            {availableMedications.length === 0 && (
              <p className="text-xs text-gray-500">
                No medications available for this service type.
              </p>
            )}
          </div>
        </div>

        {/* Dosage & Plan Configuration */}
        {selectedMedications.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configure Selected Medications
            </label>
            <div className="border border-gray-200 rounded-md p-3 space-y-3">
              {selectedMedications.map((selectedMed) => {
                const productDetail = availableMedications.find(
                  (p) => p.id === selectedMed.productId
                );
                if (!productDetail) return null;

                return (
                  <div
                    key={selectedMed.productId}
                    className="grid grid-cols-3 gap-2 items-end border-t pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0"
                  >
                    <span className="text-sm font-medium text-gray-800 col-span-3 mb-1">
                      {productDetail.name}:
                      <span className="ml-2 text-indigo-700 font-semibold">
                        {productDetail.doses.find(d => d.id === selectedMed.doseId)?.value || 'Select Dose'}
                      </span>
                    </span>
                    <div className="col-span-1">
                      <label
                        htmlFor={`dosage-${selectedMed.productId}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        Dosage
                      </label>
                      <select
                        id={`dosage-${selectedMed.productId}`}
                        value={selectedMed.doseId}
                        onChange={(e) => onDosageChange(selectedMed.productId, e.target.value)} // Use passed handler
                        disabled={readOnly}
                        className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white"
                      >
                        {productDetail.doses.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor={`plan-${selectedMed.productId}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        Plan
                      </label>
                      <select
                        id={`plan-${selectedMed.productId}`}
                        value={selectedMed.planId || ''}
                        onChange={(e) => onPlanChangeForMedication(selectedMed.productId, e.target.value)} // Use passed handler
                        disabled={readOnly || plansForSelectedService.length === 0}
                        className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white"
                      >
                        <option value="">One-Time Purchase</option>
                        {plansForSelectedService.map((planConfig) => (
                          <option key={planConfig.planId} value={planConfig.planId}>
                            {getPlanName(planConfig.planId)} ({planConfig.duration || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMedicationOrderSection;
