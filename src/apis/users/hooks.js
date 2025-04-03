import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

// --- Mock Data ---
const sampleUserProfileData = {
  id: 'user_admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  role: 'admin', // Example role
  // Add other profile fields as needed
};
// --- End Mock Data ---

// React Query hooks moved from apiService.js
// Get user profile hook (Mocked)
export const useGetProfile = () => {
  console.log('Using mock user profile data');
  // Assuming 'profile' is a stable key, adjust if user ID specific
  return useQuery({
    queryKey: ['profile'],
    // queryFn: () => apiService.users.getProfile(), // Original API call
    queryFn: () => Promise.resolve(sampleUserProfileData), // Return mock data
    staleTime: Infinity,
  });
};

// Update user profile hook (Mocked)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (userData) => apiService.users.updateProfile(userData), // Original API call
    mutationFn: async (userData) => {
      console.log('Mock Updating profile:', userData);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Update the mock data (in a real scenario, this might update a store)
      Object.assign(sampleUserProfileData, userData);
      return { data: { ...sampleUserProfileData } }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      // options.onSuccess?.(data, variables, context); // Pass options if needed
    },
    onError: (error, variables, context) => {
      toast.error(
        error.message || 'An error occurred while updating the profile.'
      );
      // options.onError?.(error, variables, context); // Pass options if needed
    },
  });
};

// Change password hook (Mocked)
export const useChangePassword = () => {
  return useMutation({
    // mutationFn: ({ currentPassword, newPassword }) => apiService.users.changePassword(currentPassword, newPassword), // Original API call
    mutationFn: async ({ currentPassword, newPassword }) => {
      console.log('Mock Changing password (validation skipped)');
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // In a real mock, you might check currentPassword against a stored mock password
      return { success: true }; // Simulate API response
    },
    onSuccess: (data, variables, context) => {
      toast.success('Password changed successfully');
      // options.onSuccess?.(data, variables, context); // Pass options if needed
    },
    onError: (error, variables, context) => {
      toast.error(
        error.message || 'An error occurred while changing the password.'
      );
      // options.onError?.(error, variables, context); // Pass options if needed
    },
  });
};

// Add other user-related hooks if needed (e.g., useGetUsers for admin lists)
