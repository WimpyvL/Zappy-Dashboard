import React from 'react';

const StatusBadge = ({ status, type }) => {
  // Define styles based on type
  const styles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  // Get the appropriate style or fall back to default
  const badgeStyle = styles[type] || styles.default;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;