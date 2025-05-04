import React from 'react';
import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge';

/**
 * TreatmentCard component
 * 
 * A card component for displaying treatment information with color-coded headers
 * based on treatment type
 * 
 * @param {string} type - The treatment type ('weight' or 'hair')
 * @param {string} title - The title of the treatment
 * @param {string} subtitle - The subtitle or description of the treatment
 * @param {string} status - The status of the treatment (active, paused, etc.)
 * @param {object} nextTask - The next task for this treatment (with title and description)
 * @param {array} details - Array of detail objects with label and value
 * @param {object} primaryAction - The primary action button (with text and onClick)
 * @param {object} secondaryAction - The secondary action button (with text and onClick)
 * @param {array} resourceLinks - Array of resource link objects (with icon, text, and onClick)
 */
const TreatmentCard = ({
  type = 'weight',
  title,
  subtitle,
  status = 'active',
  nextTask,
  details = [],
  primaryAction,
  secondaryAction,
  resourceLinks = []
}) => {
  // Define treatment type styles
  const typeStyles = {
    weight: {
      headerBg: 'bg-[#dbeafe]',
      titleColor: 'text-[#2D7FF9]',
      buttonBg: 'bg-[#2D7FF9]',
      badgeVariant: 'info'
    },
    hair: {
      headerBg: 'bg-[#ede9fe]',
      titleColor: 'text-[#2D7FF9]',
      buttonBg: 'bg-purple-600',
      badgeVariant: 'purple'
    }
  };
  
  // Get the appropriate styles for this treatment type
  const styles = typeStyles[type] || typeStyles.weight;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 mb-6">
      {/* Header */}
      <div className={`p-5 ${styles.headerBg} border-b border-gray-200`}>
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-lg ${styles.titleColor}`}>{title}</h3>
          <StatusBadge status={status} variant={status === 'active' ? 'success' : 'gray'} />
        </div>
        <p className="text-sm text-[#4b5563] mt-1">{subtitle}</p>
      </div>
      
      <div className="p-5">
        {/* Next Task */}
        {nextTask && (
          <div className="bg-[#FFD100] bg-opacity-20 p-3 rounded-lg mb-4">
            <p className="font-bold text-gray-900">{nextTask.title}</p>
            {nextTask.description && (
              <p className="text-sm text-gray-700">{nextTask.description}</p>
            )}
          </div>
        )}
        
        {/* Treatment Details */}
        {details.length > 0 && (
          <div className="space-y-3 mb-4">
            {details.map((detail, index) => (
              <div key={index} className="flex">
                <span className="font-semibold text-sm w-24">{detail.label}:</span>
                <span className="text-sm">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Divider before actions */}
        {(primaryAction || secondaryAction || resourceLinks.length > 0) && (
          <div className="border-t border-gray-200 my-4"></div>
        )}
        
        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex space-x-4 mb-4">
            {primaryAction && (
              <button 
                className={`${styles.buttonBg} text-white px-4 py-2 rounded-full text-sm font-medium flex-1`}
                onClick={primaryAction.onClick}
              >
                {primaryAction.text}
              </button>
            )}
            
            {secondaryAction && (
              <button 
                className="border border-gray-300 px-4 py-2 rounded-full text-sm font-medium flex-1"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.text}
              </button>
            )}
          </div>
        )}
        
        {/* Resource Links */}
        {resourceLinks.length > 0 && (
          <div className="space-y-3">
            {resourceLinks.map((link, index) => (
              <button 
                key={index}
                className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 text-left min-h-[44px]"
                onClick={link.onClick}
              >
                <div className="flex items-center">
                  {link.icon && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {link.icon}
                    </div>
                  )}
                  <span className="font-medium">{link.text}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TreatmentCard.propTypes = {
  type: PropTypes.oneOf(['weight', 'hair']),
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  status: PropTypes.string,
  nextTask: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string
  }),
  details: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ),
  primaryAction: PropTypes.shape({
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }),
  secondaryAction: PropTypes.shape({
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }),
  resourceLinks: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired
    })
  )
};

export default TreatmentCard;
