import React from 'react';
import Modal from '../ui/Modal';
import useProductForm from '../../hooks/useProductForm';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormSection,
  TagInput,
  DosesFormSection
} from '../ui/FormComponents';

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  isSubmitting = false,
  services = []
}) => {
  const isEditMode = !!product;

  // Initial form state definition (can be kept here or moved to hook)
  const initialFormData = {
    name: '',
    type: 'medication',
    description: '',
    price: 0,
    oneTimePurchasePrice: 0,
    active: true,
    requiresPrescription: true,
    category: 'hair',
    associatedServiceIds: [],
    stockStatus: 'in-stock',
    interactionWarnings: [],
    doses: [],
    allowOneTimePurchase: false,
    fulfillmentSource: 'compounding_pharmacy',
    stripePriceId: '',
    stripeOneTimePriceId: '',
    // Additional fields from the HTML mockup
    discreetPackaging: true,
    eligibleForShipping: true,
    temperatureControlled: false,
    shippingRestrictions: false,
    restrictedStates: [],
    telemedicineAvailable: true,
    acceptExternalPrescriptions: true,
    drugClass: '',
    ndcCode: '',
    indications: [],
    contraindications: [],
    educationalMaterials: []
  };

  const {
    formData,
    errors,
    handleInputChange,
    handleServiceSelectionChange,
    handleTagsChange,
    handleDosesChange,
    validateForm,
    toggleShippingRestrictions,
    toggleStateRestriction,
  } = useProductForm(product, services, initialFormData);

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const submissionData = { ...formData };

      // Clean up data based on type
      if (submissionData.type !== 'medication') {
        delete submissionData.doses;
        delete submissionData.oneTimePurchasePrice;
        delete submissionData.stripeOneTimePriceId;
        delete submissionData.requiresPrescription;
        delete submissionData.drugClass;
        delete submissionData.ndcCode;
        delete submissionData.telemedicineAvailable;
        delete submissionData.acceptExternalPrescriptions;
      } else {
        delete submissionData.price;
        delete submissionData.stripePriceId;

        // Ensure doses have valid structure
        submissionData.doses = (submissionData.doses || []).map(dose => ({
          value: dose.value,
          description: dose.description,
          allowOneTimePurchase: !!dose.allowOneTimePurchase,
          stripePriceId: dose.stripePriceId,
          form: dose.form,
          // Remove temporary ID if backend assigns its own
          id: typeof dose.id === 'string' && dose.id.startsWith('temp_') ? undefined : dose.id
        }));
      }

      onSubmit(submissionData);
    }
  };

  // Product type options
  const productTypeOptions = [
    { value: 'medication', label: 'Medication' },
    { value: 'supplement', label: 'Supplement' },
    { value: 'service', label: 'Service' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'hair', label: 'Hair' },
    { value: 'ed', label: 'ED' },
    { value: 'weight-management', label: 'Weight Management' },
    { value: 'skin', label: 'Skin' },
    { value: 'general-health', label: 'General Health' }
  ];

  // Fulfillment source options
  const fulfillmentOptions = [
    { value: 'compounding_pharmacy', label: 'Compounding Pharmacy' },
    { value: 'retail_pharmacy', label: 'Retail Pharmacy' },
    { value: 'internal_supplement', label: 'Internal (Supplement)' },
    { value: 'internal_service', label: 'Internal (Service)' }
  ];

  // Stock status options
  const stockStatusOptions = [
    { value: 'in-stock', label: 'In Stock' },
    { value: 'limited', label: 'Limited Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'backorder', label: 'On Backorder' }
  ];

  // US States for shipping restrictions
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Product' : 'Add New Product'}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Save Changes' : 'Add Product'}
      isSubmitting={isSubmitting}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div>
          <FormSection title="Basic Information">
            <FormInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={errors.name}
            />

            <FormSelect
              label="Product Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={productTypeOptions}
            />

            <FormSelect
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions}
            />

            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />

            {formData.type !== 'medication' && (
              <FormInput
                label="Price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                prefix="$"
                error={errors.price}
              />
            )}

            {formData.type !== 'medication' && (
              <FormInput
                label="Stripe Price ID"
                name="stripePriceId"
                value={formData.stripePriceId}
                onChange={handleInputChange}
                placeholder="price_..."
              />
            )}

            {formData.type === 'medication' && (
              <FormInput
                label="One-Time Purchase Price"
                name="oneTimePurchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.oneTimePurchasePrice}
                onChange={handleInputChange}
                prefix="$"
              />
            )}

            {formData.type === 'medication' && (
              <FormInput
                label="Stripe One-Time Price ID"
                name="stripeOneTimePriceId"
                value={formData.stripeOneTimePriceId}
                onChange={handleInputChange}
                placeholder="price_..."
              />
            )}
          </FormSection>

          <FormSection title="Shipping & Packaging">
            <div className="space-y-3">
              <FormCheckbox
                label="Eligible for shipping"
                name="eligibleForShipping"
                checked={formData.eligibleForShipping}
                onChange={handleInputChange}
              />

              <FormCheckbox
                label="Discreet packaging"
                name="discreetPackaging"
                checked={formData.discreetPackaging}
                onChange={handleInputChange}
              />

              <FormCheckbox
                label="Temperature controlled shipping required"
                name="temperatureControlled"
                checked={formData.temperatureControlled}
                onChange={handleInputChange}
              />

              <FormCheckbox
                label="Restrict shipping to specific states"
                name="shippingRestrictions"
                checked={formData.shippingRestrictions}
                onChange={toggleShippingRestrictions}
              />

              {formData.shippingRestrictions && (
                <div className="mt-3 border border-gray-200 rounded-md p-3">
                  <div className="text-sm font-medium mb-2">Select restricted states:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {usStates.map(state => (
                      <FormCheckbox
                        key={state}
                        label={state}
                        name={`state-${state}`}
                        checked={formData.restrictedStates.includes(state)}
                        onChange={() => toggleStateRestriction(state)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Status">
            <div className="flex space-x-6">
              <FormCheckbox
                label="Active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />

              {formData.type !== 'medication' && (
                <FormCheckbox
                  label="Allow One-Time Purchase"
                  name="allowOneTimePurchase"
                  checked={formData.allowOneTimePurchase}
                  onChange={handleInputChange}
                />
              )}
            </div>
          </FormSection>
        </div>

        {/* Right Column - Type-specific Information */}
        <div>
          {formData.type === 'medication' && (
            <>
              <FormSection title="Medication Details">
                <FormCheckbox
                  label="Requires Prescription"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleInputChange}
                />

                <div className="mt-3 space-y-3">
                  <FormCheckbox
                    label="Telemedicine consultation available"
                    name="telemedicineAvailable"
                    checked={formData.telemedicineAvailable}
                    onChange={handleInputChange}
                  />

                  <FormCheckbox
                    label="Accept external prescriptions"
                    name="acceptExternalPrescriptions"
                    checked={formData.acceptExternalPrescriptions}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormInput
                    label="Drug Class"
                    name="drugClass"
                    value={formData.drugClass}
                    onChange={handleInputChange}
                    placeholder="e.g. 5α-reductase inhibitor"
                  />

                  <FormInput
                    label="NDC Code"
                    name="ndcCode"
                    value={formData.ndcCode}
                    onChange={handleInputChange}
                    placeholder="National Drug Code"
                  />
                </div>

                <TagInput
                  label="Indications"
                  value={formData.indications}
                  onChange={(tags) => handleTagsChange('indications', tags)}
                  placeholder="Add indication..."
                />

                <TagInput
                  label="Contraindications"
                  value={formData.contraindications}
                  onChange={(tags) => handleTagsChange('contraindications', tags)}
                  placeholder="Add contraindication..."
                />

                <TagInput
                  label="Interaction Warnings"
                  value={formData.interactionWarnings}
                  onChange={(tags) => handleTagsChange('interactionWarnings', tags)}
                  placeholder="Add warning..."
                />
              </FormSection>

              <DosesFormSection
                doses={formData.doses}
                onChange={handleDosesChange}
              />
              {errors.doses && (
                <p className="mt-1 text-sm text-red-600">{errors.doses}</p>
              )}
            </>
          )}

          <FormSection title="Associated Services">
            <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto space-y-1">
              {services.length > 0 ? (
                services.map(service => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-assoc-${service.id}`}
                      checked={formData.associatedServiceIds?.includes(service.id) || false}
                      onChange={() => handleServiceSelectionChange(service.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`service-assoc-${service.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {service.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No services available</p>
              )}
            </div>
          </FormSection>

          <FormSection title="Associated Content">
            <div className="space-y-3">
              <div className="text-sm text-gray-500 mb-2">
                Select educational materials to associate with this product
              </div>

              <FormCheckbox
                label="Product Information Sheet"
                name="educationalMaterial-info"
                checked={formData.educationalMaterials.includes('Product Information Sheet')}
                onChange={() => {
                  const materials = formData.educationalMaterials || [];
                  const newMaterials = materials.includes('Product Information Sheet')
                    ? materials.filter(m => m !== 'Product Information Sheet')
                    : [...materials, 'Product Information Sheet'];
                  handleTagsChange('educationalMaterials', newMaterials);
                }}
              />

              <FormCheckbox
                label="Usage Instructions"
                name="educationalMaterial-usage"
                checked={formData.educationalMaterials.includes('Usage Instructions')}
                onChange={() => {
                  const materials = formData.educationalMaterials || [];
                  const newMaterials = materials.includes('Usage Instructions')
                    ? materials.filter(m => m !== 'Usage Instructions')
                    : [...materials, 'Usage Instructions'];
                  handleTagsChange('educationalMaterials', newMaterials);
                }}
              />

              <FormCheckbox
                label="Side Effect Management Guide"
                name="educationalMaterial-sideEffects"
                checked={formData.educationalMaterials.includes('Side Effect Management Guide')}
                onChange={() => {
                  const materials = formData.educationalMaterials || [];
                  const newMaterials = materials.includes('Side Effect Management Guide')
                    ? materials.filter(m => m !== 'Side Effect Management Guide')
                    : [...materials, 'Side Effect Management Guide'];
                  handleTagsChange('educationalMaterials', newMaterials);
                }}
              />
            </div>
          </FormSection>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
