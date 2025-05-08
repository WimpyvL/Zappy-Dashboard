import React from 'react';
import PropTypes from 'prop-types';

/**
 * Grid component
 * 
 * A responsive grid component that adapts to different screen sizes
 * 
 * @param {object} props
 * @param {node} props.children - Grid content
 * @param {object} props.columns - Number of columns at different breakpoints
 * @param {number} props.gap - Gap size between grid items
 * @param {string} props.className - Additional CSS classes
 */
const Grid = ({ 
  children, 
  columns = { 
    xs: 1,  // Extra small devices (phones)
    sm: 2,  // Small devices (tablets)
    md: 3,  // Medium devices (desktops)
    lg: 4   // Large devices (large desktops)
  },
  gap = 4,
  className = ''
}) => {
  // Generate column classes based on breakpoints
  const getColumnsClass = () => {
    const classes = [];
    
    if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
    
    return classes.join(' ');
  };
  
  // Generate gap class
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;
  
  return (
    <div className={`grid ${getColumnsClass()} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
    '2xl': PropTypes.number
  }),
  gap: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  className: PropTypes.string
};

export default Grid;
