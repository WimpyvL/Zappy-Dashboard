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

  // Function to return specific active/inactive classes for patient view
  const getPatientNavItemClasses = (path, color) => {
    const isActive = location.pathname === path;
    const baseClasses = 'flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all';
    
    // Define explicit classes for each color
    const colorClasses = {
      primary: {
        active: 'bg-primary text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-primary'
      },
      accent1: {
        active: 'bg-accent1 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent1'
      },
      accent2: {
        active: 'bg-accent2 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent2'
      },
      accent3: {
        active: 'bg-accent3 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent3'
      },
      accent4: {
        active: 'bg-accent4 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent4'
      },
      // Add default fallback if color is missing or invalid
      default: {
        active: 'bg-primary text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-primary'
      }
    };

    const styles = colorClasses[color] || colorClasses.default;
    
    return {
      link: `${baseClasses} ${isActive ? styles.active : styles.inactive}`,
      icon: styles.icon
    };
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

  // Reusable menu item component for patient view - Updated
  const PatientNavItem = ({ item }) => {
    const Icon = item.icon;
    const { link: linkClasses, icon: iconClass } = getPatientNavItemClasses(item.path, item.color || 'primary');

    return (
      <Link
        to={item.path}
        className={linkClasses}
      >
        <div className={`${iconClass} mr-3`}>
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
