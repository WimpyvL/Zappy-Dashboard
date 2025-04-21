// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react'; // Removed unused useEffect
import apiService from '../utils/apiService';
import errorHandling from '../utils/errorHandling';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // Initialize loading to false, as we are not checking localStorage anymore
  // Auth status will be determined by API calls or login actions.
  const [loading, setLoading] = useState(false);
  // isAuthenticated is now derived directly from currentUser state (Removed unused variable declaration)
  // const isAuthenticated = !!currentUser;
  const [error, setError] = useState(null);

  // Removed useEffect checking localStorage on initial load.
  // Authentication state will be established via login or API calls
  // triggering the interceptor (which uses refreshToken from localStorage).

  // Function to set user data (e.g., after login or profile fetch)
  // This should also handle storing the refreshToken if applicable
  const setUser = (userData, refreshToken) => {
    // console.log('AuthContext: Setting user data', userData); // Removed log
    setCurrentUser(userData);
    // Store refreshToken securely (localStorage is used here based on existing interceptor)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      // If no refresh token provided (e.g., profile update), don't clear existing one
      // localStorage.removeItem('refreshToken'); // Decide if this should be cleared
    }
    // Removed setting localStorage for token, user, isAuthenticated
  };

  // Logout function
  const logout = async () => {
    // Make async if calling API logout
    // console.log('AuthContext: Logging out'); // Removed log

    // Optional: Call API logout endpoint
    try {
      await apiService.auth.logout(); // Assuming this exists and handles server-side session invalidation
    } catch (logoutError) {
      console.error('Logout API call failed:', logoutError);
      // Decide if you want to proceed with client-side logout anyway
    }

    // Clear sensitive data from state and refreshToken from localStorage
    setCurrentUser(null);
    localStorage.removeItem('refreshToken');
    // Removed clearing token, user, isAuthenticated from localStorage

    // console.log('AuthContext: Logout completed'); // Removed log
    // Optionally redirect to login page
    // window.location.href = '/login';
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.auth.register(userData);
      return { success: true, user: response.user };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.register');
      setError(errorHandling.getErrorMessage(error));
      return {
        success: false,
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error),
      };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await apiService.users.updateProfile(userData);

      // Update state only, removed localStorage.setItem('user', ...)
      setCurrentUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.updateProfile');
      setError(errorHandling.getErrorMessage(error));
      return {
        success: false,
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error),
      };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.users.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.changePassword');
      setError(errorHandling.getErrorMessage(error));
      return {
        success: false,
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error),
      };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.auth.forgotPassword(email);
      return { success: true };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.forgotPassword');
      setError(errorHandling.getErrorMessage(error));
      return { success: false, error: errorHandling.getErrorMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.auth.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.resetPassword');
      setError(errorHandling.getErrorMessage(error));
      return {
        success: false,
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error),
      };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Derive isAuthenticated directly from currentUser state
  const value = {
    currentUser,
    isAuthenticated: !!currentUser, // Derived state
    loading,
    error,
    setUser,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
