import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge component
 * 
 * A badge component for displaying status indicators with different color variants
 * 
 * @param {string} status - The status to display (active, todo, done, or custom text)
 * @param {string} variant - The color variant (success, warning, info, or custom)
 * @param {node} icon - Optional icon to display before the text
 */
const StatusBadge = ({ status, variant = 'info', icon }) => {
  // Define color variants
  const variants = {
    success: 'bg-[#d1fae5] text-[#10b981]',
    warning: 'bg-[#FFD100] bg-opacity-70 text-gray-900',
    info: 'bg-[#dbeafe] text-[#2D7FF9]',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600'
  };
  
  // Map status to display text
  const statusText = {
    active: 'Active',
    todo: 'To Do',
    done: 'Done',
  }[status.toLowerCase()] || status;
  
  // Get the appropriate color classes
  const colorClasses = variants[variant] || variants.info;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {statusText}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'info', 'purple', 'gray']),
  icon: PropTypes.node
};

export default StatusBadge;
