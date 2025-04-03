import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Tag,
  Layers,
  Calendar,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const ServiceManagement = () => {
  const {
    services,
    subscriptionPlans, // Assuming this holds the plan definitions {id, name, billingFrequency, ...}
    loading,
    addService,
    updateService,
    deleteService,
    getAllPlans, // Function to get all possible plans {id, name, ...}
    // Need access to products for the product selection part
    // products, // Assuming products are available in context: {id, name, ...}
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    requiresConsultation: true,
    associatedProducts: [],
    availablePlans: [], // Array of objects: { planId: number, duration: string, requiresSubscription: boolean }
  });

  // Get all available plans for selection modals
  const allPlans = getAllPlans ? getAllPlans() : [];
  // Get all products for selection modals (replace with actual product fetching if needed)
  const allProducts = [
    { id: 1, name: "Product 1" },
    { id: 2, name: "Product 2" },
    { id: 3, name: "Product 3" },
    { id: 4, name: "Product 4" },
    // Add more products as needed from context or API
  ];


  // Filter services based on search
  const filteredServices = services.filter((service) => {
    return (
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Handle adding new service
  const handleAddService = () => {
    setFormData({
      name: "",
      description: "",
      active: true,
      requiresConsultation: true,
      associatedProducts: [],
      availablePlans: [],
    });
    setShowAddModal(true);
  };

  // Handle editing service
  const handleEditService = (service) => {
    setCurrentService(service);
    // Ensure availablePlans is an array before mapping
    const currentAvailablePlans = Array.isArray(service.availablePlans) ? service.availablePlans : [];
    const initialAvailablePlans = currentAvailablePlans.map(planConfig => {
      // Find the plan details to potentially pre-fill defaults if needed
      const planDetails = allPlans.find(p => p.id === planConfig.planId);
      return {
        planId: planConfig.planId,
        // Use existing duration/subscription if available, otherwise default
        duration: planConfig.duration || planDetails?.billingFrequency || '1 month', // Default to '1 month' if no other info
        requiresSubscription: planConfig.requiresSubscription !== undefined ? planConfig.requiresSubscription : true // Default to true
      };
    });

    setFormData({
      name: service.name || "",
      description: service.description || "",
      active: service.active !== undefined ? service.active : true,
      requiresConsultation: service.requiresConsultation !== undefined ? service.requiresConsultation : true,
      associatedProducts: Array.isArray(service.associatedProducts) ? [...service.associatedProducts] : [],
      availablePlans: initialAvailablePlans,
    });
    setShowEditModal(true);
  };


  // Handle form input changes for basic fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle product selection/deselection
  const handleProductSelection = (productId) => {
    const isSelected = formData.associatedProducts.includes(productId);
    setFormData(prevFormData => ({
      ...prevFormData,
      associatedProducts: isSelected
        ? prevFormData.associatedProducts.filter(id => id !== productId)
        : [...prevFormData.associatedProducts, productId]
    }));
  };

  // Handle plan selection/deselection
  const handlePlanSelection = (planId) => {
    const isSelected = formData.availablePlans.some(p => p.planId === planId);
    if (isSelected) {
      // Remove the plan object
      setFormData({
        ...formData,
        availablePlans: formData.availablePlans.filter(p => p.planId !== planId),
      });
    } else {
      // Add the plan object with default settings
      const planDetails = allPlans.find(p => p.id === planId);
      setFormData({
        ...formData,
        availablePlans: [
          ...formData.availablePlans,
          {
            planId: planId,
            duration: '1 month', // Default duration when adding
            requiresSubscription: true // Default subscription requirement when adding
          }
        ],
      });
    }
  };

  // Handle changes within a selected plan's configuration (duration, subscription)
  const handlePlanConfigChange = (planId, field, value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      availablePlans: prevFormData.availablePlans.map(planConfig => {
        if (planConfig.planId === planId) {
          // Handle checkbox value specifically
          const newValue = field === 'requiresSubscription' ? (value.target ? value.target.checked : value) : value;
          return { ...planConfig, [field]: newValue };
        }
        return planConfig;
      })
    }));
  };


  // Handle form submission
  const handleSubmit = async () => {
    try {
      // IMPORTANT: Ensure the data sent matches what the backend/context expects
      // The current formData.availablePlans is an array of objects.
      // If the backend expects only an array of plan IDs, transform it here.
      const dataToSend = {
        ...formData,
        // Example transformation if backend expects only IDs:
        // availablePlans: formData.availablePlans.map(p => p.planId)
      };

      if (showAddModal) {
        await addService(dataToSend);
        setShowAddModal(false);
      } else if (showEditModal && currentService) {
        await updateService(currentService.id, dataToSend);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error submitting service:", error);
      // TODO: Handle error (show message to user, etc.)
    }
  };

  // Handle deleting service
  const handleDeleteService = async (id) => {
    // TODO: Add confirmation dialog before deleting
    try {
      await deleteService(id);
    } catch (error) {
      console.error("Error deleting service:", error);
      // TODO: Handle error (show message to user, etc.)
    }
  };

  // Get plan name by ID
  const getPlanNameById = (id) => {
    const plan = allPlans.find((p) => p.id === id);
    return plan ? plan.name : `Plan ID ${id}`;
  };

  // Get product name by ID
  const getProductNameById = (id) => {
    const product = allProducts.find(p => p.id === id);
    return product ? product.name : `Product ID ${id}`;
  };

  // Helper function to render the plan configuration section in modals
  const renderPlanConfiguration = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Plans
      </label>
      <div className="border border-gray-300 rounded-md p-2 h-48 overflow-y-auto space-y-2">
        {allPlans.length === 0 && <p className="text-xs text-gray-500 p-2">No plans available.</p>}
        {allPlans.map((plan) => {
          const planConfig = formData.availablePlans.find(p => p.planId === plan.id);
          const isSelected = !!planConfig;

          return (
            <div key={plan.id} className={`p-2 rounded ${isSelected ? 'bg-indigo-50 border border-indigo-200' : ''}`}>
              {/* Plan Selection Row */}
              <div
                className={`flex items-center cursor-pointer ${isSelected ? '' : 'hover:bg-gray-100'}`}
                onClick={() => handlePlanSelection(plan.id)}
              >
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded-full border mr-2 flex-shrink-0 ${
                    isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <Calendar className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                <div className="text-sm font-medium flex-grow truncate" title={plan.name}>{plan.name}</div>
              </div>

              {/* Configuration for Selected Plan */}
              {isSelected && planConfig && ( // Ensure planConfig exists
                <div className="mt-2 pl-7 space-y-2">
                  {/* Duration Input (Text Input) */}
                  <div>
                    <label htmlFor={`duration-${plan.id}`} className="block text-xs font-medium text-gray-600 mb-0.5">Duration</label>
                    <input
                      type="text"
                      id={`duration-${plan.id}`}
                      value={planConfig.duration}
                      onChange={(e) => handlePlanConfigChange(plan.id, 'duration', e.target.value)}
                      placeholder="e.g., 1 month, 90 days"
                      className="block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    />
                  </div>
                  {/* Requires Subscription Checkbox */}
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      id={`requiresSubscription-${plan.id}`}
                      checked={planConfig.requiresSubscription}
                      onChange={(e) => handlePlanConfigChange(plan.id, 'requiresSubscription', e)} // Pass event directly
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor={`requiresSubscription-${plan.id}`} className="text-xs text-gray-700">Subscription Required</label>
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

  // Helper function to render product selection
   const renderProductSelection = () => (
     <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
         Standalone Products {/* Renamed Label */}
       </label>
       <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto">
         {allProducts.length === 0 && <p className="text-xs text-gray-500 p-2">No products available.</p>}
         {allProducts.map((product) => (
           <div
             key={product.id}
             className={`flex items-center p-2 rounded cursor-pointer ${
               formData.associatedProducts.includes(product.id)
                 ? "bg-indigo-100"
                 : "hover:bg-gray-100"
             }`}
             onClick={() => handleProductSelection(product.id)}
           >
             <div
               className={`w-5 h-5 flex items-center justify-center rounded-full border mr-2 flex-shrink-0 ${
                 formData.associatedProducts.includes(product.id)
                   ? "bg-indigo-600 border-indigo-600"
                   : "border-gray-300"
               }`}
             >
               {formData.associatedProducts.includes(product.id) && (
                 <Check className="h-3 w-3 text-white" />
               )}
             </div>
             <div className="ml-2">
               <div className="text-sm font-medium truncate" title={product.name}>
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


  if (loading.services) {
    return (
      <div className="flex justify-center items-center p-8">
        Loading services...
      </div>
    );
  }

  // Main component render
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={handleAddService}
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
                    <div className="text-sm text-gray-500 truncate" title={service.description}>
                      {service.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {/* Display configured plan details in the table */}
                      {Array.isArray(service.availablePlans) && service.availablePlans.map((planConfig) => (
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
                      {Array.isArray(service.associatedProducts) && service.associatedProducts.map((productId) => (
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
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {service.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleEditService(service)}
                      title="Edit Service"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteService(service.id)} // Consider adding confirmation
                      title="Delete Service"
                    >
                      <Trash2 className="h-5 w-5" />
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
                {showAddModal ? "Add New Service" : "Edit Service"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
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
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                onClick={handleSubmit}
                disabled={!formData.name}
              >
                {showAddModal ? "Add Service" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
