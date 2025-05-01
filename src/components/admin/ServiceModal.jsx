import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox, 
  FormSection,
  TagInput
} from '../ui/FormComponents';

const ServiceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  service = null, 
  isSubmitting = false,
  providers = []
}) => {
  const isEditMode = !!service;
  
  // Initial form state
  const initialFormData = {
    name: '',
    description: '',
    serviceId: '',
    category: 'hair',
    type: 'consultation',
    duration: 20,
    price: 0,
    active: true,
    requiresConsultation: false,
    providerIds: [],
    stripePriceId: '',
    // Additional fields
    followUpRequired: false,
    tags: [],
    formId: '',
    availableTimeSlots: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Load service data if in edit mode
  useEffect(() => {
    if (isEditMode && service) {
      setFormData({
        ...initialFormData,
        ...service,
        // Ensure arrays are properly initialized
        providerIds: Array.isArray(service.providerIds) ? [...service.providerIds] : [],
        tags: Array.isArray(service.tags) ? [...service.tags] : [],
        availableTimeSlots: Array.isArray(service.availableTimeSlots) ? [...service.availableTimeSlots] : []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, service]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                    (type === 'number' || name === 'price' || name === 'duration') 
                      ? parseFloat(value) || 0 
                      : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle provider selection
  const handleProviderSelectionChange = (providerId) => {
    setFormData(prev => {
      const currentIds = prev.providerIds || [];
      const newIds = currentIds.includes(providerId)
        ? currentIds.filter(id => id !== providerId)
        : [...currentIds, providerId];
      return { ...prev, providerIds: newIds };
    });
  };

  // Handle tag inputs
  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  // Handle time slot addition
  const handleAddTimeSlot = (day, startTime, endTime) => {
    if (!day || !startTime || !endTime) return;
    
    setFormData(prev => {
      const newSlot = { day, startTime, endTime };
      return {
        ...prev,
        availableTimeSlots: [...prev.availableTimeSlots, newSlot]
      };
    });
    
    // Reset time slot form
    setNewTimeSlot({
      day: '',
      startTime: '',
      endTime: ''
    });
  };

  // Handle time slot removal
  const handleRemoveTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter((_, i) => i !== index)
    }));
  };

  // New time slot state
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: '',
    startTime: '',
    endTime: ''
  });

  // Handle new time slot input changes
  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    setNewTimeSlot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Category options
  const categoryOptions = [
    { value: 'hair', label: 'Hair' },
    { value: 'ed', label: 'ED' },
    { value: 'weight-management', label: 'Weight Management' },
    { value: 'skin', label: 'Skin' },
    { value: 'general-health', label: 'General Health' }
  ];

  // Service type options
  const serviceTypeOptions = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'coaching', label: 'Coaching' }
  ];

  // Day options for time slots
  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Service' : 'Add New Service'}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Save Changes' : 'Add Service'}
      isSubmitting={isSubmitting}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div>
          <FormSection title="Basic Information">
            <FormInput
              label="Service Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={errors.name}
            />
            
            <FormInput
              label="Service ID"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleInputChange}
              placeholder="SV-HAIR-001"
            />
            
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categoryOptions}
              />
              
              <FormSelect
                label="Service Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={serviceTypeOptions}
              />
            </div>
            
            <FormInput
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              prefix="$"
            />
            
            <FormInput
              label="Stripe Price ID"
              name="stripePriceId"
              value={formData.stripePriceId}
              onChange={handleInputChange}
              placeholder="price_..."
            />
            
            <TagInput
              label="Tags"
              value={formData.tags}
              onChange={handleTagsChange}
              placeholder="Add tag..."
            />
          </FormSection>
          
          <FormSection title="Service Options">
            <div className="space-y-3">
              <FormCheckbox
                label="Requires Prior Consultation"
                name="requiresConsultation"
                checked={formData.requiresConsultation}
                onChange={handleInputChange}
              />
              
              <FormCheckbox
                label="Follow-up Required"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>
          
          <FormSection title="Status">
            <FormCheckbox
              label="Active"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
            />
          </FormSection>
        </div>
        
        {/* Right Column */}
        <div>
          <FormSection title="Providers">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Providers
              </label>
              <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto space-y-1">
                {providers.length > 0 ? (
                  <>
                    <div className="flex items-center border-b border-gray-200 pb-1 mb-1">
                      <input
                        type="checkbox"
                        id="provider-select-all"
                        checked={formData.providerIds?.length === providers.length}
                        onChange={() => {
                          if (formData.providerIds?.length === providers.length) {
                            // Deselect all providers
                            setFormData(prev => ({ ...prev, providerIds: [] }));
                          } else {
                            // Select all providers
                            setFormData(prev => ({ 
                              ...prev, 
                              providerIds: providers.map(p => p.id) 
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="provider-select-all"
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        All providers
                      </label>
                    </div>
                    
                    {providers.map(provider => (
                      <div key={provider.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`provider-select-${provider.id}`}
                          checked={formData.providerIds?.includes(provider.id) || false}
                          onChange={() => handleProviderSelectionChange(provider.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`provider-select-${provider.id}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {provider.name} {provider.credentials ? `(${provider.credentials})` : ''}
                        </label>
                      </div>
                    ))
                  }
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    No providers available.
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.providerIds?.length || 0} providers assigned
              </p>
            </div>
          </FormSection>
          
          <FormSection title="Service Availability">
            <div className="mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                <p className="text-sm">
                  This service is asynchronous and does not require specific time slots or durations.
                  Providers will respond to patient requests as they become available.
                </p>
              </div>
            </div>
          </FormSection>
          
          <FormSection title="Associated Form">
            <div className="mb-4">
              <FormSelect
                label="Connect to Form"
                name="formId"
                value={formData.formId || ''}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'None' },
                  { value: 'form_hair_consultation', label: 'Hair Consultation Form' },
                  { value: 'form_ed_assessment', label: 'ED Assessment Form' },
                  { value: 'form_weight_management', label: 'Weight Management Form' },
                  { value: 'form_skin_assessment', label: 'Skin Assessment Form' },
                  { value: 'form_general_health', label: 'General Health Form' }
                ]}
              />
              <p className="mt-1 text-xs text-gray-500">
                Connecting a form will require patients to fill it out when requesting this service
              </p>
            </div>
          </FormSection>
        </div>
      </div>
    </Modal>
  );
};

export default ServiceModal;
