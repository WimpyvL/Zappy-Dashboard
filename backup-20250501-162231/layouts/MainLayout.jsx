import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './components/Headers';
import Sidebar from './components/Sidebar';
import ShoppingCart from '../pages/shop/components/ShoppingCart';
import { useAppContext } from '../context/AppContext';
import { patientSidebarItems } from '../constants/SidebarItems';

/**
 * Main layout wrapper for authenticated pages
 * Includes the header, sidebar, shopping cart drawer, and Zappy-themed responsive design
 */
const MainLayout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { viewMode } = useAppContext();
  const location = useLocation();

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-to-br from-accent1/5 via-white to-accent2/5">
      {/* Left sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleCart={toggleCart} />
        
        {/* Decorative floating elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent3/10 rounded-full blur-2xl -z-10"></div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Shopping Cart drawer */}
      <ShoppingCart isOpen={isCartOpen} onClose={toggleCart} />

      {/* Zappy-themed Patient Bottom Navigation for mobile */}
      {viewMode === 'patient' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-2 md:hidden z-30 shadow-lg">
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
                <Icon className={`h-5 w-5 ${isActive ? 'mb-0.5' : 'mb-0.5'}`} />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
