import React from 'react';
import {
  ButtonExample,
  StatusBadgeExample,
  TableExample,
  CategoryIndicatorExample,
  CardExample
} from '../../components/ui';

/**
 * UIComponentsPage
 * 
 * A showcase of all UI components in the system.
 * This page serves as a living documentation and testing ground for UI components.
 */
const UIComponentsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UI Components Library</h1>
        <p className="text-gray-600">
          A collection of reusable UI components for the Telehealth platform.
          These components provide consistent styling and behavior across the application.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li>
              <a href="#buttons" className="text-blue-600 hover:underline">Buttons</a>
            </li>
            <li>
              <a href="#status-badges" className="text-blue-600 hover:underline">Status Badges</a>
            </li>
            <li>
              <a href="#tables" className="text-blue-600 hover:underline">Tables</a>
            </li>
            <li>
              <a href="#category-indicators" className="text-blue-600 hover:underline">Category Indicators</a>
            </li>
            <li>
              <a href="#cards" className="text-blue-600 hover:underline">Cards</a>
            </li>
          </ul>
        </div>
        
        {/* Buttons Section */}
        <div id="buttons" className="scroll-mt-16">
          <ButtonExample />
        </div>
        
        {/* Status Badges Section */}
        <div id="status-badges" className="scroll-mt-16">
          <StatusBadgeExample />
        </div>
        
        {/* Tables Section */}
        <div id="tables" className="scroll-mt-16">
          <TableExample />
        </div>
        
        {/* Category Indicators Section */}
        <div id="category-indicators" className="scroll-mt-16">
          <CategoryIndicatorExample />
        </div>
        
        {/* Cards Section */}
        <div id="cards" className="scroll-mt-16">
          <CardExample />
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          UI Components Library - Version 1.0.0 - Last Updated: May 22, 2025
        </p>
      </div>
    </div>
  );
};

export default UIComponentsPage;
