import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook to track and log route changes
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether route tracking is enabled
 * @param {boolean} options.logPrevious - Whether to log previous route
 * @param {boolean} options.logNavigationType - Whether to log navigation type (POP, PUSH, REPLACE)
 * @param {Function} options.onRouteChange - Callback function when route changes
 * @returns {Object} - Current location information
 */
const useRouteTracker = (options = {}) => {
  const {
    enabled = true,
    logPrevious = true,
    logNavigationType = true,
    onRouteChange = null,
  } = options;
  
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocationRef = useRef(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Get state from location
    const { pathname, search, hash, state } = location;
    const fullPath = `${pathname}${search}${hash}`;
    const navigationType = state?.navigationType || 'UNKNOWN';
    
    // Format route change message
    let logMessage = `🔄 ROUTE CHANGED TO: ${fullPath}`;
    
    // Optional logging for previous route
    if (logPrevious && previousLocationRef.current) {
      const prevFullPath = `${previousLocationRef.current.pathname}${previousLocationRef.current.search}${previousLocationRef.current.hash}`;
      logMessage += `\n📍 FROM: ${prevFullPath}`;
    }
    
    // Optional logging for navigation type
    if (logNavigationType) {
      logMessage += `\n📋 TYPE: ${navigationType}`;
    }
    
    // Additional state info if present
    if (state && Object.keys(state).length > 0) {
      // Filter out navigationType from logged state
      const { navigationType: _, ...restState } = state;
      if (Object.keys(restState).length > 0) {
        logMessage += `\n🔍 STATE: ${JSON.stringify(restState)}`;
      }
    }
    
    // Add separator for readability
    logMessage += '\n' + '='.repeat(50);
    
    // Log to console
    console.log(logMessage);
    
    // Call callback if provided
    if (onRouteChange && typeof onRouteChange === 'function') {
      onRouteChange({
        current: location,
        previous: previousLocationRef.current,
        navigationType
      });
    }
    
    // Update previous location ref
    previousLocationRef.current = location;
  }, [location, enabled, logPrevious, logNavigationType, onRouteChange]);

  // Enhanced navigate function that includes navigation type
  const navigateWithTracking = (to, options = {}) => {
    const enhancedOptions = {
      ...options,
      state: {
        ...(options.state || {}),
        navigationType: options.replace ? 'REPLACE' : 'PUSH',
      },
    };
    
    navigate(to, enhancedOptions);
  };

  return {
    location,
    navigateWithTracking,
    previousLocation: previousLocationRef.current,
  };
};

export default useRouteTracker;