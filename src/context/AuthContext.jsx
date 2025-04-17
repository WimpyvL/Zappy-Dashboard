// context/AuthContext.jsx - Refactored for Supabase
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null); // Store Supabase session
  const [currentUser, setCurrentUser] = useState(null); // Store Supabase user
  const [loading, setLoading] = useState(true); // Keep loading state

  useEffect(() => {
    // 1. Get the initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error("Error getting initial session:", error);
      setLoading(false);
    });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, session);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        // Ensure loading is false if the listener fires quickly
        if (loading) setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loading]); // Rerun effect if loading state changes unexpectedly

  // Simplified logout function - just calls Supabase signOut
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      // Optionally handle logout error state here
    }
    // onAuthStateChange listener will handle setting session/user to null
  };

  // Value provided by the context
  // Remove action functions like register, updateProfile, etc.
  const register = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone
          }
        }
      });
  
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };
  
  // Update the context value to include register
  const value = {
    session,
    currentUser,
    isAuthenticated: !!session?.user,
    loading,
    logout,
    register, // Add the register function
  };

  // Render children only when not loading (or handle loading state in consuming components)
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
