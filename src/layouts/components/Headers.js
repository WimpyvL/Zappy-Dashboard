import React, { useState, useRef, useEffect } from 'react'; // Removed useMemo, Removed useCallback
import { useAuth } from '../../contexts/auth/AuthContext';
// import { useCart } from '../../contexts/cart/CartContext'; // Removed unused useCart import
import { useAppContext } from '../../contexts/app/AppContext';
import NotificationsCenter from '../../components/notifications/NotificationsCenter';
import { useNavigate } from 'react-router-dom'; // Removed unused Link
import { Dropdown, Button, Avatar } from 'antd'; // Removed unused Menu
import { profileMenuItems } from '../../constants/SidebarItems';
// import { debounce } from 'lodash'; // No longer needed for client-side search
import {
  // Bell, // Removed unused Bell
  Search,
  LogOut,
  Settings,
  User,
  X,
  ChevronDown,
  // ShoppingCart, // Removed unused ShoppingCart
  UserCheck, // Icon for Patient View
  ShieldCheck, // Icon for Admin View
  Eye, // Generic View icon
} from 'lucide-react';

const Header = ({ onToggleCart }) => {
  const { currentUser, logout } = useAuth();
  // const { getCartItemCount: _getCartItemCount } = useCart(); // Removed unused var
  const { viewMode, setViewMode /*, patients: _patients */ } = useAppContext(); // Removed unused var, Get view mode, setter
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  // const [searchResults, setSearchResults] = useState([]); // No longer needed
  // const [isSearchFocused, setIsSearchFocused] = useState(false); // No longer needed

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Removed unused performSearch function

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    // performSearch(query); // Removed client-side search trigger
  };

  // Handle search submission (e.g., pressing Enter)
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    if (searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      // Optionally clear search after navigation
      // setSearchQuery('');
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Close dropdowns when clicking outside (Keep user dropdown logic)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      // Removed search dropdown logic from click outside handler
      // if (searchRef.current && !searchRef.current.contains(event.target)) {
      //   setIsSearchFocused(false);
      // }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // const showSearchDropdown = isSearchFocused && searchQuery.length > 0; // Removed

  return (
    <header className="bg-white p-4 flex items-center justify-between shadow-sm relative z-20">
      {/* Search bar - only shown for admin view */}
      {viewMode === 'admin' && (
        // Wrap in a form for submission handling
        <form className="flex-1 max-w-xl" onSubmit={handleSearchSubmit} ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search" // Use type="search" for better semantics and potential browser features
              placeholder="Search Patients..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={handleSearchChange}
              // onFocus={() => setIsSearchFocused(true)} // Removed focus handler
            />
            {searchQuery && (
              <button
               type="button"
               onClick={clearSearch}
               className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
               aria-label="Clear search"
             >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Removed Search Results Dropdown */}
        </form>
      )}

      {/* View Mode Dropdown, Notifications, Cart, and user profile */}
      <div className={`flex items-center space-x-4 ${viewMode === 'admin' ? 'ml-4' : 'ml-auto'}`}>
        {/* View Mode Dropdown - Conditionally disable Patient View for Admins */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'admin',
                icon: <ShieldCheck size={14} />,
                label: 'Admin View',
                // Disable if already in admin mode
                disabled: viewMode === 'admin',
              },
              {
                key: 'patient',
                icon: <UserCheck size={14} />,
                label: 'Patient View',
                // Disable if already in patient mode OR if current mode is admin (prevent switching back)
                disabled: viewMode === 'patient' || viewMode === 'admin',
              },
            ].filter(item => !(item.key === 'patient' && viewMode === 'admin')), // Hide Patient View option entirely for Admins
            onClick: ({ key }) => {
              // Only allow setting the view mode if the target key is different and allowed
              if (key !== viewMode && !(key === 'patient' && viewMode === 'admin')) {
                 setViewMode(key);
              }
            },
          }}
          trigger={['click']}
        >
          <Button className="flex items-center">
            <Eye size={16} className="mr-1" />
            <span className="text-sm font-medium capitalize mr-1">
              {viewMode} View
            </span>
            <ChevronDown size={16} />
          </Button>
        </Dropdown>

        {/* Notifications Center */}
        <NotificationsCenter />

        {/* Shopping Cart Button - Only show for admin? Or maybe never? Hiding for now. */}
        {/* {viewMode === 'admin' && (
          <button
            onClick={onToggleCart}
            className="relative p-1 text-gray-600 hover:text-gray-900"
            aria-label="Open shopping cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {getCartItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-xs font-medium text-white">
                {getCartItemCount()}
              </span>
            )}
          </button>
        )} */}

        {/* User Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          {viewMode === 'admin' ? (
            // Admin view - simple dropdown
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <div className="flex items-center">
                <img
                  className="h-9 w-9 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User avatar"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser?.firstName || 'Admin'}
                  </span>
                  <ChevronDown className="h-4 w-4 inline-block ml-1 text-gray-500" />
                </div>
              </div>
            </button>
          ) : (
            // Patient view - just avatar button
            <button
              className="flex items-center focus:outline-none"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="Open profile menu"
            >
              <Avatar 
                size="large"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="border-2 border-indigo-100"
              />
            </button>
          )}

          {userDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg overflow-hidden bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              {viewMode === 'patient' ? (
                // Patient view - expanded menu with accent colors
                <>
                  {/* User info at top of dropdown with primary color background */}
                  <div className="px-4 py-4 bg-primary text-white">
                    <p className="text-base font-medium">
                      {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
                    </p>
                    <p className="text-xs opacity-90 truncate">
                      {currentUser?.email || 'user@example.com'}
                    </p>
                  </div>
                  
                  {/* Profile Menu Items with accent colors */}
                  <div>
                    {profileMenuItems.map((item) => (
                      <button
                        key={item.title}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 w-full hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate(item.path);
                        }}
                      >
                        <item.icon className={`h-5 w-5 mr-3 text-${item.color}`} />
                        {item.title}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                // Admin view - original menu items
                <>
                  {/* User info at top of dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">
                      {currentUser?.firstName || 'Admin'} {currentUser?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser?.email || 'admin@example.com'}
                    </p>
                  </div>
                  
                  {/* Profile Link */}
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/settings/profile');
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Your Profile
                  </button>
                  {/* Settings Link */}
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/settings');
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </>
              )}
              
              {/* Logout - for both views */}
              <button
                className="flex items-center px-4 py-3 text-sm text-gray-700 w-full hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
