import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext'; // Import useAppContext
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  ShoppingCart,
  CalendarCheck,
  MessageSquare,
  Store,
} from 'lucide-react'; // Icons for patient view
import {
  sidebarItems as adminSidebarItems, // Rename admin items
  settingsItems,
  logoutItem,
} from '../../constants/SidebarItems';


// Placeholder for Patient Sidebar Items (Ideally move to SidebarItems.js)
const patientSidebarItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, // Could link to a patient-specific dashboard later
  { title: 'My Profile', path: '/settings/profile', icon: User }, // Reuse settings profile path
  { title: 'My Orders', path: '/orders', icon: ShoppingCart }, // Reuse orders path (needs filtering later)
  { title: 'My Sessions', path: '/sessions', icon: CalendarCheck }, // Reuse sessions path (needs filtering later)
  { title: 'Messages', path: '/messages', icon: MessageSquare },
  { title: 'Shop', path: '/shop', icon: Store },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { viewMode } = useAppContext(); // Get viewMode
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to determine if a menu item is active
  const isActive = (path) => {
    return location.pathname === path
      ? 'bg-indigo-800 text-white'
      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white';
  };

  // Reusable menu item component
  const NavItem = ({ item }) => {
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive(item.path)}`}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.title}
      </Link>
    );
  };

  return (
    <div className="bg-indigo-900 text-white w-64 flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Zappy Health</h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {/* Conditional Main menu items */}
        {viewMode === 'admin'
          ? adminSidebarItems.map((item) => (
              <NavItem key={`admin-${item.path}`} item={item} />
            ))
          : patientSidebarItems.map((item) => (
              <NavItem key={`patient-${item.path}`} item={item} />
            ))}

        <div className="pt-4">
          <hr className="border-indigo-800" />
        </div>

        {/* Settings items */}
        {settingsItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4">
        <button
          className="flex items-center text-indigo-100 hover:text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-indigo-700 w-full"
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
