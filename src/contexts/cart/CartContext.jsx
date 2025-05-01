import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from local storage if available
    const savedCart = localStorage.getItem('shoppingCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (product, dose, quantity = 1) => {
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
      console.warn(`Product ${product.name} ${dose ? `(${dose.value})` : ''} is not available for one-time purchase.`);
      // Optionally show an alert to the user
      // alert(`This item is not available for one-time purchase.`);
      return; // Exit without modifying cart
    }
    // --- End Price Logic ---

    setCartItems(prevItems => {
      // Check if the specific dose/product is already in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.doseId === dose.id
      );

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [
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
             // Store relevant Stripe Price IDs
             stripePriceId: product.type === 'medication' ? product.stripeOneTimePriceId : product.stripePriceId, // One-time purchase Price ID
             stripeSubscriptionPriceId: dose?.stripePriceId, // Subscription Price ID (from dose)
             // Add other relevant product details if needed
          },
        ];
      }
    });
  };

  const removeItem = (doseId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.doseId !== doseId)
    );
  };

  const updateQuantity = (doseId, newQuantity) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.doseId === doseId) {
            // Ensure quantity doesn't go below 1
            return { ...item, quantity: Math.max(1, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remove item if quantity becomes 0 or less (optional)
    });
  };

  const clearCart = () => {
    setCartItems([]);
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
