import React from 'react';
import PropTypes from 'prop-types';

/**
 * Container component
 * 
 * A responsive container component that centers content and applies consistent padding
 * 
 * @param {object} props
 * @param {node} props.children - Container content
 * @param {string} props.maxWidth - Maximum width of the container
 * @param {boolean} props.padding - Whether to apply padding
 * @param {string} props.className - Additional CSS classes
 */
const Container = ({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  className = ''
}) => {
  // Define max width classes
  const maxWidthClasses = {
    sm: 'max-w-screen-sm', // 640px
    md: 'max-w-screen-md', // 768px
    lg: 'max-w-screen-lg', // 1024px
    xl: 'max-w-screen-xl', // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    full: 'max-w-full'
  };
  
  // Define padding classes based on screen size
  const paddingClass = padding ? 'px-4 sm:px-6 md:px-8' : '';
  
  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth] || 'max-w-screen-xl'} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  padding: PropTypes.bool,
  className: PropTypes.string
};

export default Container;
