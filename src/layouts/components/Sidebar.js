import React, { useRef, useEffect } from 'react'; // Import useRef and useEffect
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  sidebarItems as adminSidebarItems,
  settingsItems,
  logoutItem,
  patientSidebarItems,
  superUserItem,
} from '../../constants/SidebarItems';

const Sidebar = () => {
  const location = useLocation();
  const { logout, isSuperUser, toggleSuperUser } = useAuth();
  const { viewMode } = useAppContext(); // Get viewMode
  const navigate = useNavigate();
  const navRef = useRef(null); // Ref for the scrollable nav element
  const scrollKey = 'sidebarScrollPos'; // Key for sessionStorage

  const handleLogout = () => {
    sessionStorage.removeItem(scrollKey); // Clear scroll position on logout
    logout();
    navigate('/login');
  };

  // Function to return specific active/inactive classes for patient view
  const getPatientNavItemClasses = (path, color) => {
    const isActive = location.pathname === path;
    const baseClasses =
      'flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all';

    // Define explicit classes for each color
    const colorClasses = {
      primary: {
        active: 'bg-primary text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-primary',
      },
      accent1: {
        active: 'bg-accent1 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent1',
      },
      accent2: {
        active: 'bg-accent2 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent2',
      },
      accent3: {
        active: 'bg-accent3 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent3',
      },
      accent4: {
        active: 'bg-accent4 text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-accent4',
      },
      // Add default fallback if color is missing or invalid
      default: {
        active: 'bg-primary text-white shadow-md',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
        icon: 'text-primary',
      },
    };

    const styles = colorClasses[color] || colorClasses.default;

    return {
      link: `${baseClasses} ${isActive ? styles.active : styles.inactive}`,
      icon: styles.icon,
    };
  };

  // Reusable menu item component for patient view - Updated
  // Removed unused AdminNavItem component
  const PatientNavItem = ({ item }) => {
    const Icon = item.icon;
    const { link: linkClasses, icon: iconClass } = getPatientNavItemClasses(
      item.path,
      item.color || 'primary'
    );

    return (
      <Link to={item.path} className={linkClasses}>
        <div className={`${iconClass} mr-3`}>
          <Icon className="h-5 w-5" />
        </div>
        <span>{item.title}</span>
      </Link>
    );
  };

  // Determine items based on viewMode
  const currentSidebarItems =
    viewMode === 'admin'
      ? [...adminSidebarItems, ...settingsItems]
      : patientSidebarItems;
  const sidebarKeyPrefix = viewMode === 'admin' ? 'admin' : 'patient';

  // Effect to restore scroll position on mount
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem(scrollKey);
    if (savedScrollPos && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScrollPos, 10);
      // Optional: Remove after restoring if you only want it restored once per session start
      // sessionStorage.removeItem(scrollKey);
    }

    // Capture the ref's current value inside the effect
    const node = navRef.current;
    // Cleanup function to save scroll position on unmount/navigation
    return () => {
      if (node) {
        // Use the captured value in the cleanup
        sessionStorage.setItem(scrollKey, node.scrollTop);
      }
    };
  }, [scrollKey]); // Added scrollKey to dependency array as it's used inside

  // Use the light theme structure for both views
  return (
    <div className="bg-gray-50 w-64 flex flex-col h-full border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        {/* Use primary color for title regardless of view mode */}
        <h1 className="text-2xl font-bold text-primary">Zappy Health</h1>
        {/* Optionally show subtitle only for patient view */}
        {viewMode === 'patient' && (
          <p className="text-sm text-gray-500 font-handwritten mt-1">
            Your health journey
          </p>
        )}
      </div>

      {/* Render items using PatientNavItem for consistent styling - Added overflow-y-auto and ref */}
      <nav ref={navRef} className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {currentSidebarItems.map((item) => (
          <PatientNavItem
            key={`${sidebarKeyPrefix}-${item.path}`}
            item={item}
          />
        ))}

        {/* Super User Mode Toggle */}
        {viewMode === 'admin' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={toggleSuperUser}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all ${isSuperUser ? 'bg-yellow-100 text-yellow-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <superUserItem.icon
                className={`mr-3 h-5 w-5 ${isSuperUser ? 'text-yellow-600' : 'text-gray-400'}`}
              />
              <span>{superUserItem.title}</span>
              <span
                className={`ml-auto text-xs px-2 py-1 rounded ${isSuperUser ? 'bg-yellow-200' : 'bg-gray-100'}`}
              >
                {isSuperUser ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Logout button with consistent light theme styling */}
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
