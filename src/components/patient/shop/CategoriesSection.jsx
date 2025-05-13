import React from 'react';
import { ChevronRight } from 'lucide-react';

const CategoriesSection = ({ categories, handleViewAllCategories }) => {
  // Hardcoded categories - this should ideally come from an API
  const defaultCategories = [
    { id: 1, name: 'Weight Management', imageUrl: 'https://via.placeholder.com/100' },
    { id: 2, name: 'Diabetes Management', imageUrl: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Heart Health', imageUrl: 'https://via.placeholder.com/100' },
    { id: 4, name: 'Mental Wellness', imageUrl: 'https://via.placeholder.com/100' },
  ];

  const categoriesToDisplay = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">Shop by Category</h2>
        <button
          className="text-sm font-medium text-teal-600 flex items-center hover:underline"
          onClick={handleViewAllCategories}
        >
          View All <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {categoriesToDisplay.map(category => (
          <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center p-4">
            <img src={category.imageUrl} alt={category.name} className="w-20 h-20 object-cover rounded-lg mb-2"/>
            <span className="text-sm font-medium text-gray-800">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
