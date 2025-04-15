import React, { useState, useEffect, useMemo } from "react"; // Added useMemo, useEffect
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
  Briefcase, // Added Briefcase
  AlertTriangle // Added AlertTriangle for ErrorAlert
} from "lucide-react";
// import { useAppContext } from "../../context/AppContext"; // Removed
// TODO: Import useServices, useSubscriptionPlans, useProducts, useCreateService, useUpdateService, useDeleteService hooks
import { toast } from 'react-toastify'; // Added toast
import { useQueryClient } from '@tanstack/react-query'; // Added query client
import LoadingSpinner from "../patients/patientDetails/common/LoadingSpinner"; // Added LoadingSpinner import
import { Modal, FormInput, FormSelect, FormTextarea, FormCheckbox, Badge } from '../products/ProductComponents'; // Added shared components import

// Internal Components (Re-added ErrorAlert)
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


// Generate unique ID helper function (if needed for temporary keys)
function generateRandomId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

const ServiceManagement = () => {
  // TODO: Replace context usage with hooks
  // const { services, subscriptionPlans, loading, addService, updateService, deleteService, getAllPlans } = useAppContext();
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = {data: {data: []}}; // Placeholder for useServices hook
  const { data: plansData, isLoading: plansLoading, error: plansError } = {data: {data: []}}; // Placeholder for useSubscriptionPlans hook
  const { data: productsData, isLoading: productsLoading, error: productsError } = {data: {data: []}}; // Placeholder for useProducts hook

  const services = servicesData?.data || [];
  const allPlans = plansData?.data || [];
  const allProducts = productsData?.data || [];

  // TODO: Use mutation hooks
  const addService = async (data) => { console.warn("addService needs implementation"); toast.info("Adding service..."); };
  const updateService = async (id, data) => { console.warn("updateService needs implementation"); toast.info("Updating service..."); };
  const deleteService = async (id) => { console.warn("deleteService needs implementation"); toast.info("Deleting service..."); };

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true, // Use 'active' based on previous state, map to 'is_active' for DB
    requiresConsultation: true,
    associatedProducts: [], // Should store product IDs
    availablePlans: [], // Array of objects: { planId: string, duration: string, requiresSubscription: boolean }
  });

  // Filter services based on search (client-side for now)
  const filteredServices = useMemo(() => services.filter((service) => {
    return (
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }), [services, searchTerm]);

  // --- Handlers ---
  const handleAddService = () => {
    setFormData({ name: "", description: "", active: true, requiresConsultation: true, associatedProducts: [], availablePlans: [] });
    setShowAddModal(true);
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    // Map DB 'is_active' to form's 'active'
    const initialAvailablePlans = (Array.isArray(service.availablePlans) ? service.availablePlans : []).map(planConfig => ({
        planId: planConfig.planId, // Assuming planId is stored
        duration: planConfig.duration || '1 month', // Provide default
        requiresSubscription: planConfig.requiresSubscription !== undefined ? planConfig.requiresSubscription : true,
    }));
     const initialAssociatedProducts = Array.isArray(service.associatedProducts) ? service.associatedProducts.map(p => p.id || p) : []; // Handle object or just ID

    setFormData({
      name: service.name || "",
      description: service.description || "",
      active: service.is_active !== undefined ? service.is_active : true, // Map from is_active
      requiresConsultation: service.requires_consultation !== undefined ? service.requires_consultation : true, // Map from requires_consultation
      associatedProducts: initialAssociatedProducts,
      availablePlans: initialAvailablePlans,
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => { /* ... (keep existing logic) ... */ };
  const handleProductSelection = (productId) => { /* ... (keep existing logic) ... */ };
  const handlePlanSelection = (planId) => { /* ... (keep existing logic) ... */ };
  const handlePlanConfigChange = (planId, field, value) => { /* ... (keep existing logic) ... */ };

  const handleSubmit = async () => {
    try {
      // Map form state back to DB schema (active -> is_active)
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        is_active: formData.active,
        requires_consultation: formData.requiresConsultation,
        // Assuming associatedProducts stores IDs and availablePlans stores the object structure
        associated_products: formData.associatedProducts, // Adjust if backend expects different format
        available_plans: formData.availablePlans, // Adjust if backend expects different format
      };

      if (showAddModal) {
        await addService(dataToSend); // Replace with createServiceMutation.mutate(dataToSend);
        setShowAddModal(false);
      } else if (showEditModal && currentService) {
        await updateService(currentService.id, dataToSend); // Replace with updateServiceMutation.mutate({ id: currentService.id, serviceData: dataToSend });
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error submitting service:", error);
      toast.error("Failed to save service.");
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
        await deleteService(id); // Replace with deleteServiceMutation.mutate(id);
    }
  };

  const getPlanNameById = (id) => { /* ... (keep existing logic using allPlans state) ... */ };
  const getProductNameById = (id) => { /* ... (keep existing logic using allProducts state) ... */ };
  const renderPlanConfiguration = () => { /* ... (keep existing logic using allPlans state) ... */ };
  const renderProductSelection = () => { /* ... (keep existing logic using allProducts state) ... */ };

  // --- Render ---
  if (servicesLoading || plansLoading || productsLoading) { // Check loading states from hooks
    return <LoadingSpinner message="Loading service data..." />;
  }

  // Combine errors if needed
  const error = servicesError || plansError || productsError;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700" onClick={handleAddService}>
          <Plus className="h-5 w-5 mr-2" /> Add Service
        </button>
      </div>

      {error && <ErrorAlert message={error.message || "Failed to load data."} />}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" placeholder="Search services..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Services list */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Plans</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{service.name}</div></td>
                  <td className="px-6 py-4 max-w-xs"><div className="text-sm text-gray-500 truncate" title={service.description}>{service.description}</div></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Array.isArray(service.available_plans) && service.available_plans.map((planConfig) => ( // Use available_plans from schema
                        <span key={planConfig.planId} className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800" title={`Duration: ${planConfig.duration || 'N/A'}, Subscription: ${planConfig.requiresSubscription ? 'Yes' : 'No'}`}>
                          {getPlanNameById(planConfig.planId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Array.isArray(service.associated_products) && service.associated_products.map((productId) => ( // Use associated_products from schema
                        <span key={productId} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {getProductNameById(productId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {service.is_active ? "Active" : "Inactive"} {/* Use is_active */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => handleEditService(service)} title="Edit Service"><Edit className="h-5 w-5" /></button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteService(service.id)} title="Delete Service"><Trash2 className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))
            ) : ( <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No services found matching criteria.</td></tr> )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modals */}
      {(showAddModal || showEditModal) && (
        <Modal
          title={showAddModal ? "Add New Service" : "Edit Service"}
          isOpen={showAddModal || showEditModal}
          onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
          onSubmit={handleSubmit}
          submitText={showAddModal ? "Add Service" : "Save Changes"}
          // isSubmitting={createServiceMutation.isPending || updateServiceMutation.isPending} // TODO: Use mutation state
        >
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div> {/* Left Column */}
                 <FormInput label="Service Name *" name="name" value={formData.name} onChange={handleInputChange} required />
                 <FormTextarea label="Description" name="description" value={formData.description} onChange={handleInputChange} rows={4} />
                 <FormCheckbox label="Active" name="active" checked={formData.active} onChange={handleInputChange} />
                 <FormCheckbox label="Requires Consultation" name="requiresConsultation" checked={formData.requiresConsultation} onChange={handleInputChange} />
              </div>
              <div> {/* Right Column */}
                 {renderPlanConfiguration()}
                 {renderProductSelection()}
              </div>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default ServiceManagement;
