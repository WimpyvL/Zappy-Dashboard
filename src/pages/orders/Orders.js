import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Removed useAppContext import
import { useOrders, useUpdateOrderStatus } from '../../apis/orders/hooks'; // Assuming hooks exist
import { useSessions } from '../../apis/sessions/hooks'; // Assuming hook exists
import {
  Search,
  Filter,
  Plus,
  // Package, // Removed unused import
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TruckIcon,
  Calendar,
  Loader2, // Added for loading state
} from 'lucide-react';

const StatusBadge = ({ status, holdReason }) => {
  if (status === 'shipped') {
    return (
      <div>
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Shipped
        </span>
      </div>
    );
  } else if (status === 'processing') {
    return (
      <div>
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          <TruckIcon className="h-3 w-3 mr-1" />
          Processing
        </span>
      </div>
    );
  } else if (status === 'pending') {
    return (
      <div>
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
        {holdReason && (
          <p className="text-xs text-red-500 mt-1">{holdReason}</p>
        )}
      </div>
    );
  } else if (status === 'cancelled') {
    return (
      <div>
        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </span>
      </div>
    );
  }
  return null;
};

const Orders = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch data using React Query hooks
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
  } = useOrders(); // Assuming useOrders fetches all orders or handles pagination/filtering
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useSessions(); // Assuming useSessions fetches all sessions needed for linking

  // Mutation hook for updating status
  const updateOrderStatusMutation = useUpdateOrderStatus({
    // Optional: Add onSuccess/onError callbacks if needed, e.g., for notifications
    onSuccess: () => {
      console.log('Order status updated successfully');
      // queryClient.invalidateQueries(['orders']) is likely handled within the hook itself
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      // Show error notification to user
    },
  });

  // Use fetched data or default empty arrays
  const allOrders = ordersData?.data || ordersData || []; // Adapt based on API response structure
  const sessions = sessionsData?.data || sessionsData || []; // Adapt based on API response structure

  // Filter orders based on search and status
  const filteredOrders = allOrders.filter((order) => {
    // Ensure patientName and medication exist before calling toLowerCase
    const patientName = order.patientName || '';
    const medication = order.medication || '';
    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group orders by status (using filteredOrders)
  const pendingOrders = filteredOrders.filter(
    (order) => order.status === 'pending'
  );
  const processingOrders = filteredOrders.filter(
    (order) => order.status === 'processing'
  );
  const shippedOrders = filteredOrders.filter(
    (order) => order.status === 'shipped'
  );
  // const cancelledOrders = filteredOrders.filter( // Removed unused variable
  //   (order) => order.status === 'cancelled'
  // );

  // Function to get the linked session for an order
  const getLinkedSession = (sessionId) => {
    if (!sessionId) return null;
    return sessions.find((session) => session.id === sessionId);
  };

  // Handle order status update using the mutation hook
  const handleStatusUpdate = (orderId, newStatus) => {
    // Pass data as expected by the mutation hook, adjust if needed
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Handle loading state
  if (isLoadingOrders || isLoadingSessions) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle error state (basic example)
  if (errorOrders || errorSessions) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading order or session data.</p>
        {/* <p>{errorOrders?.message || errorSessions?.message}</p> */}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Order
        </button>
      </div>

      {/* Alerts for orders requiring attention */}
      {pendingOrders.some(
        (order) => order.holdReason === 'Awaiting follow-up appointment'
      ) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">
                  {
                    pendingOrders.filter(
                      (order) =>
                        order.holdReason === 'Awaiting follow-up appointment'
                    ).length
                  }{' '}
                  orders on hold
                </span>{' '}
                due to missed follow-up appointments.
              </p>
            </div>
            <div className="ml-auto">
              <Link
                to="/sessions"
                className="text-sm font-medium text-yellow-700 underline"
              >
                View Sessions
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by patient or medication..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pending Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linked Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacy
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingOrders.length > 0 ? (
                pendingOrders
                  .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate))
                  .map((order) => {
                    const linkedSession = getLinkedSession(
                      order.linkedSessionId
                    );
                    const isProcessing =
                      updateOrderStatusMutation.isLoading &&
                      updateOrderStatusMutation.variables?.orderId ===
                        order.id &&
                      updateOrderStatusMutation.variables?.status ===
                        'processing';
                    const isCancelling =
                      updateOrderStatusMutation.isLoading &&
                      updateOrderStatusMutation.variables?.orderId ===
                        order.id &&
                      updateOrderStatusMutation.variables?.status ===
                        'cancelled';
                    const isMutating =
                      updateOrderStatusMutation.isLoading &&
                      updateOrderStatusMutation.variables?.orderId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/patients/${order.patientId}`} // Assuming patientId is available
                              className="hover:text-indigo-600"
                            >
                              {order.patientName || 'N/A'}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.medication}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={order.status}
                            holdReason={order.holdReason}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {linkedSession ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span
                                className={`text-xs ${
                                  linkedSession.status === 'completed'
                                    ? 'text-green-600'
                                    : linkedSession.status === 'scheduled'
                                      ? 'text-blue-600'
                                      : 'text-red-600'
                                }`}
                              >
                                {new Date(
                                  linkedSession.scheduledDate
                                ).toLocaleDateString()}
                                {' – '}
                                {linkedSession.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">
                              No session linked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.pharmacy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, 'processing')
                            }
                            className={`text-indigo-600 hover:text-indigo-900 mr-3 ${
                              isProcessing
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            disabled={
                              order.holdReason ===
                                'Awaiting follow-up appointment' || isMutating
                            }
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                            ) : null}
                            Process
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, 'cancelled')
                            }
                            className={`text-red-600 hover:text-red-900 ${
                              isCancelling
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            disabled={isMutating}
                          >
                            {isCancelling ? (
                              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                            ) : null}
                            Cancel
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
                    No pending orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Orders */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Processing Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacy
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processingOrders.length > 0 ? (
                processingOrders
                  .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate))
                  .map((order) => {
                    const isShipping =
                      updateOrderStatusMutation.isLoading &&
                      updateOrderStatusMutation.variables?.orderId ===
                        order.id &&
                      updateOrderStatusMutation.variables?.status === 'shipped';
                    const isCancelling =
                      updateOrderStatusMutation.isLoading &&
                      updateOrderStatusMutation.variables?.orderId ===
                        order.id &&
                      updateOrderStatusMutation.variables?.status ===
                        'cancelled';
                    const isMutating =
                      updateOrderStatusMutation.isLoading &&
                      updateOrderStatusMutation.variables?.orderId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/patients/${order.patientId}`} // Assuming patientId is available
                              className="hover:text-indigo-600"
                            >
                              {order.patientName || 'N/A'}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.medication}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={order.status}
                            holdReason={order.holdReason}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.pharmacy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, 'shipped')
                            } // Assuming backend handles tracking number
                            className={`text-indigo-600 hover:text-indigo-900 mr-3 ${
                              isShipping ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isMutating}
                          >
                            {isShipping ? (
                              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                            ) : null}
                            Mark as Shipped
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, 'cancelled')
                            }
                            className={`text-red-600 hover:text-red-900 ${
                              isCancelling
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            disabled={isMutating}
                          >
                            {isCancelling ? (
                              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                            ) : null}
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No processing orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipped and Cancelled Orders */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Shipped Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shippedOrders.length > 0 ? (
                shippedOrders
                  .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                  .slice(0, 10) // Only show the 10 most recent shipped orders
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link
                            to={`/patients/${order.patientId}`} // Assuming patientId is available
                            className="hover:text-indigo-600"
                          >
                            {order.patientName || 'N/A'}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.medication}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.trackingNumber ? (
                          <a
                            href={`https://tracking.example.com/${order.trackingNumber}`} // Replace with actual tracking URL if available
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {order.trackingNumber}
                          </a>
                        ) : (
                          'Not available'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.estimatedDelivery || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.pharmacy || 'N/A'}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No shipped orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal - Placeholder, needs proper implementation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Order
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowCreateModal(false)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* TODO: Replace with actual form using react-hook-form and fetch data for selects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select a patient</option>
                  {/* Populate with fetched patients */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select a medication</option>
                  {/* Populate with fetched products/medications */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacy
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select a pharmacy</option>
                  {/* Populate with fetched pharmacies */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Session (Optional)
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select a session</option>
                  {/* Populate with fetched sessions */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Add any notes about this order..."
                ></textarea>
              </div>
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
                onClick={() => {
                  // TODO: Implement order creation logic using useCreateOrder mutation hook
                  setShowCreateModal(false);
                }}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
