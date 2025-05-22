import React from 'react';
import './StatusBadges.css';

/**
 * StatusBadge Component
 * 
 * A reusable component for displaying status information with consistent styling.
 * 
 * @param {Object} props
 * @param {string} props.status - The status to display (pending, approved, rejected, followup, in-progress, completed, cancelled)
 * @param {React.ReactNode} props.icon - Optional icon to display before the status text
 * @param {string} props.label - Optional custom label (if not provided, will capitalize the status)
 * @param {string} props.className - Optional additional CSS classes
 */
const StatusBadge = ({ status, icon, label, className = '' }) => {
  // Default statuses
  const validStatuses = [
    'pending', 
    'approved', 
    'rejected', 
    'followup', 
    'in-progress', 
    'completed', 
    'cancelled'
  ];
  
  // Use a default status if the provided one is not valid
  const badgeStatus = validStatuses.includes(status) ? status : 'pending';
  
  // Generate the display label (capitalize first letter)
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={`status-badge ${badgeStatus} ${className}`}>
      {icon && <span className="icon">{icon}</span>}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
