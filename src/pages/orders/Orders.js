import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TruckIcon,
  Calendar
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
  // Get context with defensive programming
  const context = useAppContext();
  const orders = context?.orders || [];
  const sessions = context?.sessions || [];
  const updateOrderStatus = context?.updateOrderStatus || (() => { });

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.medication?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
  //  need to update 
    return orders;
  });

  // Group orders by status
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const processingOrders = filteredOrders.filter(order => order.status === 'processing');
  const shippedOrders = filteredOrders.filter(order => order.status === 'shipped');
  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');

  // Function to get the linked session for an order
  const getLinkedSession = (sessionId) => {
    if (!sessionId) return null;
    return sessions.find(session => session.id === sessionId);
  };

  // Handle order status update
  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

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
      {pendingOrders.some(order => order.holdReason === 'Awaiting follow-up appointment') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">
                  {pendingOrders.filter(order => order.holdReason === 'Awaiting follow-up appointment').length} orders on hold
                </span> due to missed follow-up appointments.
              </p>
            </div>
            <div className="ml-auto">
              <Link to="/sessions" className="text-sm font-medium text-yellow-700 underline">
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
                  .map(order => {
                    const linkedSession = getLinkedSession(order.linkedSessionId);

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/patients/${order.patientId}`} className="hover:text-indigo-600">
                              {order.patientName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.medication}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} holdReason={order.holdReason} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {linkedSession ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className={`text-xs ${linkedSession.status === 'completed' ? 'text-green-600' :
                                  linkedSession.status === 'scheduled' ? 'text-blue-600' :
                                    'text-red-600'
                                }`}>
                                {new Date(linkedSession.scheduledDate).toLocaleDateString()}
                                {' – '}
                                {linkedSession.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No session linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.pharmacy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'processing')}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            disabled={order.holdReason === 'Awaiting follow-up appointment'}
                          >
                            Process
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
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
          <h2 className="text-lg font-medium text-gray-900">Processing Orders</h2>
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
                  .map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/patients/${order.patientId}`} className="hover:text-indigo-600">
                            {order.patientName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.medication}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} holdReason={order.holdReason} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.pharmacy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            // Generate a tracking number for demo purposes
                            const trackingNumber = Math.random().toString(36).substring(2, 15);
                            // In a real app, you would update the order in the backend
                            const updatedOrder = { ...order, trackingNumber, status: 'shipped' };
                            handleStatusUpdate(order.id, 'shipped');
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Mark as Shipped
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
          <h2 className="text-lg font-medium text-gray-900">Recent Shipped Orders</h2>
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
                  .map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/patients/${order.patientId}`} className="hover:text-indigo-600">
                            {order.patientName}
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
                            href={`https://tracking.example.com/${order.trackingNumber}`}
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
                        {order.pharmacy}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No shipped orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal - In a real app, this would be a proper modal component */}
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

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a patient</option>
                  <option value="1">John Doe</option>
                  <option value="2">Jane Smith</option>
                  <option value="3">Robert Johnson</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a medication</option>
                  <option value="semaglutide_05">Semaglutide 0.5mg</option>
                  <option value="semaglutide_1">Semaglutide 1mg</option>
                  <option value="tirzepatide_5">Tirzepatide 5mg</option>
                  <option value="tirzepatide_10">Tirzepatide 10mg</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacy
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a pharmacy</option>
                  <option value="red_rock">Red Rock Pharmacy</option>
                  <option value="bay_area">Bay Area Meds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Session (Optional)
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a session</option>
                  <option value="101">Feb 10, 2025 - John Doe (Completed)</option>
                  <option value="103">Jan 28, 2025 - Jane Smith (Completed)</option>
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
                  // Logic to create the order
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