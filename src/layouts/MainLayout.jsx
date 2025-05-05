import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './components/Headers';
import Sidebar from './components/Sidebar';
import ShoppingCart from '../pages/shop/components/ShoppingCart';
import { useAppContext } from '../context/AppContext';
import { patientSidebarItems } from '../constants/SidebarItems';
import BottomNavigation from '../components/ui/redesign/BottomNavigation';
import TopNavigation from '../components/ui/redesign/TopNavigation';

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

  // Check if current page is one of the new mobile-focused pages
  const isMobilePage = ['/home', '/care', '/programs', '/shop'].includes(location.pathname);
  
  // Determine which navigation page is active
  const getActivePage = () => {
    if (location.pathname === '/home') return 'home';
    if (location.pathname === '/care') return 'care';
    if (location.pathname === '/programs') return 'programs';
    if (location.pathname === '/shop') return 'shop';
    return '';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-to-br from-accent1/5 via-white to-accent2/5">
      {/* Left sidebar - hidden on mobile and mobile-focused pages */}
      {!isMobilePage && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - hidden on mobile-focused pages */}
        {!isMobilePage && <Header onToggleCart={toggleCart} />}
        
        {/* Top Navigation for desktop on mobile-focused pages */}
        {isMobilePage && <TopNavigation activePage={getActivePage()} />}
        
        {/* Decorative floating elements - hidden on mobile-focused pages */}
        {!isMobilePage && (
          <>
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent3/10 rounded-full blur-2xl -z-10"></div>
          </>
        )}
        
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${isMobilePage ? 'p-0' : 'px-4 py-6 md:p-6'}`}>
          <div className={isMobilePage ? 'md:max-w-3xl md:mx-auto' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      {/* Shopping Cart drawer */}
      <ShoppingCart isOpen={isCartOpen} onClose={toggleCart} />

      {/* Bottom Navigation for mobile-focused pages - hidden on desktop */}
      {isMobilePage && (
        <div className="md:hidden">
          <BottomNavigation 
            activePage={getActivePage()}
            notifications={{
              home: 0,
              care: 0,
              programs: 0,
              shop: 0,
              learn: 0
            }}
          />
        </div>
      )}
      
      {/* Legacy Patient Bottom Navigation for non-mobile-focused pages */}
      {viewMode === 'patient' && !isMobilePage && (
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
