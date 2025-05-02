import { useState, useCallback } from 'react';

/**
 * A custom hook for displaying toast notifications
 * @returns {Object} Object containing showToast function and toast state
 */
export const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  /**
   * Show a toast notification
   * @param {string} type - The type of toast (success, error, info, warning)
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the toast in milliseconds
   */
  const showToast = useCallback((type, message, duration = 3000) => {
    setToast({ visible: true, message, type });
    
    // Auto-hide the toast after duration
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  /**
   * Hide the toast notification
   */
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
};

export default useToast;
