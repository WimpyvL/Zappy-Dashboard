import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../utils/apiService'; // Import the central apiService
import { toast } from 'react-toastify';

// React Query hooks moved from apiService.js
export const useGetProfile = () => {
  // Assuming 'profile' is a stable key, adjust if user ID specific
  return useQuery({
      queryKey: ['profile'],
      queryFn: () => apiService.users.getProfile()
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
      mutationFn: (userData) => apiService.users.updateProfile(userData),
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

export const useChangePassword = () => {
  return useMutation({
      mutationFn: ({ currentPassword, newPassword }) => apiService.users.changePassword(currentPassword, newPassword),
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
