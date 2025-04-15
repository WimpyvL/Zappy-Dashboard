import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabase'; // Use the correct Supabase client
import { useAppContext } from './AppContext'; // Import AppContext hook
// Removed apiService and errorHandling imports

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setViewMode } = useAppContext(); // Get setViewMode from AppContext
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading true to check initial session
  const [error, setError] = useState(null);

  // Check current user session on initial load
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        setError(sessionError.message);
        setViewMode('admin'); // Default to admin if error getting session
      } else {
        const user = session?.user ?? null;
        setCurrentUser(user); // Set user if session exists, otherwise null
        // Determine view mode based on user role, default to 'admin' if role is not 'admin' or undefined
        const userRole = user?.app_metadata?.role; // Check role in app_metadata
        const determinedViewMode = userRole === 'admin' ? 'admin' : 'admin'; // Default to ADMIN if role is not explicitly 'admin'
        setViewMode(determinedViewMode);
        console.log(`AuthContext: Session checked, user role: ${userRole}, viewMode set to ${determinedViewMode}`);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      const user = session?.user ?? null;
      setCurrentUser(user);
      setError(null); // Clear errors on auth change
      // Determine view mode based on user role, default to 'admin' if role is not 'admin' or undefined
      const userRole = user?.app_metadata?.role; // Check role in app_metadata
      const determinedViewMode = userRole === 'admin' ? 'admin' : 'admin'; // Default to ADMIN if role is not explicitly 'admin'
      setViewMode(determinedViewMode);
      console.log(`AuthContext: Auth state changed, user role: ${userRole}, viewMode set to ${determinedViewMode}`);
      // No need to set loading here as getSession handles initial load
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [setViewMode]); // Added setViewMode to dependency array

  // Login function using Supabase
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      // User state will be updated by onAuthStateChange listener
      console.log('Login successful:', data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Failed to log in.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function using Supabase
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      // User state will be set to null by onAuthStateChange listener
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout error:', err.message);
      setError(err.message || 'Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  // Register function using Supabase
  const register = async (email, password, options = {}) => {
    // Accept options for metadata etc.
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: options, // Pass additional data like firstName, lastName if needed
      });

      if (signUpError) throw signUpError;

      // User state might be updated by onAuthStateChange if auto-login occurs,
      // or user might need email confirmation depending on Supabase settings.
      console.log('Registration successful:', data.user);
      // Check if email confirmation is required
      if (data.user && !data.session) {
        alert(
          'Registration successful! Please check your email to confirm your account.'
        );
      }
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.error('Registration error:', err.message);
      setError(err.message || 'Failed to register.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile using Supabase (e.g., metadata)
  const updateProfile = async (metadata) => {
    setLoading(true);
    setError(null);
    try {
      // Need 'data' here to get the updated user object
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: metadata, // Supabase uses 'data' for user_metadata
      });

      if (updateError) throw updateError;

      // Update local state immediately as onAuthStateChange might not trigger for metadata
      setCurrentUser(data.user);
      console.log('Profile updated successfully:', data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Update profile error:', err.message);
      setError(err.message || 'Failed to update profile.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Change password using Supabase (for logged-in user)
  const changePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      // Removed unused 'data' from destructuring
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;

      console.log('Password updated successfully');
      alert('Password updated successfully!'); // Give user feedback
      return { success: true };
    } catch (err) {
      console.error('Change password error:', err.message);
      setError(err.message || 'Failed to change password.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset using Supabase
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          // Optional: redirectTo URL for the password reset link
          // redirectTo: 'http://localhost:3000/update-password', // Adjust URL as needed
        }
      );

      if (resetError) throw resetError;

      console.log('Password reset email sent successfully.');
      alert('Password reset email sent. Please check your inbox.');
      return { success: true };
    } catch (err) {
      console.error('Forgot password error:', err.message);
      setError(err.message || 'Failed to send password reset email.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token (handled via link from email, typically on a separate page)
  // This function might not be needed directly in the context if using Supabase's flow.
  // The user clicks the link, Supabase handles verification, and onAuthStateChange updates the state.
  // If implementing a custom reset form after link click:
  const updatePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      // This assumes the user is already authenticated via the reset link session
      const { error: updatePassError } = await supabase.auth.updateUser({ // Removed unused 'data' from destructuring
        password: newPassword,
      });
      if (updatePassError) throw updatePassError;
      console.log('Password updated via reset link.');
      alert('Password successfully reset.');
      return { success: true };
    } catch (err) {
      console.error('Update password error:', err.message);
      setError(err.message || 'Failed to update password.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Derive isAuthenticated directly from currentUser state
  const value = {
    currentUser,
    // Don't call getSession() directly here as it returns a Promise
    isAuthenticated: !!currentUser, // Derived state
    loading,
    error: error
      ? typeof error === 'string'
        ? error
        : error.message || 'An error occurred'
      : null,
    login, // Use Supabase login
    logout, // Use Supabase logout
    register, // Use Supabase register
    updateProfile, // Use Supabase updateProfile
    changePassword, // Use Supabase changePassword (for logged-in user)
    forgotPassword, // Use Supabase forgotPassword
    updatePassword, // Use Supabase updatePassword (after reset link)
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
