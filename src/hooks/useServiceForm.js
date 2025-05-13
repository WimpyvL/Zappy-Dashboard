import { useState, useEffect } from 'react';

const useServiceForm = (initialService = null, providers = [], initialFormData = {}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialService) {
      setFormData({
        ...initialFormData,
        ...initialService,
        providerIds: initialService.providerIds || [],
        tags: initialService.tags || [],
        availableTimeSlots: initialService.availableTimeSlots || []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [initialService, initialFormData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for the field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProviderSelectionChange = (providerId) => {
    setFormData(prev => {
      const currentProviderIds = prev.providerIds || [];
      if (Array.isArray(providerId)) {
        // Handle select all/deselect all
        return { ...prev, providerIds: providerId };
      } else {
        // Handle single selection
        if (currentProviderIds.includes(providerId)) {
          return { ...prev, providerIds: currentProviderIds.filter(id => id !== providerId) };
        } else {
          return { ...prev, providerIds: [...currentProviderIds, providerId] };
        }
      }
    });
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleTimeSlotChange = (e) => {
    // Placeholder for time slot input change
    // This would typically handle changes to a temporary state for adding a new slot
  };

  const handleAddTimeSlot = () => {
    // Placeholder for adding a new time slot
    // This would typically add the newTimeSlot to availableTimeSlots
  };

  const handleRemoveTimeSlot = (index) => {
    // Placeholder for removing a time slot
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Service Name is required';
    // Add other validation rules as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Placeholder for newTimeSlot state and its handler
  const [newTimeSlot, setNewTimeSlot] = useState({ day: '', startTime: '', endTime: '' });


  return {
    formData,
    errors,
    handleInputChange,
    handleProviderSelectionChange,
    handleTagsChange,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    newTimeSlot, // Include newTimeSlot in return
    handleTimeSlotChange, // Include handleTimeSlotChange in return
    validateForm,
  };
};

export default useServiceForm;
