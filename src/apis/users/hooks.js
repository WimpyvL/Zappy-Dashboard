import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { useAuth } from '../../context/AuthContext'; // Import useAuth to potentially get user ID
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  profile: ['profile'], // Key for the current user's profile
  // usersList: ['users', 'list'], // Example if you add a hook to list all users
};

// Get current user profile hook using Supabase auth session
// Note: This might be redundant if useAuth().currentUser is sufficient
export const useGetProfile = (options = {}) => {
  const { currentUser } = useAuth(); // Get user from auth context

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      // Re-fetch user data to ensure it's up-to-date, including metadata
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(error.message);
      }
      // You might want to fetch additional profile data from a 'profiles' table
      // linked to the auth user ID if you store more info there.
      // Example:
      // if (user) {
      //   const { data: profileData, error: profileError } = await supabase
      //     .from('profiles') // Assuming a 'profiles' table linked by user.id
      //     .select('*')
      //     .eq('id', user.id)
      //     .single();
      //   if (profileError) console.error("Error fetching profile table data:", profileError);
      //   return { ...user, ...profileData }; // Merge auth user and profile table data
      // }
      return user; // Return Supabase auth user object
    },
    enabled: !!currentUser, // Only fetch if there's potentially a logged-in user
    staleTime: 5 * 60 * 1000, // Cache profile for 5 minutes
    ...options,
  });
};

// Update user profile hook using Supabase auth
export const useUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient();
  const { setCurrentUser } = useAuth(); // Get setCurrentUser to update context state immediately

  return useMutation({
    mutationFn: async (profileData) => {
      // Supabase uses 'data' field for user_metadata
      // Map frontend fields (like firstName) to Supabase metadata structure if needed
      const metadata = {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          // Add other metadata fields here
      };

      const { data, error } = await supabase.auth.updateUser({
        data: metadata
        // You can also update email/phone here if needed, but it might trigger verification flows
        // email: profileData.email,
        // phone: profileData.phone_number,
      });

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message);
      }
      return data.user; // Return the updated user object
    },
    onSuccess: (data, variables, context) => {
      // Update the user in AuthContext immediately
      setCurrentUser(data);
      // Invalidate the profile query to refetch potentially merged profile data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success('Profile updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating profile: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Change password hook using Supabase auth (for logged-in user)
export const useChangePassword = (options = {}) => {
  return useMutation({
    mutationFn: async ({ newPassword }) => { // Supabase doesn't need currentPassword here
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        throw new Error(error.message);
      }
      return data; // Returns { user: User | null }
    },
    onSuccess: (data, variables, context) => {
      toast.success('Password changed successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error changing password: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to get list of users (Example - assuming admin role needed)
export const useGetUsers = (options = {}) => {
   return useQuery({
     queryKey: ['users', 'list'], // Example query key
     queryFn: async () => {
       // This likely needs RLS or potentially a backend function call
       // to ensure only authorized users can list all users.
       // Directly querying auth.users is often restricted.
       // A common pattern is to have a 'profiles' table synced with auth.users.
       console.warn("useGetUsers hook needs proper implementation, potentially querying a 'profiles' table or using an admin API/function.");

       // Example querying a 'profiles' table:
       // const { data, error } = await supabase.from('profiles').select('id, first_name, last_name, email, role');
       // if (error) throw error;
       // return data || [];

       // Placeholder:
       return [];
     },
     ...options,
   });
 };
