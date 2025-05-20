import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Layers, Award, ShoppingBag, Bell, Menu, X
} from 'lucide-react';

/**
 * Custom hook for handling window resize with debouncing
 * @param {number} delay - Debounce delay in milliseconds
 * @param {number} mobileBreakpoint - Width in pixels below which is considered mobile
 * @returns {boolean} - Whether the current viewport is mobile size
 */
const useResponsiveBreakpoint = (delay = 250, mobileBreakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < mobileBreakpoint);
  
  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < mobileBreakpoint);
      }, delay);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay, mobileBreakpoint]);
  
  return isMobile;
};

/**
 * TopNavigation component for the application header
 * @param {Object} props - Component props
 * @param {string} props.activePage - ID of the currently active page
 * @returns {JSX.Element} - Rendered component
 */
const TopNavigation = ({ activePage }) => {
  const isMobile = useResponsiveBreakpoint();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: Heart, path: '/' },
    { id: 'health', label: 'Health', icon: Layers, path: '/health' },
    { id: 'learn', label: 'Learn', icon: Award, path: '/programs' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/shop' }
  ], []);

  // Use useCallback for event handlers to prevent unnecessary re-renders
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prevState => !prevState);
  }, []);
  
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  
  const handleSignOut = useCallback(() => {
    closeMenu();
    // Add logout logic here
  }, [closeMenu]);

  // Mobile header with menu button
  if (isMobile) {
    return (
      <>
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Zappy Health" 
              className="h-8 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%232D7FF9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
              }}
            />
            <span className="ml-2 text-lg font-bold text-gray-900">Zappy Health</span>
          </div>
          
          <div className="flex items-center">
            <button 
              className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md mr-2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
            </button>
            
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>
        
        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <nav 
            id="mobile-menu"
            className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50"
            aria-label="Mobile navigation"
          >
            <div className="py-2 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <Link 
                    key={`mobile-nav-${item.id}`}
                    to={item.path} 
                    className={`flex items-center py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md ${
                      isActive 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={closeMenu}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 mr-3" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link 
                  to="/profile" 
                  className="flex items-center py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                  onClick={closeMenu}
                >
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                  onClick={closeMenu}
                >
                  <span>Settings</span>
                </Link>
                <button 
                  className="flex items-center py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                  onClick={handleSignOut}
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </nav>
        )}
      </>
    );
  }

  // Desktop navigation
  return (
    <nav 
      className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 justify-center"
      aria-label="Main navigation"
    >
      <div className="flex space-x-8" role="menubar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <Link 
              key={`top-nav-${item.id}`}
              to={item.path} 
              className={`flex items-center px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                isActive 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(TopNavigation);
