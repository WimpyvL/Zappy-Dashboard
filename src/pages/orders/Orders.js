// src/pages/orders/Orders.js - Refactored for Supabase
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// Remove AppContext import
// import { useAppContext } from '../../context/AppContext';
import { useOrders, useUpdateOrderStatus, useCreateOrder } from '../../apis/orders/hooks'; // Import hooks
import { useQueryClient } from '@tanstack/react-query'; // Import query client
import {
  Search,
  Filter,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Truck, // Changed from TruckIcon
  Calendar,
  ChevronLeft, // Added
  ChevronRight // Added
} from 'lucide-react';
import LoadingSpinner from '../patients/patientDetails/common/LoadingSpinner'; // Adjust path if needed
import { toast } from 'react-toastify'; // For notifications

// Updated StatusBadge to match PatientOrders version
const StatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  let icon = <Clock className="h-3 w-3 mr-1" />; // Default to pending
  let style = "bg-yellow-100 text-yellow-800";

  if (lowerStatus === 'shipped' || lowerStatus === 'delivered') {
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    style = "bg-green-100 text-green-800";
  } else if (lowerStatus === 'processing') {
    icon = <Truck className="h-3 w-3 mr-1" />;
    style = "bg-blue-100 text-blue-800";
  } else if (lowerStatus === 'cancelled') {
    icon = <XCircle className="h-3 w-3 mr-1" />;
    style = "bg-red-100 text-red-800";
  } else if (lowerStatus !== 'pending') {
     // Default/unknown status
     icon = null;
     style = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      {icon}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};


// Main Orders Component
const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const filters = useMemo(() => {
    const activeFilters = {};
    if (searchTerm) {
      // Assuming API handles search across patient name (joined) or order number
      activeFilters.orderNumber = searchTerm; // Adjust if API uses different search param
    }
    if (statusFilter !== 'all') {
      activeFilters.status = statusFilter;
    }
    return activeFilters;
  }, [searchTerm, statusFilter]);

  const {
    data: ordersData,
    isLoading,
    error,
    isFetching,
  } = useOrders(currentPage, filters);

  const orders = ordersData?.data || []; // Use fetched orders
  const pagination = ordersData?.pagination || { totalPages: 1, totalCount: 0, itemsPerPage: 10 }; // Provide default

  // Remove local filtering and grouping

  // Remove getLinkedSession (needs re-implementation based on joined data or separate query)

  // --- Mutations ---
  const updateStatusMutation = useUpdateOrderStatus({
      onSuccess: (data, variables) => {
          toast.success(`Order status updated to ${variables.status}.`);
          // Invalidate the main orders query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['orders', currentPage, filters] });
          // Optionally invalidate specific order query if needed elsewhere
          queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      },
      onError: (error, variables) => {
          toast.error(`Failed to update status for order ${variables.id}: ${error.message}`);
      }
  });

  // TODO: Refactor Create Order Modal properly
  const createOrderMutation = useCreateOrder({
       onSuccess: () => {
          toast.success("Order created successfully!");
          setShowCreateModal(false);
          queryClient.invalidateQueries({ queryKey: ['orders'] }); // Refetch orders list
       },
       onError: (error) => {
           toast.error(`Failed to create order: ${error.message}`);
       }
  });

  // --- Handlers ---
  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

   const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCreateOrder = (formData) => {
      // TODO: Map formData from modal state to the structure expected by createOrder API
      console.warn("Create order modal logic needs implementation.");
      // Example:
      // const orderPayload = {
      //    patient_id: formData.patientId,
      //    order_number: `ORD-${Date.now()}`, // Generate order number?
      //    items: [{ product_id: formData.medicationId, quantity: 1, price: 199.99 }], // Example item structure
      //    total_amount: 199.99,
      //    status: 'pending',
      //    // ... other fields
      // };
      // createOrderMutation.mutate(orderPayload);
      toast.info("Create order functionality needs implementation.");
      setShowCreateModal(false); // Close modal for now
  };

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
     try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", year: "numeric"
        }).format(date);
    } catch (e) { return "Invalid Date"; }
  };


  // --- Render ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={() => setShowCreateModal(true)} // Open the basic modal
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Order
        </button>
      </div>

      {/* TODO: Re-implement alerts if needed based on fetched data */}
      {/* {pendingOrders.some(...) && ( ... )} */}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Order # or Patient Name..." // Updated placeholder
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset page on search
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} // Reset page on filter
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isLoading || isFetching) && !ordersData ? ( // Show loading only on initial load
                <tr><td colSpan="7" className="text-center py-10"><LoadingSpinner message="Loading orders..." /></td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="text-center py-10 text-red-600">Error loading orders: {error.message}</td></tr>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                       <Link to={`/orders/${order.id}`}>{order.order_number || order.id.substring(0, 8)}</Link>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       <Link to={`/patients/${order.patient_id}`} className="hover:text-indigo-600">
                         {order.patient?.first_name || 'N/A'} {order.patient?.last_name || ''}
                       </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                       {order.items?.length || 0} item(s)
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                       {/* Example Actions - Adapt based on status */}
                       {order.status === 'pending' && (
                           <>
                               <button
                                   onClick={() => handleStatusUpdate(order.id, 'processing')}
                                   className="text-blue-600 hover:text-blue-900"
                                   disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                               >
                                   Process
                               </button>
                               <button
                                   onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                   className="text-red-600 hover:text-red-900"
                                    disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                               >
                                   Cancel
                               </button>
                           </>
                       )}
                        {order.status === 'processing' && (
                           <>
                               <button
                                   onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                   className="text-green-600 hover:text-green-900"
                                    disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                               >
                                   Mark Shipped
                               </button>
                                <button
                                   onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                   className="text-red-600 hover:text-red-900"
                                    disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                               >
                                   Cancel
                               </button>
                           </>
                       )}
                       <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500">No orders found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
         {/* Pagination */}
         {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                 <div className="flex-1 flex justify-between sm:hidden">
                    {/* Mobile Pagination (Simplified) */}
                 </div>
                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * pagination.itemsPerPage, pagination.totalCount)}</span> of <span className="font-medium">{pagination.totalCount}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                             <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                             {/* TODO: Add numbered page buttons if needed */}
                             <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage < pagination.totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                 </div>
            </div>
         )}
      </div>

      {/* Create Order Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Create New Order</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowCreateModal(false)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            {/* TODO: Implement actual form with state and validation */}
            <div className="p-6">
                <p className="text-center text-gray-600">Create Order form needs implementation.</p>
                <p className="text-center text-xs text-gray-400 mt-2">Connect form fields to state and call handleCreateOrder on submit.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                onClick={() => handleCreateOrder({})} // Pass form data here
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
