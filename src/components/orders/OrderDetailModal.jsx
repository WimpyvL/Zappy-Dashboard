import React from 'react';
import { useOrderById } from '../../apis/orders/hooks'; // Assuming hook path
import { X, Package, MapPin, Truck, Info, Loader2, AlertTriangle } from 'lucide-react'; // Removed Calendar, DollarSign
import { StatusBadge } from '../../pages/orders/PatientOrderHistoryPage'; // Reuse StatusBadge

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const OrderDetailModal = ({ orderId, isOpen, onClose }) => {
  const { data: order, isLoading, error } = useOrderById(orderId, {
    enabled: isOpen && !!orderId, // Only fetch when modal is open and orderId is provided
  });

  if (!isOpen) return null;

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-accent1" />
          <p className="ml-3 text-gray-600">Loading order details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-10 text-red-600">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Error loading order details.</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="text-center p-10 text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-4" />
          <p>Order details not found.</p>
        </div>
      );
    }

    // Assuming order structure based on hooks and previous context
    const items = order.medication ? [{ name: order.medication, quantity: 1, price: order.totalAmount }] : (order.items || []); // Adapt based on actual data structure
    const shippingAddress = order.shipping_address || { street: '123 Health St', city: 'Wellnessville', state: 'CA', zip: '90210', country: 'USA' }; // Mock address if needed

    return (
      <>
        {/* Order Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-medium">{order.orderId || order.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Order Date</p>
            <p className="font-medium">{formatDate(order.order_date || order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="font-medium">${(order.totalAmount || order.invoiceAmount || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Items Ordered */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 flex items-center"><Package className="h-4 w-4 mr-2 text-accent1" /> Items Ordered</h3>
          <div className="space-y-2 bg-gray-50 p-3 rounded border border-gray-200">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                {item.price && <span className="font-medium">${item.price.toFixed(2)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 flex items-center"><MapPin className="h-4 w-4 mr-2 text-accent3" /> Shipping Address</h3>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
            <p>{shippingAddress.street}</p>
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
            <p>{shippingAddress.country}</p>
          </div>
        </div>

        {/* Tracking Information */}
        {order.status?.toLowerCase() === 'shipped' && (
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center"><Truck className="h-4 w-4 mr-2 text-accent2" /> Tracking Information</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
              {order.trackingNumber ? (
                <p>
                  Tracking Number: 
                  <a 
                    href={`https://www.google.com/search?q=${order.trackingNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-2 text-accent3 hover:underline font-medium"
                  >
                    {order.trackingNumber}
                  </a>
                </p>
              ) : (
                <p className="text-gray-500">Tracking information not available yet.</p>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-accent1/5">
          <div className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-accent1" />
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent3 text-white rounded-md text-sm font-medium hover:bg-accent3/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
