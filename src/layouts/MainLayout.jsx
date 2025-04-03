import React, { useState } from "react"; // Import useState
import Header from "./components/Headers";
import Sidebar from "./components/Sidebar";
import ShoppingCart from "../pages/shop/components/ShoppingCart"; // Import ShoppingCart

/**
 * Main layout wrapper for authenticated pages
 * Includes the header, sidebar, and shopping cart drawer
 */
const MainLayout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Pass toggleCart function to Header */}
        <Header onToggleCart={toggleCart} /> 
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
      {/* Render ShoppingCart drawer */}
      <ShoppingCart isOpen={isCartOpen} onClose={toggleCart} />
    </div>
  );
};

export default MainLayout;
