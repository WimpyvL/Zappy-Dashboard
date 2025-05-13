import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAddProvider, useUpdateProvider } from '../apis/providers/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// List of US states (can be imported from a constants file if available)
const states = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];


const useProviderForm = (provider, onCloseModal) => {
  const queryClient = useQueryClient();
  const isEditMode = !!provider;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    active: true,
    authorizedStates: [],
    role: 'provider',
    // Professional details (currently disabled in UI)
    credentials: '',
    licenseNumber: '',
    profileImageUrl: '',
    biography: '',
  });
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  const addProviderMutation = useAddProvider();
  const updateProviderMutation = useUpdateProvider();

  // Initialize form data if editing
  useEffect(() => {
    if (isEditMode && provider) {
      setFormData({
        name: provider.name || '',
        specialty: provider.specialty || '',
        email: provider.email || '',
        phone: provider.phone || '',
        active: provider.active || true,
        authorizedStates: [...(provider.authorizedStates || [])],
        role: provider.role || 'provider',
        credentials: provider.credentials || '',
        licenseNumber: provider.licenseNumber || '',
        profileImageUrl: provider.profileImageUrl || '',
        biography: provider.biography || '',
      });
    } else {
      setFormData({
        name: '',
        specialty: '',
        email: '',
        phone: '',
        active: true,
        authorizedStates: [],
        role: 'provider',
        credentials: '',
        licenseNumber: '',
        profileImageUrl: '',
        biography: '',
      });
    }
  }, [isEditMode, provider]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle state selection
  const handleStateSelection = useCallback((stateCode) => {
    setFormData(prev => {
      const currentStates = prev.authorizedStates || [];
      if (currentStates.includes(stateCode)) {
        return {
          ...prev,
          authorizedStates: currentStates.filter(
            (code) => code !== stateCode
          ),
        };
      } else {
        return {
          ...prev,
          authorizedStates: [...currentStates, stateCode],
        };
      }
    });
  }, []);

  // Filter states based on search term
  const filteredStates = useMemo(() => {
    return states.filter(
      (state) =>
        state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
        state.code.toLowerCase().includes(stateSearchTerm.toLowerCase())
    );
  }, [stateSearchTerm]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    }
    // Add other validation rules as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      if (isEditMode && provider) {
        updateProviderMutation.mutate({ id: provider.id, ...formData }, {
          onSuccess: () => {
            toast.success('Provider updated successfully');
            queryClient.invalidateQueries(['providers']);
            onCloseModal();
          },
          onError: (error) => {
            toast.error(`Error updating provider: ${error.message}`);
          }
        });
      } else {
        addProviderMutation.mutate(formData, {
          onSuccess: () => {
            toast.success('Provider added successfully');
            queryClient.invalidateQueries(['providers']);
            onCloseModal();
          },
          onError: (error) => {
            toast.error(`Error adding provider: ${error.message}`);
          }
        });
      }
    } else {
       toast.error(errors.name || 'Validation failed. Please check the form.');
    }
  }, [formData, validateForm, isEditMode, provider, addProviderMutation, updateProviderMutation, queryClient, onCloseModal, errors]);

  return {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    stateSearchTerm,
    setStateSearchTerm,
    filteredStates,
    handleInputChange,
    handleStateSelection,
    handleSubmit,
    errors,
    isSubmitting: addProviderMutation.isLoading || updateProviderMutation.isLoading,
  };
};

export default useProviderForm;
