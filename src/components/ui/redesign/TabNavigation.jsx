import React from 'react';
import PropTypes from 'prop-types';

/**
 * TabNavigation component
 * 
 * A component for within-page tab navigation
 * 
 * @param {array} tabs - Array of tab objects with id, label, and optional icon
 * @param {string} activeTab - The ID of the currently active tab
 * @param {function} onTabChange - Function to call when a tab is clicked
 * @param {string} variant - The style variant ('underline' or 'pills')
 */
const TabNavigation = ({ tabs, activeTab, onTabChange, variant = 'underline' }) => {
  // Define variant styles
  const variants = {
    underline: {
      container: 'border-b border-gray-200',
      tab: 'flex-1 py-4 text-center font-medium',
      active: 'text-[#2D7FF9] border-b-2 border-[#2D7FF9]',
      inactive: 'text-gray-500 hover:text-gray-700'
    },
    pills: {
      container: 'flex space-x-2 py-2 overflow-x-auto scrollbar-hide',
      tab: 'whitespace-nowrap px-4 py-2 rounded-full text-center font-medium',
      active: 'bg-[#2D7FF9] text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  };
  
  // Get the appropriate styles for this variant
  const styles = variants[variant] || variants.underline;
  
  return (
    <div className={styles.container}>
      <div className="flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id
                ? styles.active
                : styles.inactive
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && (
              <span className="inline-block mr-2">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['underline', 'pills'])
};

export default TabNavigation;
