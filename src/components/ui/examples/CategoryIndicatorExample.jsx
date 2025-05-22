import React from 'react';
import CategoryIndicator from '../CategoryIndicator';

/**
 * CategoryIndicatorExample Component
 * 
 * A demonstration component showing all the different category indicator variations.
 * This serves as both documentation and a visual test for the CategoryIndicator component.
 */
const CategoryIndicatorExample = () => {
  // Define all available categories
  const categories = [
    { id: 'weight-management', name: 'Weight Management' },
    { id: 'ed', name: 'ED Consultation' },
    { id: 'hair-loss', name: 'Hair Loss' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'mental-health', name: 'Mental Health' },
    { id: 'primary-care', name: 'Primary Care' },
    { id: 'womens-health', name: 'Women\'s Health' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'default', name: 'Default' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Category Indicator Examples</h2>
      
      <div className="space-y-6">
        {/* Basic Category Indicators */}
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Category Indicators</h3>
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <div key={category.id} className="flex items-center">
                <CategoryIndicator category={category.id} />
                <span className="ml-1">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Category Indicators with Labels */}
        <div>
          <h3 className="text-lg font-medium mb-2">Category Indicators with Labels</h3>
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <CategoryIndicator 
                key={category.id}
                category={category.id} 
                label={category.name}
              />
            ))}
          </div>
        </div>
        
        {/* Usage Examples */}
        <div>
          <h3 className="text-lg font-medium mb-2">Usage Examples</h3>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-medium mb-4">Service Categories</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <CategoryIndicator category="weight-management" />
                  <span>Weight Management</span>
                </div>
                <span className="text-sm text-gray-500">24 patients</span>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <CategoryIndicator category="ed" />
                  <span>ED Consultation</span>
                </div>
                <span className="text-sm text-gray-500">18 patients</span>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <CategoryIndicator category="hair-loss" />
                  <span>Hair Loss</span>
                </div>
                <span className="text-sm text-gray-500">12 patients</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4">Patient Services</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <CategoryIndicator category="weight-management" label="Weight Management" />
                <p className="mt-2 text-sm text-gray-600">Personalized weight management programs with medical supervision.</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <CategoryIndicator category="mental-health" label="Mental Health" />
                <p className="mt-2 text-sm text-gray-600">Therapy and medication management for anxiety, depression, and more.</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <CategoryIndicator category="primary-care" label="Primary Care" />
                <p className="mt-2 text-sm text-gray-600">Comprehensive primary care services for all your health needs.</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <CategoryIndicator category="womens-health" label="Women's Health" />
                <p className="mt-2 text-sm text-gray-600">Specialized care for women's health concerns and wellness.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Implementation Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Implementation Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Import the <code className="bg-gray-100 px-1 rounded">CategoryIndicator</code> component from <code className="bg-gray-100 px-1 rounded">src/components/ui/CategoryIndicator</code></li>
          <li>Use the <code className="bg-gray-100 px-1 rounded">category</code> prop to set the indicator color (weight-management, ed, hair-loss, etc.)</li>
          <li>Optionally provide a <code className="bg-gray-100 px-1 rounded">label</code> to display text next to the indicator</li>
          <li>Add additional classes with the <code className="bg-gray-100 px-1 rounded">className</code> prop if needed</li>
          <li>The component automatically converts category names to kebab-case, so "Weight Management" becomes "weight-management"</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryIndicatorExample;
