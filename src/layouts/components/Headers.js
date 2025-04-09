import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useAppContext } from '../../context/AppContext';
import NotificationsCenter from '../../components/notifications/NotificationsCenter';
import { useNavigate, Link } from 'react-router-dom';
import { Dropdown, Button, Menu, Avatar } from 'antd';
import { profileMenuItems } from '../../constants/SidebarItems';
import { debounce } from 'lodash';
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  X,
  ChevronDown,
  ShoppingCart,
  UserCheck, // Icon for Patient View
  ShieldCheck, // Icon for Admin View
  Eye, // Generic View icon
} from 'lucide-react';

const Header = ({ onToggleCart }) => {
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { viewMode, setViewMode, patients } = useAppContext(); // Get view mode, setter, and patients
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Debounced search function
  const performSearch = useCallback(
    debounce((query) => {
      // Ensure patients is an array before filtering
      if (!query || !Array.isArray(patients)) {
        setSearchResults([]);
        return;
      }
      const lowerCaseQuery = query.toLowerCase();
      const results = patients.filter(
        (patient) =>
          patient.firstName?.toLowerCase().includes(lowerCaseQuery) ||
          patient.lastName?.toLowerCase().includes(lowerCaseQuery) ||
          patient.email?.toLowerCase().includes(lowerCaseQuery) ||
          `${patient.firstName?.toLowerCase()} ${patient.lastName?.toLowerCase()}`.includes(lowerCaseQuery)
      );
      setSearchResults(results.slice(0, 10)); // Limit results
    }, 300),
    [patients] // Dependency: re-create if patients array changes
  );

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  // Handle clicking a search result
  const handleResultClick = () => {
    clearSearch();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showSearchDropdown = isSearchFocused && searchQuery.length > 0;

  return (
    <header className="bg-white p-4 flex items-center justify-between shadow-sm relative z-20">
      {/* Search bar - only shown for admin view */}
      {viewMode === 'admin' && (
        <div className="flex-1 max-w-xl" ref={searchRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search Patients..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
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
         {/* Search Results Dropdown */}
         {showSearchDropdown && (
           <div className="absolute mt-1 w-full max-w-xl bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
             {searchResults.length > 0 ? (
               <ul>
                 {searchResults.map((patient) => (
                   <li key={patient.id}>
                     <Link
                       to={`/patients/${patient.id}`}
                       onClick={handleResultClick}
                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                     >
                       {patient.firstName} {patient.lastName} ({patient.email})
                     </Link>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="px-4 py-3 text-sm text-gray-500">
                 No patients found.
               </div>
             )}
           </div>
         )}
        </div>
      )}

      {/* View Mode Dropdown, Notifications, Cart, and user profile */}
      <div className={`flex items-center space-x-4 ${viewMode === 'admin' ? 'ml-4' : 'ml-auto'}`}>
        {/* View Mode Dropdown */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'admin',
                icon: <ShieldCheck size={14} />,
                label: 'Admin View',
              },
              {
                key: 'patient',
                icon: <UserCheck size={14} />,
                label: 'Patient View',
              },
            ],
            onClick: ({ key }) => setViewMode(key),
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
