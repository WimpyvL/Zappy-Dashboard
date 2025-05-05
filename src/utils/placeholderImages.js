/**
 * Placeholder Images Utility
 * 
 * This utility provides placeholder image URLs for different categories
 * of products and treatments, similar to the Hims website aesthetic.
 */

// Base colors from our theme
const COLORS = {
  weightBlue: '#DBEAFE',
  hairPurple: '#EDE9FE',
  wellnessGreen: '#D1FAE5',
  sexualHealthPink: '#FEE2E2',
  zappyBlue: '#2D7FF9',
  zappyYellow: '#FFD100',
};

/**
 * Generate a placeholder image URL with specified parameters
 * @param {string} bgColor - Background color in hex
 * @param {string} fgColor - Foreground color in hex
 * @param {number} width - Width of the image
 * @param {number} height - Height of the image
 * @param {string} text - Optional text to display on the image
 * @returns {string} - URL for the placeholder image
 */
const generatePlaceholderUrl = (bgColor, fgColor, width, height, text = '') => {
  // Remove # from hex colors
  const bg = bgColor.replace('#', '');
  const fg = fgColor.replace('#', '');
  
  // Base URL for placeholder service
  const baseUrl = 'https://via.placeholder.com';
  
  // Construct the URL with parameters
  let url = `${baseUrl}/${width}x${height}/${bg}/${fg}`;
  
  // Add text if provided
  if (text) {
    url += `?text=${encodeURIComponent(text)}`;
  }
  
  return url;
};

/**
 * Get a placeholder image for weight management products
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @returns {string} - URL for the placeholder image
 */
export const getWeightManagementImage = (width = 300, height = 300) => {
  return generatePlaceholderUrl(
    COLORS.weightBlue, 
    COLORS.zappyBlue, 
    width, 
    height, 
    'Weight Management'
  );
};

/**
 * Get a placeholder image for hair treatment products
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @returns {string} - URL for the placeholder image
 */
export const getHairTreatmentImage = (width = 300, height = 300) => {
  return generatePlaceholderUrl(
    COLORS.hairPurple, 
    COLORS.zappyBlue, 
    width, 
    height, 
    'Hair Treatment'
  );
};

/**
 * Get a placeholder image for wellness products
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @returns {string} - URL for the placeholder image
 */
export const getWellnessImage = (width = 300, height = 300) => {
  return generatePlaceholderUrl(
    COLORS.wellnessGreen, 
    COLORS.zappyBlue, 
    width, 
    height, 
    'Wellness'
  );
};

/**
 * Get a placeholder image for sexual health products
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @returns {string} - URL for the placeholder image
 */
export const getSexualHealthImage = (width = 300, height = 300) => {
  return generatePlaceholderUrl(
    COLORS.sexualHealthPink, 
    COLORS.zappyBlue, 
    width, 
    height, 
    'Sexual Health'
  );
};

/**
 * Get a placeholder image for a generic product
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @param {string} category - Category name to display (default: 'Product')
 * @returns {string} - URL for the placeholder image
 */
export const getProductImage = (width = 300, height = 300, category = 'Product') => {
  return generatePlaceholderUrl(
    '#FFFFFF', 
    COLORS.zappyBlue, 
    width, 
    height, 
    category
  );
};

/**
 * Get a placeholder image for a person/avatar
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @returns {string} - URL for the placeholder image
 */
export const getPersonImage = (width = 300, height = 300) => {
  return `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
};

/**
 * Get a placeholder image for a doctor/provider
 * @param {number} width - Width of the image (default: 300)
 * @param {number} height - Height of the image (default: 300)
 * @returns {string} - URL for the placeholder image
 */
export const getDoctorImage = (width = 300, height = 300) => {
  // Use professional looking portraits for doctors
  return `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 20) + 30}.jpg`;
};

// Export a default object with all image getters
export default {
  getWeightManagementImage,
  getHairTreatmentImage,
  getWellnessImage,
  getSexualHealthImage,
  getProductImage,
  getPersonImage,
  getDoctorImage,
};
