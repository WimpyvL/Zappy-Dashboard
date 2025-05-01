/**
 * Utility functions for formatting data across the application
 */

/**
 * Format a phone number as (XXX) XXX-XXXX
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number or original string if invalid
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the input is valid
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not a 10-digit number
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

/**
 * Format a date string in the desired format
 * @param {string|Date} date - The date to format
 * @param {string} format - The format to use ('short', 'long', 'full')
 * @returns {string} - The formatted date or empty string if invalid
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return ''; // Invalid date
    }
    
    // Different format options
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'long':
        return dateObj.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'full':
        return dateObj.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      default:
        return dateObj.toLocaleDateString();
    }
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

/**
 * Format a currency value as USD
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Truncate a string if it exceeds a certain length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated string with ellipsis
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str || '';
  return `${str.slice(0, maxLength)}...`;
};