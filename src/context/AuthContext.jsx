import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { supabase } from '../lib/supabase'; // Use the correct Supabase client
import { useAppContext } from './AppContext'; // Import AppContext hook

const AuthContext = createContext();

// Add a function to validate token with the server
const validateSession = async () => {
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

export const AuthProvider = ({ children }) => {
  const { setViewMode } = useAppContext(); // Get setViewMode from AppContext
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(undefined); // Add state for user role
  const [authLoading, setAuthLoading] = useState(true); // Renamed loading state for initial auth check
  const [actionLoading, setActionLoading] = useState(false); // Separate loading state for actions like login/logout
  const [error, setError] = useState(null);
  const [sessionValid, setSessionValid] = useState(false); // Add state to track session validity
  
  // Use a ref to track the visibility state
  const documentVisibilityRef = useRef(document.visibilityState);
  // Use a ref to track validation interval
  const validationIntervalRef = useRef(null);

  // Check current user session on initial load
  useEffect(() => {
    const checkSession = async () => {
      // setAuthLoading(true); // Already true by default
      if (!supabase) {
        console.error('AuthContext: Supabase client not initialized');
        setError(
          'Supabase client not initialized. Please check your environment variables.'
        );
        setCurrentUser(null);
        setUserRole(undefined);
        setAuthLoading(false);
        setSessionValid(false);
        return;
      }

      try {
        // First get the session from supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            'AuthContext: Error getting session:',
            sessionError.message
          );
          setError(sessionError.message);
          setCurrentUser(null);
          setUserRole(undefined);
          setSessionValid(false);
        } else {
          const user = session?.user ?? null;
          
          // If we have a user from the session
          if (user) {
            setCurrentUser(user);
            setSessionValid(true); // Trust the session initially
            
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
                .throwOnError();

              if (profileError) {
                // Log the error but don't throw it to prevent authentication failures
                console.error('Error fetching profile role:', profileError.message);
                // Continue with default role
              }

              const role = profile?.role || 'patient'; // Default to 'patient' if profile exists but role is null/undefined or profile doesn't exist yet
              setUserRole(role);
              console.log(
                'AuthContext: Session checked, user found:',
                !!user,
                'Role fetched:',
                role
              );
            } catch (profileError) {
              console.error(
                'AuthContext: Error fetching profile role during session check:',
                profileError.message
              );
              // Handle error - maybe default role or log out? For now, set role undefined.
              setUserRole(undefined);
              setError('Failed to fetch user profile.');
            }
          } else {
            setCurrentUser(null);
            setUserRole(undefined); // No user, no role
            setSessionValid(false);
            console.log('AuthContext: Session checked, no user found.');
          }
        }
      } catch (error) {
        console.error('AuthContext: Error checking session:', error.message);
        setError('Error checking session: ' + error.message);
        setCurrentUser(null);
        setUserRole(undefined);
        setSessionValid(false);
      }
      setAuthLoading(false); // Indicate auth check is complete
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    // Check if supabase is initialized before setting up auth state listener
    if (!supabase) {
      console.error(
        'AuthContext: Cannot set up auth state listener - Supabase client not initialized'
      );
      setAuthLoading(false);
      return () => {}; // Return empty cleanup function
    }

    let subscription = null;
    try {
      const authStateChange = supabase.auth.onAuthStateChange(
        (_event, session) => {
          console.log('Auth state changed:', _event, session);
          const user = session?.user ?? null;
          setCurrentUser(user);
          setError(null); // Clear errors on auth change
          setSessionValid(!!user);

          // Fetch role when user logs in, session is restored, or token refreshed
          if (
            user &&
            (_event === 'SIGNED_IN' ||
              _event === 'INITIAL_SESSION' ||
              _event === 'TOKEN_REFRESHED')
          ) {
            setAuthLoading(true); // Set loading true while fetching role
            const fetchRole = async () => {
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', user.id)
                  .single()
                  .throwOnError();

                // Log error but don't throw to prevent authentication failures
                if (profileError) {
                  console.error('Error fetching profile role:', profileError.message);
                  // Continue with default role
                }

                const role = profile?.role || 'patient'; // Default to 'patient'
                setUserRole(role);
                console.log(
                  `AuthContext (${_event}): User detected, Role fetched:`,
                  role
                );
              } catch (profileError) {
                console.error(
                  `AuthContext (${_event}): Error fetching profile role:`,
                  profileError.message
                );
                setUserRole(undefined); // Or handle appropriately
                setError('Failed to fetch user profile on auth change.');
              } finally {
                setAuthLoading(false); // Ensure loading is false after role fetch attempt
              }
            };
            fetchRole();
          } else if (!user) {
            // User logged out
            setUserRole(undefined);
            setAuthLoading(false); // Ensure loading is false on logout
            console.log(`AuthContext (${_event}): User logged out.`);
          } else {
            // Other events might not require role refetch, keep loading false
            // We might already have the role from initial load or previous fetch
            setAuthLoading(false);
          }
        }
      );
      subscription = authStateChange.data.subscription;
    } catch (error) {
      console.error(
        'AuthContext: Error setting up auth state listener:',
        error.message
      );
      setError('Error setting up auth state listener: ' + error.message);
      setAuthLoading(false); // Ensure loading is set to false on error
    }

    // Set up visibility change listener to validate session when tab becomes visible again
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

    // Set up one validation interval (only if not already set)
    if (!validationIntervalRef.current) {
      validationIntervalRef.current = setInterval(async () => {
        // Only check if we have a user and the tab is visible
        if (currentUser && document.visibilityState === 'visible') {
          console.log('Performing periodic session validation');
          const { isValid } = await validateSession();
          if (!isValid && sessionValid) {
            console.warn('Session has expired, logging out');
            logout();
          } else {
            setSessionValid(isValid);
          }
        }
      }, 10 * 60 * 1000); // Every 10 minutes instead of 5
    }

    // Cleanup subscription, interval, and event listener on unmount
    return () => {
      try {
        subscription?.unsubscribe();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      } catch (error) {
        console.error(
          'AuthContext: Error unsubscribing from auth state:',
          error.message
        );
      }
    };
  }, []); // Don't include currentUser or sessionValid as dependencies to avoid re-running this effect

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
    };
  }, []);

  // Effect to set viewMode and log when auth state is resolved
  useEffect(() => {
    if (!authLoading) {
      // Set view mode based on the resolved role from the profiles table
      // Default to 'patient' if role is not 'admin' or is undefined
      const determinedViewMode = userRole === 'admin' ? 'admin' : 'patient';
      setViewMode(determinedViewMode);
      console.log(
        `✅ Auth ready, User role: ${userRole}, ViewMode set to: ${determinedViewMode}`
      );
    }
  }, [authLoading, userRole, setViewMode]);

  // Login function using Supabase
  const login = async (email, password) => {
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      try {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginError) {
          // If the error is about email not confirmed, provide a clearer message
          if (loginError.message && loginError.message.toLowerCase().includes('email not confirmed')) {
            setError('Email not confirmed. Please check your inbox or resend the verification email.');
          } else {
            setError(loginError.message || 'Failed to log in.');
          }
          return { success: false, error: loginError.message };
        }

        // User state will be updated by onAuthStateChange listener
        console.log('Login successful:', data.user);
        return { success: true, user: data.user };
      } catch (loginError) {
        setError(loginError.message || 'Failed to log in.');
        return { success: false, error: loginError.message };
      }
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Failed to log in.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Logout function using Supabase
  const logout = async () => {
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        // User state will be set to null by onAuthStateChange listener
        setSessionValid(false);
        console.log('Logout successful');
      } catch (signOutError) {
        throw signOutError;
      }
    } catch (err) {
      console.error('Logout error:', err.message);
      setError(err.message || 'Failed to log out.');
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Register function using Supabase
  const register = async (email, password, options = {}) => {
    // Accept options for metadata etc.
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

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
      } catch (signUpError) {
        throw signUpError;
      }
    } catch (err) {
      console.error('Registration error:', err.message);
      setError(err.message || 'Failed to register.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Update user profile using Supabase (e.g., metadata)
  const updateProfile = async (metadata) => {
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

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
      } catch (updateError) {
        throw updateError;
      }
    } catch (err) {
      console.error('Update profile error:', err.message);
      setError(err.message || 'Failed to update profile.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Change password using Supabase (for logged-in user)
  const changePassword = async (newPassword) => {
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      try {
        // Removed unused 'data' from destructuring
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) throw passwordError;

        console.log('Password updated successfully');
        alert('Password updated successfully!'); // Give user feedback
        return { success: true };
      } catch (passwordError) {
        throw passwordError;
      }
    } catch (err) {
      console.error('Change password error:', err.message);
      setError(err.message || 'Failed to change password.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Request password reset using Supabase
  const forgotPassword = async (email) => {
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

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
      } catch (resetError) {
        throw resetError;
      }
    } catch (err) {
      console.error('Forgot password error:', err.message);
      setError(err.message || 'Failed to send password reset email.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Reset password with token (handled via link from email, typically on a separate page)
  // This function might not be needed directly in the context if using Supabase's flow.
  // The user clicks the link, Supabase handles verification, and onAuthStateChange updates the state.
  // If implementing a custom reset form after link click:
  const updatePassword = async (newPassword) => {
    setActionLoading(true); // Use actionLoading
    setError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      try {
        // This assumes the user is already authenticated via the reset link session
        const { error: updatePassError } = await supabase.auth.updateUser({
          // Removed unused 'data' from destructuring
          password: newPassword,
        });
        if (updatePassError) throw updatePassError;
        console.log('Password updated via reset link.');
        alert('Password successfully reset.');
        return { success: true };
      } catch (updatePassError) {
        throw updatePassError;
      }
    } catch (err) {
      console.error('Update password error:', err.message);
      setError(err.message || 'Failed to update password.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false); // Use actionLoading
    }
  };

  // Resend verification email using Supabase magic link (for unconfirmed users)
  const resendVerificationEmail = async (email) => {
    setActionLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }
      // This will send a new confirmation email if the user is unconfirmed
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Derive isAuthenticated from currentUser state - don't require sessionValid for UI rendering
  const value = {
    currentUser,
    userRole, // Provide userRole
    isAuthenticated: !!currentUser, // Only check for user to avoid flickering when switching tabs
    authLoading, // Provide authLoading state
    actionLoading, // Provide actionLoading state
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
    resendVerificationEmail, // Add to context
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
