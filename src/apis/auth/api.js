// services/authService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Supabase login error:', error.message);
    throw error; // Re-throw the error for the hook to handle
  }
  // Return user and session data
  return data;
};

export const register = async (userData) => {
  // Assuming userData contains email and password
  // userData should contain email, password, and optionally options: { data: {...} }
  const { email, password, options } = userData;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: options // Pass the whole options object received
  });

  if (error) {
    console.error('Supabase signup error:', error.message);
    throw error;
  }
  // Returns { user, session }, user might be null if email confirmation is required
  return data;
};

export const forgotPassword = async (email) => {
  // Specify the URL where users will be redirected to reset their password
  // This URL should point to a page in your app designed for password reset
  const resetPasswordUrl = `${window.location.origin}/reset-password`; // Adjust if needed

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetPasswordUrl,
  });

  if (error) {
    console.error('Supabase forgot password error:', error.message);
    throw error;
  }
  // Returns { data: null, error: null } on success
  return data;
};

// Note: The resetPassword flow changes with Supabase.
// 1. User clicks link in email, gets redirected to `resetPasswordUrl` with a code/token.
// 2. Your reset-password page detects this and allows the user to enter a new password.
// 3. On submit, that page calls `supabase.auth.updateUser({ password: newPassword })`.
// This function might become obsolete or be replaced by logic on the reset page.
/*
export const resetPassword = async (token, newPassword) => {
  // This function likely needs to be removed or adapted.
  // Password update happens via updateUser after email link verification.
  console.warn("resetPassword function may be obsolete with Supabase flow.");
  // Example of how it *might* look if called from the reset page:
  // const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  // if (error) throw error;
  // return data;
};
*/

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase logout error:', error.message);
    throw error;
  }
  // Returns null on success
  return null;
};
