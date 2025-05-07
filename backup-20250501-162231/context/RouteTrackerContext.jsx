import React, { createContext, useContext } from 'react';
import useRouteTracker from '../hooks/useRouteTracker';

// Create context
const RouteTrackerContext = createContext(null);

/**
 * Provider component that makes route tracking available to the entire app
 */
export const RouteTrackerProvider = ({ children, options = {} }) => {
  const routeTrackerData = useRouteTracker(options);
  
  return (
    <RouteTrackerContext.Provider value={routeTrackerData}>
      {children}
    </RouteTrackerContext.Provider>
  );
};

/**
 * Custom hook to use the route tracker context
 */
export const useRouteTrackerContext = () => {
  const context = useContext(RouteTrackerContext);
  if (context === undefined) {
    throw new Error('useRouteTrackerContext must be used within a RouteTrackerProvider');
  }
  return context;
};