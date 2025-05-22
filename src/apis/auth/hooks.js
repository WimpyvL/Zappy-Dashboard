import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/auth/AuthContext'; // Import useAuth to update context

// Define query keys (optional for auth, but good practice)
const queryKeys = {
  user: ['user'],
};

// Hook for user login using Supabase Auth
export const useLogin = (options = {}) => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth(); // Get setUser from context

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }
      return data; // Contains user and session
    },
    onSuccess: (data, variables, context) => {
      if (data.user && data.session) {
        // Update user in AuthContext
        // You might need to fetch profile data here if not in user_metadata
        setUser(data.user);
        // Optionally invalidate user-related queries if needed elsewhere
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
        toast.success('Login successful!');
      } else {
         // Handle cases where login might succeed but return unexpected data
         throw new Error('Login succeeded but user data is missing.');
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Login failed: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook for user signup using Supabase Auth
export const useSignup = (options = {}) => {
  return useMutation({
    mutationFn: async ({ email, password, firstName, lastName }) => {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // Store additional info in user_metadata
          data: {
            first_name: firstName,
            last_name: lastName,
            // Add role or other default metadata if needed
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw new Error(error.message || 'Signup failed. Please try again.');
      }
      // Note: Supabase might require email confirmation depending on settings.
      // The 'data' object contains user and session info if confirmation is not required or disabled.
      return data;
    },
    onSuccess: (data, variables, context) => {
      if (data.user?.identities?.length === 0) {
         toast.error('Signup error: User might already exist.'); // Supabase sometimes returns this
      } else if (data.user && data.session) {
         toast.success('Signup successful! Welcome.');
      } else if (data.user) {
         toast.success('Signup successful! Please check your email to confirm your account.');
      } else {
         toast.warn('Signup process initiated. Further steps might be required.');
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Signup failed: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook for user logout using Supabase Auth
export const useLogout = (options = {}) => {
  const queryClient = useQueryClient();
  const { logout: logoutContext } = useAuth(); // Get logout from context

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
        // Don't necessarily throw, allow context cleanup anyway
        // throw new Error(error.message || 'Logout failed.');
      }
      return null; // No data needed on success
    },
    onSuccess: (data, variables, context) => {
      // Clear user state in AuthContext
      logoutContext();
      // Clear React Query cache if desired
      queryClient.clear();
      toast.success('Logged out successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Still attempt context cleanup even if Supabase logout fails
      logoutContext();
      queryClient.clear();
      toast.error(`Logout error: ${error.message || 'An error occurred.'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook for password reset request (forgot password)
export const useForgotPassword = (options = {}) => {
    return useMutation({
      mutationFn: async ({ email }) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // Optional: Specify the URL to redirect the user to after clicking the email link
          // redirectTo: 'http://localhost:3000/update-password',
        });
        if (error) {
          console.error('Supabase password reset request error:', error);
          throw new Error(error.message || 'Failed to send password reset email.');
        }
        return null; // No data needed on success
      },
      onSuccess: (data, variables, context) => {
        toast.success('Password reset email sent. Please check your inbox.');
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        toast.error(`Password reset request failed: ${error.message}`);
        options.onError?.(error, variables, context);
      },
      onSettled: options.onSettled,
    });
  };

// Hook for updating password (after reset link clicked or logged in)
// Note: Supabase uses updateUser for logged-in password changes (see useChangePassword in users/hooks.js)
// This hook is specifically for the reset flow *after* the user clicks the email link.
export const useUpdatePassword = (options = {}) => {
    return useMutation({
      mutationFn: async ({ password }) => {
        // This assumes the user is on the page redirected from the email link,
        // which contains the necessary recovery token in the URL fragment.
        // Supabase client handles extracting this token automatically.
        const { data, error } = await supabase.auth.updateUser({ password });

        if (error) {
          console.error('Supabase password update error:', error);
          throw new Error(error.message || 'Failed to update password.');
        }
        return data;
      },
      onSuccess: (data, variables, context) => {
        toast.success('Password updated successfully. You can now log in.');
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        toast.error(`Password update failed: ${error.message}`);
        options.onError?.(error, variables, context);
      },
      onSettled: options.onSettled,
    });
  };
