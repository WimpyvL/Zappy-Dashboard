import React from 'react';
import { getColorClasses } from '../../../utils/colorClasses';

/**
 * Standard admin layout component with consistent styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.actions - Action buttons/components for the header
 */
export const AdminLayout = ({ children, title, actions }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      {children}
    </div>
  );
};

export default AdminLayout;
