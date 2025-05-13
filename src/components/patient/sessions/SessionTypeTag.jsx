import React from 'react';

/**
 * Component to display a tag indicating the type of session
 * @param {Object} props
 * @param {string} props.type - The type of session (e.g., 'medical', 'therapy', 'coaching')
 */
const SessionTypeTag = ({ type }) => {
  // Define colors based on session type
  const getTagColor = () => {
    switch (type?.toLowerCase()) {
      case 'medical':
        return 'bg-blue-100 text-blue-800';
      case 'therapy':
        return 'bg-purple-100 text-purple-800';
      case 'coaching':
        return 'bg-green-100 text-green-800';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-800';
      case 'initial':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor()}`}>
      {type || 'Unknown'}
    </span>
  );
};

export default SessionTypeTag;
