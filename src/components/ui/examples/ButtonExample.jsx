import React from 'react';
import Button from '../Button';

/**
 * ButtonExample Component
 * 
 * A demonstration component showing all the different button variations.
 * This serves as both documentation and a visual test for the Button component.
 */
const ButtonExample = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Button Examples</h2>
      
      <div className="space-y-6">
        {/* Button Variants */}
        <div>
          <h3 className="text-lg font-medium mb-2">Button Variants</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="blue">Blue</Button>
            <Button variant="green">Green</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        
        {/* Button Sizes */}
        <div>
          <h3 className="text-lg font-medium mb-2">Button Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Default</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </div>
        
        {/* Buttons with Icons */}
        <div>
          <h3 className="text-lg font-medium mb-2">Buttons with Icons</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>}
            >
              Add New
            </Button>
            
            <Button 
              variant="secondary" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>}
            >
              Filter
            </Button>
            
            <Button 
              variant="blue" 
              iconRight
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>}
            >
              Continue
            </Button>
          </div>
        </div>
        
        {/* Icon Only Buttons */}
        <div>
          <h3 className="text-lg font-medium mb-2">Icon Only Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              iconOnly
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>}
            />
            
            <Button 
              variant="secondary" 
              iconOnly
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>}
            />
            
            <Button 
              variant="danger" 
              iconOnly
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>}
            />
          </div>
        </div>
        
        {/* Disabled Buttons */}
        <div>
          <h3 className="text-lg font-medium mb-2">Disabled Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" disabled>Disabled Primary</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
            <Button 
              variant="blue" 
              disabled
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>}
            >
              Disabled with Icon
            </Button>
          </div>
        </div>
        
        {/* Usage Examples */}
        <div>
          <h3 className="text-lg font-medium mb-2">Usage Examples</h3>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">Patient Records</h4>
              <Button 
                variant="primary" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>}
              >
                Add Patient
              </Button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button variant="secondary" size="sm">All</Button>
              <Button variant="blue" size="sm">Active</Button>
              <Button variant="secondary" size="sm">Archived</Button>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary">Cancel</Button>
              <Button variant="green">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Implementation Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Implementation Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Import the <code className="bg-gray-100 px-1 rounded">Button</code> component from <code className="bg-gray-100 px-1 rounded">src/components/ui/Button</code></li>
          <li>Use the <code className="bg-gray-100 px-1 rounded">variant</code> prop to set the button style (primary, secondary, accent, etc.)</li>
          <li>Use the <code className="bg-gray-100 px-1 rounded">size</code> prop to set the button size (sm, md, lg)</li>
          <li>Add an icon with the <code className="bg-gray-100 px-1 rounded">icon</code> prop</li>
          <li>Use <code className="bg-gray-100 px-1 rounded">iconRight</code> to position the icon on the right</li>
          <li>Use <code className="bg-gray-100 px-1 rounded">iconOnly</code> for buttons that only contain an icon</li>
          <li>Add additional classes with the <code className="bg-gray-100 px-1 rounded">className</code> prop if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonExample;
