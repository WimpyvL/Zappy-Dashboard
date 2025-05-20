/**
 * @fileoverview Core authentication context providing login, logout, and registration functionality.
 * This context handles the basic authentication operations but delegates session management
 * and user profile data to separate contexts.
 */
import React, { createContext, useState, useContext, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';

/**
 * @typedef {Object} AuthContextType
 * @property {Object|null} currentUser - The current authenticated user object or null if not authenticated
 * @property {boolean} isAuthenticated - Whether a user is currently authenticated
 * @property {boolean} authLoading - Whether authentication operations are in progress
 * @property {string|null} error - Current authentication error message or null
 * @property {Function} login - Function to log in a user with email and password
 * @property {Function} logout - Function to log out the current user
 * @property {Function} register - Function to register a new user
 * @property {Function} forgotPassword - Function to initiate password reset
 * @property {Function} updatePassword - Function to update password after reset
 * @property {Function} resendVerificationEmail - Function to resend verification email
 * @property {Function} clearError - Function to clear current error
 */

/** @type {React.Context<AuthContextType>} */
const AuthContext = createContext();

/**
 * Provider component for authentication functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} AuthContext Provider
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Log in a user with email and password
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>} Result object
   */
  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (loginError.message && loginError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. Please check your inbox or resend the verification email.');
        } else {
          setError(loginError.message || 'Failed to log in.');
        }
        return { success: false, error: loginError.message };
      }

      console.log('Login successful:', data.user);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Failed to log in.');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Log out the current user
   * 
   * @returns {Promise<{success: boolean, error?: string}>} Result object
   */
  const logout = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      setCurrentUser(null);
      console.log('Logout successful');
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err.message);
      setError(err.message || 'Failed to log out.');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Register a new user
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {Object} options - Additional registration options
   * @returns {Promise<{success: boolean, user?: Object, session?: Object, error?: string}>} Result object
   */
  const register = useCallback(async (email, password, options = {}) => {
    setAuthLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: options,
      });

      if (signUpError) throw signUpError;

      console.log('Registration successful:', data.user);
      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Using a notification system instead of alert
        return { 
          success: true, 
          user: data.user, 
          session: data.session,
          message: 'Registration successful! Please check your email to confirm your account.'
        };
      }
      
      setCurrentUser(data.user);
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.error('Registration error:', err.message);
      setError(err.message || 'Failed to register.');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Initiate password reset for a user
   * 
   * @param {string} email - User's email
   * @returns {Promise<{success: boolean, error?: string, message?: string}>} Result object
   */
  const forgotPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          // Optional: redirectTo URL for the password reset link
          // redirectTo: 'http://localhost:3000/update-password',
        }
      );

      if (resetError) throw resetError;

      console.log('Password reset email sent successfully.');
      return { 
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (err) {
      console.error('Forgot password error:', err.message);
      setError(err.message || 'Failed to send password reset email.');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Update password after reset
   * 
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, error?: string, message?: string}>} Result object
   */
  const updatePassword = useCallback(async (newPassword) => {
    setAuthLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      const { error: updatePassError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updatePassError) throw updatePassError;
      
      console.log('Password updated via reset link.');
      return { 
        success: true,
        message: 'Password successfully reset.'
      };
    } catch (err) {
      console.error('Update password error:', err.message);
      setError(err.message || 'Failed to update password.');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Resend verification email
   * 
   * @param {string} email - User's email
   * @returns {Promise<{success: boolean, error?: string}>} Result object
   */
  const resendVerificationEmail = useCallback(async (email) => {
    setAuthLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }
      // This will send a new confirmation email if the user is unconfirmed
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      return { 
        success: true,
        message: 'Verification email sent. Please check your inbox.'
      };
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /** @type {AuthContextType} */
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    authLoading,
    error: error
      ? typeof error === 'string'
        ? error
        : error.message || 'An error occurred'
      : null,
    login,
    logout,
    register,
    forgotPassword,
    updatePassword,
    resendVerificationEmail,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 * 
 * @returns {AuthContextType} Auth context value
 */
export const useAuth = () => useContext(AuthContext);
