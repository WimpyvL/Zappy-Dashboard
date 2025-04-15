import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, logout, forgotPassword } from './api';
// Import useAuth hook if needed for context updates, e.g., from '../../context/AuthContext'

// Login Hook
export const useLogin = (options = {}) => {
  // const queryClient = useQueryClient(); // Use if invalidating other queries on login
  // const { setUser } = useAuth(); // Get context setter if needed

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data, variables, context) => {
      // Handle successful login
      // e.g., update auth context: setUser(data.user);
      // e.g., invalidate queries: queryClient.invalidateQueries({ queryKey: ['someUserData'] });

      // Call original onSuccess if provided
      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Handle login error (already logged in api.js)
      console.error("Login mutation failed:", error.message);
      // Call original onError if provided
      options.onError && options.onError(error, variables, context);
    },
    // Add other mutation options if needed
    ...options,
  });
};

// Register Hook
export const useRegister = (options = {}) => {
  return useMutation({
    mutationFn: (userData) => register(userData),
    onSuccess: (data, variables, context) => {
      // Handle successful registration
      // Note: Supabase might require email confirmation, 'data.user' might be null initially.
      console.log("Registration successful (check email for confirmation if enabled):", data);
      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Register mutation failed:", error.message);
      options.onError && options.onError(error, variables, context);
    },
    ...options,
  });
};

// Logout Hook
export const useLogout = (options = {}) => {
  // const queryClient = useQueryClient();
  // const { clearUser } = useAuth(); // Get context setter

  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, context) => {
      // Handle successful logout
      // e.g., clear auth context: clearUser();
      // e.g., clear cache: queryClient.clear();
      console.log("Logout successful");
      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Logout mutation failed:", error.message);
      options.onError && options.onError(error, variables, context);
    },
    ...options,
  });
};

// Forgot Password Hook
export const useForgotPassword = (options = {}) => {
  return useMutation({
    mutationFn: (email) => forgotPassword(email),
    onSuccess: (data, variables, context) => {
      console.log("Forgot password email sent successfully.");
      options.onSuccess && options.onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Forgot password mutation failed:", error.message);
      options.onError && options.onError(error, variables, context);
    },
    ...options,
  });
};

// Note: A hook for Reset Password (updateUser) is usually implemented
// directly within the Reset Password page component, as it depends on
// the token/code from the URL after the user clicks the email link.
