import { useState, useEffect, useCallback } from 'react';

const useResourceForm = (resource, categories, products, onSuccess, createResource, updateResource) => {
  const isEditing = !!resource;
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    title: '',
    content_id: '',
    category: '',
    content_type: 'medication_guide',
    related_product: '',
    related_condition: '',
    description: '',
    content: '',
    keywords: [],
    reading_time_minutes: 5,
    status: 'draft',
    version: '1.0',
    target_audience: 'all_patients',
    requires_medical_review: true,
    requires_legal_review: true,
    requires_marketing_review: false,
    requires_regulatory_review: false,
    references: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form data if editing
  useEffect(() => {
    if (isEditing && resource) {
      setFormData({
        ...resource,
        keywords: resource.keywords || [],
        references: resource.references || []
      });
      // Set active tab based on initial state if needed, or keep default
    }
  }, [isEditing, resource]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle content type change
  const handleContentTypeChange = useCallback((type) => {
    setFormData(prev => ({
      ...prev,
      content_type: type
    }));
  }, []);

  // Handle adding a keyword
  const handleAddKeyword = useCallback(() => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  }, [keywordInput, formData.keywords]);

  // Handle removing a keyword
  const handleRemoveKeyword = useCallback((keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (validateForm()) {
      const submissionData = { ...formData };
      submissionData.updated_at = new Date().toISOString(); // Ensure updated_at is set

      if (isEditing) {
        updateResource({ id: resource.id, resourceData: submissionData });
      } else {
        createResource(submissionData);
      }
    }
  }, [formData, validateForm, isEditing, resource, createResource, updateResource]);

  // Get content type label
  const getContentTypeLabel = useCallback((type) => {
    switch (type) {
      case 'medication_guide':
        return 'Medication Guide';
      case 'usage_guide':
        return 'Usage Guide';
      case 'side_effect':
        return 'Side Effect Management';
      case 'condition_info':
        return 'Condition Information';
      default:
        return type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || '';
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    formData,
    errors,
    keywordInput,
    setKeywordInput,
    handleInputChange,
    handleContentTypeChange,
    handleAddKeyword,
    handleRemoveKeyword,
    handleSubmit,
    getContentTypeLabel,
    setFormData // Expose setFormData for initial state setting in the component
  };
};

export default useResourceForm;
