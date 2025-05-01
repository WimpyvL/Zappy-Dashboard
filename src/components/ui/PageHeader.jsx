import React from 'react';

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
};

export default PageHeader;