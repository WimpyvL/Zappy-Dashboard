import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import Header from './components/Headers';
import Sidebar from './components/Sidebar'; // Uncommented Sidebar import
import ShoppingCart from '../pages/shop/components/ShoppingCart';
import { useAppContext } from '../context/AppContext'; // Import AppContext
import { patientSidebarItems } from '../constants/SidebarItems'; // Import patient items

/**
 * Main layout wrapper for authenticated pages
 * Includes the header, sidebar, shopping cart drawer, and conditional bottom nav
 */
const MainLayout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { viewMode } = useAppContext(); // Get viewMode
  const location = useLocation(); // Get current location

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    // Reverted to flex row for sidebar layout
    <div className="flex h-screen overflow-hidden"> 
      <Sidebar /> {/* Added Sidebar component back */}
      <div className="flex flex-col flex-1 overflow-hidden"> {/* Added wrapper div for header + main */}
        <Header onToggleCart={toggleCart} /> 
        {/* Main content area takes remaining height */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6"> 
          {children}
        </main>
      </div>
      {/* Render ShoppingCart drawer (might need adjustment or removal later) */}
      <ShoppingCart isOpen={isCartOpen} onClose={toggleCart} />

      {/* Conditional Patient Bottom Navigation */}
      {viewMode === 'patient' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 md:hidden z-30">
          {patientSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const colorClass = item.color || 'primary';
            
            return (
              <Link 
                key={`bottom-nav-${item.path}`}
                to={item.path} 
                className={`flex flex-col items-center justify-center w-1/5 ${isActive ? `text-${colorClass}` : 'text-gray-500'}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
