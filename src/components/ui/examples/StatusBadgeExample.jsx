import React from 'react';
import StatusBadge from '../StatusBadge';

/**
 * StatusBadgeExample Component
 * 
 * A demonstration component showing all the different status badge variations.
 * This serves as both documentation and a visual test for the StatusBadge component.
 */
const StatusBadgeExample = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Status Badge Examples</h2>
      
      <div className="space-y-6">
        {/* Basic Status Badges */}
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Status Badges</h3>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="pending" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="followup" />
            <StatusBadge status="in-progress" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
          </div>
        </div>
        
        {/* Custom Labels */}
        <div>
          <h3 className="text-lg font-medium mb-2">Custom Labels</h3>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="pending" label="Awaiting Review" />
            <StatusBadge status="approved" label="Accepted" />
            <StatusBadge status="rejected" label="Declined" />
            <StatusBadge status="followup" label="Needs Follow-up" />
          </div>
        </div>
        
        {/* With Icons */}
        <div>
          <h3 className="text-lg font-medium mb-2">With Icons</h3>
          <div className="flex flex-wrap gap-3">
            <StatusBadge 
              status="pending" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>} 
            />
            <StatusBadge 
              status="approved" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>} 
            />
            <StatusBadge 
              status="rejected" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>} 
            />
          </div>
        </div>
        
        {/* Usage Examples */}
        <div>
          <h3 className="text-lg font-medium mb-2">Usage Examples</h3>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">May 21, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status="pending" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">View</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                  <td className="px-6 py-4 whitespace-nowrap">May 20, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status="approved" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">View</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Alice Johnson</td>
                  <td className="px-6 py-4 whitespace-nowrap">May 19, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status="followup" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">View</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Implementation Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Implementation Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Import the <code className="bg-gray-100 px-1 rounded">StatusBadge</code> component from <code className="bg-gray-100 px-1 rounded">src/components/ui/StatusBadge</code></li>
          <li>Use the <code className="bg-gray-100 px-1 rounded">status</code> prop to set the badge style (pending, approved, rejected, etc.)</li>
          <li>Optionally provide a custom <code className="bg-gray-100 px-1 rounded">label</code> or <code className="bg-gray-100 px-1 rounded">icon</code></li>
          <li>Add additional classes with the <code className="bg-gray-100 px-1 rounded">className</code> prop if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default StatusBadgeExample;
