// components/patients/components/PatientOrders.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Plus, Clock, CheckCircle, XCircle, FileText, Hash, Loader2 } from 'lucide-react';
import { useOrders } from '../../../apis/orders/hooks'; // Import the useOrders hook

const OrderStatusBadge = ({ status }) => {
  // Determine color and icon based on status
  let bgColor, textColor, Icon;
  switch (status?.toLowerCase()) {
    case 'shipped':
    case 'completed': // Treat completed like shipped for display?
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      Icon = CheckCircle;
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      Icon = Clock;
      break;
    case 'processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      Icon = Clock; // Or a different icon like Settings
      break;
    case 'cancelled': // Added cancelled status
    case 'failed': // Added failed status
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      Icon = XCircle;
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      Icon = Hash; // Default icon
      status = status || 'Unknown'; // Handle null/undefined status
  }

  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Check for invalid date object
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date Format';
  }
};


const PatientOrders = ({ patientId }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  // Fetch orders using the hook, filtering by patientId
  // The hook returns { data: [], meta: {} }
  const { data: ordersResponse, isLoading: loading, error } = useOrders({ patientId: patientId });
  const orders = ordersResponse?.data || []; // Extract data array from response

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Order History</h2>
        <button
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          onClick={() => navigate(`/orders/new?patientId=${patientId}`)} // Use navigate
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New Order
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-500">Loading orders...</span>
        </div>
      ) : error ? (
         <div className="text-center py-8 text-red-500">
           Error loading orders: {error.message || 'Unknown error'}
         </div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Order ID
                 </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Total
                 </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                {/* Removed Pharmacy and Payment Status as they are not directly on the order table */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.order_date)} {/* Use order_date from DB */}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                     {order.id.substring(0, 8)}... {/* Display partial order UUID */}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {/* TODO: Fetch and display order items (names) */}
                     Items... {/* Placeholder */}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     ${(order.total_amount || 0).toFixed(2)} {/* Use total_amount */}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {order.invoice_id ? ( // Use invoice_id from DB
                       <Link to={`/invoices/${order.invoice_id}`} className="flex items-center text-xs text-blue-600 hover:underline">
                         <FileText size={12} className="mr-1"/> {order.invoice_id.substring(0,8)}...
                       </Link>
                     ) : (
                       '-'
                     )}
                   </td>
                  {/* Removed Pharmacy and Payment Status columns */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/orders/${order.id}`} // Link to order detail page
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
      ) : (
        <div className="text-center py-8 text-gray-500">
          No orders found for this patient.
        </div>
      )}
    </div>
  );
};

export default PatientOrders;
