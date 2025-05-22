import React from 'react';
import Card from '../Card';
import Button from '../Button';

/**
 * CardExample Component
 * 
 * A demonstration component showing all the different card variations.
 * This serves as both documentation and a visual test for the Card component.
 */
const CardExample = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Card Examples</h2>
      
      <div className="space-y-6">
        {/* Basic Card */}
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Card</h3>
          <Card>
            <p>This is a basic card with default styling.</p>
          </Card>
        </div>
        
        {/* Card with Accent Colors */}
        <div>
          <h3 className="text-lg font-medium mb-2">Cards with Accent Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card accentColor="primary">
              <p>Card with primary accent</p>
            </Card>
            
            <Card accentColor="accent1">
              <p>Card with accent1 color</p>
            </Card>
            
            <Card accentColor="accent2">
              <p>Card with accent2 color</p>
            </Card>
            
            <Card accentColor="accent4">
              <p>Card with accent4 color</p>
            </Card>
          </div>
        </div>
        
        {/* Card with Title */}
        <div>
          <h3 className="text-lg font-medium mb-2">Card with Title</h3>
          <Card title="Card Title">
            <p>This card has a title in the header section.</p>
          </Card>
        </div>
        
        {/* Card with Action */}
        <div>
          <h3 className="text-lg font-medium mb-2">Card with Action</h3>
          <Card 
            title="Recent Consultations" 
            action={
              <Button variant="primary" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Consultation
              </Button>
            }
          >
            <p>This card has both a title and an action button in the header.</p>
          </Card>
        </div>
        
        {/* Card with Footer */}
        <div>
          <h3 className="text-lg font-medium mb-2">Card with Footer</h3>
          <Card 
            title="Data Summary" 
            footer={true}
            footerContent={
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                View All Data
              </button>
            }
          >
            <p>This card has a footer section with a link.</p>
          </Card>
        </div>
        
        {/* Card with No Hover Effect */}
        <div>
          <h3 className="text-lg font-medium mb-2">Card with No Hover Effect</h3>
          <Card hover={false}>
            <p>This card does not have the hover animation effect.</p>
          </Card>
        </div>
        
        {/* Clickable Card */}
        <div>
          <h3 className="text-lg font-medium mb-2">Clickable Card</h3>
          <Card 
            onClick={() => alert('Card clicked!')}
            accentColor="accent2"
          >
            <p>This entire card is clickable. Try clicking on it!</p>
          </Card>
        </div>
        
        {/* Dashboard Stats Example */}
        <div>
          <h3 className="text-lg font-medium mb-2">Dashboard Stats Example</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card accentColor="primary">
              <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
              <p className="text-2xl font-bold text-gray-800">1,248</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                12% from last month
              </p>
            </Card>
            
            <Card accentColor="accent1">
              <h3 className="text-sm font-medium text-gray-500">Active Consultations</h3>
              <p className="text-2xl font-bold text-gray-800">64</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                8% from last week
              </p>
            </Card>
            
            <Card accentColor="accent2">
              <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
              <p className="text-2xl font-bold text-gray-800">892</p>
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
                3% from last month
              </p>
            </Card>
            
            <Card accentColor="accent4">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-2xl font-bold text-gray-800">$24,568</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                15% from last month
              </p>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Implementation Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Implementation Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Import the <code className="bg-gray-100 px-1 rounded">Card</code> component from <code className="bg-gray-100 px-1 rounded">src/components/ui/Card</code></li>
          <li>Use the <code className="bg-gray-100 px-1 rounded">accentColor</code> prop to add a colored top border</li>
          <li>Add a title with the <code className="bg-gray-100 px-1 rounded">title</code> prop</li>
          <li>Add an action button with the <code className="bg-gray-100 px-1 rounded">action</code> prop</li>
          <li>Add a footer with the <code className="bg-gray-100 px-1 rounded">footer</code> and <code className="bg-gray-100 px-1 rounded">footerContent</code> props</li>
          <li>Make the card clickable with the <code className="bg-gray-100 px-1 rounded">onClick</code> prop</li>
          <li>Disable hover effects with <code className="bg-gray-100 px-1 rounded">hover={'{false}'}</code></li>
        </ul>
      </div>
    </div>
  );
};

export default CardExample;
