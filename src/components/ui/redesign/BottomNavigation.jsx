import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  BookOpen, 
  ShoppingBag,
  Bell
} from 'lucide-react';

/**
 * BottomNavigation component
 * 
 * A fixed bottom navigation bar for mobile devices with 4 main sections
 * 
 * @param {string} activePage - The currently active page
 * @param {object} notifications - Object with notification counts for each section
 */
const BottomNavigation = ({ activePage, notifications = {} }) => {
  // Define navigation items
  const navItems = [
    { 
      id: 'home', 
      name: 'Home', 
      icon: Home, 
      route: '/' 
    },
    { 
      id: 'health', 
      name: 'Health', 
      icon: Heart, 
      route: '/health' 
    },
    { 
      id: 'learn', 
      name: 'Learn', 
      icon: BookOpen, 
      route: '/learn' 
    },
    { 
      id: 'shop', 
      name: 'Shop', 
      icon: ShoppingBag, 
      route: '/shop' 
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 z-30 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map(item => (
          <Link 
            key={item.id}
            to={item.route}
            className={`flex flex-col items-center relative ${
              activePage === item.id 
                ? 'text-[#2D7FF9] font-semibold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label={item.name}
          >
            <item.icon className="h-6 w-6" strokeWidth={activePage === item.id ? 2 : 1.5} />
            <span className="text-xs mt-1">{item.name}</span>
            
            {/* Notification badge */}
            {notifications[item.id] > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {notifications[item.id]}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

BottomNavigation.propTypes = {
  activePage: PropTypes.oneOf(['home', 'health', 'learn', 'shop', '']).isRequired,
  notifications: PropTypes.shape({
    home: PropTypes.number,
    health: PropTypes.number,
    learn: PropTypes.number,
    shop: PropTypes.number
  })
};

export default BottomNavigation;
