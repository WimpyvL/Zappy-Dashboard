import React from 'react';
import { Search, ShoppingCart, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShopHeader = ({ cartCount }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 mr-4">Shop</h1>
        <button className="text-gray-600 hover:text-gray-800">
          <Search size={24} />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative text-gray-600 hover:text-gray-800" onClick={() => navigate('/cart')}>
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <button className="text-gray-600 hover:text-gray-800">
          <Settings size={24} />
        </button>
      </div>
    </div>
  );
};

export default ShopHeader;
