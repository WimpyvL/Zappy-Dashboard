import React from 'react';
import PropTypes from 'prop-types';

/**
 * PriorityActionCard component
 * 
 * A card component with a yellow background and blue accent line to highlight important tasks
 * 
 * @param {string} title - The title of the card
 * @param {string} description - The description or subtitle of the card
 * @param {string} actionText - The text for the action button
 * @param {function} onAction - The function to call when the action button is clicked
 * @param {node} icon - Optional icon to display before the title
 * @param {node} children - Optional children to render inside the card
 */
const PriorityActionCard = ({ 
  title, 
  description, 
  actionText, 
  onAction,
  icon,
  children 
}) => {
  return (
    <div className="bg-[#FFD100] bg-opacity-30 rounded-lg p-4 border-l-4 border-[#2D7FF9] relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          {icon && (
            <div className="mr-4 mt-1">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            {description && <p className="text-gray-600 text-sm">{description}</p>}
          </div>
        </div>
        
        {actionText && (
          <button 
            className="bg-[#2D7FF9] text-white px-4 py-2 rounded-full text-sm font-medium"
            onClick={onAction}
          >
            {actionText}
          </button>
        )}
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

PriorityActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.node,
  children: PropTypes.node
};

export default PriorityActionCard;
