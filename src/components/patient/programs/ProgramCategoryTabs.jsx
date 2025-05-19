import React from 'react';

const ProgramCategoryTabs = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-1 mt-2">
      <button
        className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'for-you' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
        onClick={() => setActiveCategory('for-you')}
      >
        For You
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'weight' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
        onClick={() => setActiveCategory('weight')}
      >
        Weight
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'hair' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
        onClick={() => setActiveCategory('hair')}
      >
        Hair
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'sex' ? 'font-bold bg-white text-teal-600' : 'font-medium bg-white bg-opacity-20 text-white'}`}
        onClick={() => setActiveCategory('sex')}
      >
        Sexual Health
      </button>
    </div>
  );
};

export default ProgramCategoryTabs;
