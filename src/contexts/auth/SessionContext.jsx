/**
 * @fileoverview Session management context providing session validation and monitoring.
 * This context handles session validation, expiration, and periodic checks to ensure
 * the user's authentication state remains valid.
 */
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';

/**
 * @typedef {Object} SessionContextType
 * @property {boolean} sessionValid - Whether the current session is valid
 * @property {boolean} sessionLoading - Whether session validation is in progress
 * @property {string|null} sessionError - Current session error message or null
 * @property {Function} validateSession - Function to manually validate the current session
 * @property {Function} clearSessionError - Function to clear current session error
 */

/** @type {React.Context<SessionContextType>} */
const SessionContext = createContext();

/**
 * Validates the current user session with the server
 * 
 * @returns {Promise<{isValid: boolean, user: Object|null}>} Session validation result
 */
const validateSessionWithServer = async () => {
  try {
    // This uses Supabase's built-in session validation
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Session validation error:', error.message);
      return { isValid: false, user: null };
    }
    
    return { isValid: !!data.user, user: data.user };
  } catch (error) {
    console.error('Session validation exception:', error.message);
    return { isValid: false, user: null };
  }
};

/**
 * Provider component for session management functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} SessionContext Provider
 */
export const SessionProvider = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [sessionValid, setSessionValid] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  
  // Use refs to track the visibility state and validation interval
  const documentVisibilityRef = useRef(document.visibilityState);
  const validationIntervalRef = useRef(null);

  /**
   * Validate the current session
   * 
   * @returns {Promise<{isValid: boolean, user: Object|null}>} Session validation result
   */
  const validateSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError(null);
    
    try {
      const result = await validateSessionWithServer();
      setSessionValid(result.isValid);
      return result;
    } catch (error) {
      console.error('Session validation error:', error.message);
      setSessionError(error.message || 'Failed to validate session');
      setSessionValid(false);
      return { isValid: false, user: null };
    } finally {
      setSessionLoading(false);
    }
  }, []);

  /**
   * Clear current session error
   */
  const clearSessionError = useCallback(() => {
    setSessionError(null);
  }, []);

  // Effect to validate session when user changes
  useEffect(() => {
    if (currentUser) {
      validateSession();
    } else {
      setSessionValid(false);
    }
  }, [currentUser, validateSession]);

  // Effect to set up visibility change listener and periodic validation
  useEffect(() => {
    // Handle visibility change to validate session when tab becomes visible again
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      const wasHidden = documentVisibilityRef.current === 'hidden';
      
      documentVisibilityRef.current = document.visibilityState;
      
      // If the page is becoming visible again and we have a user
      if (isVisible && wasHidden && currentUser) {
        console.log('Tab became visible again, checking session...');
        validateSession().then(({ isValid }) => {
          if (!isValid) {
            console.warn('Session expired while away, logging out');
            logout();
          }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up periodic validation interval (only if not already set)
    if (!validationIntervalRef.current && currentUser) {
      validationIntervalRef.current = setInterval(async () => {
        // Only check if we have a user and the tab is visible
        if (currentUser && document.visibilityState === 'visible') {
          console.log('Performing periodic session validation');
          const { isValid } = await validateSession();
          if (!isValid && sessionValid) {
            console.warn('Session has expired, logging out');
            logout();
          }
        }
      }, 3 * 60 * 1000); // Every 3 minutes (reduced from 10 minutes)
    }

    // Cleanup subscription, interval, and event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
    };
  }, [currentUser, logout, sessionValid, validateSession]);

  /** @type {SessionContextType} */
  const value = {
    sessionValid,
    sessionLoading,
    sessionError: sessionError
      ? typeof sessionError === 'string'
        ? sessionError
        : sessionError.message || 'An error occurred'
      : null,
    validateSession,
    clearSessionError,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * Custom hook to use the session context
 * 
 * @returns {SessionContextType} Session context value
 */
export const useSession = () => useContext(SessionContext);