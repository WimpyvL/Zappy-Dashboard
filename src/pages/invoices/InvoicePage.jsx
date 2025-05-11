import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices, useDeleteInvoice } from '../../apis/invoices/hooks';
import CreateInvoiceModal from '../../components/invoices/CreateInvoiceModal';
import EditInvoiceModal from '../../components/invoices/EditInvoiceModal';
import { toast } from 'react-toastify';
import { Calendar, Trash2, Filter, RefreshCw } from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Custom Spinner component using primary color
const Spinner = () => (
  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

// SVG icons (keep as is, or replace with Lucide if preferred)
const PlusIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const SortIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
);

const InvoicePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch invoices using hook
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices();
  const invoices = invoicesData?.data || [];
  const loading = isLoadingInvoices;
  
  // Delete invoice mutation
  const deleteInvoiceMutation = useDeleteInvoice({
    onSuccess: () => {
      toast.success('Invoice deleted successfully');
      setConfirmDelete(null);
      // Refresh the page to show updated list
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
      setConfirmDelete(null);
    }
  });

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

      // Sort and filter invoices
  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...invoices];
    
    // Debug the invoices data
    console.log("Invoices data:", invoices);
    
    if (searchTerm) {
      sortableInvoices = sortableInvoices.filter(
        (invoice) =>
          invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.pb_invoice_metadata?.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      sortableInvoices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, searchTerm, sortConfig]);

  // Handle invoice creation success
  const handleInvoiceCreated = () => {
    setShowCreateModal(false);
    // Force a refresh of the invoices list
    window.location.reload();
  };

  return (
    <div className="relative overflow-hidden pb-10">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search invoices by name, email, or ID..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
          <button
            onClick={() => {
              // Refresh invoices by refetching
              window.location.reload();
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
            title="Refresh invoices"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  setStatusFilter('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
              >
                Clear Filters
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('patientName')}
                >
                  <div className="flex items-center">
                    Customer
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    Invoice #
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('subscription_plan_id')}
                >
                  <div className="flex items-center">
                    Product/Plan
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    <SortIcon className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">
                    Discount
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="14" className="px-6 py-4 text-center">
                    <Spinner />
                    <span className="ml-2">Loading invoices...</span>
                  </td>
                </tr>
              ) : sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.patientName || invoice.pb_invoice_metadata?.patient_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.pb_invoice_metadata?.invoice_id || invoice.id?.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.pb_invoice_metadata?.subscription_plan_id ? 
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Subscription</span> : 
                        invoice.pb_invoice_metadata?.items?.length > 0 ? 
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {invoice.pb_invoice_metadata.items[0].name || 'Product'}
                          </span> : 
                          'Custom'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                          invoice.status === 'paid'
                              ? 'bg-accent2/10 text-accent2'
                              : invoice.status === 'pending'
                                ? 'bg-accent4/10 text-accent4'
                                : invoice.status === 'refunded'
                                  ? 'bg-accent3/10 text-accent3'
                                  : invoice.status === 'partially_paid'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-accent1/10 text-accent1'
                          }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${typeof invoice.amount === 'number' ? invoice.amount.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.pb_invoice_metadata?.discount_amount ? 
                        <span className="text-green-600">
                          -${parseFloat(invoice.pb_invoice_metadata.discount_amount).toFixed(2)}
                        </span> : 
                        '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => {
                            // Toggle dropdown for this invoice
                            document.getElementById(`dropdown-${invoice.id}`).classList.toggle('hidden');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <div 
                          id={`dropdown-${invoice.id}`}
                          className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <Link
                              to={`/invoices/${invoice.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => {
                                document.getElementById(`dropdown-${invoice.id}`).classList.add('hidden');
                                setSelectedInvoice(invoice);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Edit Invoice
                            </button>
                            {invoice.status === 'pending' && (
                              <button 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Process Payment
                              </button>
                            )}
                            {(invoice.status === 'paid' || invoice.status === 'partially_paid') && !invoice.refunded && (
                              <button 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                Issue Refund
                              </button>
                            )}
                            <button
                              onClick={() => {
                                document.getElementById(`dropdown-${invoice.id}`).classList.add('hidden');
                                setConfirmDelete(invoice.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Delete Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="14"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleInvoiceCreated}
        />
      )}
      
      {/* Edit Invoice Modal */}
      {selectedInvoice && (
        <EditInvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null);
            window.location.reload();
          }}
          invoice={selectedInvoice}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Call the delete mutation
                  deleteInvoiceMutation.mutate(confirmDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
