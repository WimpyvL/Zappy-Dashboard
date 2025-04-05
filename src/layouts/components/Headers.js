import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Import useCart
import { useAppContext } from '../../context/AppContext'; // Import useAppContext
import { useNavigate } from 'react-router-dom';
import { Dropdown, Menu, Button } from 'antd'; // Import Dropdown, Menu, Button
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  ChevronDown,
  ShoppingCart,
  UserCheck, // Icon for Patient View
  ShieldCheck, // Icon for Admin View
  Eye, // Generic View icon
} from 'lucide-react'; // Import ShoppingCart icon and view mode icons

const Header = ({ onToggleCart }) => {
  // Destructure onToggleCart from props
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart(); // Get cart item count function
  const { viewMode, setViewMode } = useAppContext(); // Get view mode state and SETTER function
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white p-4 flex items-center justify-between shadow-sm">
      {/* Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* View Mode Dropdown, Notifications, Cart, and user profile */}
      <div className="flex items-center space-x-4">
        {/* View Mode Dropdown */}
        <Dropdown
          overlay={
            <Menu onClick={({ key }) => setViewMode(key)}>
              <Menu.Item key="admin" icon={<ShieldCheck size={14} />}>
                Admin View
              </Menu.Item>
              <Menu.Item key="patient" icon={<UserCheck size={14} />}>
                Patient View
              </Menu.Item>
              {/* Add other views here if needed */}
            </Menu>
          }
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
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
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

          {dropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings/profile');
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Your Profile
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                onClick={() => {
                  setDropdownOpen(false);
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
