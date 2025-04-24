import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import errorHandling from '../utils/errorHandling';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true to handle initial auth check
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
      }
      setLoading(false);
    });

    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { user, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.login');
      setError(errorHandling.getErrorMessage(error));
      return { 
        success: false, 
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error)
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, ...userData }) => {
    setLoading(true);
    setError(null);

    try {
      const { user, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // Optionally store additional user data in your users table
      if (user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ id: user.id, ...userData }]);
        if (profileError) throw profileError;
      }

      return { success: true, user };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.register');
      setError(errorHandling.getErrorMessage(error));
      return { 
        success: false, 
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error)
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', currentUser.id);
      
      if (error) throw error;
      setCurrentUser({ ...currentUser, ...userData });
      return { success: true, user: data };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.updateProfile');
      setError(errorHandling.getErrorMessage(error));
      return {
        success: false,
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error)
      };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.changePassword');
      setError(errorHandling.getErrorMessage(error));
      return {
        success: false,
        error: errorHandling.getErrorMessage(error),
        formErrors: errorHandling.getFormErrors(error)
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      errorHandling.logError(error, 'AuthContext.forgotPassword');
      setError(errorHandling.getErrorMessage(error));
      return { success: false, error: errorHandling.getErrorMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
