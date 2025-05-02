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

const SubscriptionDurationsPage = () => {
  const [editingDuration, setEditingDuration] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newDuration, setNewDuration] = useState({
    name: '',
    duration_months: 1,
    duration_days: null,
    discount_percent: 0
  });

  // Fetch all durations
  const { data: durations, isLoading, refetch } = useSubscriptionDurations();

  // Update duration mutation
  const { mutate: updateDuration, isLoading: isUpdating } = useUpdateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Subscription duration updated successfully');
      setEditingDuration(null);
      refetch();
    }
  });

  // Create duration mutation
  const { mutate: createDuration, isLoading: isCreatingDuration } = useCreateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Subscription duration created successfully');
      setIsCreating(false);
      setNewDuration({
        name: '',
        duration_months: 1,
        duration_days: null,
        discount_percent: 0
      });
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

  // Handle edit mode toggle
  const handleEditToggle = (duration) => {
    if (editingDuration?.id === duration.id) {
      setEditingDuration(null);
    } else {
      setEditingDuration({ ...duration });
    }
  };

  // Handle create mode toggle
  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    setNewDuration({
      name: '',
      duration_months: 1,
      discount_percent: 0
    });
  };

  // Handle field updates for editing
  const handleEditFieldChange = (field, value) => {
    setEditingDuration(prev => ({
      ...prev,
      [field]: field === 'duration_months' || field === 'discount_percent' 
        ? parseFloat(value) 
        : value
    }));
  };

  // Handle field updates for creating
  const handleCreateFieldChange = (field, value) => {
    setNewDuration(prev => ({
      ...prev,
      [field]: field === 'duration_months' || field === 'discount_percent' 
        ? parseFloat(value) 
        : value
    }));
  };

  // Handle update submission
  const handleUpdateSubmit = () => {
    if (!editingDuration.name || (editingDuration.duration_months <= 0 && !editingDuration.duration_days)) {
      toast.error('Name and at least one duration type are required. Duration must be greater than 0.');
      return;
    }

    updateDuration({
      id: editingDuration.id,
      durationData: {
        name: editingDuration.name,
        duration_months: editingDuration.duration_months,
        duration_days: editingDuration.duration_days,
        discount_percent: editingDuration.discount_percent || 0
      }
    });
  };

  // Handle create submission
  const handleCreateSubmit = () => {
    if (!newDuration.name || (newDuration.duration_months <= 0 && !newDuration.duration_days)) {
      toast.error('Name and at least one duration type are required. Duration must be greater than 0.');
      return;
    }

    // Log the data being sent
    console.log('Creating duration with:', newDuration);

    createDuration(newDuration, {
      onError: (error) => {
        console.error('Detailed error:', error);
        toast.error(`Failed to create: ${error.message || 'Unknown error'}`);
      }
    });
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
                    onChange={(e) => handleCreateFieldChange('name', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded"
                    value={newDuration.duration_months}
                    onChange={(e) => handleCreateFieldChange('duration_months', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded"
                    value={newDuration.duration_days || ''}
                    placeholder="Optional"
                    onChange={(e) => handleCreateFieldChange('duration_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border rounded"
                    value={newDuration.discount_percent}
                    onChange={(e) => handleCreateFieldChange('discount_percent', e.target.value)}
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
                <tr key={duration.id} className={`hover:bg-gray-50 ${editingDuration?.id === duration.id ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDuration?.id === duration.id ? (
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editingDuration.name}
                        onChange={(e) => handleEditFieldChange('name', e.target.value)}
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{duration.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDuration?.id === duration.id ? (
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border rounded"
                        value={editingDuration.duration_months}
                        onChange={(e) => handleEditFieldChange('duration_months', e.target.value)}
                      />
                    ) : (
                      duration.duration_months
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDuration?.id === duration.id ? (
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border rounded"
                        value={editingDuration.duration_days || ''}
                        placeholder="Optional"
                        onChange={(e) => handleEditFieldChange('duration_days', e.target.value ? parseInt(e.target.value) : null)}
                      />
                    ) : (
                      duration.duration_days || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDuration?.id === duration.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full p-2 border rounded"
                        value={editingDuration.discount_percent}
                        onChange={(e) => handleEditFieldChange('discount_percent', e.target.value)}
                      />
                    ) : (
                      `${duration.discount_percent || 0}%`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingDuration?.id === duration.id ? (
                      <>
                        <button
                          onClick={handleUpdateSubmit}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded mr-2"
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingDuration(null)}
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
