import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would fetch from an API
        // For now, we'll use localStorage to simulate cart persistence
        const storedCart = localStorage.getItem('patientCart');
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        showToast('error', 'Failed to load your cart items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [showToast]);

  // Update cart in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('patientCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    showToast('success', 'Item removed from cart');
  };

  // Handle checkout
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // Separate items into prescription and non-prescription
      const prescriptionItems = cartItems.filter(item => item.requiresPrescription);
      const nonPrescriptionItems = cartItems.filter(item => !item.requiresPrescription);
      
      if (prescriptionItems.length > 0) {
      // For prescription items, redirect to intake form
      navigate('/intake-form', { 
        state: { 
          prescriptionItems
        } 
      });
        return;
      }
      
      // For non-prescription items, proceed with checkout
      // In a real implementation, this would call an API to create an order
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      showToast('success', 'Order placed successfully!');
      setCartItems([]);
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error during checkout:', error);
      showToast('error', 'Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Your Cart" />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Your Cart" />
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Your Cart" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
            </div>
            
            <div className="divide-y">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow sm:ml-4 mt-4 sm:mt-0">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    
                    {item.requiresPrescription && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mt-2">
                        Requires Prescription
                      </span>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium mr-4">${(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${calculateTotal()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            <div className="mt-4">
              <button
                onClick={() => navigate('/shop')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
