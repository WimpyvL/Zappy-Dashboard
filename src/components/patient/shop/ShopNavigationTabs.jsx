import React from 'react';

const ShopNavigationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-around bg-white shadow-sm">
      <button
        className={`py-3 px-4 text-sm font-medium ${activeTab === 'for-you' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
        onClick={() => setActiveTab('for-you')}
      >
        For You
      </button>
      <button
        className={`py-3 px-4 text-sm font-medium ${activeTab === 'all-products' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
        onClick={() => setActiveTab('all-products')}
      >
        All Products
      </button>
      <button
        className={`py-3 px-4 text-sm font-medium ${activeTab === 'bundles' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
        onClick={() => setActiveTab('bundles')}
      >
        Bundles
      </button>
    </div>
  );
};

export default ShopNavigationTabs;
