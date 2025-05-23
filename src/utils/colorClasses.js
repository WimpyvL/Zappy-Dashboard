/**
 * Consistent color system using Zappy colors
 * This utility provides standardized color classes for use throughout the application
 */
export const colorClasses = {
  primary: {
    bg: 'bg-primary',
    text: 'text-primary',
    border: 'border-primary',
    hover: 'hover:bg-primary/90',
    light: 'bg-primary/10',
  },
  accent1: {
    bg: 'bg-accent1',
    text: 'text-accent1',
    border: 'border-accent1',
    hover: 'hover:bg-accent1/90',
    light: 'bg-accent1/10',
  },
  accent2: {
    bg: 'bg-accent2',
    text: 'text-accent2',
    border: 'border-accent2',
    hover: 'hover:bg-accent2/90',
    light: 'bg-accent2/10',
  },
  accent3: {
    bg: 'bg-accent3',
    text: 'text-accent3',
    border: 'border-accent3',
    hover: 'hover:bg-accent3/90',
    light: 'bg-accent3/10',
  },
  // Status colors
  success: {
    bg: 'bg-accent2',
    text: 'text-accent2',
    light: 'bg-accent2/10',
  },
  warning: {
    bg: 'bg-accent4',
    text: 'text-accent4',
    light: 'bg-accent4/10',
  },
  error: {
    bg: 'bg-accent1',
    text: 'text-accent1',
    light: 'bg-accent1/10',
  },
};

/**
 * Get color classes for a specific variant
 * @param {string} color - The color name (primary, accent1, etc.)
 * @param {string} variant - The variant (default, light, outlined, etc.)
 * @returns {string} - The CSS classes for the specified color and variant
 */
export const getColorClasses = (color = 'primary', variant = 'default') => {
  const colorSet = colorClasses[color] || colorClasses.primary;
  
  switch (variant) {
    case 'light':
      return `${colorSet.light} ${colorSet.text}`;
    case 'outlined':
      return `bg-transparent ${colorSet.border} ${colorSet.text}`;
    case 'text':
      return `bg-transparent ${colorSet.text}`;
    default:
      return `${colorSet.bg} text-white`;
  }
};

/**
 * Get status color classes
 * @param {string} status - The status (success, warning, error)
 * @param {string} variant - The variant (default, light, outlined, etc.)
 * @returns {string} - The CSS classes for the specified status and variant
 */
export const getStatusColorClasses = (status, variant = 'default') => {
  return getColorClasses(status, variant);
};

export default {
  colorClasses,
  getColorClasses,
  getStatusColorClasses
};
