import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Follows the design system from the mockup.
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style variant (primary, secondary, accent, blue, green, danger, link)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {React.ReactNode} props.icon - Optional icon to display before the button text
 * @param {boolean} props.iconRight - Whether to display the icon on the right side
 * @param {boolean} props.iconOnly - Whether the button only contains an icon
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.type - Button type attribute
 * @param {Function} props.onClick - Click handler
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon = null,
  iconRight = false,
  iconOnly = false,
  className = '',
  children,
  type = 'button',
  onClick,
  ...rest
}) => {
  // Validate variant
  const validVariants = ['primary', 'secondary', 'accent', 'blue', 'green', 'danger', 'link'];
  const buttonVariant = validVariants.includes(variant) ? variant : 'primary';
  
  // Validate size
  const validSizes = ['sm', 'md', 'lg'];
  const buttonSize = validSizes.includes(size) ? size : 'md';
  
  // Build class names
  const classes = [
    'btn',
    `btn-${buttonVariant}`,
    buttonSize === 'sm' ? 'btn-sm' : '',
    buttonSize === 'lg' ? 'btn-lg' : '',
    iconOnly ? 'btn-icon' : '',
    iconRight && !iconOnly ? 'icon-right' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon && !iconRight && <span className="icon">{icon}</span>}
      {!iconOnly && children}
      {icon && iconRight && <span className="icon">{icon}</span>}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'blue', 'green', 'danger', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconRight: PropTypes.bool,
  iconOnly: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  type: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;
