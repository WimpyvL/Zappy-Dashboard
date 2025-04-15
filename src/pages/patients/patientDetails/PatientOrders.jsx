// components/patients/components/PatientOrders.jsx
import React, { useState, useMemo } from 'react'; // Added useState, useMemo
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'; // Added pagination icons
import LoadingSpinner from './common/LoadingSpinner';
import { useOrders } from '../../../apis/orders/hooks'; // Import the hook

const OrderStatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase(); // Handle potential null/undefined and case
  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      lowerStatus === 'shipped' ? 'bg-green-100 text-green-800' :
      lowerStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
      lowerStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
      lowerStatus === 'delivered' ? 'bg-green-100 text-green-800' : // Added delivered
      lowerStatus === 'cancelled' ? 'bg-red-100 text-red-800' : // Added cancelled
      'bg-gray-100 text-gray-800' // Default
    }`}>
      {lowerStatus === 'shipped' || lowerStatus === 'delivered' ? <CheckCircle className="h-3 w-3 mr-1" /> :
       lowerStatus === 'pending' ? <Clock className="h-3 w-3 mr-1" /> :
       lowerStatus === 'cancelled' ? <XCircle className="h-3 w-3 mr-1" /> : // Icon for cancelled
       null /* Icon for processing or default */}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

// Assuming payment status might come from invoice linked to order
// This might need adjustment based on actual data structure
const PaymentStatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();
  return (
    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      lowerStatus === 'paid' ? 'bg-green-100 text-green-800' :
      lowerStatus === 'pending' || lowerStatus === 'draft' || lowerStatus === 'sent' ? 'bg-yellow-100 text-yellow-800' :
      lowerStatus === 'failed' || lowerStatus === 'overdue' || lowerStatus === 'void' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
    </span>
  );
};

// Remove orders and loading props, fetch data internally
const PatientOrders = ({ patientId }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize filters to prevent unnecessary refetches
  const filters = useMemo(() => ({ patientId }), [patientId]);

  // Fetch orders using the hook
  const {
    data: ordersData,
    isLoading, // Use isLoading from hook
    error,
    isFetching, // Use isFetching for background loading indicators
  } = useOrders(currentPage, filters);

  // Extract orders array and pagination info
  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination || { totalPages: 1 };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Order History</h2>
        {/* Consider using Link component for navigation */}
        <Link
          to={`/orders/new?patientId=${patientId}`}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New Order
        </Link>
      </div>

      {isLoading ? ( // Use isLoading from hook
        <LoadingSpinner message="Loading orders..." />
      ) : error ? ( // Handle error state
         <div className="text-center py-8 text-red-500">
            Error loading orders: {error.message}
         </div>
      ) : orders.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order # {/* Changed from Date */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items {/* Changed from Medication */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                {/* Removed Pharmacy and Payment Status - add back if needed by joining invoice/pharmacy data */}
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th> */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {/* Link to order detail */}
                    <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {order.order_number || order.id.substring(0, 8)} {/* Display order number or partial ID */}
                    </Link>
                     <div className="text-xs text-gray-500">
                       {new Date(order.created_at).toLocaleDateString()} {/* Show created date */}
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {/* Display summary of items */}
                    {order.items && order.items.length > 0
                      ? `${order.items.length} item(s)` // Simple count, or display first item name
                      : 'No items'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     ${order.total_amount?.toFixed(2)} {/* Format total amount */}
                  </td>
                  {/* Removed Pharmacy and Payment Status columns */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/orders/${order.id}`} // Link still valid
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t mt-4">
               <span className="text-sm text-gray-700">
                 Page {currentPage} of {pagination.totalPages}
               </span>
               <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`relative inline-flex items-center px-2 py-1 rounded border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-1 rounded border border-gray-300 bg-white text-sm font-medium ${currentPage < pagination.totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
               </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No orders found for this patient.
        </div>
      )}
    </div>
  );
};

export default PatientOrders;
