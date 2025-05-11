import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['tasks'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  myTasks: (params = {}) => [...queryKeys.all, 'myTasks', { params }],
  assignedByMe: (params = {}) => [...queryKeys.all, 'assignedByMe', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  assignees: ['assignees'],
  taskablePatients: ['taskablePatients'],
};

// Get tasks hook using Supabase
export const useTasks = (
  currentPage = 1,
  filters = {},
  sortingDetails = {},
  pageSize = 10
) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists({
      currentPage,
      filters,
      sortingDetails,
      pageSize,
    }),
    queryFn: async () => {
      // Simplify the query to avoid join issues
      let query = supabase
        .from('pb_tasks')
        .select('*', { count: 'exact' })
        .range(rangeFrom, rangeTo);

      // Apply sorting
      const sortColumn = sortingDetails?.column || 'created_at';
      const sortAsc = sortingDetails?.ascending ?? false;
      query = query.order(sortColumn, { ascending: sortAsc });

      // Apply filters
      if (filters.status) {
        if (filters.status === 'completed') {
          query = query.eq('status', 'completed');
        } else if (filters.status) {
          query = query.eq('status', filters.status);
        }
      }
      
      if (filters.assigneeId) {
        query = query.eq('user_id', filters.assigneeId);
      }
      
      if (filters.createdById) {
        query = query.eq('created_by', filters.createdById);
      }
      
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(error.message);
      }

      // Get related user data in separate queries
      const uniqueUserIds = [...new Set([
        ...data?.map(task => task.user_id).filter(Boolean),
        ...data?.map(task => task.created_by).filter(Boolean)
      ])];
      
      // Additional data fetching (optional)
      let users = [];
      
      // Only fetch if we have IDs
      if (uniqueUserIds.length > 0) {
        const { data: userData } = await supabase
          .from('profiles') // Assuming profiles table exists
          .select('id, first_name, last_name, email')
          .in('id', uniqueUserIds);
        users = userData || [];
      }

      // Map tasks with related data
      const mappedData = data?.map((task) => {
        // Find related users
        const assignee = users.find(u => u.id === task.user_id);
        const creator = users.find(u => u.id === task.created_by);
        
        return {
          ...task,
          assignee: assignee || null,
          creator: creator || null,
          assigneeName: assignee ? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || assignee.email : 'Unassigned',
          createdByName: creator ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || creator.email : 'Unknown',
        };
      }) || [];

      return {
        data: mappedData,
        meta: {
          total: count || 0,
          per_page: pageSize,
          current_page: currentPage,
          last_page: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    keepPreviousData: true,
  });
};

// Get my tasks hook - tasks assigned to the current user
export const useMyTasks = (
  userId,
  currentPage = 1,
  filters = {},
  sortingDetails = {},
  pageSize = 10
) => {
  // Add the user ID to the filters
  const myFilters = { ...filters, assigneeId: userId };
  
  return useTasks(
    currentPage,
    myFilters,
    sortingDetails,
    pageSize
  );
};

// Get tasks assigned by me hook - tasks created by the current user
export const useTasksAssignedByMe = (
  userId,
  currentPage = 1,
  filters = {},
  sortingDetails = {},
  pageSize = 10
) => {
  // Add the user ID to the filters as creator
  const createdFilters = { ...filters, createdById: userId };
  
  return useTasks(
    currentPage,
    createdFilters,
    sortingDetails,
    pageSize
  );
};

// Get task by ID hook using Supabase
export const useTaskById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      // Get the task data without joins
      const { data, error } = await supabase
        .from('pb_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching task ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }

      // If we have user_id and created_by, get related data
      let assignee = null;
      let creator = null;

      // Get all unique user IDs
      const userIds = [data.user_id, data.created_by].filter(Boolean);
      
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        
        if (userData) {
          assignee = userData.find(u => u.id === data.user_id) || null;
          creator = userData.find(u => u.id === data.created_by) || null;
        }
      }
      
      // Map data with proper assignee and creator info
      const mappedData = {
        ...data,
        assignee: assignee,
        creator: creator,
        assigneeName: assignee ? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || assignee.email : 'Unassigned',
        createdByName: creator ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || creator.email : 'Unknown',
      };
      
      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Create task hook using Supabase
export const useCreateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData) => {
      // Get the current user ID from auth context or session
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      if (!currentUserId) {
        throw new Error('User must be logged in to create a task');
      }

      const dataToInsert = {
        title: taskData.title,
        status: taskData.status || 'pending',
        due_date: taskData.due_date || null,
        user_id: taskData.assignable_id || null, // Assignee
        created_by: currentUserId, // Creator
        // Ensure timestamps are set
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('pb_tasks')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success('Task created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating task: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update task hook using Supabase
export const useUpdateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskData }) => {
      if (!id) throw new Error('Task ID is required for update.');

      const dataToUpdate = {
        title: taskData.title,
        status: taskData.status || 'pending',
        due_date: taskData.due_date || null,
        user_id: taskData.assignable_id || null, // Assignee
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('pb_tasks')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating task ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success('Task updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating task: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete task hook using Supabase
export const useDeleteTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Task ID is required for deletion.');

      const { error } = await supabase.from('pb_tasks').delete().eq('id', id);

      if (error) {
        console.error(`Error deleting task ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success('Task deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting task: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Mark task completed hook using Supabase
export const useMarkTaskCompleted = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Task ID is required.');

      const { data, error } = await supabase
        .from('pb_tasks')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error marking task ${id} complete:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success('Task marked as completed');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        `Error marking task complete: ${error.message || 'Unknown error'}`
      );
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Get assignees hook using Supabase (queries the 'profiles' table)
export const useAssignees = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.assignees,
    queryFn: async () => {
      // Fetch users who can be assignees from the profiles table
      const { data, error } = await supabase
        .from('profiles') // Query the profiles table
        .select('id, first_name, last_name, email')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching assignees:', error);
        throw new Error(error.message);
      }
      
      // Format the data to include full_name
      const formattedData = (data || []).map(user => ({
        ...user,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || `User #${user.id}`,
      }));
      
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};

// Get current user ID hook
export const useCurrentUserId = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};
