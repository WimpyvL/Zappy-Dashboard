import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Percent,
  DollarSign,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import {
  useCreateDiscount,
  useDeleteDiscount,
  useDiscounts,
  useUpdateDiscount,
} from '../../apis/discounts/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';

const DiscountManagement = () => {
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);

  // Form data - adjusted to match API response format
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discount_type: 'percentage',
    value: 0,
    description: '',
    valid_from: '',
    valid_until: '',
    requirement: 'None',
    min_purchase: 0,
    status: 'Active',
    usage_limit: null,
    usage_limit_per_user: null,
    subscription_plan_ids: [],
  });

  // Use TanStack Query hooks
  const { data, isLoading, error } = useDiscounts(); // Removed unused isError
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();
  const { data: subscriptionPlans, isLoading: isLoadingSubscriptionPlans } = useSubscriptionPlans();

  // Extract discounts from the query data
  const discounts = data?.data || [];

  // Filter discounts based on search, type, and status
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (discount.description &&
        discount.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'percentage' &&
        discount.discount_type === 'percentage') ||
      (typeFilter === 'fixed' && discount.discount_type === 'fixed');

    const now = new Date();
    const startDate = new Date(discount.valid_from);
    const endDate = discount.valid_until
      ? new Date(discount.valid_until)
      : null;

    let discountStatus = '';
    if (discount.status !== 'Active') {
      discountStatus = 'inactive'; // Keep gray
    } else if (startDate > now) {
      discountStatus = 'scheduled'; // Use accent3
    } else if (endDate && endDate < now) {
      discountStatus = 'expired'; // Use accent1
    } else {
      discountStatus = 'active'; // Use accent2
    }

    const matchesStatus =
      statusFilter === 'all' || statusFilter === discountStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle adding new discount
  const handleAddDiscount = () => {
    setFormData({
      name: '',
      code: '',
      discount_type: 'percentage',
      value: 0,
      description: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      requirement: 'None',
      min_purchase: 0,
      status: 'Active',
      usage_limit: null,
      usage_limit_per_user: null,
    });
    setShowAddModal(true);
  };

  // Handle editing discount
  const handleEditDiscount = (discount) => {
    setCurrentDiscount(discount);
    setFormData({
      name: discount.name,
      code: discount.code,
      discount_type: discount.discount_type,
      value: parseFloat(discount.value),
      description: discount.description || '',
      valid_from: discount.valid_from
        ? new Date(discount.valid_from).toISOString().split('T')[0]
        : '',
      valid_until: discount.valid_until
        ? new Date(discount.valid_until).toISOString().split('T')[0]
        : '',
      requirement: discount.requirement || 'None',
      min_purchase: discount.min_purchase
        ? parseFloat(discount.min_purchase)
        : 0,
      status: discount.status,
      usage_limit: discount.usage_limit,
      usage_limit_per_user: discount.usage_limit_per_user,
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? checked
            ? 'Active'
            : 'Inactive' // For status checkbox
          : value,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Prepare data for API
    const apiData = {
      ...formData,
      // Ensure value is a string as per API response
      value: formData.value.toString(),
    };

    try {
      if (showAddModal) {
        // Add new discount using the mutation
        await createDiscount.mutateAsync(apiData);
        setShowAddModal(false);
      } else if (showEditModal) {
        // Update existing discount using the mutation
        await updateDiscount.mutateAsync({
          id: currentDiscount.id,
          discountData: apiData,
        });
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error saving discount:', err);
      // Error handling is managed by the mutation
    }
  };

  // Handle deleting discount using the mutation
  const handleDeleteDiscount = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this discount? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Delete the discount directly using the mutation
      // The cascade delete in the database will handle any related records
      await deleteDiscount.mutateAsync(id);
      
      // Show success message
      toast.success('Discount deleted successfully');
    } catch (err) {
      console.error('Error deleting discount:', err);
      toast.error(`Error deleting discount: ${err.message || 'Unknown error'}`);
    }
  };

  // Format discount display value
  const formatDiscountValue = (discount) => {
    return discount.discount_type === 'percentage'
      ? `${discount.value}%`
      : `$${discount.value}`;
  };

  // Get discount status text and style
  const getDiscountStatus = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.valid_from);
    const endDate = discount.valid_until
      ? new Date(discount.valid_until)
      : null;

    if (discount.status !== 'Active') {
      return {
        text: 'Inactive',
        style: 'bg-gray-100 text-gray-800',
      };
    } else if (startDate > now) {
      return {
        text: 'Scheduled',
        style: 'bg-blue-100 text-blue-800',
      };
    } else if (endDate && endDate < now) {
      return {
        text: 'Expired',
        style: 'bg-red-100 text-red-800',
      };
    } else {
      return {
        text: 'Active',
        style: 'bg-green-100 text-green-800',
      };
    }
  };

  // Get requirement text
  const getRequirementText = (requirement) => {
    if (!requirement || requirement === 'None') return 'No minimum requirement';
    return requirement;
  };

  return (
    <div className="relative overflow-hidden pb-10"> {/* Add relative positioning and padding */}
      <div className="flex justify-between items-center mb-6 relative z-10"> {/* Added z-index */}
        <h1 className="text-2xl font-bold text-gray-800">
          Discount Management
        </h1>
        {/* Use primary color for Add Discount button */}
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90 cursor-pointer"
          onClick={handleAddDiscount}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Discount
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
               <AlertCircle className="h-5 w-5 text-red-400" />
             </div>
             <div className="ml-3">
               <p className="text-sm text-red-700">
                 {/* Safely display error message or fallback */}
                 {error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unknown error occurred while loading discounts.'}
               </p>
             </div>
           </div>
         </div>
      )}

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search discounts by name or code..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Discounts list */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {isLoading && !showAddModal && !showEditModal ? (
          <div className="flex justify-center items-center p-8">
            {/* Use primary color for spinner */}
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2">Loading discounts...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((discount) => {
                  const status = getDiscountStatus(discount);

                  return (
                    <tr key={discount.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {discount.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {discount.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {discount.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Use primary color for icons */}
                          {discount.discount_type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-primary mr-1.5" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-primary mr-1.5" />
                          )}
                          <span className="text-sm font-medium">
                            {formatDiscountValue(discount)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getRequirementText(discount.requirement)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Apply Zappy colors to status badge */}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status.text === 'Active' ? 'bg-accent2/10 text-accent2' :
                            status.text === 'Scheduled' ? 'bg-accent3/10 text-accent3' :
                            status.text === 'Expired' ? 'bg-accent1/10 text-accent1' :
                            'bg-gray-100 text-gray-800' // Inactive
                          }`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(discount.valid_from).toLocaleDateString()}
                          {discount.valid_until && (
                            <span>
                              {' '}
                              -{' '}
                              {new Date(
                                discount.valid_until
                              ).toLocaleDateString()}
                            </span>
                          )}
                          {!discount.valid_until && (
                            <span className="text-xs text-gray-500 block">
                              No expiration
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {discount.usage_count || 0} uses
                        </div>
                        {discount.usage_limit_per_user && (
                          <div className="text-xs text-gray-500">
                            Limit: {discount.usage_limit_per_user} per user
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Use accent3 for Edit button */}
                        <button
                          className="text-accent3 hover:text-accent3/80 mr-3 cursor-pointer"
                          onClick={() => handleEditDiscount(discount)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {/* Use accent1 for Delete button */}
                        <button
                          className="text-accent1 hover:text-accent1/80 cursor-pointer"
                          onClick={() => handleDeleteDiscount(discount.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No discounts found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Discount Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Discount
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. SPRING25"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="discount_type"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={formData.discount_type}
                      onChange={handleInputChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.discount_type === 'percentage'
                        ? 'Percentage Value'
                        : 'Amount'}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {formData.discount_type === 'percentage' ? '%' : '$'}
                        </span>
                      </div>
                      <input
                        type="number"
                        name="value"
                        min="0"
                        step={
                          formData.discount_type === 'percentage' ? '1' : '0.01'
                        }
                        max={
                          formData.discount_type === 'percentage'
                            ? '100'
                            : '1000'
                        }
                        className="block w-full pl-7 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.value}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="status"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={formData.status === 'Active'}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="valid_from"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={formData.valid_from}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="valid_until"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={formData.valid_until}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit Total
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    min="0"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.usage_limit || ''}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit Per User
                  </label>
                  <input
                    type="number"
                    name="usage_limit_per_user"
                    min="0"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.usage_limit_per_user || ''}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="Minimum Purchase"
                          checked={formData.requirements?.includes('Minimum Purchase')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Minimum Purchase
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="Subscription Plans"
                          checked={formData.requirements?.includes('Subscription Plans')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Subscription Plans
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="New patients only"
                          checked={formData.requirements?.includes('New patients only')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          New patients only
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="Specific products"
                          checked={formData.requirements?.includes('Specific products')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Specific products
                        </span>
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select one or more requirements for this discount
                  </p>
                </div>

                {formData.requirements?.includes('Minimum Purchase') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Purchase Amount ($)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="min_purchase"
                        min="0"
                        step="0.01"
                        className="block w-full pl-7 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.min_purchase}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Discount will only apply to orders with a total value equal to or greater than this amount
                    </p>
                  </div>
                )}

                {formData.requirements?.includes('Subscription Plans') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Plans
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                      {isLoadingSubscriptionPlans ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader className="h-5 w-5 text-primary animate-spin mr-2" />
                          <span>Loading plans...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {subscriptionPlans?.map(plan => (
                            <label key={plan.id} className="flex items-center">
                              <input
                                type="checkbox"
                                name="subscription_plan_ids"
                                value={plan.id}
                                checked={formData.subscription_plan_ids?.includes(plan.id)}
                                onChange={(e) => {
                                  const planId = e.target.value;
                                  const isChecked = e.target.checked;
                                  
                                  setFormData(prev => {
                                    const currentPlans = prev.subscription_plan_ids || [];
                                    
                                    if (isChecked) {
                                      return {
                                        ...prev,
                                        subscription_plan_ids: [...currentPlans, planId]
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        subscription_plan_ids: currentPlans.filter(id => id !== planId)
                                      };
                                    }
                                  });
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {plan.name} (${plan.price})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Select one or more subscription plans to apply this discount to
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              {/* Use primary color for Add Discount button */}
              <button
                className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary/90 cursor-pointer"
                onClick={handleSubmit}
                disabled={
                  !formData.name || !formData.code || createDiscount.isPending
                }
              >
                {createDiscount.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Discount'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Discount
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form content - same structure as Add Modal */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. SPRING25"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="discount_type"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={formData.discount_type}
                      onChange={handleInputChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.discount_type === 'percentage'
                        ? 'Percentage Value'
                        : 'Amount'}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {formData.discount_type === 'percentage' ? '%' : '$'}
                        </span>
                      </div>
                      <input
                        type="number"
                        name="value"
                        min="0"
                        step={
                          formData.discount_type === 'percentage' ? '1' : '0.01'
                        }
                        max={
                          formData.discount_type === 'percentage'
                            ? '100'
                            : '1000'
                        }
                        className="block w-full pl-7 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.value}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="status"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={formData.status === 'Active'}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="valid_from"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={formData.valid_from}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="valid_until"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={formData.valid_until}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit Total
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    min="0"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.usage_limit || ''}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit Per User
                  </label>
                  <input
                    type="number"
                    name="usage_limit_per_user"
                    min="0"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={formData.usage_limit_per_user || ''}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="Minimum Purchase"
                          checked={formData.requirements?.includes('Minimum Purchase')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Minimum Purchase
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="Subscription Plans"
                          checked={formData.requirements?.includes('Subscription Plans')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Subscription Plans
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="New patients only"
                          checked={formData.requirements?.includes('New patients only')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          New patients only
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requirements"
                          value="Specific products"
                          checked={formData.requirements?.includes('Specific products')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isChecked = e.target.checked;
                            
                            setFormData(prev => {
                              const currentRequirements = prev.requirements || [];
                              
                              if (isChecked) {
                                return {
                                  ...prev,
                                  requirements: [...currentRequirements, value]
                                };
                              } else {
                                return {
                                  ...prev,
                                  requirements: currentRequirements.filter(req => req !== value)
                                };
                              }
                            });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Specific products
                        </span>
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select one or more requirements for this discount
                  </p>
                </div>

                {formData.requirements?.includes('Minimum Purchase') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Purchase Amount ($)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="min_purchase"
                        min="0"
                        step="0.01"
                        className="block w-full pl-7 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.min_purchase}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Discount will only apply to orders with a total value equal to or greater than this amount
                    </p>
                  </div>
                )}

                {formData.requirements?.includes('Subscription Plans') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Plans
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                      {isLoadingSubscriptionPlans ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader className="h-5 w-5 text-primary animate-spin mr-2" />
                          <span>Loading plans...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {subscriptionPlans?.map(plan => (
                            <label key={plan.id} className="flex items-center">
                              <input
                                type="checkbox"
                                name="subscription_plan_ids"
                                value={plan.id}
                                checked={formData.subscription_plan_ids?.includes(plan.id)}
                                onChange={(e) => {
                                  const planId = e.target.value;
                                  const isChecked = e.target.checked;
                                  
                                  setFormData(prev => {
                                    const currentPlans = prev.subscription_plan_ids || [];
                                    
                                    if (isChecked) {
                                      return {
                                        ...prev,
                                        subscription_plan_ids: [...currentPlans, planId]
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        subscription_plan_ids: currentPlans.filter(id => id !== planId)
                                      };
                                    }
                                  });
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {plan.name} (${plan.price})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Select one or more subscription plans to apply this discount to
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              {/* Use primary color for Save Changes button */}
              <button
                className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary/90 cursor-pointer"
                onClick={handleSubmit}
                disabled={
                  !formData.name || !formData.code || updateDiscount.isPending
                }
              >
                {updateDiscount.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountManagement;
