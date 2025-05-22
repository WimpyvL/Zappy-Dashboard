import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { ShoppingCart, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendedCategories, setRecommendedCategories] = useState([
    { id: 'weight', name: 'Weight Management' },
    { id: 'hair', name: 'Hair Care' },
    { id: 'wellness', name: 'Wellness' }
  ]);

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would fetch from an API
        // For now, we'll use localStorage to simulate cart persistence
        const storedCart = localStorage.getItem('shoppingCart');
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
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
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
      
      // For non-prescription items, proceed with checkout using Stripe
      // Import the payment service dynamically to avoid circular dependencies
      const { paymentService } = await import('../../services/paymentService');
      
      // Create a checkout session
      const session = await paymentService.createCheckoutSession(
        nonPrescriptionItems,
        { userId: user?.id },
        {} // Additional options like discount codes would go here
      );
      
      // In a real implementation with Stripe, we would redirect to the Stripe checkout page
      // For now, we'll simulate a successful payment
      const paymentResult = await paymentService.processPayment(
        session.sessionId,
        { paymentMethodId: 'pm_card_visa' }
      );
      
      if (paymentResult.status === 'succeeded') {
        showToast('success', 'Order placed successfully!');
        setCartItems([]);
        navigate('/order-confirmation', {
          state: {
            orderId: paymentResult.paymentIntentId,
            items: nonPrescriptionItems
          }
        });
      } else {
        throw new Error('Payment failed');
      }
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
        <EmptyState
          icon={<ShoppingCart />}
          title="Your cart is looking a bit lonely"
          message="Ready to discover products that can help you feel your best?"
          action={
            <button
              onClick={() => navigate('/shop')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              Explore Products
            </button>
          }
          secondaryAction={
            recommendedCategories && recommendedCategories.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Popular categories to explore:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recommendedCategories.map(category => (
                    <button 
                      key={category.id}
                      onClick={() => navigate(`/shop/category/${category.id}`)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          }
        />
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
