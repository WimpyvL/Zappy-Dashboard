import React from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable empty state component that provides a consistent way to display
 * empty states throughout the application.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon or illustration to display
 * @param {string} props.imageSrc - Optional image source for illustration
 * @param {string} props.imageAlt - Alt text for the image
 * @param {string} props.title - Main title text
 * @param {string} props.message - Descriptive message
 * @param {React.ReactNode} props.action - Primary action button or link
 * @param {React.ReactNode} props.secondaryAction - Optional secondary action
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} The EmptyState component
 */
const EmptyState = ({
  icon,
  imageSrc,
  imageAlt = "No data available",
  title,
  message,
  action,
  secondaryAction,
  className = "",
}) => {
  return (
    <div className={`py-8 px-4 text-center bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}>
      {/* Icon or Image */}
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={imageAlt} 
          className="w-32 h-32 mx-auto mb-4 animate-float" 
        />
      ) : icon ? (
        <div className="mx-auto mb-4 text-gray-300 w-16 h-16 flex items-center justify-center">
          {React.cloneElement(icon, { className: "w-16 h-16" })}
        </div>
      ) : null}
      
      {/* Title */}
      {title && (
        <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      )}
      
      {/* Message */}
      {message && (
        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">{message}</p>
      )}
      
      {/* Primary Action */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
      
      {/* Secondary Action */}
      {secondaryAction && (
        <div className="mt-2">
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.element,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.node,
  secondaryAction: PropTypes.node,
  className: PropTypes.string,
};

export default EmptyState;