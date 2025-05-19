/**
 * Date utility functions for the application
 */

/**
 * Calculates a follow-up date based on the specified period
 * @param {string} period - The follow-up period (e.g., '2w', '4w', '6w', 'custom')
 * @param {Date} [baseDate=new Date()] - The base date to calculate from (defaults to current date)
 * @returns {Date} The calculated follow-up date
 */
export const calculateFollowUpDate = (period, baseDate = new Date()) => {
  const result = new Date(baseDate);
  
  switch (period) {
    case '2w':
      result.setDate(result.getDate() + 14); // 2 weeks
      break;
    case '4w':
      result.setDate(result.getDate() + 28); // 4 weeks
      break;
    case '6w':
      result.setDate(result.getDate() + 42); // 6 weeks
      break;
    case '1m':
      result.setMonth(result.getMonth() + 1); // 1 month
      break;
    case '3m':
      result.setMonth(result.getMonth() + 3); // 3 months
      break;
    case '6m':
      result.setMonth(result.getMonth() + 6); // 6 months
      break;
    case 'custom':
      // For custom, we don't modify the date - it should be provided separately
      break;
    default:
      // Default to 2 weeks if period is not recognized
      result.setDate(result.getDate() + 14);
  }
  
  return result;
};

/**
 * Formats a date as a string in the format "YYYY-MM-DD"
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDateYYYYMMDD = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Formats a date as a string in the format "MM/DD/YYYY"
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDateMMDDYYYY = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Formats a date as a string in the format "Month DD, YYYY"
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDateLong = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a date and time as a string in the format "Month DD, YYYY at HH:MM AM/PM"
 * @param {Date} date - The date to format
 * @returns {string} The formatted date and time string
 */
export const formatDateTimeLong = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Calculates the difference in days between two dates
 * @param {Date} date1 - The first date
 * @param {Date} date2 - The second date
 * @returns {number} The difference in days
 */
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
  return diffDays;
};

/**
 * Checks if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in the past, false otherwise
 */
export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Checks if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today, false otherwise
 */
export const isDateToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Returns a human-readable string describing when a date is (e.g., "Today", "Tomorrow", "In 3 days", "2 days ago")
 * @param {Date} date - The date to describe
 * @returns {string} A human-readable string describing the date
 */
export const getRelativeDateString = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  if (dateToCheck.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateToCheck.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (dateToCheck.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (dateToCheck > today) {
    const days = daysBetween(dateToCheck, today);
    return `In ${days} day${days !== 1 ? 's' : ''}`;
  } else {
    const days = daysBetween(dateToCheck, today);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};
