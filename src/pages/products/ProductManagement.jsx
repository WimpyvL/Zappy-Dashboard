import React, { useState, useEffect } from 'react'; // Added useEffect back
import {
  // Search, // Removed unused import
  Plus,
  Edit,
  Trash2,
  // Eye, // Removed unused import
  // AlertCircle, // Removed unused import
  Filter,
  Tag,
  Package,
  // DollarSign, // Removed unused import
  Check,
  Briefcase, // Icon for Service
  Loader2, // Added
  AlertTriangle, // Added for error display
} from 'lucide-react';

import {
  PageHeader,
  SearchAndFilters,
  Badge,
  Modal,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
} from './ProductComponents'; // Assuming these are present and functional

import { useServices } from '../../apis/services/hooks';
import {
  useProducts,
  useCreateProduct, // Renamed from useAddProduct
  useUpdateProduct,
  useDeleteProduct,
} from '../../apis/products/hooks';
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan, // Renamed import
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
} from '../../apis/subscriptionPlans/hooks';
import { toast } from 'react-toastify'; // Assuming toast notifications

// Component to manage medication doses (Price removed, allowOneTimePurchase added, stripePriceId added)
const DosesFormSection = ({ doses = [], onChange }) => {
  // Added stripePriceId to state
  const [newDose, setNewDose] = useState({ value: '', description: '', allowOneTimePurchase: false, stripePriceId: '' });

  const handleAddDose = () => {
    if (newDose.value.trim() === '') return;
    // Added stripePriceId to new dose object
    const updatedDoses = [
      ...doses,
      {
        id: `temp_${Date.now()}`, // Use timestamp for temporary ID
        value: newDose.value,
        description: newDose.description,
        allowOneTimePurchase: newDose.allowOneTimePurchase,
        stripePriceId: newDose.stripePriceId // Add stripePriceId
      }
    ];
    onChange(updatedDoses);
    // Reset stripePriceId as well
    setNewDose({ value: '', description: '', allowOneTimePurchase: false, stripePriceId: '' });
  };

  const handleRemoveDose = (doseId) => {
    onChange(doses.filter((dose) => dose.id !== doseId));
  };

  const handleDoseChange = (e, field, doseId) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    if (doseId) {
      onChange(
        doses.map((dose) =>
          dose.id === doseId ? { ...dose, [field]: value } : dose
        )
      );
    } else {
      setNewDose((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4">
      <h4 className="text-md font-medium mb-4">Available Doses</h4>
      {doses.length > 0 ? (
        <div className="mb-4 space-y-4">
          {doses.map((dose) => (
            <div
              key={dose.id}
              className="flex items-start bg-gray-50 p-3 rounded-md"
            >
              <div className="flex-grow flex flex-col space-y-2">
                {/* Dose Value */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Dose
                  </label>
                  <input
                    type="text"
                    value={dose.value}
                    onChange={(e) => handleDoseChange(e, 'value', dose.id)}
                    placeholder="e.g., 10mg"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={dose.description || ''}
                    onChange={(e) =>
                      handleDoseChange(e, 'description', dose.id)
                    }
                    placeholder="Description for this dose"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                  />
                </div>
                {/* Allow One-Time Purchase */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    id={`allowOneTime-${dose.id}`}
                    checked={!!dose.allowOneTimePurchase}
                    onChange={(e) =>
                      handleDoseChange(e, 'allowOneTimePurchase', dose.id)
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                   <label
                     htmlFor={`allowOneTime-${dose.id}`}
                     className="ml-2 text-xs text-gray-700"
                   >
                     Allow One-Time Purchase
                   </label>
                 </div>
                 {/* Stripe Price ID for Subscription Dose */}
                 <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stripe Price ID (Subscription)</label>
                    <input
                      type="text"
                      value={dose.stripePriceId || ''}
                      onChange={(e) => handleDoseChange(e, 'stripePriceId', dose.id)}
                      placeholder="price_..."
                      className="block w-full pl-3 pr-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md bg-gray-100"
                      // readOnly // Consider making read-only if managed by backend
                    />
                 </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDose(dose.id)}
                className="ml-3 p-1 text-red-500 hover:text-red-700 mt-12" // Adjusted margin
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-md">
          No doses added yet.
        </p>
      )}
      {/* Add New Dose Section */}
      <div className="mt-3 pt-4 border-t">
        <h5 className="text-sm font-medium mb-3">Add New Dose</h5>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex flex-col space-y-3">
            {/* Dose Value */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Dose
              </label>
              <input
                type="text"
                value={newDose.value}
                onChange={(e) => handleDoseChange(e, 'value')}
                placeholder="e.g., 10mg"
                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
              />
            </div>
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={newDose.description}
                onChange={(e) => handleDoseChange(e, 'description')}
                placeholder="Description for this dose"
                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
              />
            </div>
            {/* Allow One-Time Purchase */}
            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                id="allowOneTime-new"
                checked={newDose.allowOneTimePurchase}
                onChange={(e) => handleDoseChange(e, 'allowOneTimePurchase')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="allowOneTime-new"
                className="ml-2 text-xs text-gray-700"
              >
                 Allow One-Time Purchase
               </label>
             </div>
             {/* Stripe Price ID for Subscription Dose */}
             <div className="mt-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Stripe Price ID (Subscription)</label>
                <input
                  type="text"
                  value={newDose.stripePriceId}
                  onChange={(e) => handleDoseChange(e, 'stripePriceId')}
                  placeholder="price_..."
                  className="block w-full pl-3 pr-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                />
             </div>
            {/* Add Button */}
            <div className="flex justify-end mt-3"> {/* Adjusted margin */}
              {/* Use primary color for Add Dose button */}
              <button
                type="button"
                onClick={handleAddDose}
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center text-sm hover:bg-primary/90"
                disabled={!newDose.value.trim()}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Dose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  // --- Fetch Data ---
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useServices();
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useProducts();
  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: errorPlans,
  } = useSubscriptionPlans();

  // --- Process Fetched Data ---
  const services = servicesData?.data || servicesData || [];
  const allProducts = productsData?.data || productsData || [];
  const allSubscriptionPlans = plansData?.data || plansData || [];

  // --- Mutation Hooks ---
  const addProductMutation = useCreateProduct({
    onSuccess: () => setShowProductModal(false),
  });
  const addPlanMutation = useCreateSubscriptionPlan({ // Corrected hook name
    onSuccess: () => setShowPlanModal(false),
  });
  const updateProductMutation = useUpdateProduct({
    onSuccess: () => setShowProductModal(false),
  });
  const deleteProductMutation = useDeleteProduct();
  const updatePlanMutation = useUpdateSubscriptionPlan({ // This is the correct one for plans
    onSuccess: () => setShowPlanModal(false),
  });
  const deletePlanMutation = useDeleteSubscriptionPlan();

  // --- Local UI State ---
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  // --- Form State ---
  // Initial form state - Product (Added stripePriceId fields)
  const initialProductFormData = {
    name: '',
    type: 'medication',
    description: '',
    price: 0, // For non-med one-time
    oneTimePurchasePrice: 0, // For med one-time
    active: true,
    requiresPrescription: true,
    category: 'weight-management',
    associatedServiceIds: [],
    stockStatus: 'in-stock',
    interactionWarnings: [],
    doses: [],
    allowOneTimePurchase: false, // For non-med one-time flag
    fulfillmentSource: 'compounding_pharmacy',
    stripePriceId: '', // For non-med one-time price ID
    stripeOneTimePriceId: '' // For med one-time price ID
  };
   const [productFormData, setProductFormData] = useState(initialProductFormData);
   // Initial form state - Plan (updated for doses, added stripePriceId)
   const initialPlanFormData = {
     name: '',
     description: '',
     billingFrequency: 'monthly',
     deliveryFrequency: 'monthly',
     price: 0,
     active: true,
     discount: 0,
     allowedProductDoses: [],
     category: 'weight-management',
     popularity: 'medium',
     requiresConsultation: true,
     additionalBenefits: [],
     stripePriceId: '' // Added Stripe Price ID for the plan itself
   };
   const [planFormData, setPlanFormData] = useState(initialPlanFormData);

  // --- Derived Data ---
  const productCategories = [
    ...new Set([
      ...allProducts.map((p) => p.category),
      ...allSubscriptionPlans.map((p) => p.category),
    ]),
  ]
    .filter(Boolean)
    .sort();

  // Log the derived categories and options for debugging
  useEffect(() => {
    console.log("Derived Product Categories:", productCategories);
    const categoryOptions = [
      { value: 'all', label: 'All Categories' },
      ...productCategories.map((c) => ({ value: c, label: formatCategoryName(c) })),
    ];
    console.log("Category Filter Options Passed:", categoryOptions);
  }, [productCategories]); // Rerun if categories change

  const filteredProducts = allProducts.filter(
    (p) =>
      (typeFilter === 'all' || p.type === typeFilter) &&
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (serviceFilter === 'all' ||
        (Array.isArray(p.associatedServiceIds) &&
          p.associatedServiceIds.includes(parseInt(serviceFilter)))) &&
      ((p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPlans = allSubscriptionPlans.filter(
    (p) =>
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      ((p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Handlers ---
  const handleDosesChange = (updatedDoses) =>
    setProductFormData((prev) => ({ ...prev, doses: updatedDoses }));

  const handleAddProduct = () => {
    setEditMode(false);
    setCurrentProduct(null);
    setProductFormData(initialProductFormData);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditMode(true);
    setCurrentProduct(product);
    setProductFormData({
      name: product.name || '',
      type: product.type || 'medication',
      description: product.description || '',
      price: product.price || 0,
      oneTimePurchasePrice: product.oneTimePurchasePrice || 0,
      active: product.active !== undefined ? product.active : true,
      requiresPrescription:
        product.requiresPrescription !== undefined
          ? product.requiresPrescription
          : true,
      category: product.category || 'weight-management',
      associatedServiceIds: Array.isArray(product.associatedServiceIds)
        ? [...product.associatedServiceIds]
        : [],
      stockStatus: product.stockStatus || 'in-stock',
      interactionWarnings: product.interactionWarnings || [],
      doses: Array.isArray(product.doses)
        ? product.doses.map((d) => ({ ...d, id: d.id || `temp_${Date.now()}` }))
        : [], // Ensure doses have IDs
      allowOneTimePurchase:
        product.allowOneTimePurchase !== undefined
          ? product.allowOneTimePurchase
          : false,
      fulfillmentSource:
        product.fulfillmentSource ||
        (product.type === 'medication'
          ? 'compounding_pharmacy'
          : 'internal_supplement'),
       // Load stripe price IDs into form state
       stripePriceId: product.stripePriceId || '', // For non-med one-time
       stripeOneTimePriceId: product.stripeOneTimePriceId || '' // For med one-time
     });
     setShowProductModal(true);
  };

  const handleAddPlan = () => {
    setEditMode(false);
    setCurrentPlan(null);
    setPlanFormData(initialPlanFormData);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditMode(true);
     setCurrentPlan(plan);
     // Ensure allowedProductDoses is initialized correctly and load stripePriceId
     setPlanFormData({
       ...plan,
       allowedProductDoses: Array.isArray(plan.allowedProductDoses) ? [...plan.allowedProductDoses] : [],
       additionalBenefits: Array.isArray(plan.additionalBenefits) ? [...plan.additionalBenefits] : [], // Keep this line
       stripePriceId: plan.stripePriceId || '' // Load plan's stripePriceId
     });
     setShowPlanModal(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue =
      type === 'checkbox'
        ? checked
        : type === 'number' ||
            name === 'price' ||
            name === 'oneTimePurchasePrice'
          ? parseFloat(value) || 0
          : value;
    if (name === 'interactionWarnings') {
      setProductFormData((prev) => ({
        ...prev,
        [name]: value.split(',').map((item) => item.trim()),
      }));
    } else {
      setProductFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleServiceSelectionChange = (serviceId) => {
    setProductFormData((prev) => {
      const currentIds = prev.associatedServiceIds || [];
      const newIds = currentIds.includes(serviceId)
        ? currentIds.filter((id) => id !== serviceId)
        : [...currentIds, serviceId];
      return { ...prev, associatedServiceIds: newIds };
    });
  };

  const handlePlanInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue =
      type === 'checkbox'
        ? checked
        : type === 'number'
          ? parseFloat(value) || 0
          : value;
    if (name === 'additionalBenefits') {
      setPlanFormData((prev) => ({
        ...prev,
        [name]: value.split(',').map((item) => item.trim()),
      }));
    } else {
      setPlanFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleDoseSelectionChange = (productId, doseId) => {
    setPlanFormData((prev) => {
      const currentDoses = prev.allowedProductDoses || [];
      const doseIndex = currentDoses.findIndex(
        (d) => d.productId === productId && d.doseId === doseId
      );
      let newDoses =
        doseIndex > -1
          ? currentDoses.filter((_, index) => index !== doseIndex)
          : [...currentDoses, { productId, doseId }];
      return { ...prev, allowedProductDoses: newDoses };
    });
  };

  // Submit handlers using mutations
  const handleProductSubmit = () => {
    const submissionData = { ...productFormData };
    // Clean up data based on type
    if (submissionData.type !== 'medication') {
      delete submissionData.doses;
      delete submissionData.oneTimePurchasePrice;
    } else {
      delete submissionData.price;
      // Ensure doses have valid structure if needed by backend
      submissionData.doses = (submissionData.doses || []).map((dose) => ({
        value: dose.value,
        description: dose.description,
        allowOneTimePurchase: !!dose.allowOneTimePurchase,
        // Remove temporary ID if backend assigns its own
        id:
          typeof dose.id === 'string' && dose.id.startsWith('temp_')
            ? undefined
            : dose.id,
         stripePriceId: dose.stripePriceId // Include subscription price ID
       }));
     }
     // Include one-time price IDs
     submissionData.stripePriceId = submissionData.stripePriceId || '';
     submissionData.stripeOneTimePriceId = submissionData.stripeOneTimePriceId || '';
    submissionData.active = !!submissionData.active;
    submissionData.requiresPrescription = !!submissionData.requiresPrescription;
    submissionData.allowOneTimePurchase = !!submissionData.allowOneTimePurchase;

    if (editMode && currentProduct) {
      updateProductMutation.mutate({
        id: currentProduct.id,
        productData: submissionData,
      });
    } else {
      addProductMutation.mutate(submissionData);
    }
  };

  const handlePlanSubmit = () => {
    const submissionData = { ...planFormData };
    submissionData.allowedProductDoses = Array.isArray(
      submissionData.allowedProductDoses
    )
      ? submissionData.allowedProductDoses
      : [];
    delete submissionData.allowedProducts; // Remove old field if present
    // Ensure stripePriceId is included
    submissionData.stripePriceId = submissionData.stripePriceId || '';

    if (editMode && currentPlan) {
      updatePlanMutation.mutate({
        id: currentPlan.id,
        planData: submissionData,
      });
    } else {
      addPlanMutation.mutate(submissionData);
    }
  };

  // Delete handlers using mutations
  const handleDeleteProduct = (id) => {
    // Check if any dose of this product is in any plan
    const isUsed = allSubscriptionPlans.some(
      (plan) =>
        Array.isArray(plan.allowedProductDoses) &&
        plan.allowedProductDoses.some((doseRef) => doseRef.productId === id)
    );
    if (isUsed) {
      toast.error(
        'This product cannot be deleted as one of its doses is used in a subscription plan.'
      );
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleDeletePlan = (id) => {
    if (
      window.confirm('Are you sure you want to delete this subscription plan?')
    ) {
      deletePlanMutation.mutate(id);
    }
  };

  // Utility functions
  const getServiceNameById = (id) =>
    services.find((s) => s.id === id)?.name || null;
  const formatCategoryName = (category) =>
    category
      ? category
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Uncategorized';
  const formatFulfillmentSource = (source) =>
    source
      ? source.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : 'N/A';
  const getProductDoseName = (productId, doseId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return 'Unknown Product';
    const dose = product.doses?.find((d) => d.id === doseId);
    return dose ? `${product.name} ${dose.value}` : product.name;
  };

  // --- Render ---
  const isLoading = isLoadingServices || isLoadingProducts || isLoadingPlans;
  const isMutating =
    addProductMutation.isLoading ||
    updateProductMutation.isLoading ||
    deleteProductMutation.isLoading ||
    addPlanMutation.isLoading ||
    updatePlanMutation.isLoading ||
    deletePlanMutation.isLoading;
  const error = errorServices || errorProducts || errorPlans;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-64">
        {/* Use primary color for spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        <p>Error loading data.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden pb-10"> {/* Add relative positioning and padding */}
      <PageHeader title="Product & Subscription Management" />
      {/* Tabs */}
      <div className="mb-6 relative z-10"> {/* Added z-index */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {/* Use primary color for active tab */}
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Package className="h-4 w-4 inline-block mr-1" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'plans' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Tag className="h-4 w-4 inline-block mr-1" />
              Subscription Plans
            </button>
          </nav>
        </div>
      </div>
      {/* Search and filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder={
          activeTab === 'products'
            ? 'Search products...'
            : 'Search subscription plans...'
        }
        filters={[
          ...(activeTab === 'products'
            ? [
                {
                  value: typeFilter,
                  onChange: setTypeFilter,
                  options: [
                    { value: 'all', label: 'All Types' },
                    { value: 'medication', label: 'Medications' },
                    { value: 'supplement', label: 'Supplements' },
                    { value: 'service', label: 'Services' },
                  ],
                  icon: Filter,
                },
              ]
            : []),
          ...(activeTab === 'products' &&
          Array.isArray(services) &&
          services.length > 0
            ? [
                {
                  value: serviceFilter,
                  onChange: setServiceFilter,
                  options: [
                    { value: 'all', label: 'All Services' },
                    ...services.map((s) => ({
                      value: s.id.toString(),
                      label: s.name,
                    })),
                  ],
                  icon: Briefcase,
                },
              ]
            : []),
          {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: 'all', label: 'All Categories' },
              ...productCategories.map((c) => ({
                value: c,
                label: formatCategoryName(c),
              })),
            ],
          },
        ]}
      >
        {/* Use primary color for Add button */}
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
          onClick={activeTab === 'products' ? handleAddProduct : handleAddPlan}
        >
          <Plus className="h-5 w-5 mr-2" />
          {activeTab === 'products' ? 'Add Product' : 'Add Plan'}
        </button>
      </SearchAndFilters>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {/* Removed redundant Add Product button */}
          <div className="bg-white shadow overflow-hidden rounded-lg mt-6">
            {' '}
            {/* Added margin top */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name / Dose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Associated Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfillment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    One-Time Purchase
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
                {filteredProducts
                  .flatMap((product) => {
                    if (
                      product.type !== 'medication' ||
                      !Array.isArray(product.doses) ||
                      product.doses.length === 0
                    ) {
                      return [
                        {
                          ...product,
                          displayName: product.name,
                          key: `${product.id}-base`,
                          allowOneTimePurchase: !!product.allowOneTimePurchase,
                          price: product.price,
                        },
                      ];
                    }
                    return product.doses.map((dose, index) => ({
                      ...product,
                      displayName: `${product.name} ${dose.value}`,
                      currentDose: dose,
                      price: product.oneTimePurchasePrice,
                      doseDescription: dose.description,
                      key: `${product.id}-${dose.id}`,
                      isFirstDose: index === 0,
                      allowOneTimePurchase: !!dose.allowOneTimePurchase,
                    }));
                  })
                  .map((product) => (
                    <tr key={product.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.displayName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            product.type === 'medication'
                              ? 'bg-blue-100 text-blue-800'
                              : product.type === 'supplement'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                          }
                        >
                          {product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(product.associatedServiceIds) &&
                            product.associatedServiceIds.map((serviceId) => {
                              const serviceName = getServiceNameById(serviceId);
                              return serviceName ? (
                                <Badge
                                  key={serviceId}
                                  className="bg-gray-100 text-gray-800"
                                >
                                  {serviceName}
                                </Badge>
                              ) : null;
                            })}
                          {(!Array.isArray(product.associatedServiceIds) ||
                            product.associatedServiceIds.length === 0) && (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFulfillmentSource(product.fulfillmentSource)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.allowOneTimePurchase ? (
                          <span className="text-xs text-green-600 flex items-center">
                            <Check size={12} className="mr-1" />
                            Allowed (${Number(product.price).toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Subscription Only
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            product.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {(!product.currentDose || product.isFirstDose) && (
                          <>
                            {/* Use accent3 for Edit button */}
                            <button
                              className="text-accent3 hover:text-accent3/80 mr-3 disabled:opacity-50"
                              onClick={() =>
                                handleEditProduct(
                                  allProducts.find((p) => p.id === product.id)
                                )
                              }
                              disabled={isMutating}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            {/* Use accent1 for Delete button */}
                            <button
                              className="text-accent1 hover:text-accent1/80 disabled:opacity-50"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={
                                isMutating ||
                                deleteProductMutation.variables === product.id
                              }
                            >
                              {deleteProductMutation.isLoading &&
                              deleteProductMutation.variables === product.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <>
          {/* Removed redundant Add Plan button */}
          <div className="bg-white shadow overflow-hidden rounded-lg mt-6">
            {' '}
            {/* Added margin top */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Included Doses
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {plan.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {plan.description}
                      </div>
                      <div className="mt-1">
                        <Badge
                          className={
                            plan.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {plan.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-purple-100 text-purple-800">
                        {formatCategoryName(plan.category)}
                      </Badge>
                      <div className="mt-1 text-xs">
                        <span className="text-gray-500">Bill: </span>
                        <span className="font-medium capitalize">
                          {plan.billingFrequency}
                        </span>
                      </div>
                      <div className="mt-1 text-xs">
                        <span className="text-gray-500">Delivery: </span>
                        <span className="font-medium capitalize">
                          {plan.deliveryFrequency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        ${plan.price.toFixed(2)}
                      </div>
                      {plan.discount > 0 && (
                        <div className="text-xs text-green-600">
                          {plan.discount}% discount
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="mb-1 text-xs text-gray-500 font-medium">
                          {plan.allowedProductDoses?.length || 0} doses included
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(plan.allowedProductDoses) &&
                            plan.allowedProductDoses.map((doseRef) => (
                              <Badge
                                key={`${doseRef.productId}-${doseRef.doseId}`}
                                className="bg-gray-100 text-gray-800"
                              >
                                {getProductDoseName(
                                  doseRef.productId,
                                  doseRef.doseId
                                )}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Use accent3 for Edit button */}
                      <button
                        className="text-accent3 hover:text-accent3/80 mr-3 disabled:opacity-50"
                        onClick={() => handleEditPlan(plan)}
                        disabled={isMutating}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {/* Use accent1 for Delete button */}
                      <button
                        className="text-accent1 hover:text-accent1/80 disabled:opacity-50"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={
                          isMutating || deletePlanMutation.variables === plan.id
                        }
                      >
                        {deletePlanMutation.isLoading &&
                        deletePlanMutation.variables === plan.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No plans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Product Modal */}
      <Modal
        title={editMode ? 'Edit Product' : 'Add New Product'}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleProductSubmit}
        submitText={editMode ? 'Save Changes' : 'Add Product'}
        isSubmitting={
          addProductMutation.isLoading || updateProductMutation.isLoading
        }
      >
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-5">
            {/* Form Inputs */}
            <FormInput
              label="Product Name"
              name="name"
              value={productFormData.name}
              onChange={handleProductInputChange}
              required
            />
            <FormSelect
              label="Type"
              name="type"
              value={productFormData.type}
              onChange={handleProductInputChange}
              options={[
                { value: 'medication', label: 'Medication' },
                { value: 'supplement', label: 'Supplement' },
                { value: 'service', label: 'Service' },
              ]}
            />
            <FormSelect
              label="Fulfillment Source"
              name="fulfillmentSource"
              value={productFormData.fulfillmentSource}
              onChange={handleProductInputChange}
              options={[
                {
                  value: 'compounding_pharmacy',
                  label: 'Compounding Pharmacy',
                },
                { value: 'retail_pharmacy', label: 'Retail Pharmacy' },
                {
                  value: 'internal_supplement',
                  label: 'Internal (Supplement)',
                },
                { value: 'internal_service', label: 'Internal (Service)' },
              ]}
            />
            <FormSelect
              label="Category"
              name="category"
              value={productFormData.category}
              onChange={handleProductInputChange}
              options={productCategories.map((c) => ({
                value: c,
                label: formatCategoryName(c),
              }))}
            />
            <FormTextarea
              label="Description"
              name="description"
              value={productFormData.description}
              onChange={handleProductInputChange}
              rows={3}
            />
            {productFormData.type !== 'medication' && (
              <div className="mb-4"> {/* Added wrapper div */}
                <FormInput
                  label="Price (One-Time)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productFormData.price}
                    onChange={handleProductInputChange}
                    prefix="$"
                  />
                 {/* Stripe Price ID for One-Time Purchase (Non-Medication) */}
                 <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stripe Price ID (One-Time)</label>
                    <input
                      type="text"
                      name="stripePriceId" // Assuming one price ID for the product's one-time price
                      value={productFormData.stripePriceId || ''}
                      onChange={handleProductInputChange}
                      placeholder="price_..."
                      className="block w-full pl-3 pr-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                    />
                 </div>
               </div>
             )}
             {productFormData.type === 'medication' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Purchase Price</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                  <input type="number" name="oneTimePurchasePrice" min="0" step="0.01" className="block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" value={productFormData.oneTimePurchasePrice} onChange={handleProductInputChange}/>
                 </div>
                 {/* Stripe Price ID for One-Time Purchase (Medication) */}
                 <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stripe Price ID (One-Time)</label>
                    <input
                      type="text"
                      name="stripeOneTimePriceId" // Use a distinct name
                      value={productFormData.stripeOneTimePriceId || ''}
                      onChange={handleProductInputChange}
                      placeholder="price_..."
                      className="block w-full pl-3 pr-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                    />
                 </div>
               </div>
             )}
          </div>
          {/* Right Column */}
          <div className="col-span-7">
            {productFormData.type === 'medication' ? (
              <DosesFormSection
                doses={productFormData.doses || []}
                onChange={handleDosesChange}
              />
            ) : (
              <div>
                <FormSelect
                  label="Stock Status"
                  name="stockStatus"
                  value={productFormData.stockStatus}
                  onChange={handleProductInputChange}
                  options={[
                    { value: 'in-stock', label: 'In Stock' },
                    { value: 'limited', label: 'Limited Stock' },
                    { value: 'out-of-stock', label: 'Out of Stock' },
                    { value: 'backorder', label: 'On Backorder' },
                  ]}
                />{' '}
                <FormTextarea
                  label="Interaction Warnings"
                  name="interactionWarnings"
                  value={
                    Array.isArray(productFormData.interactionWarnings)
                      ? productFormData.interactionWarnings.join(', ')
                      : ''
                  }
                  onChange={handleProductInputChange}
                  rows={2}
                  placeholder="e.g. Nitrates, Beta-blockers"
                />{' '}
              </div>
            )}
            <div
              className={productFormData.type === 'medication' ? 'mt-4' : ''}
            >
              <FormSelect
                label="Stock Status"
                name="stockStatus"
                value={productFormData.stockStatus}
                onChange={handleProductInputChange}
                options={[
                  { value: 'in-stock', label: 'In Stock' },
                  { value: 'limited', label: 'Limited Stock' },
                  { value: 'out-of-stock', label: 'Out of Stock' },
                  { value: 'backorder', label: 'On Backorder' },
                ]}
              />
              {productFormData.type === 'medication' && (
                <FormTextarea
                  label="Interaction Warnings"
                  name="interactionWarnings"
                  value={
                    Array.isArray(productFormData.interactionWarnings)
                      ? productFormData.interactionWarnings.join(', ')
                      : ''
                  }
                  onChange={handleProductInputChange}
                  rows={2}
                  placeholder="e.g. Nitrates, Beta-blockers"
                />
              )}
              {/* Associated Services */}
              <div className="mb-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Services (Standalone)
                </label>
                <div className="border border-gray-300 rounded-md p-2 h-32 overflow-y-auto space-y-1">
                  {Array.isArray(services) ? (
                    services.map((service) => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`service-assoc-${service.id}`}
                          checked={
                            productFormData.associatedServiceIds?.includes(
                              service.id
                            ) || false
                          }
                          onChange={() =>
                            handleServiceSelectionChange(service.id)
                          }
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`service-assoc-${service.id}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">Loading services...</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-6 mt-4">
                <FormCheckbox
                  label="Active"
                  name="active"
                  checked={productFormData.active}
                  onChange={handleProductInputChange}
                />
                <FormCheckbox
                  label="Requires Prescription"
                  name="requiresPrescription"
                  checked={productFormData.requiresPrescription}
                  onChange={handleProductInputChange}
                />
                {productFormData.type !== 'medication' && (
                  <FormCheckbox
                    label="Allow One-Time Purchase"
                    name="allowOneTimePurchase"
                    checked={!!productFormData.allowOneTimePurchase}
                    onChange={handleProductInputChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Plan Modal */}
      <Modal
        title={editMode ? 'Edit Plan' : 'Add New Plan'}
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSubmit={handlePlanSubmit}
        submitText={editMode ? 'Save Changes' : 'Add Plan'}
        isSubmitting={addPlanMutation.isLoading || updatePlanMutation.isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {' '}
            {/* Left Column */}
            <FormInput
              label="Plan Name"
              name="name"
              value={planFormData.name}
              onChange={handlePlanInputChange}
              required
            />
            <FormTextarea
              label="Description"
              name="description"
              value={planFormData.description}
              onChange={handlePlanInputChange}
              rows={2}
            />
            <FormSelect
              label="Category"
              name="category"
              value={planFormData.category}
              onChange={handlePlanInputChange}
              options={productCategories.map((c) => ({
                value: c,
                label: formatCategoryName(c),
              }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Billing Frequency"
                name="billingFrequency"
                value={planFormData.billingFrequency}
                onChange={handlePlanInputChange}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'biannually', label: 'Biannually' },
                  { value: 'annually', label: 'Annually' },
                ]}
              />
              <FormSelect
                label="Delivery Frequency"
                name="deliveryFrequency"
                value={planFormData.deliveryFrequency}
                onChange={handlePlanInputChange}
                options={[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'biweekly', label: 'Biweekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'bimonthly', label: 'Bimonthly' },
                ]}
              />
            </div>
            <FormInput
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={planFormData.price}
              onChange={handlePlanInputChange}
              prefix="$"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Discount (%)"
                name="discount"
                type="number"
                min="0"
                max="100"
                value={planFormData.discount}
                onChange={handlePlanInputChange}
              />
              <FormSelect
                label="Popularity"
                name="popularity"
                value={planFormData.popularity}
                onChange={handlePlanInputChange}
                options={[
                  { value: 'high', label: 'High Demand' },
                  { value: 'medium', label: 'Medium Demand' },
                  { value: 'low', label: 'Low Demand' },
                ]}
              />
            </div>
          </div>
          <div>
            {' '}
            {/* Right Column */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Included Product Doses
              </label>
              <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto space-y-2">
                {allProducts
                  .filter((p) => p.type === 'medication' && p.doses?.length > 0)
                  .map((product) => (
                    <div key={product.id}>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">
                        {product.name}
                      </h4>
                      <div className="pl-2 space-y-1">
                        {product.doses.map((dose) => (
                          <div key={dose.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`dose-select-${product.id}-${dose.id}`}
                              checked={
                                planFormData.allowedProductDoses?.some(
                                  (d) =>
                                    d.productId === product.id &&
                                    d.doseId === dose.id
                                ) || false
                              }
                              onChange={() =>
                                handleDoseSelectionChange(product.id, dose.id)
                              }
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`dose-select-${product.id}-${dose.id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {dose.value}{' '}
                              {dose.description ? `(${dose.description})` : ''}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {allProducts.filter(
                  (p) => p.type === 'medication' && p.doses?.length > 0
                ).length === 0 && (
                  <p className="text-xs text-gray-500">
                    No medication products with doses available.
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {planFormData.allowedProductDoses?.length || 0} doses selected
              </p>
            </div>
             {/* Add Stripe Price ID input for the Plan */}
             <FormInput
               label="Stripe Price ID (Plan)"
               name="stripePriceId"
               value={planFormData.stripePriceId || ''}
               onChange={handlePlanInputChange}
               placeholder="price_..."
               className="text-xs" // Smaller text for ID field
             />
            <div className="grid grid-cols-2 gap-4 mt-4"> {/* Added margin top */}
              <FormCheckbox
                label="Active"
                name="active"
                checked={planFormData.active}
                onChange={handlePlanInputChange}
              />
              <FormCheckbox
                label="Requires Consultation"
                name="requiresConsultation"
                checked={planFormData.requiresConsultation}
                onChange={handlePlanInputChange}
              />
            </div>
            <FormTextarea
              label="Additional Benefits"
              name="additionalBenefits"
              value={
                Array.isArray(planFormData.additionalBenefits)
                  ? planFormData.additionalBenefits.join(', ')
                  : ''
              }
              onChange={handlePlanInputChange}
              rows={3}
              placeholder="e.g. Free anti-nausea medication"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;
