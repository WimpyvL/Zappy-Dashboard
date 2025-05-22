/**
 * @fileoverview User profile context providing profile data and operations.
 * This context handles fetching and updating user profile data, using React Query
 * for efficient data fetching and caching.
 */
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';
import { useAppContext } from '../app/AppContext.jsx';

/**
 * @typedef {Object} UserProfile
 * @property {string} id - User ID
 * @property {string} role - User role (admin, patient, etc.)
 * @property {string} [firstName] - User's first name
 * @property {string} [lastName] - User's last name
 * @property {Object} [additionalData] - Any additional profile data
 */

/**
 * @typedef {Object} UserProfileContextType
 * @property {UserProfile|null} userProfile - The current user's profile data
 * @property {boolean} profileLoading - Whether profile data is being loaded
 * @property {string|null} profileError - Current profile error message or null
 * @property {Function} updateProfile - Function to update user profile metadata
 * @property {Function} changePassword - Function to change user password
 * @property {Function} refreshProfile - Function to manually refresh profile data
 * @property {Function} clearProfileError - Function to clear current profile error
 */

/** @type {React.Context<UserProfileContextType>} */
const UserProfileContext = createContext();

/**
 * Fetches user profile data from the database
 * 
 * @param {string} userId - User ID to fetch profile for
 * @returns {Promise<UserProfile|null>} User profile data
 */
const fetchUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    throw error;
  }
};

/**
 * Provider component for user profile functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} UserProfileContext Provider
 */
export const UserProfileProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setViewMode } = useAppContext();
  const [profileError, setProfileError] = useState(null);
  const queryClient = useQueryClient();
  
  // Use React Query to fetch and cache user profile data
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: queryError,
    refetch: refreshProfile
  } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: () => fetchUserProfile(currentUser?.id),
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error in profile query:', error.message);
      setProfileError(error.message || 'Failed to fetch user profile');
    }
  });

  // Set view mode based on user role whenever profile changes
  useEffect(() => {
    if (userProfile) {
      const determinedViewMode = userProfile.role === 'admin' ? 'admin' : 'patient';
      setViewMode(determinedViewMode);
      console.log(
        `✅ Profile loaded, User role: ${userProfile.role}, ViewMode set to: ${determinedViewMode}`
      );
    }
  }, [userProfile, setViewMode]);

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      if (!currentUser?.id) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(['userProfile', currentUser?.id], data);
      return { success: true, profile: data };
    },
    onError: (error) => {
      setProfileError(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  });

  /**
   * Update user profile data
   * 
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<{success: boolean, profile?: UserProfile, error?: string}>} Result object
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      return await updateProfileMutation.mutateAsync(profileData);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [updateProfileMutation]);

  /**
   * Change user password
   * 
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, error?: string, message?: string}>} Result object
   */
  const changePassword = useCallback(async (newPassword) => {
    setProfileError(null);
    try {
      if (!supabase) {
        throw new Error(
          'Supabase client not initialized. Please check your environment variables.'
        );
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;

      console.log('Password updated successfully');
      return { 
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (err) {
      console.error('Change password error:', err.message);
      setProfileError(err.message || 'Failed to change password.');
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Clear current profile error
   */
  const clearProfileError = useCallback(() => {
    setProfileError(null);
  }, []);

  // Set error from query if it exists
  useEffect(() => {
    if (queryError) {
      setProfileError(queryError.message || 'Error fetching profile data');
    }
  }, [queryError]);

  /** @type {UserProfileContextType} */
  const value = {
    userProfile,
    profileLoading,
    profileError,
    updateProfile,
    changePassword,
    refreshProfile,
    clearProfileError,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

/**
 * Custom hook to use the user profile context
 * 
 * @returns {UserProfileContextType} User profile context value
 */
export const useUserProfile = () => useContext(UserProfileContext);