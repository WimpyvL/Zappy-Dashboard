import React, { useState } from 'react';
import {
  useSubscriptionDurations,
  useUpdateSubscriptionDuration,
  useCreateSubscriptionDuration,
  useDeleteSubscriptionDuration
} from '../../apis/subscriptionDurations/hooks';
import { toast } from 'react-toastify';

// Components
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useSubscriptionDurationForm from '../../hooks/useSubscriptionDurationForm';

const SubscriptionDurationsPage = () => {
  const [editingDurationId, setEditingDurationId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all durations
  const { data: durations, isLoading, refetch } = useSubscriptionDurations();

  // Update duration mutation
  const { mutate: updateDuration, isLoading: isUpdating } = useUpdateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Subscription duration updated successfully');
      setEditingDurationId(null);
      refetch();
    }
  });

  // Create duration mutation
  const { mutate: createDuration, isLoading: isCreatingDuration } = useCreateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Subscription duration created successfully');
      setIsCreating(false);
      refetch();
    }
  });

  // Delete duration mutation
  const { mutate: deleteDuration, isLoading: isDeleting } = useDeleteSubscriptionDuration({
    onSuccess: () => {
      toast.success('Subscription duration deleted successfully');
      refetch();
    }
  });

  // Hook for the create form
  const {
    formData: newDuration,
    errors: createErrors,
    handleInputChange: handleCreateFieldChange,
    handleNumericChange: handleCreateNumericChange,
    validateForm: validateCreateForm,
    setFormData: setNewDuration,
  } = useSubscriptionDurationForm({
    name: '',
    duration_months: 1,
    duration_days: null,
    discount_percent: 0
  });

  // Hook for the edit form
  const editingDuration = durations?.find(d => d.id === editingDurationId);
  const {
    formData: editFormData,
    errors: editErrors,
    handleInputChange: handleEditFieldChange,
    handleNumericChange: handleEditNumericChange,
    validateForm: validateEditForm,
    setFormData: setEditFormData,
  } = useSubscriptionDurationForm(editingDuration || {
    name: '',
    duration_months: 1,
    duration_days: null,
    discount_percent: 0
  });

  // Handle edit mode toggle
  const handleEditToggle = (duration) => {
    if (editingDurationId === duration.id) {
      setEditingDurationId(null);
    } else {
      setEditingDurationId(duration.id);
    }
  };

  // Handle create mode toggle
  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    // Reset new duration form when toggling off
    if (isCreating) {
       setNewDuration({
        name: '',
        duration_months: 1,
        duration_days: null,
        discount_percent: 0
      });
    }
  };

  // Handle update submission
  const handleUpdateSubmit = () => {
    if (validateEditForm()) {
      updateDuration({
        id: editingDurationId,
        durationData: {
          name: editFormData.name,
          duration_months: editFormData.duration_months,
          duration_days: editFormData.duration_days,
          discount_percent: editFormData.discount_percent || 0
        }
      });
    } else {
       toast.error(editErrors.duration || editErrors.name || 'Validation failed.');
    }
  };

  // Handle create submission
  const handleCreateSubmit = () => {
    if (validateCreateForm()) {
      createDuration(newDuration, {
        onError: (error) => {
          console.error('Detailed error:', error);
          toast.error(`Failed to create: ${error.message || 'Unknown error'}`);
        }
      });
    } else {
       toast.error(createErrors.duration || createErrors.name || 'Validation failed.');
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subscription duration? This action cannot be undone.')) {
      deleteDuration(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Subscription Durations" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Subscription Durations"
        actionButton={{
          label: isCreating ? "Cancel" : "Add Duration",
          onClick: handleCreateToggle
        }}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Months)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Days)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isCreating && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Quarterly"
                    value={newDuration.name}
                    onChange={handleCreateFieldChange}
                    name="name"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded"
                    value={newDuration.duration_months}
                    onChange={handleCreateNumericChange}
                    name="duration_months"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded"
                    value={newDuration.duration_days || ''}
                    placeholder="Optional"
                    onChange={handleCreateNumericChange}
                    name="duration_days"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border rounded"
                    value={newDuration.discount_percent}
                    onChange={handleCreateNumericChange}
                    name="discount_percent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={handleCreateSubmit}
                    disabled={isCreatingDuration}
                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded mr-2"
                  >
                    {isCreatingDuration ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCreateToggle}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}

            {durations?.length > 0 ? (
              durations.map(duration => (
                <tr key={duration.id} className={`hover:bg-gray-50 ${editingDurationId === duration.id ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDurationId === duration.id ? (
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editFormData.name}
                        onChange={handleEditFieldChange}
                        name="name"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{duration.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDurationId === duration.id ? (
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border rounded"
                        value={editFormData.duration_months}
                        onChange={handleEditNumericChange}
                        name="duration_months"
                      />
                    ) : (
                      duration.duration_months
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDurationId === duration.id ? (
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border rounded"
                        value={editFormData.duration_days || ''}
                        placeholder="Optional"
                        onChange={handleEditNumericChange}
                        name="duration_days"
                      />
                    ) : (
                      duration.duration_days || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDurationId === duration.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full p-2 border rounded"
                        value={editFormData.discount_percent}
                        onChange={handleEditNumericChange}
                        name="discount_percent"
                      />
                    ) : (
                      `${duration.discount_percent || 0}%`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingDurationId === duration.id ? (
                      <>
                        <button
                          onClick={handleUpdateSubmit}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded mr-2"
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingDurationId(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditToggle(duration)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(duration.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No subscription durations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <h3 className="font-bold">About Subscription Durations</h3>
        <p>Subscription durations determine the length and discount for each billing cycle option.</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Set up durations like Monthly (28 days), Quarterly, Semi-Annual, and Annual</li>
          <li>Use either months or exact days for precise billing periods</li>
          <li>Configure discounts to incentivize longer commitments</li>
          <li>All treatment packages will use these durations for subscription options</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionDurationsPage;
