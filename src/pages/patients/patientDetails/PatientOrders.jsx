// components/patients/components/PatientOrders.jsx
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, FileText, Hash } from 'lucide-react'; // Added FileText, Hash
import LoadingSpinner from './common/LoadingSpinner';

const OrderStatusBadge = ({ status }) => {
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        status === 'shipped'
          ? 'bg-green-100 text-green-800'
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'shipped' ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : status === 'pending' ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        status === 'paid'
          ? 'bg-green-100 text-green-800'
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status || 'Unknown'}
    </span>
  );
};

// Mock Order Data (including linkage)
const mockPatientOrders = [
  {
    id: 'ORD-101',
    orderDate: '2025-03-15',
    medication: 'Semaglutide 0.5mg',
    status: 'shipped',
    pharmacy: 'Compounding Central',
    paymentStatus: 'paid',
    invoiceId: 'INV-123', // Link to invoice
    consultationId: 'CON-001', // Link to consultation
    trackingNumber: '1Z999AA10123456784',
  },
  {
    id: 'ORD-102',
    orderDate: '2025-04-01',
    medication: 'Tirzepatide 5mg',
    status: 'processing',
    pharmacy: 'Wellness Pharmacy',
    paymentStatus: 'paid',
    invoiceId: 'INV-456',
    consultationId: 'CON-005',
    trackingNumber: null,
  },
   {
    id: 'ORD-103',
    orderDate: '2025-04-10',
    medication: 'Semaglutide 0.25mg',
    status: 'pending',
    pharmacy: 'Compounding Central',
    paymentStatus: 'pending', // Example of pending payment
    invoiceId: 'INV-789',
    consultationId: 'CON-010',
    trackingNumber: null,
  },
];

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


const PatientOrders = ({ patientId }) => { // Removed orders and loading props
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    setLoading(true);
    // Replace with actual API call: apiService.get(`/api/patients/${patientId}/orders`)
    setTimeout(() => {
      setOrders(mockPatientOrders); // Use mock data for now
      setLoading(false);
    }, 800); // Simulate network delay
  }, [patientId]);


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Order History</h2>
        <button
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          onClick={() =>
            (window.location.href = `/orders/new?patientId=${patientId}`)
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New Order
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="small" />
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
                  Medication
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Links
                 </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                     {order.id}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.medication}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {/* Add links to related items */}
                     <div className="flex flex-col space-y-1">
                       {order.invoiceId && (
                         <Link to={`/invoices/${order.invoiceId}`} className="flex items-center text-xs text-blue-600 hover:underline">
                           <FileText size={12} className="mr-1"/> Invoice: {order.invoiceId}
                         </Link>
                       )}
                       {order.consultationId && (
                         <span className="flex items-center text-xs text-gray-500"> {/* Assuming no direct link page for consultations yet */}
                           <Hash size={12} className="mr-1"/> Consult: {order.consultationId}
                         </span>
                       )}
                     </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.pharmacy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/orders/${order.id}`}
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
