import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Layers, Award, ShoppingBag, Bell, Menu, X
} from 'lucide-react';

const TopNavigation = ({ activePage }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Heart, path: '/' },
    { id: 'health', label: 'Health', icon: Layers, path: '/health' },
    { id: 'learn', label: 'Learn', icon: Award, path: '/learn' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/shop' }
  ];

  // Mobile header with menu button
  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
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
              className="relative p-2 text-gray-500 hover:text-gray-700 mr-2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="py-2 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <Link 
                    key={`mobile-nav-${item.id}`}
                    to={item.path} 
                    className={`flex items-center py-3 ${
                      isActive 
                        ? 'text-[#2D7FF9] font-medium' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link 
                  to="/profile" 
                  className="flex items-center py-3 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center py-3 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Settings</span>
                </Link>
                <button 
                  className="flex items-center py-3 text-gray-600 w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // Add logout logic here
                  }}
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop navigation
  return (
    <div className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 justify-center">
      <div className="flex space-x-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <Link 
              key={`top-nav-${item.id}`}
              to={item.path} 
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'text-[#2D7FF9] font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TopNavigation;
