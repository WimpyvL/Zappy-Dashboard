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
    virtualService: true,
    inPersonService: false,
    bookable: true,
    preparationInstructions: '',
    followUpRequired: false,
    tags: [],
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
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than zero';
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Duration (minutes)"
                name="duration"
                type="number"
                min="5"
                step="5"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
              />
              
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
            </div>
            
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
                label="Virtual Service"
                name="virtualService"
                checked={formData.virtualService}
                onChange={handleInputChange}
              />
              
              <FormCheckbox
                label="In-Person Service"
                name="inPersonService"
                checked={formData.inPersonService}
                onChange={handleInputChange}
              />
              
              <FormCheckbox
                label="Bookable"
                name="bookable"
                checked={formData.bookable}
                onChange={handleInputChange}
              />
              
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
            
            <div className="mt-4">
              <FormTextarea
                label="Preparation Instructions"
                name="preparationInstructions"
                value={formData.preparationInstructions}
                onChange={handleInputChange}
                rows={3}
                placeholder="Instructions for patients before the service"
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
                  providers.map(provider => (
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
          
          <FormSection title="Available Time Slots">
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormSelect
                  label="Day"
                  name="day"
                  value={newTimeSlot.day}
                  onChange={handleTimeSlotChange}
                  options={dayOptions}
                  className="mb-0"
                />
                
                <FormInput
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={handleTimeSlotChange}
                  className="mb-0"
                />
                
                <FormInput
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={handleTimeSlotChange}
                  className="mb-0"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAddTimeSlot(newTimeSlot.day, newTimeSlot.startTime, newTimeSlot.endTime)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  disabled={!newTimeSlot.day || !newTimeSlot.startTime || !newTimeSlot.endTime}
                >
                  Add Time Slot
                </button>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Time Slots:</h4>
                {formData.availableTimeSlots?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.availableTimeSlots.map((slot, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <div className="text-sm">
                          <span className="font-medium capitalize">{slot.day}</span>: {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No time slots added yet</p>
                )}
              </div>
            </div>
          </FormSection>
          
          <FormSection title="Service Summary">
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Service Type</h4>
                  <p className="text-sm font-medium capitalize">{formData.type}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Duration</h4>
                  <p className="text-sm font-medium">{formData.duration} minutes</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Price</h4>
                  <p className="text-sm font-medium">${formData.price.toFixed(2)}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Providers</h4>
                  <p className="text-sm font-medium">{formData.providerIds?.length || 0} assigned</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-500 mb-1">Service Options</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.virtualService && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">Virtual</span>
                  )}
                  {formData.inPersonService && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">In-Person</span>
                  )}
                  {formData.bookable && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">Bookable</span>
                  )}
                  {formData.requiresConsultation && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">Requires Consultation</span>
                  )}
                  {formData.followUpRequired && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md">Follow-up Required</span>
                  )}
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </Modal>
  );
};

export default ServiceModal;
