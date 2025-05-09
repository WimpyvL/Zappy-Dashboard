import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderById } from '../../apis/orders/hooks';
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, Package, Loader2, TruckIcon } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'shipped') {
    return (
      <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-accent2/10 text-accent2">
        <CheckCircle className="h-4 w-4 mr-1" />
        Shipped
      </span>
    );
  } else if (status === 'processing') {
    return (
      <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-accent3/10 text-accent3">
        <Package className="h-4 w-4 mr-1" />
        Processing
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-accent4/10 text-accent4">
        <Clock className="h-4 w-4 mr-1" />
        Pending
      </span>
    );
  } else if (status === 'cancelled') {
    return (
      <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
        <XCircle className="h-4 w-4 mr-1" />
        Cancelled
      </span>
    );
  }
  return null;
};

const OrderDetail = () => {
  // Get order ID from URL
  const { orderId } = useParams();
  
  // Fetch order details
  const { data: order, isLoading, error } = useOrderById(orderId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <Link to="/orders" className="text-primary hover:text-primary/80 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
        </div>
        <div className="text-center py-10 text-red-600">
          <p>Error loading order details. {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <Link to="/orders" className="text-primary hover:text-primary/80 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Order Summary */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-sm font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="text-sm font-medium">{new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm font-medium">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient</p>
              <p className="text-sm font-medium">
                <Link to={`/patients/${order.patient_id}`} className="text-primary hover:text-primary/80">
                  {order.patientName || "Unknown Patient"}
                </Link>
              </p>
            </div>
            {order.tracking_number && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="text-sm font-medium">
                  <a 
                    href={`https://tracking.example.com/${order.tracking_number}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:text-primary/80"
                  >
                    {order.tracking_number}
                  </a>
                </p>
              </div>
            )}
            {order.pharmacy && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Pharmacy</p>
                <p className="text-sm font-medium">{order.pharmacy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
          
          {order.status === 'shipped' ? (
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <TruckIcon className="h-5 w-5 text-accent2 mr-2" />
                <span className="text-accent2 font-medium">
                  Order shipped on {order.shipped_date ? new Date(order.shipped_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-500">Estimated Delivery Date</p>
                <p className="text-sm font-medium">{order.estimated_delivery || 'Unknown'}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 italic">
                {order.status === 'processing' 
                  ? 'Order is being prepared for shipping.' 
                  : order.status === 'pending' 
                    ? 'Order is pending processing.' 
                    : 'Order has been cancelled.'}
              </p>
            </div>
          )}
          
          {/* Delivery Address placeholder */}
          <div className="mt-4">
            <p className="text-sm text-gray-500">Delivery Address</p>
            <address className="not-italic text-sm">
              {order.delivery_address || 'Address information not available'}
            </address>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="border rounded-lg p-4 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.products?.name || item.description || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.products?.description || item.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${parseFloat(item.price_at_order || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No items found for this order.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-6 py-4 text-right font-medium">Total:</td>
                <td className="px-6 py-4 text-right font-medium">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Additional Information */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">Order Notes</p>
          <p className="text-sm">{order.notes || 'No notes provided.'}</p>
        </div>
        
        {order.invoiceId && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Related Documents</p>
            <div className="flex items-center mt-1">
              <FileText className="h-4 w-4 text-primary mr-2" />
              <Link to={`/invoices/${order.invoiceId}`} className="text-primary hover:underline">
                View Invoice
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;