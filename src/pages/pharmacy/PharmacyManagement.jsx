import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  usePharmacies,
  useCreatePharmacy,
  useUpdatePharmacy,
  useDeletePharmacy,
  useTogglePharmacyActive,
} from '../../apis/pharmacies/hooks';
import { US_STATES } from '../../constants/countryStates';
import { PHARMACY_TYPES } from '../../constants/pharmacies';

// Internal Components
const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-red-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

const StatusBadge = ({ active }) => (
  <span
    className={`px-2 py-1 text-xs font-medium rounded-full ${
      active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}
  >
    {active ? 'Active' : 'Inactive'}
  </span>
);

const TypeBadge = ({ type }) => {
  const getBgColor = (pharmacyType) => {
    const lowerType = pharmacyType.toLowerCase();
    if (lowerType === 'compounding') return 'bg-purple-100 text-purple-800';
    if (lowerType === 'retail') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getBgColor(
        type
      )}`}
    >
      {type}
    </span>
  );
};

// Main PharmacyTable component
const PharmacyTable = ({
  pharmacies,
  onEdit,
  onDelete,
  isDeleting,
  onToggleActive,
}) => {
  if (!pharmacies.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pharmacies found matching your search criteria.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Pharmacy Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contact
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            States Served
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
        {pharmacies.map((pharmacy) => (
          <tr key={pharmacy.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {pharmacy.name}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <TypeBadge type={pharmacy.pharmacy_type} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {pharmacy.contact_name}
              </div>
              <div className="text-sm text-gray-500">
                {pharmacy.contact_email}
              </div>
              <div className="text-sm text-gray-500">
                {pharmacy.contact_phone}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-1 max-w-xs">
                {pharmacy.served_state_codes.map((state) => (
                  <span
                    key={state}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                  >
                    {state}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => onToggleActive(pharmacy.id, !pharmacy.active)}
                className="border-0 bg-transparent cursor-pointer"
              >
                <StatusBadge active={pharmacy.active} />
              </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer disabled:opacity-50"
                onClick={() => onEdit(pharmacy)}
                aria-label={`Edit ${pharmacy.name}`}
                disabled={isDeleting}
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                className="text-red-600 hover:text-red-900 cursor-pointer disabled:opacity-50"
                onClick={() => onDelete(pharmacy.id)}
                aria-label={`Delete ${pharmacy.name}`}
                disabled={isDeleting}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// PharmacyFormModal component
const PharmacyFormModal = ({
  onClose,
  onSubmit,
  title,
  submitText,
  initialData = null,
  isSubmitting,
}) => {
  const INITIAL_FORM_DATA = {
    name: '',
    pharmacy_type: 'Compounding',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    active: true,
    served_state_codes: [],
  };

  const [formData, setFormData] = useState(initialData || INITIAL_FORM_DATA);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [validationError, setValidationError] = useState('');

  // Filter states based on search term
  const filteredStates = US_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      state.code.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setValidationError('');
  };

  // Handle state selection
  const handleStateSelection = (stateCode) => {
    if (formData.served_state_codes.includes(stateCode)) {
      setFormData({
        ...formData,
        served_state_codes: formData.served_state_codes.filter(
          (code) => code !== stateCode
        ),
      });
    } else {
      setFormData({
        ...formData,
        served_state_codes: [...formData.served_state_codes, stateCode],
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      setValidationError('Pharmacy name is required');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            className="text-gray-400 hover:text-gray-500 cursor-pointer"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {validationError && (
            <div className="mx-6 mt-4 p-2 text-sm text-red-600 bg-red-50 rounded">
              {validationError}
            </div>
          )}

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="pharmacy-name"
                >
                  Pharmacy Name *
                </label>
                <input
                  id="pharmacy-name"
                  type="text"
                  name="name"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="pharmacy-type"
                >
                  Pharmacy Type
                </label>
                <select
                  id="pharmacy-type"
                  name="pharmacy_type"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.pharmacy_type}
                  onChange={handleInputChange}
                >
                  {PHARMACY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contact-name"
                >
                  Contact Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="contact_name"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contact-email"
                >
                  Contact Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="contact_email"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contact-phone"
                >
                  Contact Phone
                </label>
                <input
                  id="contact-phone"
                  type="text"
                  name="contact_phone"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                States Served
              </label>
              <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search states..."
                    className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={stateSearchTerm}
                    onChange={(e) => setStateSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {filteredStates.map((state) => (
                    <div
                      key={state.code}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        formData.served_state_codes.includes(state.code)
                          ? 'bg-indigo-100'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleStateSelection(state.code)}
                    >
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                          formData.served_state_codes.includes(state.code)
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.served_state_codes.includes(state.code) && (
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
                {formData.served_state_codes.length} states selected
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formData.name}
            >
              {isSubmitting ? 'Saving...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main PharmacyManagement component
const PharmacyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPharmacy, setCurrentPharmacy] = useState(null);

  // Use React Query hooks
  const { data: pharmaciesData, isLoading, error } = usePharmacies();
  debugger;
  const pharmacies = useMemo(() => {
    return pharmaciesData?.data ?? [];
  }, [pharmaciesData?.data]);

  const createPharmacy = useCreatePharmacy({
    onSuccess: () => {
      setShowAddModal(false);
    },
  });

  const updatePharmacy = useUpdatePharmacy({
    onSuccess: () => {
      setShowEditModal(false);
    },
  });

  const deletePharmacy = useDeletePharmacy();
  const togglePharmacyActive = useTogglePharmacyActive();

  // Filter pharmacies based on search and type
  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pharmacy.contact_name &&
        pharmacy.contact_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      typeFilter === 'all' ||
      pharmacy.pharmacy_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Handle adding new pharmacy
  const handleAddPharmacy = () => {
    setShowAddModal(true);
  };

  // Handle editing pharmacy
  const handleEditPharmacy = (pharmacy) => {
    setCurrentPharmacy(pharmacy);
    setShowEditModal(true);
  };

  // Handle adding pharmacy submission
  const handleAddSubmit = async (formData) => {
    try {
      await createPharmacy.mutateAsync(formData);
      return true;
    } catch (err) {
      console.error('Error creating pharmacy:', err);
      return false;
    }
  };

  // Handle editing pharmacy submission
  const handleEditSubmit = async (formData) => {
    try {
      await updatePharmacy.mutateAsync({
        id: currentPharmacy.id,
        pharmacyData: formData,
      });
      return true;
    } catch (err) {
      console.error('Error updating pharmacy:', err);
      return false;
    }
  };

  // Handle deleting pharmacy
  const handleDeletePharmacy = async (id) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      try {
        await deletePharmacy.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting pharmacy:', err);
      }
    }
  };

  // Handle toggling pharmacy active status
  const handleToggleActive = async (id, active) => {
    try {
      await togglePharmacyActive.mutateAsync({ id, active });
    } catch (err) {
      console.error('Error toggling pharmacy active status:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pharmacy Management
        </h1>
        <button
          className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={handleAddPharmacy}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Pharmacy
        </button>
      </div>

      {/* Error alert */}
      {(error ||
        createPharmacy.error ||
        updatePharmacy.error ||
        deletePharmacy.error ||
        togglePharmacyActive.error) && (
        <ErrorAlert
          message={
            error?.message ||
            createPharmacy.error?.message ||
            updatePharmacy.error?.message ||
            deletePharmacy.error?.message ||
            togglePharmacyActive.error?.message ||
            'An error occurred'
          }
        />
      )}

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search pharmacies..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {PHARMACY_TYPES.map((type) => (
              <option key={type.value} value={type.value.toLowerCase()}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pharmacies list */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <PharmacyTable
            pharmacies={filteredPharmacies}
            onEdit={handleEditPharmacy}
            onDelete={handleDeletePharmacy}
            onToggleActive={handleToggleActive}
            isDeleting={deletePharmacy.isPending}
          />
        )}
      </div>

      {/* Add/Edit Pharmacy Modals */}
      {showAddModal && (
        <PharmacyFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          title="Add New Pharmacy"
          submitText="Add Pharmacy"
          isSubmitting={createPharmacy.isPending}
        />
      )}

      {showEditModal && currentPharmacy && (
        <PharmacyFormModal
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          title="Edit Pharmacy"
          submitText="Save Changes"
          initialData={currentPharmacy}
          isSubmitting={updatePharmacy.isPending}
        />
      )}
    </div>
  );
};

export default PharmacyManagement;
