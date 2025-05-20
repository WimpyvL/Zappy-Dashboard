import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './components/Headers';
import Sidebar from './components/Sidebar';
import ShoppingCart from '../pages/shop/components/ShoppingCart';
import { useAppContext } from '../contexts/app/AppContext';
import { patientSidebarItems } from '../constants/SidebarItems';
import TopNavigation from '../components/ui/redesign/TopNavigation';
import BottomNavigation from '../components/ui/redesign/BottomNavigation';
import {
  Home, Heart, BookOpen, ShoppingBag, Plus, MessageSquare, Share2, HelpCircle
} from 'lucide-react'; // Import icons

/**
 * Main layout wrapper for authenticated pages
 * Mobile-first design with responsive adaptations for desktop
 */
const MainLayout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { viewMode } = useAppContext();
  const location = useLocation();

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleQuickActions = useCallback(() => {
    setIsQuickActionsOpen(prevState => !prevState);
  }, []);

  // Check if current page is one of the mobile-focused pages
  const isMobilePage = ['/', '/home', '/health', '/learn', '/shop'].includes(location.pathname);
  
  // Determine which navigation page is active
  const getActivePage = () => {
    if (location.pathname === '/' || location.pathname === '/home') return 'home';
    if (location.pathname === '/health') return 'health';
    if (location.pathname === '/learn') return 'learn';
    if (location.pathname === '/shop') return 'shop';
    return '';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - only visible in admin view and on desktop */}
      {viewMode === 'admin' && !isMobile && (
        <Sidebar />
      )}
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Admin Header - only visible in admin view */}
        {viewMode === 'admin' && (
          <Header onToggleCart={toggleCart} />
        )}
        
        {/* Top Navigation - only visible in patient view or mobile */}
        {(viewMode === 'patient' || isMobile) && (
          <TopNavigation activePage={getActivePage()} />
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${isMobilePage ? 'pb-20' : 'px-4 py-6 md:p-6'}`}>
          <div className={isMobilePage ? 'max-w-md mx-auto' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      {/* Shopping Cart drawer */}
      <ShoppingCart isOpen={isCartOpen} onClose={toggleCart} />

      {/* Quick Actions Menu */}
      <div className={`quick-actions-menu fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg p-4 transition-all duration-300 z-40 ${isQuickActionsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="grid grid-cols-2 gap-3">
          <button className="quick-action-btn flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" onClick={() => console.log('Support clicked')}>
            <MessageSquare className="w-5 h-5 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Support</span>
          </button>
          
          <button className="quick-action-btn flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" onClick={() => console.log('Refer clicked')}>
            <Share2 className="w-5 h-5 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Refer</span>
          </button>
          
          <button className="quick-action-btn flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" onClick={() => console.log('Share clicked')}>
            <Share2 className="w-5 h-5 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Share</span>
          </button>
          
          <button className="quick-action-btn flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" onClick={() => console.log('Assistant clicked')}>
            <HelpCircle className="w-5 h-5 text-orange-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Assistant</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation - only visible on mobile */}
      {isMobilePage && isMobile && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bottom-nav-with-fab z-30">
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 flex">
              <Link to="/" className={`flex-1 flex flex-col items-center justify-center py-3 ${getActivePage() === 'home' ? 'text-cyan-600' : 'text-gray-500'}`}>
                <Home className="w-6 h-6 mb-1" strokeWidth={getActivePage() === 'home' ? 2 : 1.5} />
                <span className={`text-xs ${getActivePage() === 'home' ? 'font-medium' : ''}`}>Home</span>
              </Link>
              <Link to="/health" className={`flex-1 flex flex-col items-center justify-center py-3 ${getActivePage() === 'health' ? 'text-cyan-600' : 'text-gray-500'}`}>
                <Heart className="w-6 h-6 mb-1" strokeWidth={getActivePage() === 'health' ? 2 : 1.5} />
                <span className={`text-xs ${getActivePage() === 'health' ? 'font-medium' : ''}`}>Health</span>
              </Link>
              <div className="flex-1"></div> {/* Placeholder for FAB */}
              <Link to="/learn" className={`flex-1 flex flex-col items-center justify-center py-3 ${getActivePage() === 'learn' ? 'text-cyan-600' : 'text-gray-500'}`}>
                <BookOpen className="w-6 h-6 mb-1" strokeWidth={getActivePage() === 'learn' ? 2 : 1.5} />
                <span className={`text-xs ${getActivePage() === 'learn' ? 'font-medium' : ''}`}>Learn</span>
              </Link>
              <Link to="/shop" className={`flex-1 flex flex-col items-center justify-center py-3 ${getActivePage() === 'shop' ? 'text-cyan-600' : 'text-gray-500'}`}>
                <ShoppingBag className="w-6 h-6 mb-1" strokeWidth={getActivePage() === 'shop' ? 2 : 1.5} />
                <span className={`text-xs ${getActivePage() === 'shop' ? 'font-medium' : ''}`}>Shop</span>
              </Link>
            </div>
            
            {/* Center FAB */}
            <button 
              className="nav-fab flex items-center justify-center shadow-lg" 
              onClick={toggleQuickActions}
              aria-label="Quick actions"
            >
              <Plus className={`w-5 h-5 text-white transition-transform duration-300 ${isQuickActionsOpen ? 'rotate-45' : 'rotate-0'}`} />
            </button>
          </nav>
        </>
      )}
      
      {/* Bottom Navigation for non-mobile pages on mobile devices */}
      {!isMobilePage && isMobile && viewMode === 'patient' && (
        <BottomNavigation activePage={location.pathname.split('/')[1] || 'home'} />
      )}
    </div>
  );
};

export default MainLayout;
