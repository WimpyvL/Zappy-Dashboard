import React, { useState, useRef, useEffect, useCallback } from 'react'; // Added useCallback
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { useAppContext } from '../../context/AppContext'; // Import AppContext hook
import { debounce } from 'lodash'; // Import debounce
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  X, // Import X icon for clearing search
  ChevronDown,
  ShoppingCart,
} from 'lucide-react';

const Header = ({ onToggleCart }) => {
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { patients } = useAppContext(); // Get patients from context
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // Renamed for clarity
  const userDropdownRef = useRef(null); // Renamed for clarity
  const searchRef = useRef(null); // Ref for search input and dropdown container

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Track focus for dropdown visibility

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Debounced search function
  const performSearch = useCallback(
    debounce((query) => {
      if (!query) {
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
    }, 300), // 300ms debounce
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
    setIsSearchFocused(false); // Optionally lose focus
  };

  // Handle clicking a search result
  const handleResultClick = () => {
    clearSearch(); // Clear search after selection
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      // Close search dropdown
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false); // Hide dropdown by setting focus state
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showSearchDropdown = isSearchFocused && searchQuery.length > 0;

  return (
    <header className="bg-white p-4 flex items-center justify-between shadow-sm relative z-20"> {/* Added relative and z-index */}
      {/* Search bar */}
      <div className="flex-1 max-w-xl" ref={searchRef}> {/* Attach ref here */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search Patients..." // Updated placeholder
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" // Added pr-10 for clear button
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            // onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} // Delay blur to allow clicking results
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
                       to={`/patients/${patient.id}`} // Link to patient detail page
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

      {/* Notifications, Cart, and user profile */}
      <div className="flex items-center space-x-4 ml-4"> {/* Added ml-4 for spacing */}
        {/* Notifications Button */}
        <button className="relative p-1 text-gray-600 hover:text-gray-900">
          <Bell className="h-6 w-6" />
          {/* Placeholder for notification count */}
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Shopping Cart Button */}
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

        {/* User Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}> {/* Attach ref here */}
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)} // Use renamed state setter
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

          {userDropdownOpen && ( // Use renamed state variable
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"> {/* Ensure z-index is high enough */}
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                onClick={() => {
                  setUserDropdownOpen(false); // Use renamed state setter
                  navigate('/settings/profile');
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Your Profile
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                onClick={() => {
                  setUserDropdownOpen(false); // Use renamed state setter
                  navigate('/settings');
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
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
