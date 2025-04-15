// src/pages/discounts/DiscountManagement.jsx - Refactored for Supabase
import React, { useState, useMemo, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
    useCreateDiscount,
    useDeleteDiscount,
    useDiscounts,
    useUpdateDiscount
} from "../../apis/discounts/hooks"; // Ensure path is correct
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import LoadingSpinner from "../patients/patientDetails/common/LoadingSpinner"; // Adjust path if needed
// Import shared form components (adjust path if necessary)
import { Modal, FormInput, FormSelect, FormTextarea, FormCheckbox } from '../products/ProductComponents';


// Helper to format date string (YYYY-MM-DD) for input type="date"
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch (e) {
        console.error("Error formatting date for input:", e);
        return '';
    }
};

// Helper to format date for display
const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
        console.error("Error formatting date for display:", e);
        return "Invalid Date";
    }
};


const DiscountManagement = () => {
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // State for UI
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);

  // Form data state - aligned with DB schema
  const initialFormData = {
    code: "",
    discount_type: "percentage",
    value: 0,
    description: "",
    valid_from: formatDateForInput(new Date().toISOString()),
    valid_until: "",
    usage_limit: null,
    is_active: true,
  };
  const [formData, setFormData] = useState(initialFormData);

  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const filters = useMemo(() => {
      const activeFilters = {};
      if (searchTerm) activeFilters.code = searchTerm;
      if (typeFilter !== 'all') activeFilters.discount_type = typeFilter;
      // Pass the UI status filter value; client-side logic will interpret it
      // API filtering for status based on dates and is_active is more complex
      // if (statusFilter !== 'all') activeFilters.status = statusFilter;
      return activeFilters;
  }, [searchTerm, typeFilter]); // Removed statusFilter dependency for API call

  const {
      data: discountsData,
      isLoading,
      error: queryError,
      isFetching
  } = useDiscounts(currentPage, filters);

  const discounts = discountsData?.data || [];
  const pagination = discountsData?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 };

  // --- Mutations ---
  const createDiscountMutation = useCreateDiscount({
      onSuccess: () => {
          toast.success("Discount created successfully.");
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: ['discounts'] });
      },
      onError: (error) => toast.error(`Error creating discount: ${error.message}`)
  });

  const updateDiscountMutation = useUpdateDiscount({
       onSuccess: (data, variables) => {
          toast.success("Discount updated successfully.");
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: ['discounts'] });
          queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
      },
      onError: (error) => toast.error(`Error updating discount: ${error.message}`)
  });

   const deleteDiscountMutation = useDeleteDiscount({
       onSuccess: () => {
          toast.success("Discount deleted successfully.");
          queryClient.invalidateQueries({ queryKey: ['discounts'] });
      },
      onError: (error) => toast.error(`Error deleting discount: ${error.message}`)
  });

  // --- Client-side Status Calculation & Filtering ---
  const getDiscountStatus = (discount) => {
      const now = new Date();
      const startDate = discount.valid_from ? parseISO(discount.valid_from) : null;
      const endDate = discount.valid_until ? parseISO(discount.valid_until) : null;

      if (!discount.is_active) {
          return { text: "Inactive", style: "bg-gray-100 text-gray-800", value: "inactive" };
      } else if (startDate && isAfter(startDate, now)) {
          return { text: "Scheduled", style: "bg-blue-100 text-blue-800", value: "scheduled" };
      } else if (endDate && isBefore(endDate, now)) {
          return { text: "Expired", style: "bg-red-100 text-red-800", value: "expired" };
      } else {
          return { text: "Active", style: "bg-green-100 text-green-800", value: "active" };
      }
  };

  // Apply client-side status filter
  const filteredDiscounts = useMemo(() => {
      if (statusFilter === 'all') return discounts;
      return discounts.filter(d => getDiscountStatus(d).value === statusFilter);
  }, [discounts, statusFilter]);


  // --- Handlers ---
  const handleAddDiscount = () => {
    setEditMode(false);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleEditDiscount = (discount) => {
    setEditMode(true);
    setCurrentDiscount(discount);
    setFormData({
      code: discount.code,
      discount_type: discount.discount_type,
      value: parseFloat(discount.value) || 0,
      description: discount.description || "",
      valid_from: formatDateForInput(discount.valid_from),
      valid_until: formatDateForInput(discount.valid_until),
      usage_limit: discount.usage_limit === null ? '' : discount.usage_limit,
      is_active: discount.is_active,
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (type === 'checkbox') {
        newValue = checked;
    } else if (type === 'number') {
        newValue = value === '' ? null : parseFloat(value);
        if (name === 'usage_limit' && newValue !== null && newValue < 0) newValue = 0;
        if (name === 'value' && newValue < 0) newValue = 0;
        if (name === 'value' && formData.discount_type === 'percentage' && newValue > 100) newValue = 100;
    } else if (name === 'usage_limit' && value === '') {
        newValue = null;
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = () => {
    const apiData = {
      code: formData.code?.trim(),
      discount_type: formData.discount_type,
      value: parseFloat(formData.value) || 0,
      description: formData.description?.trim() || null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      usage_limit: formData.usage_limit === null ? null : parseInt(formData.usage_limit, 10),
      is_active: formData.is_active,
    };

    if (!apiData.code) { toast.error("Discount code is required."); return; }
    if (apiData.value <= 0) { toast.error("Discount value must be greater than zero."); return; }
    if (apiData.discount_type === 'percentage' && apiData.value > 100) { toast.error("Percentage value cannot exceed 100."); return; }
    if (apiData.valid_from && apiData.valid_until && apiData.valid_from > apiData.valid_until) { toast.error("End date cannot be before start date."); return; }

    if (editMode && currentDiscount) {
      updateDiscountMutation.mutate({ id: currentDiscount.id, discountData: apiData });
    } else {
      createDiscountMutation.mutate(apiData);
    }
  };

  const handleDeleteDiscount = (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      deleteDiscountMutation.mutate(id);
    }
  };

   const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDiscountValue = (discount) => {
    return discount.discount_type === "percentage"
      ? `${discount.value}%`
      : `$${Number(discount.value).toFixed(2)}`;
  };

  const error = queryError?.message || null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Discount Management</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 cursor-pointer" onClick={handleAddDiscount}>
          <Plus className="h-5 w-5 mr-2" /> Add Discount
        </button>
      </div>

      {error && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md"><div className="flex"><div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm text-red-700">{error}</p></div></div></div> )}

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" placeholder="Search by code..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2">
          <select className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <select className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        {(isLoading || isFetching) && !discountsData ? (
          <div className="flex justify-center items-center p-8"><LoadingSpinner message="Loading discounts..." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDiscounts.length > 0 ? (
                    filteredDiscounts.map((discount) => {
                      const statusInfo = getDiscountStatus(discount);
                      return (
                        <tr key={discount.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{discount.code}</span></td>
                          <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate">{discount.description || '-'}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {discount.discount_type === "percentage" ? <Percent className="h-4 w-4 text-indigo-500 mr-1.5" /> : <DollarSign className="h-4 w-4 text-indigo-500 mr-1.5" />}
                              <span className="text-sm font-medium">{formatDiscountValue(discount)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}>{statusInfo.text}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateForDisplay(discount.valid_from)} - {discount.valid_until ? formatDateForDisplay(discount.valid_until) : 'No Expiry'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {discount.usage_count || 0} / {discount.usage_limit ?? '∞'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer" onClick={() => handleEditDiscount(discount)}><Edit className="h-5 w-5" /></button>
                            <button className="text-red-600 hover:text-red-900 cursor-pointer" onClick={() => handleDeleteDiscount(discount.id)} disabled={deleteDiscountMutation.isPending && deleteDiscountMutation.variables === discount.id}><Trash2 className="h-5 w-5" /></button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No discounts found matching criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
             {pagination.totalPages > 1 && (
                 <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                     <div className="flex-1 flex justify-between sm:hidden">{/* Mobile Pagination */}</div>
                     <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                         <div><p className="text-sm text-gray-700">Showing <span className="font-medium">{pagination.totalCount > 0 ? (currentPage - 1) * pagination.itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * pagination.itemsPerPage, pagination.totalCount)}</span> of <span className="font-medium">{pagination.totalCount}</span> results</p></div>
                         <div>
                             <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                 <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}><ChevronLeft className="h-5 w-5" /></button>
                                 <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Page {currentPage} of {pagination.totalPages}</span>
                                 <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= pagination.totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage < pagination.totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}><ChevronRight className="h-5 w-5" /></button>
                             </nav>
                         </div>
                     </div>
                 </div>
             )}
          </>
        )}
      </div>

      {/* Add/Edit Discount Modal */}
      <Modal
        title={editMode ? 'Edit Discount' : 'Add New Discount'}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        submitText={editMode ? 'Save Changes' : 'Add Discount'}
        isSubmitting={createDiscountMutation.isPending || updateDiscountMutation.isPending}
      >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div> {/* Left Column */}
                 <FormInput label="Discount Code *" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. SPRING25" required />
                 <FormTextarea label="Description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormSelect label="Discount Type" name="discount_type" value={formData.discount_type} onChange={handleInputChange} options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed_amount', label: 'Fixed Amount ($)' }]} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{formData.discount_type === "percentage" ? "Percentage Value *" : "Amount *"}</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">{formData.discount_type === "percentage" ? "%" : "$"}</span></div>
                            <input type="number" name="value" min="0" step={formData.discount_type === "percentage" ? "1" : "0.01"} max={formData.discount_type === "percentage" ? "100" : undefined} className="block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.value} onChange={handleInputChange} required />
                        </div>
                    </div>
                 </div>
                 <FormCheckbox label="Active" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
              </div>
              <div> {/* Right Column */}
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormInput label="Start Date *" name="valid_from" type="date" value={formData.valid_from} onChange={handleInputChange} required />
                    <FormInput label="End Date" name="valid_until" type="date" value={formData.valid_until} onChange={handleInputChange} />
                 </div>
                 <FormInput label="Usage Limit Total" name="usage_limit" type="number" min="0" value={formData.usage_limit ?? ''} onChange={handleInputChange} placeholder="Leave empty for unlimited" />
              </div>
         </div>
      </Modal>
    </div>
  );
};

export default DiscountManagement;
