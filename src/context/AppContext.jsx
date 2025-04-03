import React, { createContext, useContext } from 'react';
// Removed useState, useEffect, apiService imports as they are no longer needed here

// Create context
const AppContext = createContext();

// AppProvider now primarily serves as a placeholder or for potential future *client-side* global state.
// All server state (patients, orders, products, etc.), loading/error states,
// and data fetching/mutation logic should be handled by React Query hooks (e.g., usePatients, useCreateOrder)
// imported directly into the components that need them.
export const AppProvider = ({ children }) => {
  // --- Potentially Add Client-Side Global State Here ---
  // Example: const [uiTheme, setUiTheme] = useState('light');

  // The value provided by the context is now minimal or empty.
  // Components should rely on specific React Query hooks for data.
  const contextValue = {
    // Example: uiTheme, setUiTheme
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  // The check remains useful if the context is expected to exist, even if empty.
  if (context === undefined) {
    // Changed error check to undefined, as an empty object is a valid context value
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
