import React from 'react';
import PropTypes from 'prop-types';

/**
 * MessagePreviewCard component
 * 
 * A card component for displaying message previews on the home page
 * 
 * @param {string} senderName - The name of the message sender
 * @param {string} messagePreview - A preview of the message content
 * @param {string} timeAgo - How long ago the message was sent (e.g., "Yesterday", "2 hours ago")
 * @param {node} senderIcon - Optional icon representing the sender
 * @param {function} onClick - Function to call when the card is clicked
 */
const MessagePreviewCard = ({
  senderName,
  messagePreview,
  timeAgo,
  senderIcon,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start">
        {senderIcon && (
          <div className="mr-4">
            {senderIcon}
          </div>
        )}
        
        <div>
          <div className="flex items-center">
            <h3 className="font-semibold text-gray-900 text-sm">{senderName}</h3>
            <span className="text-xs text-gray-500 ml-auto">{timeAgo}</span>
          </div>
          <p className="text-gray-600 text-xs mt-1 line-clamp-1">{messagePreview}</p>
        </div>
      </div>
      
      <div className="ml-4">
        <div className="w-9 h-9 rounded-full bg-[#2D7FF9] flex items-center justify-center text-white">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

MessagePreviewCard.propTypes = {
  senderName: PropTypes.string.isRequired,
  messagePreview: PropTypes.string.isRequired,
  timeAgo: PropTypes.string.isRequired,
  senderIcon: PropTypes.node,
  onClick: PropTypes.func.isRequired
};

export default MessagePreviewCard;
