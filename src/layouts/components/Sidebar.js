import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  sidebarItems as adminSidebarItems,
  settingsItems,
  logoutItem,
  patientSidebarItems,
} from '../../constants/SidebarItems';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { viewMode } = useAppContext(); // Get viewMode
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to determine if a menu item is active for admin view
  const isAdminActive = (path) => {
    return location.pathname === path
      ? 'bg-indigo-800 text-white'
      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white';
  };

  // Function to determine if a menu item is active for patient view
  const isPatientActive = (path, color) => {
    if (location.pathname === path) {
      return `bg-${color} text-white shadow-md`;
    }
    return 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm';
  };

  // Reusable menu item component for admin view
  const AdminNavItem = ({ item }) => {
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isAdminActive(item.path)}`}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.title}
      </Link>
    );
  };

  // Reusable menu item component for patient view
  const PatientNavItem = ({ item }) => {
    const Icon = item.icon;
    const colorClass = item.color || 'primary';

    return (
      <Link
        to={item.path}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all ${isPatientActive(item.path, colorClass)}`}
      >
        <div className={`text-${colorClass} mr-3`}>
          <Icon className="h-5 w-5" />
        </div>
        <span>{item.title}</span>
      </Link>
    );
  };

  return viewMode === 'admin' ? (
    // Admin sidebar - keep the original dark design
    <div className="bg-indigo-900 text-white w-64 flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Zappy Health</h1>
      </div>

      <nav className="px-2 py-4 space-y-1"> 
        {adminSidebarItems.map((item) => (
          <AdminNavItem key={`admin-${item.path}`} item={item} />
        ))}
        
        <div className="pt-4">
          <hr className="border-indigo-800" />
        </div>
        {settingsItems.map((item) => (
          <AdminNavItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          className="flex items-center text-indigo-100 hover:text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-indigo-700 w-full"
          onClick={() => handleLogout()}
        >
          <logoutItem.icon className="mr-3 h-5 w-5" />
          {logoutItem.title}
        </button>
      </div>
    </div>
  ) : (
    // Patient sidebar - new light design with accent colors
    <div className="bg-gray-50 w-64 flex flex-col h-full border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Zappy Health</h1>
        <p className="text-sm text-gray-500 font-handwritten mt-1">Your health journey</p>
      </div>

      <nav className="px-3 py-6"> 
        {patientSidebarItems.map((item) => (
          <PatientNavItem key={`patient-${item.path}`} item={item} />
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-200">
        <button
          className="flex items-center text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 w-full"
          onClick={() => handleLogout()}
        >
          <logoutItem.icon className="mr-3 h-5 w-5" />
          {logoutItem.title}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
