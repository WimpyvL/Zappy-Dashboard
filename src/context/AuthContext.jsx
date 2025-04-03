// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import apiService from "../utils/apiService";
import errorHandling from "../utils/errorHandling";

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem("isAuthenticated");
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedAuth === "true" && storedUser && token) {
          // Parse the stored user data
          const userData = JSON.parse(storedUser);

          // Set the current user and authenticated state
          setCurrentUser(userData);
          setIsAuthenticated(true);

          // Optionally validate token with the server
          // This is commented out to avoid unnecessary API calls on each render
          // but can be enabled if needed
          /*
          try {
            const userProfile = await apiService.users.getProfile();
            setCurrentUser(userProfile);
          } catch (error) {
            // If token validation fails, clear auth data
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("user");
            setCurrentUser(null);
            setIsAuthenticated(false);
            setError("Your session has expired. Please log in again.");
          }
          */
        } else {
          // No stored auth data or invalid data
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        errorHandling.logError(error, "AuthContext.checkAuth");
        setError("Failed to verify authentication status");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to set user data (called from Login component)
  const setUser = (userData) => {
    console.log("AuthContext: Setting user data", userData);
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext: Logging out");

    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    // Update state
    setCurrentUser(null);
    setIsAuthenticated(false);

    console.log("AuthContext: Logout completed");
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.auth.register(userData);
      return { success: true, user: response.user };
    } catch (error) {
      errorHandling.logError(error, "AuthContext.register");
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

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setCurrentUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      errorHandling.logError(error, "AuthContext.updateProfile");
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
      errorHandling.logError(error, "AuthContext.changePassword");
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
      errorHandling.logError(error, "AuthContext.forgotPassword");
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
      errorHandling.logError(error, "AuthContext.resetPassword");
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

  const value = {
    currentUser,
    isAuthenticated,
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
