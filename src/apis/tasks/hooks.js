import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, supabaseHelper } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['tasks'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
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
      const fetchOptions = {
        select: '*',
        range: { from: rangeFrom, to: rangeTo },
        count: 'exact',
        filters: [],
      };

      // Apply sorting (example)
      const sortColumn = sortingDetails?.column || 'created_at';
      const sortAsc = sortingDetails?.ascending ?? false;
      fetchOptions.order = { column: sortColumn, ascending: sortAsc };

      // Apply filters
      if (filters.status) {
        // Adjust based on actual status values (e.g., completed boolean?)
        if (filters.status === 'Completed') {
          fetchOptions.filters.push({ column: 'completed', operator: 'eq', value: true });
        } else if (filters.status === 'Pending') {
          fetchOptions.filters.push({ column: 'completed', operator: 'eq', value: false }); // Or is.('completed', null) ?
        }
      }
      if (filters.assigneeId) {
        fetchOptions.filters.push({ column: 'user_id', operator: 'eq', value: filters.assigneeId });
      }
      if (filters.patientId) {
        fetchOptions.filters.push({ column: 'patient_id', operator: 'eq', value: filters.patientId }); // Corrected FK name
      }
      // Add search filter if needed
      if (filters.search) {
        // supabaseHelper.fetch doesn't directly support .or()
        // This filter might need adjustment or backend handling.
        // For now, adding a basic filter example that might not work as intended.
        // fetchOptions.filters.push({ column: 'title', operator: 'ilike', value: `%${filters.search}%` });
        console.warn("Filtering tasks by search might require backend changes or different table structure.");
      }

      const { data, error, count } = await supabaseHelper.fetch('pb_tasks', fetchOptions);

      if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(error.message);
      }

      // Map data without relying on joins
      const mappedData =
        data?.map((task) => ({
          ...task,
          assigneeName: 'N/A', // We'll need to fetch user names separately
          patientName: 'N/A', // We'll need to fetch patient names separately
          status: task.completed ? 'Completed' : 'Pending', // Map boolean to status string
        })) || [];

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

// Add real-time subscriptions for tasks
export const useTasksSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabaseHelper.subscribe('pb_tasks', (payload) => {
      console.log('Task change received:', payload);
      // Invalidate the tasks query to refetch data when changes occur
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    });

    // Cleanup the subscription on component unmount
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [queryClient]); // Re-run effect if queryClient changes (rare)
};

// Get task by ID hook using Supabase
export const useTaskById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const fetchOptions = {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: id }],
        single: true,
      };
      const { data, error } = await supabaseHelper.fetch('pb_tasks', fetchOptions);

      if (error) {
        console.error(`Error fetching task ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      // Map data without relying on joins
      const mappedData = data
        ? {
            ...data,
            assigneeName: 'N/A', // We'll need to fetch user name separately
            patientName: 'N/A', // We'll need to fetch patient name separately
            status: data.completed ? 'Completed' : 'Pending',
          }
        : null;
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
      const dataToInsert = {
        ...taskData,
        // Map frontend fields to DB columns if names differ
        user_id: taskData.assigneeId,
        patient_id: taskData.patientId, // Corrected FK name
        completed: taskData.status === 'Completed',
        // Ensure timestamps are set
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date_created: new Date().toISOString(), // Assuming this should be set on creation
        date_modified: new Date().toISOString(),
      };
      // Remove frontend-specific fields not in DB table
      delete dataToInsert.assigneeId;
      delete dataToInsert.patientId;
      delete dataToInsert.status;

      const { data, error } = await supabaseHelper.insert('pb_tasks', dataToInsert, { returning: 'representation' });

      if (error) {
        console.error('Error creating task:', error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.insert returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
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
        ...taskData,
        user_id: taskData.assigneeId,
        patient_id: taskData.patientId, // Corrected FK name
        completed: taskData.status === 'Completed',
        updated_at: new Date().toISOString(),
        date_modified: new Date().toISOString(),
      };
      delete dataToUpdate.assigneeId;
      delete dataToUpdate.patientId;
      delete dataToUpdate.status;
      delete dataToUpdate.id; // Don't update the ID itself
      delete dataToUpdate.created_at;
      delete dataToUpdate.date_created;

      const { data, error } = await supabaseHelper.update('pb_tasks', id, dataToUpdate);

      if (error) {
        console.error(`Error updating task ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.update returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(variables.id),
      });
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

      const { data, error } = await supabaseHelper.delete('pb_tasks', id);

      if (error) {
        console.error(`Error deleting task ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
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

      const { data, error } = await supabaseHelper.update('pb_tasks', id, {
          completed: true,
          updated_at: new Date().toISOString(),
          date_modified: new Date().toISOString(),
        });

      if (error) {
        console.error(`Error marking task ${id} complete:`, error);
        throw new Error(error.message);
      }
      return data ? data[0] : null; // supabaseHelper.update returns an array, so take the first element
    },
    onSuccess: (data, variables, context) => {
      // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables) });
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

// Get assignees hook using Supabase (queries the 'user' table)
export const useAssignees = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.assignees,
    queryFn: async () => {
      // Fetch users who can be assignees from the profiles table
      const fetchOptions = {
        select: 'id, first_name, last_name',
      };
      const { data, error } = await supabaseHelper.fetch('profiles', fetchOptions);

      if (error) {
        console.error('Error fetching assignees:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};

// Get taskable patients hook using Supabase (queries the 'client_record' table)
export const useTaskablePatients = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.taskablePatients,
    queryFn: async () => {
      const fetchOptions = {
        select: 'id, first_name, last_name',
        order: { column: 'last_name', ascending: true },
      };
      const { data, error } = await supabaseHelper.fetch('patients', fetchOptions);

      if (error) {
        console.error('Error fetching taskable patients:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};

// Removed session/bulk/archive hooks as they require more specific backend logic
