import React, { useState } from 'react';
import {
  Package, Tag, Box, Briefcase, Plus, Edit, Trash2, Search, Loader2, Layers, Calendar
} from 'lucide-react';

// API Hooks
import { useTreatmentPackages } from '../../apis/treatmentPackages/hooks';
import { 
  useSubscriptionDurations,
  useCreateSubscriptionDuration,
  useUpdateSubscriptionDuration,
  useDeleteSubscriptionDuration
} from '../../apis/subscriptionDurations/hooks';
import { useServices } from '../../apis/services/hooks';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct
} from '../../apis/products/hooks';
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan
} from '../../apis/subscriptionPlans/hooks';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from '../../apis/categories/hooks';

// Components
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import ProductModal from '../../components/admin/ProductModal';
import SubscriptionPlanModal from '../../components/admin/SubscriptionPlanModal';
import SubscriptionDurationModal from '../../components/admin/SubscriptionDurationModal';
import BundleModal from '../../components/admin/BundleModal';
import ServiceModal from '../../components/admin/ServiceModal';
import CategoryModal from '../../components/admin/CategoryModal';
import { toast } from 'react-toastify';
import { applyFilters } from '../../utils/filterUtils';
import { useStandardizedData } from '../../hooks/useStandardizedData';

const ProductSubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch data using standardized hook
  const { data: services, isLoading: isLoadingServices } = useStandardizedData(useServices);
  const { data: packages, isLoading: isLoadingPackages } = useStandardizedData(useTreatmentPackages);
  const { data: durationsData, isLoading: isLoadingDurations } = useSubscriptionDurations();
  const { data: products, isLoading: isLoadingProducts } = useStandardizedData(useProducts);
  const { data: subscriptionPlans, isLoading: isLoadingPlans } = useStandardizedData(useSubscriptionPlans);
  const { data: categories, isLoading: isLoadingCategories } = useStandardizedData(useCategories);

  // Sample data for bundles (since we don't have a real API for them yet)
  const bundles = [
    {
      id: 1,
      name: 'Hair Loss Kit',
      bundleId: 'BN-HAIR-001',
      category: 'Hair',
      includedProducts: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 }
      ],
      price: 38.50,
      discount: 5.00,
      status: 'active'
    },
    {
      id: 2,
      name: 'Hair Care Complete',
      bundleId: 'BN-HAIR-002',
      category: 'Hair',
      includedProducts: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 1 },
        { productId: 4, quantity: 1 }
      ],
      price: 55.00,
      discount: 10.50,
      status: 'active'
    }
  ];

  // Sample data for providers (since we don't have a real API for them yet)
  const providers = [
    { id: 1, name: 'Dr. John Smith', credentials: 'MD' },
    { id: 2, name: 'Dr. Sarah Johnson', credentials: 'MD' },
    { id: 3, name: 'Dr. Michael Lee', credentials: 'DO' },
    { id: 4, name: 'Jane Wilson', credentials: 'NP' }
  ];

  // Mutation hooks
  const createProductMutation = useCreateProduct({
    onSuccess: () => {
      toast.success('Product created successfully');
      setShowProductModal(false);
    },
    onError: (error) => {
      toast.error(`Error creating product: ${error.message}`);
    }
  });

  const updateProductMutation = useUpdateProduct({
    onSuccess: () => {
      toast.success('Product updated successfully');
      setShowProductModal(false);
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error.message}`);
    }
  });

  const deleteProductMutation = useDeleteProduct({
    onSuccess: () => {
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error.message}`);
    }
  });

  const createPlanMutation = useCreateSubscriptionPlan({
    onSuccess: () => {
      toast.success('Subscription plan created successfully');
      setShowPlanModal(false);
    },
    onError: (error) => {
      toast.error(`Error creating subscription plan: ${error.message}`);
    }
  });

  const updatePlanMutation = useUpdateSubscriptionPlan({
    onSuccess: () => {
      toast.success('Subscription plan updated successfully');
      setShowPlanModal(false);
    },
    onError: (error) => {
      toast.error(`Error updating subscription plan: ${error.message}`);
    }
  });

  const deletePlanMutation = useDeleteSubscriptionPlan({
    onSuccess: () => {
      toast.success('Subscription plan deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting subscription plan: ${error.message}`);
    }
  });

  const createCategoryMutation = useCreateCategory({
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowCategoryModal(false);
    },
    onError: (error) => {
      toast.error(`Error creating category: ${error.message}`);
    }
  });

  const updateCategoryMutation = useUpdateCategory({
    onSuccess: () => {
      toast.success('Category updated successfully');
      setShowCategoryModal(false);
    },
    onError: (error) => {
      toast.error(`Error updating category: ${error.message}`);
    }
  });

  const deleteCategoryMutation = useDeleteCategory({
    onSuccess: () => {
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting category: ${error.message}`);
    }
  });

  // Subscription Duration mutations
  const createDurationMutation = useCreateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Billing cycle created successfully');
      setShowDurationModal(false);
    },
    onError: (error) => {
      toast.error(`Error creating billing cycle: ${error.message}`);
    }
  });

  const updateDurationMutation = useUpdateSubscriptionDuration({
    onSuccess: () => {
      toast.success('Billing cycle updated successfully');
      setShowDurationModal(false);
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

  // Check if any data is loading
  const isLoading = isLoadingServices || isLoadingPackages || isLoadingDurations || 
                   isLoadingProducts || isLoadingPlans || isLoadingCategories;

  // Apply all filters
  const filteredProducts = applyFilters(products, searchTerm, categoryFilter, statusFilter);
  const filteredPlans = applyFilters(subscriptionPlans, searchTerm, categoryFilter, statusFilter);
  const filteredBundles = applyFilters(bundles, searchTerm, categoryFilter, statusFilter);
  const filteredServices = applyFilters(services, searchTerm, categoryFilter, statusFilter);
  const filteredCategories = applyFilters(categories, searchTerm, categoryFilter, statusFilter);

  // Handle actions
  const handleAddNew = () => {
    setIsEditMode(false);
    setCurrentItem(null);

    switch (activeTab) {
      case 'products':
        setShowProductModal(true);
        break;
      case 'subscriptionPlans':
        setShowPlanModal(true);
        break;
      case 'subscriptionDurations':
        setShowDurationModal(true);
        break;
      case 'bundles':
        setShowBundleModal(true);
        break;
      case 'services':
        setShowServiceModal(true);
        break;
      case 'categories':
        setShowCategoryModal(true);
        break;
      default:
        break;
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentItem(item);

    switch (activeTab) {
      case 'products':
        setShowProductModal(true);
        break;
      case 'subscriptionPlans':
        setShowPlanModal(true);
        break;
      case 'subscriptionDurations':
        setShowDurationModal(true);
        break;
      case 'bundles':
        setShowBundleModal(true);
        break;
      case 'services':
        setShowServiceModal(true);
        break;
      case 'categories':
        setShowCategoryModal(true);
        break;
      default:
        break;
    }
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    switch (activeTab) {
      case 'products':
        deleteProductMutation.mutate(item.id);
        break;
      case 'subscriptionPlans':
        deletePlanMutation.mutate(item.id);
        break;
      case 'subscriptionDurations':
        deleteDurationMutation.mutate(item.id);
        break;
      case 'bundles':
        // Handle bundle deletion (mock for now)
        toast.success('Bundle deleted successfully');
        break;
      case 'services':
        // Handle service deletion (mock for now)
        toast.success('Service deleted successfully');
        break;
      case 'categories':
        deleteCategoryMutation.mutate(item.id);
        break;
      default:
        break;
    }
  };

  // Handle form submissions
  const handleProductSubmit = (productData) => {
    if (isEditMode && currentItem) {
      updateProductMutation.mutate({
        id: currentItem.id,
        productData
      });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handlePlanSubmit = (planData) => {
    if (isEditMode && currentItem) {
      updatePlanMutation.mutate({
        id: currentItem.id,
        planData
      });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const handleBundleSubmit = (bundleData) => {
    // Mock bundle submission
    toast.success(isEditMode ? 'Bundle updated successfully' : 'Bundle created successfully');
    setShowBundleModal(false);
  };

  const handleServiceSubmit = (serviceData) => {
    // Mock service submission
    toast.success(isEditMode ? 'Service updated successfully' : 'Service created successfully');
    setShowServiceModal(false);
  };

  const handleCategorySubmit = (categoryData) => {
    if (isEditMode && currentItem) {
      // Add original categoryId for comparison in the update function
      categoryData.originalCategoryId = currentItem.categoryId;
      updateCategoryMutation.mutate({
        id: currentItem.id,
        categoryData
      });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const handleDurationSubmit = (durationData) => {
    if (isEditMode && currentItem) {
      updateDurationMutation.mutate({
        id: currentItem.id,
        durationData
      });
    } else {
      createDurationMutation.mutate(durationData);
    }
  };

  // Get unique categories from all items
  const allCategories = [...new Set([
    ...products.map(p => p.category),
    ...subscriptionPlans.map(p => p.category),
    ...bundles.map(b => b.category),
    ...services.map(s => s.category)
  ])].filter(Boolean).sort();

  if (isLoading) {
    return (
      <AdminLayout title="Products & Subscriptions">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout 
      title="Products & Subscriptions"
      actions={
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
          onClick={() => handleAddNew()}
        >
          <Plus className="h-5 w-5 mr-2" />
          {activeTab === 'products' && 'Add New Product'}
          {activeTab === 'subscriptionPlans' && 'Add New Plan'}
          {activeTab === 'bundles' && 'Create New Bundle'}
          {activeTab === 'services' && 'Add New Service'}
          {activeTab === 'categories' && 'Add New Category'}
        </button>
      }
    >

      {/* Main Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Tabs */}
        <div className="tabs flex border-b border-gray-200">
          <button
            className={`tab px-6 py-3 font-medium ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('products')}
          >
            <Package className="h-4 w-4 inline-block mr-1" />
            Products
          </button>
          <button
            className={`tab px-6 py-3 font-medium ${activeTab === 'subscriptionPlans' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('subscriptionPlans')}
          >
            <Tag className="h-4 w-4 inline-block mr-1" />
            Subscription Plans
          </button>
          <button
            className={`tab px-6 py-3 font-medium ${activeTab === 'subscriptionDurations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('subscriptionDurations')}
          >
            <Calendar className="h-4 w-4 inline-block mr-1" />
            Billing Cycles
          </button>
          <button
            className={`tab px-6 py-3 font-medium ${activeTab === 'bundles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bundles')}
          >
            <Box className="h-4 w-4 inline-block mr-1" />
            Bundles
          </button>
          <button
            className={`tab px-6 py-3 font-medium ${activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('services')}
          >
            <Briefcase className="h-4 w-4 inline-block mr-1" />
            Services
          </button>
          <button
            className={`tab px-6 py-3 font-medium ${activeTab === 'categories' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers className="h-4 w-4 inline-block mr-1" />
            Categories
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative max-w-md mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              {allCategories.map(category => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${categoryFilter === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
              <div className="flex-grow"></div>
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter('all')}
              >
                All Status
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${statusFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${statusFilter === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter('draft')}
              >
                Draft
              </button>
            </div>
          </div>

          {/* Dynamic Tab Content */}
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price?.toFixed(2) || '0.00'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-4">
                {filteredProducts.length} products found
              </p>
            </div>
          )}

          {activeTab === 'subscriptionDurations' && (
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
                  {durationsData?.map((duration) => (
                    <tr key={duration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{duration.name}</div>
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
                  {!durationsData || durationsData.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No billing cycles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-4">
                {durationsData?.length || 0} billing cycles found
              </p>
            </div>
          )}

          {activeTab === 'subscriptionPlans' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{plan.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${plan.price?.toFixed(2) || '0.00'}</div>
                        {plan.discount > 0 && (
                          <div className="text-xs text-green-600">{plan.discount}% off</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{plan.billingFrequency || 'Monthly'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={plan.status || 'active'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(plan)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPlans.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No subscription plans found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-4">
                {filteredPlans.length} subscription plans found
              </p>
            </div>
          )}

          {activeTab === 'bundles' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBundles.map((bundle) => (
                    <tr key={bundle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bundle.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{bundle.bundleId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{bundle.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${bundle.price?.toFixed(2) || '0.00'}</div>
                        {bundle.discount > 0 && (
                          <div className="text-xs text-green-600">Save ${bundle.discount.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{bundle.includedProducts?.length || 0} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={bundle.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(bundle)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(bundle)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBundles.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No bundles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-4">
                {filteredBundles.length} bundles found
              </p>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{service.serviceId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{service.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{service.provider || 'Any Provider'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{service.duration || '30'} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(service)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No services found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-4">
                {filteredServices.length} services found
              </p>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category.categoryId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category.productCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={category.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(category)}
                          disabled={category.productCount > 0}
                          title={category.productCount > 0 ? `Cannot delete: Used by ${category.productCount} products` : ''}
                        >
                          <Trash2 className={`h-5 w-5 ${category.productCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCategories.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-4">
                {filteredCategories.length} categories found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleProductSubmit}
        product={isEditMode ? currentItem : null}
        isSubmitting={createProductMutation.isLoading || updateProductMutation.isLoading}
        services={services.filter(s => s.type === 'service')}
      />

      <SubscriptionPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSubmit={handlePlanSubmit}
        plan={isEditMode ? currentItem : null}
        isSubmitting={createPlanMutation.isLoading || updatePlanMutation.isLoading}
        products={products}
      />

      <BundleModal
        isOpen={showBundleModal}
        onClose={() => setShowBundleModal(false)}
        onSubmit={handleBundleSubmit}
        bundle={isEditMode ? currentItem : null}
        isSubmitting={false}
        products={products}
      />

      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSubmit={handleServiceSubmit}
        service={isEditMode ? currentItem : null}
        isSubmitting={false}
        providers={providers}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleCategorySubmit}
        category={isEditMode ? currentItem : null}
        isSubmitting={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
        productCount={isEditMode && currentItem ? currentItem.productCount || 0 : 0}
      />

      <SubscriptionDurationModal
        isOpen={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        onSubmit={handleDurationSubmit}
        duration={isEditMode ? currentItem : null}
        isSubmitting={createDurationMutation.isLoading || updateDurationMutation.isLoading}
      />
    </AdminLayout>
  );
};

export default ProductSubscriptionManagement;
