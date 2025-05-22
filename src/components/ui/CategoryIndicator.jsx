import React from 'react';
import PropTypes from 'prop-types';
import './CategoryIndicator.css';

/**
 * CategoryIndicator Component
 * 
 * A simple colored dot indicator for different categories.
 * 
 * @param {Object} props
 * @param {string} props.category - The category to display (weight-management, ed, hair-loss, etc.)
 * @param {string} props.label - Optional label to display next to the indicator
 * @param {string} props.className - Additional CSS classes
 */
const CategoryIndicator = ({
  category = 'default',
  label = null,
  className = '',
}) => {
  // Normalize category to kebab-case
  const normalizedCategory = category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // If no label, just return the indicator
  if (!label) {
    return (
      <span 
        className={`category-indicator ${normalizedCategory} ${className}`}
        aria-label={`${category} category`}
      />
    );
  }
  
  // Return indicator with label
  return (
    <div className={`category-with-label ${className}`}>
      <span 
        className={`category-indicator ${normalizedCategory}`}
        aria-hidden="true"
      />
      <span className="category-label">{label}</span>
    </div>
  );
};

CategoryIndicator.propTypes = {
  category: PropTypes.string.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default CategoryIndicator;
