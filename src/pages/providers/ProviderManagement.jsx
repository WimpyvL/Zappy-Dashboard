import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Filter,
  UserPlus,
  Award,
  FileText,
  Image,
  AlertCircle, // Added AlertCircle import
  CheckCircle, // Added CheckCircle import
} from 'lucide-react';
import {
  useProviders,
  useAddProvider,
  useUpdateProvider,
  useDeleteProvider,
} from '../../apis/providers/hooks';
import { useAuth } from '../../contexts/auth/AuthContext';
import Toast from '../../components/ui/Toast'; // Import Toast component
import useProviderFilters from '../../hooks/useProviderFilters'; // Import useProviderFilters hook
import useProviderForm from '../../hooks/useProviderForm'; // Import useProviderForm hook


// List of US states
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


const ProviderManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);


  const { data: providers = [], isLoading, error } = useProviders();
  const addProvider = useAddProvider();
  const updateProvider = useUpdateProvider();
  const deleteProvider = useDeleteProvider();

  const {
    searchTerm,
    setSearchTerm,
    specialtyFilter,
    setSpecialtyFilter,
    filteredProviders,
    specialties,
  } = useProviderFilters(providers);

  // Hook for the provider form
  const {
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
    isSubmitting: isFormSubmitting, // Renamed to avoid conflict with mutation loading
  } = useProviderForm(currentProvider, () => {
     setShowAddModal(false);
     setShowEditModal(false);
     setCurrentProvider(null);
  });


  // Effect to handle mutation success and error states
  useEffect(() => {
    // Handle add provider success
    if (addProvider.isSuccess) {
      setToast({
        message: 'Provider added successfully',
        type: 'success'
      });
      queryClient.invalidateQueries(['providers']);
    }

    // Handle add provider error
    if (addProvider.isError) {
      setToast({
        message: `Error adding provider: ${addProvider.error?.message || 'Unknown error'}`,
        type: 'error'
      });
    }

    // Handle update provider success
    if (updateProvider.isSuccess) {
      setToast({
        message: 'Provider updated successfully',
        type: 'success'
      });
      queryClient.invalidateQueries(['providers']);
    }

    // Handle update provider error
    if (updateProvider.isError) {
      setToast({
        message: `Error updating provider: ${updateProvider.error?.message || 'Unknown error'}`,
        type: 'error'
      });
    }

    // Handle delete provider success
    if (deleteProvider.isSuccess) {
      setToast({
        message: 'Provider deleted successfully',
        type: 'success'
      });
      queryClient.invalidateQueries(['providers']);
    }

    // Handle delete provider error
    if (deleteProvider.isError) {
      setToast({
        message: `Error deleting provider: ${deleteProvider.error?.message || 'Unknown error'}`,
        type: 'error'
      });
    }
  }, [
    addProvider.isSuccess, addProvider.isError, addProvider.error,
    updateProvider.isSuccess, updateProvider.isError, updateProvider.error,
    deleteProvider.isSuccess, deleteProvider.isError, deleteProvider.error,
    queryClient
  ]);

  // Handle deleting provider
  // Handle resource edit
  const handleEditProvider = (provider) => {
    setCurrentProvider(provider);
    setShowEditModal(true);
  };

  // Handle deleting provider
  const handleDeleteProvider = (id) => {
    deleteProvider.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading providers</div>;

  return (
    <div className="p-6">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Provider Management
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={() => {
             setCurrentProvider(null); // Clear current provider for add mode
             setShowAddModal(true);
             setActiveTab('basic'); // Reset tab to basic
             setFormData({ // Reset form data
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
          }}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Provider
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search providers..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="all">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Providers list */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {provider.name}
                    </div>
                    {provider.credentials && (
                      <div className="text-xs text-gray-500">
                        {provider.credentials}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {provider.specialty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {provider.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {provider.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        provider.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {provider.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleEditProvider(provider)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No providers found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provider Modal (Add/Edit) */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {showAddModal ? 'Add New Provider' : 'Edit Provider'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`px-6 py-3 border-b-2 text-sm font-medium ${
                    activeTab === 'basic'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic Information
                </button>
                <button
                  className={`px-6 py-3 border-b-2 text-sm font-medium ${
                    activeTab === 'professional'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('professional')}
                >
                  Professional Details
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialty
                      </label>
                      <input
                        type="text"
                        name="specialty"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                        value={formData.specialty}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={formData.active}
                          onChange={handleInputChange}
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      States Authorized
                    </label>
                    <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto">
                      <div className="mb-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Search states..."
                          className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 rounded-md"
                          value={stateSearchTerm}
                          onChange={(e) => setStateSearchTerm(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              const allStateCodes = states.map(state => state.code);
                              setFormData({
                                ...formData,
                                authorizedStates: allStateCodes
                              });
                            }}
                            className="flex-1 px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                authorizedStates: []
                              });
                            }}
                            className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {filteredStates.map((state) => (
                          <div
                            key={state.code}
                            className={`flex items-center p-2 rounded cursor-pointer ${
                              formData.authorizedStates.includes(state.code)
                                ? 'bg-indigo-100'
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleStateSelection(state.code)}
                          >
                            <div
                              className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                                formData.authorizedStates.includes(state.code)
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {formData.authorizedStates.includes(state.code) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span className="ml-2 text-sm">
                              {state.code} - {state.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.authorizedStates.length} states selected
                    </p>
                  </div>
                </div>
              )}

              {/* Professional Details Tab */}
              {activeTab === 'professional' && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <p className="text-yellow-700 text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Professional details settings are currently in development and will be available in a future update.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Award className="h-4 w-4 inline mr-1" />
                        Credentials
                      </label>
                      <input
                        type="text"
                        name="credentials"
                        placeholder="MD, NP, PA, etc."
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md bg-gray-100"
                        disabled
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FileText className="h-4 w-4 inline mr-1" />
                        License Number
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Image className="h-4 w-4 inline mr-1" />
                      Profile Image URL
                    </label>
                    <input
                      type="text"
                      name="profileImageUrl"
                      placeholder="https://example.com/image.jpg"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md bg-gray-100"
                      disabled
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biography
                    </label>
                    <textarea
                      name="biography"
                      rows="4"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md bg-gray-100"
                      placeholder="Professional biography and background information"
                      disabled
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                onClick={handleSubmit}
                disabled={!formData.name}
              >
                {showAddModal ? 'Add Provider' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderManagement;
