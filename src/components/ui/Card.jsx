import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

/**
 * Card Component
 * 
 * A versatile card component with hover effects and optional accent borders.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display inside the card
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.accentColor - Optional top border color (primary, accent1, accent2, accent3, accent4, etc.)
 * @param {boolean} props.hover - Whether to apply hover effects (shadow and slight elevation)
 * @param {function} props.onClick - Optional click handler
 * @param {string} props.title - Optional card title
 * @param {React.ReactNode} props.action - Optional action element (button, link, etc.) to display in the header
 * @param {boolean} props.footer - Whether to display a footer section
 * @param {React.ReactNode} props.footerContent - Content to display in the footer
 */
const Card = ({
  children,
  className = '',
  accentColor = '',
  hover = true,
  onClick = null,
  title = null,
  action = null,
  footer = false,
  footerContent = null,
}) => {
  // Determine if we need a header
  const hasHeader = title || action;
  
  // Build class names
  const cardClasses = [
    'card',
    hover ? 'card-hover' : '',
    accentColor ? `card-${accentColor}` : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {hasHeader && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footerContent}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  accentColor: PropTypes.string,
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.node,
  action: PropTypes.node,
  footer: PropTypes.bool,
  footerContent: PropTypes.node,
};

export default Card;
