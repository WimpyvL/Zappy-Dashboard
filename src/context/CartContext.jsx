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
    setCartItems(prevItems => {
      // Check if the specific dose of the product is already in the cart
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === product.id && item.doseId === dose.id
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
            doseId: dose.id,
            doseValue: dose.value,
            price: dose.price,
            quantity: quantity,
            // Add other relevant product details if needed, e.g., image
          }
        ];
      }
    });
  };

  const removeItem = (doseId) => {
    setCartItems(prevItems => prevItems.filter(item => item.doseId !== doseId));
  };

  const updateQuantity = (doseId, newQuantity) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.doseId === doseId) {
          // Ensure quantity doesn't go below 1
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove item if quantity becomes 0 or less (optional)
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
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
