import React from 'react';

/**
 * Component to display a badge indicating the status of a session
 * @param {Object} props
 * @param {string} props.status - The status of the session (e.g., 'scheduled', 'completed', 'cancelled')
 */
const SessionStatusBadge = ({ status }) => {
  // Define colors and text based on session status
  const getBadgeProperties = () => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return {
          color: 'bg-blue-100 text-blue-800',
          text: 'Scheduled'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          text: 'Cancelled'
        };
      case 'no-show':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: 'No Show'
        };
      case 'in-progress':
        return {
          color: 'bg-purple-100 text-purple-800',
          text: 'In Progress'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: status || 'Unknown'
        };
    }
  };

  const { color, text } = getBadgeProperties();

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default SessionStatusBadge;
