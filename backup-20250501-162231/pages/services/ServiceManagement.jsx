import React, { useState } from 'react'; // Removed unused useEffect
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  // Tag, // Removed unused import
  // Layers, // Removed unused import
  Calendar,
  Loader2, // Added for loading state
  AlertTriangle, // Added for error state
} from 'lucide-react';
import { toast } from 'react-toastify'; // Import toast for notifications
import ErrorBoundary from '../../components/common/ErrorBoundary';
import {
  useServices,
  useCreateService, // Corrected hook name
  useUpdateService,
  useDeleteService,
} from '../../apis/services/hooks'; // Assuming these exist
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks'; // Assuming this exists
import { useProducts } from '../../apis/products/hooks'; // Assuming this exists

const ServiceManagementContent = () => {
  // Fetch data using React Query hooks
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices();
  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: errorPlans,
  } = useSubscriptionPlans();
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useProducts();

  // Mutation hooks
  const addServiceMutation = useCreateService({ // Corrected hook name
    onSuccess: () => {
      setShowAddModal(false); // Close modal on success
      toast.success('Service created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating service: ${error.message || 'Unknown error'}`);
      console.error('Error adding service:', error);
    },
  });
  const updateServiceMutation = useUpdateService({
    onSuccess: () => {
      setShowEditModal(false); // Close modal on success
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating service: ${error.message || 'Unknown error'}`);
      console.error('Error updating service:', error);
    },
  });
  const deleteServiceMutation = useDeleteService({
    onSuccess: () => toast.success('Service deleted successfully'),
    onError: (error) => {
      toast.error(`Error deleting service: ${error.message || 'Unknown error'}`);
      console.error('Error deleting service:', error);
    },
  });

  // Local state for UI control and form data
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    requiresConsultation: true,
    associatedProducts: [],
    availablePlans: [], // Array of objects: { planId: number, duration: string, requiresSubscription: boolean }
  });

  // Process fetched data
  const allServices = servicesData?.data || servicesData || [];
  const allPlans = plansData?.data || plansData || [];
  const allProducts = productsData?.data || productsData || [];

  // Filter services based on search
  const filteredServices = allServices.filter((service) => {
    const name = service.name || '';
    const description = service.description || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle adding new service modal opening
  const handleAddServiceModal = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
      requiresConsultation: true,
      associatedProducts: [],
      availablePlans: [],
    });
    setCurrentService(null); // Ensure no previous edit state lingers
    setShowAddModal(true);
  };

  // Handle editing service modal opening
  const handleEditServiceModal = (service) => {
    setCurrentService(service);
    const currentAvailablePlans = Array.isArray(service.availablePlans)
      ? service.availablePlans
      : [];
    const initialAvailablePlans = currentAvailablePlans.map((planConfig) => {
      const planDetails = allPlans.find((p) => p.id === planConfig.planId);
      return {
        planId: planConfig.planId,
        duration:
          planConfig.duration || planDetails?.billingFrequency || '1 month',
        requiresSubscription:
          planConfig.requiresSubscription !== undefined
            ? planConfig.requiresSubscription
            : true,
      };
    });

    setFormData({
      name: service.name || '',
      description: service.description || '',
      active: service.active !== undefined ? service.active : true,
      requiresConsultation:
        service.requiresConsultation !== undefined
          ? service.requiresConsultation
          : true,
      associatedProducts: Array.isArray(service.associatedProducts)
        ? [...service.associatedProducts]
        : [],
      availablePlans: initialAvailablePlans,
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle product selection/deselection
  const handleProductSelection = (productId) => {
    setFormData((prev) => ({
      ...prev,
      associatedProducts: prev.associatedProducts.includes(productId)
        ? prev.associatedProducts.filter((id) => id !== productId)
        : [...prev.associatedProducts, productId],
    }));
  };

  // Handle plan selection/deselection
  const handlePlanSelection = (planId) => {
    setFormData((prev) => ({
      ...prev,
      availablePlans: prev.availablePlans.some((p) => p.planId === planId)
        ? prev.availablePlans.filter((p) => p.planId !== planId)
        : [
            ...prev.availablePlans,
            { planId: planId, duration: '1 month', requiresSubscription: true },
          ],
    }));
  };

  // Handle changes within a selected plan's configuration
  const handlePlanConfigChange = (planId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availablePlans: prev.availablePlans.map((planConfig) => {
        if (planConfig.planId === planId) {
          const newValue =
            field === 'requiresSubscription'
              ? (value.target?.checked ?? value) // Handle checkbox event or direct boolean
              : value;
          return { ...planConfig, [field]: newValue };
        }
        return planConfig;
      }),
    }));
  };

  // Handle form submission using mutation hooks
  const handleSubmit = () => {
    // Ensure data matches backend expectations (e.g., plan IDs only?)
    const dataToSend = { ...formData };
    if (showAddModal) {
      addServiceMutation.mutate(dataToSend);
    } else if (showEditModal && currentService) {
      updateServiceMutation.mutate({ id: currentService.id, ...dataToSend });
    }
  };

  // Handle deleting service using mutation hook
  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  // Get plan name by ID from fetched data
  const getPlanNameById = (id) => {
    const plan = allPlans.find((p) => p.id === id);
    return plan ? plan.name : `Plan ID ${id}`;
  };

  // Get product name by ID from fetched data
  const getProductNameById = (id) => {
    const product = allProducts.find((p) => p.id === id);
    return product ? product.name : `Product ID ${id}`;
  };

  // --- Render Helper Functions ---
  const renderPlanConfiguration = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Plans
      </label>
      <div className="border border-gray-300 rounded-md p-2 h-48 overflow-y-auto space-y-2">
        {isLoadingPlans && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoadingPlans && allPlans.length === 0 && (
          <p className="text-xs text-gray-500 p-2">No plans available.</p>
        )}
        {!isLoadingPlans &&
          allPlans.map((plan) => {
            const planConfig = formData.availablePlans.find(
              (p) => p.planId === plan.id
            );
            const isSelected = !!planConfig;

            return (
              <div
                key={plan.id}
                className={`p-2 rounded ${isSelected ? 'bg-indigo-50 border border-indigo-200' : ''}`}
              >
                <div
                  className={`flex items-center cursor-pointer ${isSelected ? '' : 'hover:bg-gray-100'}`}
                  onClick={() => handlePlanSelection(plan.id)}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center rounded-full border mr-2 flex-shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                  <div
                    className="text-sm font-medium flex-grow truncate"
                    title={plan.name}
                  >
                    {plan.name}
                  </div>
                </div>
                {isSelected && planConfig && (
                  <div className="mt-2 pl-7 space-y-2">
                    <div>
                      <label
                        htmlFor={`duration-${plan.id}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        Duration
                      </label>
                      <input
                        type="text"
                        id={`duration-${plan.id}`}
                        value={planConfig.duration}
                        onChange={(e) =>
                          handlePlanConfigChange(
                            plan.id,
                            'duration',
                            e.target.value
                          )
                        }
                        placeholder="e.g., 1 month, 90 days"
                        className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                      />
                    </div>
                    <div className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        id={`requiresSubscription-${plan.id}`}
                        checked={planConfig.requiresSubscription}
                        onChange={(e) =>
                          handlePlanConfigChange(
                            plan.id,
                            'requiresSubscription',
                            e // Pass event directly
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                      />
                      <label
                        htmlFor={`requiresSubscription-${plan.id}`}
                        className="text-xs text-gray-700"
                      >
                        Subscription Required
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {formData.availablePlans.length} plans selected
      </p>
    </div>
  );

  const renderProductSelection = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Standalone Products
      </label>
      <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto">
        {isLoadingProducts && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoadingProducts && allProducts.length === 0 && (
          <p className="text-xs text-gray-500 p-2">No products available.</p>
        )}
        {!isLoadingProducts &&
          allProducts.map((product) => (
            <div
              key={product.id}
              className={`flex items-center p-2 rounded cursor-pointer ${
                formData.associatedProducts.includes(product.id)
                  ? 'bg-indigo-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleProductSelection(product.id)}
            >
              <div
                className={`w-5 h-5 flex items-center justify-center rounded-full border mr-2 flex-shrink-0 ${
                  formData.associatedProducts.includes(product.id)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300'
                }`}
              >
                {formData.associatedProducts.includes(product.id) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <div className="ml-2">
                <div
                  className="text-sm font-medium truncate"
                  title={product.name}
                >
                  {product.name}
                </div>
              </div>
            </div>
          ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {formData.associatedProducts.length} products selected
      </p>
    </div>
  );

  // --- Main Component Render ---

  // Handle combined loading state
  if (isLoadingServices || isLoadingPlans || isLoadingProducts) {
    return (
      <div className="flex justify-center items-center p-8 h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle combined error state
  if (errorServices || errorPlans || errorProducts) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        <p>Error loading data.</p>
        {/* Optionally show specific errors */}
        {/* <p className="text-xs">{errorServices?.message || errorPlans?.message || errorProducts?.message}</p> */}
      </div>
    );
  }

  const isMutating =
    addServiceMutation.isLoading ||
    updateServiceMutation.isLoading ||
    deleteServiceMutation.isLoading;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={handleAddServiceModal}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search services..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Services list */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Plans
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Associated Products
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
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {service.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div
                      className="text-sm text-gray-500 truncate"
                      title={service.description}
                    >
                      {service.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Array.isArray(service.availablePlans) &&
                        service.availablePlans.map((planConfig) => (
                          <span
                            key={planConfig.planId}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
                            title={`Duration: ${planConfig.duration || 'N/A'}, Subscription: ${planConfig.requiresSubscription ? 'Yes' : 'No'}`}
                          >
                            {getPlanNameById(planConfig.planId)}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Array.isArray(service.associatedProducts) &&
                        service.associatedProducts.map((productId) => (
                          <span
                            key={productId}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                          >
                            {getProductNameById(productId)}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50"
                      onClick={() => handleEditServiceModal(service)}
                      title="Edit Service"
                      disabled={isMutating}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      onClick={() => handleDeleteService(service.id)}
                      title="Delete Service"
                      disabled={
                        isMutating ||
                        deleteServiceMutation.variables === service.id
                      }
                    >
                      {deleteServiceMutation.isLoading &&
                      deleteServiceMutation.variables === service.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No services found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {showAddModal ? 'Add New Service' : 'Edit Service'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
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
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiresConsultation"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.requiresConsultation}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requires Consultation
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {renderPlanConfiguration()}
                {renderProductSelection()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
                onClick={handleSubmit}
                disabled={
                  !formData.name ||
                  addServiceMutation.isLoading ||
                  updateServiceMutation.isLoading
                }
              >
                {(addServiceMutation.isLoading ||
                  updateServiceMutation.isLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {showAddModal ? 'Add Service' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap the component with an error boundary
const ServiceManagement = () => {
  return (
    <ErrorBoundary 
      title="Service Management Error"
      message="An error occurred while displaying the Service Management page. Please try again or contact support if the issue persists."
      showError={process.env.NODE_ENV !== 'production'}
    >
      <ServiceManagementContent />
    </ErrorBoundary>
  );
};

export default ServiceManagement;
