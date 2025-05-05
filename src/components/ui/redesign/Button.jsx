import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button component
 * 
 * A standardized button component with various variants, sizes, and states
 * 
 * @param {object} props
 * @param {node} props.children - Button content
 * @param {string} props.variant - Button style variant
 * @param {string} props.size - Button size
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {node} props.icon - Icon to display in button
 * @param {string} props.iconPosition - Position of icon (left or right)
 * @param {function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether button is disabled
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  disabled = false,
  ...props 
}) => {
  // Define variant styles
  const variants = {
    primary: 'bg-zappy-blue text-white hover:bg-opacity-90',
    secondary: 'border border-border-gray text-text-medium hover:bg-gray-50',
    success: 'bg-success text-white hover:bg-opacity-90',
    warning: 'bg-warning text-white hover:bg-opacity-90',
    danger: 'bg-error text-white hover:bg-opacity-90',
    ghost: 'bg-transparent text-text-medium hover:bg-gray-50',
  };
  
  // Define size styles
  const sizes = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };
  
  // Base classes for all buttons
  const baseClasses = 'rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zappy-blue';
  
  // Get the appropriate variant and size classes
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.medium;
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${className} flex items-center justify-center`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
