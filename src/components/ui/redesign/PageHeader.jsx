import React from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';

/**
 * PageHeader component
 * 
 * A standardized header component for pages with consistent styling
 * 
 * @param {object} props
 * @param {string} props.title - The page title
 * @param {string} props.subtitle - Optional subtitle text
 * @param {node} props.rightContent - Optional content to display on the right side
 * @param {boolean} props.showUserIcon - Whether to show the user icon
 * @param {function} props.onUserIconClick - Function to call when user icon is clicked
 * @param {string} props.subtitleColor - Color class for the subtitle text
 * @param {string} props.className - Additional CSS classes
 */
const PageHeader = ({ 
  title, 
  subtitle,
  rightContent,
  showUserIcon = true,
  onUserIconClick,
  subtitleColor = 'text-zappy-blue',
  className = '',
}) => {
  return (
    <header className={`bg-white px-5 py-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text-dark">{title}</h2>
          {subtitle && (
            <p className={`text-sm font-semibold ${subtitleColor}`}>{subtitle}</p>
          )}
        </div>
        {rightContent ? (
          rightContent
        ) : showUserIcon ? (
          <div 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
            onClick={onUserIconClick}
            role="button"
            aria-label="User profile"
            tabIndex={0}
          >
            <User className="h-4 w-4 text-gray-500" />
          </div>
        ) : null}
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  rightContent: PropTypes.node,
  showUserIcon: PropTypes.bool,
  onUserIconClick: PropTypes.func,
  subtitleColor: PropTypes.string,
  className: PropTypes.string,
};

export default PageHeader;
