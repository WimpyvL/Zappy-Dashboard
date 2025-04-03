import React from 'react';
import { useCart } from '../../../context/CartContext';
import { redirectToPaymentCheckout } from '../../../utils/stripeCheckout';
import { X, Trash2, Plus, Minus, ShoppingCart as CartIcon } from 'lucide-react';
import { message } from 'antd';

const ShoppingCart = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      message.warning('Your cart is empty.');
      return;
    }
    try {
      // In a real app, you might pass the logged-in user's ID if available
      // const patientId = getCurrentUserId(); // Placeholder
      await redirectToPaymentCheckout(cartItems /*, patientId */);
      // Redirect happens in the utility function, no need to clear cart here yet
      // It might be better to clear cart upon successful payment confirmation (webhook or return page)
    } catch (error) {
      message.error(`Checkout failed: ${error.message}`);
    }
  };

  const handleQuantityChange = (doseId, change) => {
    const item = cartItems.find(i => i.doseId === doseId);
    if (item) {
      updateQuantity(doseId, item.quantity + change);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <CartIcon size={48} className="mx-auto mb-4 text-gray-400" />
              Your cart is empty.
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.doseId} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                {/* Placeholder for image */}
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  <CartIcon size={24} />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.doseValue}</p>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">${item.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => handleQuantityChange(item.doseId, -1)}
                      className="p-1 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.doseId, 1)}
                      className="p-1 border rounded text-gray-600 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.doseId)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal ({getCartItemCount()} items)</span>
              <span className="text-lg font-semibold text-gray-800">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-red-600 hover:text-red-800 mt-2"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
