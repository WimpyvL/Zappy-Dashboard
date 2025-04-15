// src/pages/invoices/InvoicePage.jsx - Refactored for Supabase
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  Loader, // Added Loader
  ChevronLeft, // Added
  ChevronRight, // Added
  AlertTriangle, // Added
  X // Added
} from "lucide-react"; // Using lucide-react icons
import { useInvoices, useCreateInvoice } from "../../apis/invoices/hooks"; // Import hooks
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import LoadingSpinner from "../patients/patientDetails/common/LoadingSpinner"; // Adjust path if needed

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (e) {
    return "Invalid Date";
  }
};

// Payment Status Badge Component (from PatientBilling)
const PaymentStatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  let icon = <Clock className="h-3 w-3 mr-1" />;
  let style = "bg-yellow-100 text-yellow-800"; // Default pending/draft/sent

  if (lowerStatus === "paid") {
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    style = "bg-green-100 text-green-800";
  } else if (lowerStatus === "failed" || lowerStatus === "overdue" || lowerStatus === "void" || lowerStatus === "cancelled") {
    icon = <XCircle className="h-3 w-3 mr-1" />;
    style = "bg-red-100 text-red-800";
  } else if (lowerStatus !== "pending" && lowerStatus !== "draft" && lowerStatus !== "sent") {
     icon = null; // Unknown status
     style = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {icon}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};


const InvoicePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // TODO: Add state and inputs for create invoice modal (patient_id, items, etc.)
  const [newInvoiceData, setNewInvoiceData] = useState({ patient_id: '', amount: '', dueDate: '' }); // Simplified for now

  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const filters = useMemo(() => {
      const activeFilters = {};
      if (searchTerm) activeFilters.invoiceNumber = searchTerm; // Assuming API filters by invoice_number or patient name
      // Add other filters like status if needed
      return activeFilters;
  }, [searchTerm]);

  const sortingDetails = useMemo(() => ({
      sortBy: sortConfig.key,
      ascending: sortConfig.direction === 'asc'
  }), [sortConfig]);

  const {
      data: invoicesQueryResult,
      isLoading,
      error: queryError,
      isFetching
  } = useInvoices(currentPage, filters, sortingDetails);

  const invoices = invoicesQueryResult?.data || [];
  const pagination = invoicesQueryResult?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 };

  // --- Mutations ---
  const createInvoiceMutation = useCreateInvoice({
      onSuccess: () => {
          toast.success("Invoice created successfully.");
          setShowCreateModal(false);
          setNewInvoiceData({ patient_id: '', amount: '', dueDate: '' }); // Reset form
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
      },
      onError: (error) => toast.error(`Error creating invoice: ${error.message}`)
  });

  // --- Handlers ---
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset page on sort
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    // TODO: Add validation and proper data structure for items
    const payload = {
        patient_id: newInvoiceData.patient_id,
        // items: [{ description: 'Service', quantity: 1, unit_price: parseFloat(newInvoiceData.amount) }], // Example item structure
        total_amount: parseFloat(newInvoiceData.amount),
        due_date: newInvoiceData.dueDate || null,
        status: 'draft', // Default status
    };
    if (!payload.patient_id || !payload.total_amount || payload.total_amount <= 0) {
        toast.error("Please provide Patient ID and a valid Amount.");
        return;
    }
    console.log("Creating invoice:", payload); // Log payload for debugging
    createInvoiceMutation.mutate(payload); // Use mutation
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortConfig.key === field) {
      return sortConfig.direction === 'asc' ?
        <ChevronUp className="inline h-4 w-4 ml-1 text-gray-600" /> :
        <ChevronDown className="inline h-4 w-4 ml-1 text-gray-600" />;
    }
    return <ChevronDown className="inline h-4 w-4 ml-1 text-gray-300 group-hover:text-gray-400" />;
  };

  const error = queryError?.message || null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700">
          <Plus className="h-5 w-5 mr-2" /> Create Invoice
        </button>
      </div>

      {error && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md"><div className="flex"><div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm text-red-700">{error}</p></div></div></div> )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" placeholder="Search by Invoice # or Patient Name..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {/* TODO: Add Status Filter Dropdown if needed */}
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {(isLoading || isFetching) && !invoicesQueryResult ? (
             <div className="flex justify-center items-center p-8"><LoadingSpinner message="Loading invoices..." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th onClick={() => requestSort('invoice_number')} className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Invoice # {renderSortIndicator('invoice_number')}</th>
                    <th onClick={() => requestSort('issue_date')} className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Issue Date {renderSortIndicator('issue_date')}</th>
                    <th onClick={() => requestSort('due_date')} className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Due Date {renderSortIndicator('due_date')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th onClick={() => requestSort('total_amount')} className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Amount {renderSortIndicator('total_amount')}</th>
                    <th onClick={() => requestSort('status')} className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Status {renderSortIndicator('status')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900"><Link to={`/invoices/${invoice.id}`}>{invoice.invoice_number}</Link></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.issue_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.due_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <Link to={`/patients/${invoice.patient_id}`} className="hover:text-indigo-600">
                            {invoice.patient?.first_name} {invoice.patient?.last_name || ''}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${invoice.total_amount?.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><PaymentStatusBadge status={invoice.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                          {/* TODO: Add Pay/Refund actions based on status and integration */}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No invoices found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Create New Invoice</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowCreateModal(false)}><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="px-6 py-4 space-y-4">
                {/* TODO: Replace inputs with proper selectors/components */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
                  <input type="text" name="patient_id" value={newInvoiceData.patient_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                  <input type="number" name="amount" min="0.01" step="0.01" value={newInvoiceData.amount} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" name="dueDate" value={newInvoiceData.dueDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                 {/* TODO: Add line item inputs */}
                 <p className="text-sm text-gray-500">(Line item selection not yet implemented)</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50" disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
