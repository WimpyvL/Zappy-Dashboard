import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useAppContext } from '../../contexts/app/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  adminSidebarSections,
  patientSidebarSections,
  logoutItem,
} from '../../constants/SidebarItems';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { viewMode } = useAppContext();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const scrollKey = 'sidebarScrollPos';

  const handleLogout = () => {
    sessionStorage.removeItem(scrollKey);
    logout();
    navigate('/login');
  };

  // Determine if current page is a provider/admin route (EMR interface)
  const isProviderRoute = () => {
    const providerRoutes = [
      '/dashboard', '/patients', '/orders', '/invoices', '/sessions', '/consultations',
      '/tasks', '/insurance', '/pharmacies', '/providers', '/services', '/discounts',
      '/tags', '/settings', '/reports', '/admin', '/notes', '/system-map'
    ];
    
    return providerRoutes.some(route => location.pathname.startsWith(route));
  };

  // Provider routes always show EMR interface (admin sidebar)
  // Patient routes show customer-friendly interface (patient sidebar)
  // Toggle allows switching interface style on any route
  const shouldShowProviderSidebar = isProviderRoute() || viewMode === 'admin';

  // Determine sections based on interface type
  const currentSidebarSections = shouldShowProviderSidebar ? adminSidebarSections : patientSidebarSections;
  const sidebarKeyPrefix = shouldShowProviderSidebar ? 'admin' : 'patient';

  // Effect to restore scroll position on mount
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem(scrollKey);
    if (savedScrollPos && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }

    const node = navRef.current;
    return () => {
      if (node) {
        sessionStorage.setItem(scrollKey, node.scrollTop);
      }
    };
  }, [scrollKey]);

  // Navigation item component with icons and minimal styling
  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <Link
        to={item.path}
        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        {Icon && <Icon size={16} />}
        {item.title}
      </Link>
    );
  };

  return (
    <div className="bg-white w-64 flex flex-col h-full border-r border-gray-200">
      <div className="p-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Zappy Health</h1>
        {!shouldShowProviderSidebar && (
          <p className="text-sm text-text-medium font-handwritten mt-1">Your health journey</p>
        )}
      </div>

      {/* Navigation with sections */}
      <nav ref={navRef} className="flex-1 py-4 space-y-6 overflow-y-auto">
        {currentSidebarSections.map((section) => (
          <div key={`section-${section.title}`} className="space-y-1">
            {/* Section title */}
            <h3 className="sidebar-section-title">
              {section.title}
            </h3>
            
            {/* Section items */}
            <div className="mt-1">
              {section.items.map((item) => (
                <NavItem 
                  key={`${sidebarKeyPrefix}-${item.path}`} 
                  item={item} 
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout button with icon */}
      <div className="p-5 mt-auto border-t border-gray-200">
        <button
          className="sidebar-nav-item flex items-center text-text-medium hover:text-primary text-sm font-medium"
          onClick={() => handleLogout()}
        >
          {logoutItem.icon && <logoutItem.icon size={16} />}
          {logoutItem.title}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
