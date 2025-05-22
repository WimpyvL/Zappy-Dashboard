import React, { useState } from 'react';
import Table from '../Table';
import Button from '../Button';
import StatusBadge from '../StatusBadge';

/**
 * TableExample Component
 * 
 * A demonstration component showing the Table component with various features.
 * This serves as both documentation and a visual test for the Table component.
 */
const TableExample = () => {
  // Sample data for the table
  const consultations = [
    { id: 1, patient: 'John Doe', date: 'May 21, 2025', service: 'Weight Management', provider: 'Dr. Smith', status: 'pending' },
    { id: 2, patient: 'Jane Smith', date: 'May 20, 2025', service: 'ED Consultation', provider: 'Dr. Johnson', status: 'approved' },
    { id: 3, patient: 'Alice Johnson', date: 'May 19, 2025', service: 'Hair Loss', provider: 'Dr. Williams', status: 'followup' },
    { id: 4, patient: 'Bob Brown', date: 'May 18, 2025', service: 'Wellness Check', provider: 'Dr. Davis', status: 'completed' },
    { id: 5, patient: 'Carol White', date: 'May 17, 2025', service: 'Mental Health', provider: 'Dr. Wilson', status: 'pending' },
  ];

  // Column definitions
  const columns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
            {record.patient.split(' ').map(name => name[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.patient}</div>
            <div className="text-xs text-gray-500">{`patient-${record.id}@example.com`}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Date',
      key: 'date',
    },
    {
      title: 'Service',
      key: 'service',
      render: (record) => {
        // Map service to category for the indicator
        const categoryMap = {
          'Weight Management': 'weight-management',
          'ED Consultation': 'ed',
          'Hair Loss': 'hair-loss',
          'Wellness Check': 'wellness',
          'Mental Health': 'mental-health',
        };
        
        const category = categoryMap[record.service] || '';
        
        return (
          <div className="flex items-center">
            <span className={`category-indicator ${category}`}></span>
            {record.service}
          </div>
        );
      }
    },
    {
      title: 'Provider',
      key: 'provider',
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => <StatusBadge status={record.status} />
    },
    {
      title: 'Actions',
      render: () => (
        <div className="flex space-x-2">
          <Button variant="blue" size="sm">View</Button>
          <Button variant="secondary" size="sm">Details</Button>
        </div>
      )
    }
  ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Mock total pages

  // Handle row click
  const handleRowClick = (record) => {
    console.log('Row clicked:', record);
  };

  // Custom footer with pagination
  const renderFooter = () => (
    <div className="flex justify-between items-center w-full">
      <div>
        Showing {consultations.length} of 15 consultations
      </div>
      <div className="pagination">
        <button 
          className="pagination-button" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        >
          &lt;
        </button>
        
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        
        <button 
          className="pagination-button" 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        >
          &gt;
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Table Examples</h2>
      
      <div className="space-y-8">
        {/* Table with Header */}
        <div>
          <h3 className="text-lg font-medium mb-2">Table with Header</h3>
          <Table
            title="Recent Consultations"
            action={
              <Button variant="primary" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Consultation
              </Button>
            }
            columns={columns}
            data={consultations}
            categoryKey="service"
            onRowClick={handleRowClick}
            footer={renderFooter()}
          />
        </div>
        
        {/* Basic Table */}
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Table</h3>
          <Table
            columns={columns}
            data={consultations}
            categoryKey="service"
            onRowClick={handleRowClick}
            footer={renderFooter()}
          />
        </div>
        
        {/* Empty State */}
        <div>
          <h3 className="text-lg font-medium mb-2">Empty State</h3>
          <Table
            columns={columns}
            data={[]}
            emptyMessage="No consultations found. Create a new consultation to get started."
          />
        </div>
        
        {/* Loading State */}
        <div>
          <h3 className="text-lg font-medium mb-2">Loading State</h3>
          <Table
            columns={columns}
            data={[]}
            isLoading={true}
            loadingMessage="Loading consultations..."
          />
        </div>
        
        {/* Error State */}
        <div>
          <h3 className="text-lg font-medium mb-2">Error State</h3>
          <Table
            columns={columns}
            data={[]}
            error="Failed to load consultations. Please try again later."
          />
        </div>
      </div>
      
      {/* Implementation Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Implementation Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Import the <code className="bg-gray-100 px-1 rounded">Table</code> component from <code className="bg-gray-100 px-1 rounded">src/components/ui/Table</code></li>
          <li>Define columns with <code className="bg-gray-100 px-1 rounded">title</code>, <code className="bg-gray-100 px-1 rounded">key</code>, and optional <code className="bg-gray-100 px-1 rounded">render</code> function</li>
          <li>Add a header with the <code className="bg-gray-100 px-1 rounded">title</code> and <code className="bg-gray-100 px-1 rounded">action</code> props</li>
          <li>Use the <code className="bg-gray-100 px-1 rounded">categoryKey</code> prop to enable category-specific styling</li>
          <li>Provide a <code className="bg-gray-100 px-1 rounded">footer</code> prop for pagination or other controls</li>
          <li>Handle row clicks with the <code className="bg-gray-100 px-1 rounded">onRowClick</code> prop</li>
          <li>Use <code className="bg-gray-100 px-1 rounded">isLoading</code>, <code className="bg-gray-100 px-1 rounded">isEmpty</code>, and <code className="bg-gray-100 px-1 rounded">error</code> props for different states</li>
          <li>Customize messages with <code className="bg-gray-100 px-1 rounded">emptyMessage</code> and <code className="bg-gray-100 px-1 rounded">loadingMessage</code></li>
        </ul>
      </div>
      
      {/* Category Indicators */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Category Indicators</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="category-indicator weight-management"></span>
            <span>Weight Management</span>
          </div>
          <div className="flex items-center">
            <span className="category-indicator ed"></span>
            <span>ED Consultation</span>
          </div>
          <div className="flex items-center">
            <span className="category-indicator hair-loss"></span>
            <span>Hair Loss</span>
          </div>
          <div className="flex items-center">
            <span className="category-indicator wellness"></span>
            <span>Wellness</span>
          </div>
          <div className="flex items-center">
            <span className="category-indicator mental-health"></span>
            <span>Mental Health</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableExample;
