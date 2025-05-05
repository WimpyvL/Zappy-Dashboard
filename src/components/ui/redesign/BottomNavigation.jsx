import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  Calendar, 
  ShoppingBag
} from 'lucide-react';

/**
 * BottomNavigation component
 * 
 * A fixed bottom navigation bar with 4 main sections: Home, Care, Programs, and Shop
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
      route: '/home' 
    },
    { 
      id: 'care', 
      name: 'Care', 
      icon: Heart, 
      route: '/care' 
    },
    { 
      id: 'programs', 
      name: 'Programs', 
      icon: Calendar, 
      route: '/programs' 
    },
    { 
      id: 'shop', 
      name: 'Shop', 
      icon: ShoppingBag, 
      route: '/shop' 
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10">
      <div className="flex justify-around">
        {navItems.map(item => (
          <Link 
            key={item.id}
            to={item.route}
            className={`flex flex-col items-center relative ${
              activePage === item.id 
                ? 'text-[#2D7FF9] font-semibold' 
                : 'text-gray-500'
            }`}
          >
            <item.icon className="h-6 w-6" />
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
  activePage: PropTypes.oneOf(['home', 'care', 'programs', 'shop']).isRequired,
  notifications: PropTypes.shape({
    home: PropTypes.number,
    care: PropTypes.number,
    programs: PropTypes.number,
    shop: PropTypes.number
  })
};

export default BottomNavigation;
