import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResourceCategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tabsRef = useRef(null);

  // Check if scroll arrows should be shown
  const checkForScrollArrows = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  };

  // Scroll tabs left or right
  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Update arrows after scroll animation completes
      setTimeout(checkForScrollArrows, 300);
    }
  };

  // Initialize and handle resize
  useEffect(() => {
    checkForScrollArrows();
    window.addEventListener('resize', checkForScrollArrows);
    return () => window.removeEventListener('resize', checkForScrollArrows);
  }, []);

  // Update arrows when tabs content changes
  useEffect(() => {
    checkForScrollArrows();
  }, [categories]);

  // Handle scroll events
  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (tabsElement) {
      tabsElement.addEventListener('scroll', checkForScrollArrows);
      return () => tabsElement.removeEventListener('scroll', checkForScrollArrows);
    }
  }, []);

  return (
    <div className="relative">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Scrollable tabs container */}
      <div
        ref={tabsRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-2 -mx-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All categories tab */}
        <button
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium mr-2 transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onCategoryChange('all')}
        >
          All Resources
        </button>

        {/* Category tabs */}
        {categories.map((category) => (
          <button
            key={category.category_id}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium mr-2 transition-colors ${
              activeCategory === category.category_id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onCategoryChange(category.category_id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default ResourceCategoryTabs;
