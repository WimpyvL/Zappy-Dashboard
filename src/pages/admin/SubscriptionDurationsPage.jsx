import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { 
  useSubscriptionDurations,
  useCreateSubscriptionDuration,
  useUpdateSubscriptionDuration,
  useDeleteSubscriptionDuration
} from '../../apis/subscriptionDurations/hooks';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SubscriptionDurationModal from '../../components/admin/SubscriptionDurationModal';
import { toast } from 'react-toastify';

const SubscriptionDurationsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: durationsData, isLoading } = useSubscriptionDurations();
  const durations = durationsData || [];

  // Mutations
  const createDurationMutation = useCreateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Billing cycle created successfully');
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(`Error creating billing cycle: ${error.message}`);
    }
  });

  const updateDurationMutation = useUpdateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Billing cycle updated successfully');
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(`Error updating billing cycle: ${error.message}`);
    }
  });

  const deleteDurationMutation = useDeleteSubscriptionDuration({
    onSuccess: () => {
      toast.success('Billing cycle deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting billing cycle: ${error.message}`);
    }
  });

  // Filter durations based on search term
  const filteredDurations = durations.filter(duration => 
    duration.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle actions
  const handleAddNew = () => {
    setIsEditMode(false);
    setCurrentDuration(null);
    setShowModal(true);
  };

  const handleEdit = (duration) => {
    setIsEditMode(true);
    setCurrentDuration(duration);
    setShowModal(true);
  };

  const handleDelete = (duration) => {
    if (!window.confirm(`Are you sure you want to delete the "${duration.name}" billing cycle?`)) {
      return;
    }
    deleteDurationMutation.mutate(duration.id);
  };

  const handleSubmit = (durationData) => {
    if (isEditMode && currentDuration) {
      updateDurationMutation.mutate({
        id: currentDuration.id,
        durationData
      });
    } else {
      createDurationMutation.mutate(durationData);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Subscription Billing Cycles" />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Subscription Billing Cycles" />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleAddNew}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Billing Cycle
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search billing cycles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Months)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Days)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDurations.map((duration) => (
                <tr key={duration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{duration.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{duration.duration_months}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{duration.duration_days || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{duration.discount_percent || 0}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEdit(duration)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(duration)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDurations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No billing cycles found matching your search' : 'No billing cycles found. Click "Add New Billing Cycle" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {filteredDurations.length} billing cycles found
          </p>
        </div>
      </div>

      {/* Modal */}
      <SubscriptionDurationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        duration={isEditMode ? currentDuration : null}
        isSubmitting={createDurationMutation.isLoading || updateDurationMutation.isLoading}
      />
    </div>
  );
};

export default SubscriptionDurationsPage;
