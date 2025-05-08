/**
 * Color Utility Functions
 * 
 * Utility functions for working with colors in the application
 */

/**
 * Convert a hex color to RGB format
 * @param {string} hex - Hex color code (e.g., "#2D7FF9")
 * @returns {string} RGB values as "r, g, b" string
 */
export const hexToRgb = (hex) => {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Parse hex values
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  
  // Return as comma-separated string
  return `${r}, ${g}, ${b}`;
};

/**
 * Get a color with specified opacity
 * @param {string} colorName - Color name from theme (e.g., "zappy-blue")
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} CSS rgba color string
 */
export const getColorWithOpacity = (colorName, opacity) => {
  // Theme colors mapping
  const colors = {
    'zappy-blue': '#2D7FF9',
    'zappy-yellow': '#FFD100',
    'success': '#10B981',
    'warning': '#F59E0B',
    'error': '#EF4444',
    'info': '#2D7FF9',
    'weight-blue': '#DBEAFE',
    'hair-purple': '#EDE9FE',
    'wellness-green': '#D1FAE5',
    'sexual-health-pink': '#FEE2E2',
    'text-dark': '#111827',
    'text-medium': '#6B7280',
    'text-light': '#9CA3AF',
    'border-gray': '#E5E7EB',
    'bg-gray': '#F9FAFB',
    'card-white': '#FFFFFF',
  };
  
  // Get the hex color or default to black
  const hexColor = colors[colorName] || '#000000';
  
  // Convert to RGB and return with opacity
  return `rgba(${hexToRgb(hexColor)}, ${opacity})`;
};

/**
 * Get a CSS variable reference for a theme color
 * @param {string} colorName - Color name from theme
 * @returns {string} CSS variable reference
 */
export const getCssVariable = (colorName) => {
  return `var(--color-${colorName})`;
};

/**
 * Lighten a color by mixing it with white
 * @param {string} hex - Hex color code
 * @param {number} amount - Amount to lighten (0-1)
 * @returns {string} Lightened hex color
 */
export const lightenColor = (hex, amount) => {
  const rgb = hexToRgb(hex).split(', ').map(Number);
  const white = [255, 255, 255];
  
  // Mix with white
  const result = rgb.map((channel, i) => {
    return Math.round(channel + (white[i] - channel) * amount);
  });
  
  // Convert back to hex
  return `#${result.map(c => c.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Darken a color by mixing it with black
 * @param {string} hex - Hex color code
 * @param {number} amount - Amount to darken (0-1)
 * @returns {string} Darkened hex color
 */
export const darkenColor = (hex, amount) => {
  const rgb = hexToRgb(hex).split(', ').map(Number);
  const black = [0, 0, 0];
  
  // Mix with black
  const result = rgb.map((channel, i) => {
    return Math.round(channel + (black[i] - channel) * amount);
  });
  
  // Convert back to hex
  return `#${result.map(c => c.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Check if a color is light or dark
 * @param {string} hex - Hex color code
 * @returns {boolean} True if color is light, false if dark
 */
export const isLightColor = (hex) => {
  const rgb = hexToRgb(hex).split(', ').map(Number);
  
  // Calculate luminance using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  
  // Return true if luminance is greater than 0.5 (light color)
  return luminance > 0.5;
};

/**
 * Get appropriate text color (black or white) for a background color
 * @param {string} bgHex - Background hex color code
 * @returns {string} Text color (black or white)
 */
export const getContrastTextColor = (bgHex) => {
  return isLightColor(bgHex) ? '#111827' : '#FFFFFF';
};

export default {
  hexToRgb,
  getColorWithOpacity,
  getCssVariable,
  lightenColor,
  darkenColor,
  isLightColor,
  getContrastTextColor
};
