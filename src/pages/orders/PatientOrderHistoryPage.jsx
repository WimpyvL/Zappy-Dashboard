import React, { useState } from 'react'; // Import useState
import { useAuth } from '../../context/AuthContext';
// import { useMyOrders } from '../../apis/orders/hooks'; // Temporarily disable hook for mock data
import { Link } from 'react-router-dom';
import { Loader2, AlertTriangle, Package, CheckCircle, Clock, XCircle, Truck, Info } from 'lucide-react'; // Replaced TruckIcon with Truck, added Info
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement'; // Import drawing element
import OrderDetailModal from '../../components/orders/OrderDetailModal'; // Import the modal

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

// Enhanced Status Badge Component (Exported)
export const StatusBadge = ({ status }) => {
  let bgColor, textColor, Icon;
  switch (status?.toLowerCase()) {
    case 'shipped':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      Icon = Truck;
      break;
    case 'delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      Icon = CheckCircle;
      break;
    case 'processing':
      bgColor = 'bg-purple-100'; // Changed color
      textColor = 'text-purple-800';
      Icon = Clock; // Changed icon
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      Icon = Clock;
      break;
    case 'cancelled':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      Icon = XCircle;
      break;
    case 'paid': // For non-shippable items like fees
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      Icon = CheckCircle;
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      Icon = Info;
      status = status || 'Unknown'; // Ensure status has a value
  }

  return (
    <span className={`flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)} {/* Capitalize status */}
    </span>
  );
};


const PatientOrderHistoryPage = () => {
  const { currentUser } = useAuth();
  // Use a default ID for testing if currentUser is null (due to auth bypass)
  const patientId = currentUser?.id || 'dev-patient-id'; 
  
  // State for modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // --- MOCK DATA ---
  const mockOrders = [
      { id: 'ord-1', orderId: 'ZAP-1001', orderDate: '2025-04-05T14:00:00Z', created_at: '2025-04-05T14:00:00Z', medication: 'Weight Loss Med A (1 Month)', totalAmount: 299.00, status: 'shipped', trackingNumber: '1Z999AA10123456789' },
      { id: 'ord-2', orderId: 'ZAP-1005', orderDate: '2025-04-08T10:00:00Z', created_at: '2025-04-08T10:00:00Z', medication: 'Wellness Supplement Pack', totalAmount: 79.99, status: 'processing' },
      { id: 'ord-3', orderId: 'ZAP-0988', orderDate: '2025-03-15T16:30:00Z', created_at: '2025-03-15T16:30:00Z', medication: 'Weight Loss Med A (1 Month)', totalAmount: 299.00, status: 'delivered' }, // Assuming 'delivered' is a possible status
      { id: 'ord-4', orderId: 'ZAP-0950', orderDate: '2025-03-01T11:00:00Z', created_at: '2025-03-01T11:00:00Z', medication: 'Initial Consultation Fee', totalAmount: 150.00, status: 'paid' }, // Example non-med order
  ];
  const orders = mockOrders;
  const isLoading = false; // Simulate loaded state
  const error = null; // Simulate no error
  // --- END MOCK DATA ---

  // Original hook usage (commented out)
  /*
  const { data: orders, isLoading, error } = useMyOrders(patientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#F85C5C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading your order history.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }
  */ // End of original hook logic comment

  
  const handleRowClick = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  // Use mock data
  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="doodle" color="accent1" position="top-right" size={150} rotation={-10} opacity={0.15} />
      <ChildishDrawingElement type="watercolor" color="primary" position="bottom-left" size={180} rotation={20} opacity={0.1} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Order History</h1>
        <p className="text-sm font-handwritten text-accent1 mt-1">Review your past orders and track shipments</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.sort((a, b) => new Date(b.orderDate || b.created_at) - new Date(a.orderDate || a.created_at)).map((order) => ( // Sort by date descending
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer" // Add cursor-pointer
                    onClick={() => handleRowClick(order.id)} // Add onClick handler
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderDate || order.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId || order.id}</td> {/* Display order ID */}
                    <td className="px-6 py-4 text-sm text-gray-700 line-clamp-1">{order.medication || order.items?.join(', ') || 'N/A'}</td> {/* Truncate items */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(order.totalAmount || order.invoiceAmount || 0).toFixed(2)}</td> {/* Display total */}
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.status?.toLowerCase() === 'shipped' && order.trackingNumber ? (
                        /* TODO: Replace with actual carrier tracking URL structure */
                        <a href={`https://www.google.com/search?q=${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-accent3 hover:text-accent3/80 hover:underline" title="Track Package (opens new tab)">
                          {order.trackingNumber}
                        </a>
                      ) : order.status?.toLowerCase() === 'shipped' ? (
                        'Tracking N/A' // Indicate if shipped but no tracking
                      ) : (
                        '-' // No tracking for non-shipped orders
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          {/* Link to shop page might not exist, link to dashboard or program instead? */}
          {/* <Link to="/shop" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Go to Shop
          </Link> */}
        </div>
      )}
      
      {/* Order Detail Modal */}
      <OrderDetailModal 
        orderId={selectedOrderId} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />
    </div>
  );
};

export default PatientOrderHistoryPage;
