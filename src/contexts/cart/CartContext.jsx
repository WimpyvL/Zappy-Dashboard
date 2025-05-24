import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { cartApi } from '../../apis/cart';
import { useAuth } from '../auth/AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from backend when user logs in
  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const mergedItems = await cartApi.mergeCart(cartItems);
          setCartItems(mergedItems);
          toast.success('Cart synchronized successfully');
        } catch (error) {
          console.error('Error syncing cart:', error);
          toast.error('Failed to sync cart with server');
        } finally {
          setIsLoading(false);
        }
      }
    };

    syncCart();
  }, [user]);

  // Save cart to local storage and backend
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    
    if (user) {
      cartApi.saveCart(cartItems).catch(error => {
        console.error('Error saving cart to server:', error);
        toast.error('Failed to save cart changes');
      });
    }
  }, [cartItems, user]);

  const addItem = async (product, dose, quantity = 1) => {
    // --- Determine Correct Price and Purchasability ---
    let itemPrice = 0;
    let isPurchasable = false;

    if (product.type === 'medication') {
      // For medications, check the specific dose
      if (dose && dose.allowOneTimePurchase) {
        isPurchasable = true;
        itemPrice = product.oneTimePurchasePrice || 0; // Use product-level one-time price
      }
    } else {
      // For non-medications (supplements, services), check the product itself
      if (product.allowOneTimePurchase) {
        isPurchasable = true;
        itemPrice = product.price || 0; // Use product-level price
      }
    }

    // Only proceed if the item is actually purchasable one-time
    if (!isPurchasable) {
      toast.error(`${product.name} ${dose ? `(${dose.value})` : ''} is not available for one-time purchase.`);
      return;
    }
    // --- End Price Logic ---

    setCartItems(prevItems => {
      // Check if the specific dose/product is already in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.doseId === dose.id
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        updatedItems = [
          ...prevItems,
          {
            productId: product.id,
            productName: product.name,
            // Use optional chaining for dose properties as non-medications might not have a dose object passed
            doseId: dose?.id,
            doseValue: dose?.value,
            price: itemPrice, // Use the correctly determined price
            quantity: quantity,
            type: product.type, // Store type for potential future use
            requiresPrescription: product.requiresPrescription || false, // Add requiresPrescription flag
            // Store relevant Stripe Price IDs
            stripePriceId: product.type === 'medication' ? product.stripeOneTimePriceId : product.stripePriceId, // One-time purchase Price ID
            stripeSubscriptionPriceId: dose?.stripePriceId, // Subscription Price ID (from dose)
          },
        ];
      }

      toast.success(`${product.name} added to cart`);
      return updatedItems;
    });
  };

  const removeItem = (doseId) => {
    setCartItems((prevItems) => {
      const filteredItems = prevItems.filter((item) => item.doseId !== doseId);
      toast.success('Item removed from cart');
      return filteredItems;
    });
  };

  const updateQuantity = (doseId, newQuantity) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems
        .map((item) => {
          if (item.doseId === doseId) {
            // Ensure quantity doesn't go below 1
            return { ...item, quantity: Math.max(1, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remove item if quantity becomes 0 or less

      if (updatedItems.length !== prevItems.length) {
        toast.info('Item removed from cart');
      }
      
      return updatedItems;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        await cartApi.clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart on server');
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
