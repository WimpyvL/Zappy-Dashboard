import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth/AuthContext';
import { toast } from 'react-toastify';

// Define query keys for users
const queryKeys = {
  profile: ['profile'],
  users: (filters = {}) => ['users', 'list', { filters }],
  userDetails: (id) => ['users', 'detail', id],
};

// Get current user profile hook using Supabase auth
export const useGetProfile = (options = {}) => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(error.message);
      }
      return user;
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Update user profile hook using Supabase auth
export const useUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient();
  const { setCurrentUser } = useAuth();

  return useMutation({
    mutationFn: async (profileData) => {
      const metadata = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      };

      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message);
      }
      return data.user;
    },
    onSuccess: (data, variables, context) => {
      setCurrentUser(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success('Profile updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating profile: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Change password hook using Supabase auth
export const useChangePassword = (options = {}) => {
  return useMutation({
    mutationFn: async ({ newPassword }) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('Password changed successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error changing password: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Get users with pagination and filtering
export const useGetUsers = (filters = {}, pageSize = 10, options = {}) => {
  const { page, role } = filters;
  const currentPage = page || 1;
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, role, email', { count: 'exact' })
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .range(rangeFrom, rangeTo);

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.message);
      }

      return {
        data: data || [],
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Get user details by ID
export const useUserById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.userDetails(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching user ${id}:`, error);
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Update user role and details
export const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }) => {
      if (!id) throw new Error('User ID is required for update.');

      // First get current user data
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating user ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.userDetails(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`Update user ${variables.id} mutation error:`, error);
      toast.error(`Error updating user: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
