import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Layers, Award, ShoppingBag
} from 'lucide-react';

const TopNavigation = ({ activePage }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Heart, path: '/home' },
    { id: 'care', label: 'Care', icon: Layers, path: '/care' },
    { id: 'programs', label: 'Programs', icon: Award, path: '/programs' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/shop' }
  ];

  return (
    <div className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 justify-center">
      <div className="flex space-x-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <Link 
              key={`top-nav-${item.id}`}
              to={item.path} 
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'text-[#2D7FF9] font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TopNavigation;
