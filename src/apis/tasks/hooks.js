import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-toastify';

// Get tasks hook (Supabase implementation)
export const useTasks = (pageParam = 1, filters = {}, sort = {}) => {
  const PER_PAGE = 10;
  const page = Math.max(1, Number(pageParam) || 1); // Ensure valid page number
  
  return useQuery({
    queryKey: ['tasks', page, filters, sort],
    queryFn: async () => {
      try {
        // Build base query
        let query = supabase
          .from('tasks')
          .select('*', { count: 'exact' });

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        // Apply sorting
        if (sort.field) {
          query = query.order(sort.field, {
            ascending: sort.direction === 'asc'
          });
        }

        // Only apply pagination if page is valid
        if (page >= 1) {
          const from = (page - 1) * PER_PAGE;
          const to = from + PER_PAGE - 1;
          query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching tasks:', error);
          throw new Error('Failed to fetch tasks');
        }

        // Validate response structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid tasks data format');
        }

        return {
          data,
          meta: {
            total: count || 0,
            per_page: PER_PAGE,
            current_page: page,
          },
        };
      } catch (error) {
        console.error('Error in useTasks:', error);
        throw error;
      }
    },
    keepPreviousData: true,
  });
};

// Get task by ID hook (Supabase implementation)
export const useTaskById = (id, options = {}) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        throw new Error('Failed to fetch task');
      }

      if (!data) {
        throw new Error('Task not found');
      }

      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Create task hook (Supabase implementation)
export const useCreateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          status: taskData.status || 'pending', // Default status
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
      }

      if (!data) {
        throw new Error('No data returned after task creation');
      }

      return { data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
      options.onSuccess && options.onSuccess(data);
    },
    onError: (error) => {
      console.error('Task creation error:', error);
      toast.error('Failed to create task');
      options.onError && options.onError(error);
    },
  });
};

// Update task hook (Supabase implementation)
export const useUpdateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskData }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...taskData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
      }

      if (!data) {
        throw new Error('No data returned after task update');
      }

      return { data };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      toast.success('Task updated successfully');
      options.onSuccess && options.onSuccess(data);
    },
    onError: (error) => {
      console.error('Task update error:', error);
      toast.error('Failed to update task');
      options.onError && options.onError(error);
    },
  });
};

// Delete task hook (Supabase implementation)
export const useDeleteTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
      }

      return { success: true };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
      toast.success('Task deleted successfully');
      options.onSuccess && options.onSuccess(data);
    },
    onError: (error) => {
      console.error('Task deletion error:', error);
      toast.error('Failed to delete task');
      options.onError && options.onError(error);
    },
  });
};

// Mark task completed hook (Supabase implementation)
export const useMarkTaskCompleted = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking task completed:', error);
        throw new Error('Failed to mark task completed');
      }

      if (!data) {
        throw new Error('No data returned after marking task completed');
      }

      return { success: true, id: data.id, status: data.status };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
      toast.success('Task marked as completed');
      options.onSuccess && options.onSuccess(data);
    },
    onError: (error) => {
      console.error('Task completion error:', error);
      toast.error('Failed to mark task completed');
      options.onError && options.onError(error);
    },
  });
};

// Creating session hook (Supabase implementation)
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      // 1. Get task details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw new Error('Failed to fetch task details');
      if (!task) throw new Error('Task not found');

      // 2. Create session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          patient_id: task.patient_id,
          scheduled_date: new Date().toISOString(),
          duration_minutes: 30,
          status: 'scheduled',
          type: 'follow_up',
          notes: `Created from task ${taskId}`,
          task_id: taskId
        })
        .select()
        .single();

      if (sessionError) throw new Error('Failed to create session');

      // 3. Update task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'converted_to_session',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) console.warn('Failed to update task status');

      return {
        success: true,
        taskId,
        sessionId: session.id
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
      options.onSuccess && options.onSuccess(data);
    },
    onError: (error) => {
      console.error('Session creation error:', error);
      toast.error('Failed to create session');
      options.onError && options.onError(error);
    }
  });
};

// Creating bulk sessions hook (Supabase implementation)
export const useCreateBulkSessions = (selectedRows, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      let successCount = 0;
      
      // Process in batches to avoid overwhelming Supabase
      const batchSize = 5;
      for (let i = 0; i < selectedRows.length; i += batchSize) {
        const batch = selectedRows.slice(i, i + batchSize);
        
        // Process batch in transaction
        const { data, error } = await supabase.rpc('create_bulk_sessions', {
          task_ids: batch
        });

        if (error) {
          console.error(`Error processing batch ${i/batchSize + 1}:`, error);
          continue;
        }

        successCount += data.length;
      }

      return {
        success: true,
        count: successCount,
        total: selectedRows.length
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      selectedRows.forEach(id =>
        queryClient.invalidateQueries({ queryKey: ['task', id] })
      );
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success(
        `Created ${data.count} of ${data.total} sessions successfully`
      );
      options.onSuccess && options.onSuccess(data);
    },
    onError: (error) => {
      console.error('Bulk session creation error:', error);
      toast.error('Failed to create some sessions');
      options.onError && options.onError(error);
    }
  });
};

// Archiving data hook (Mocked - Assuming this updates task status)
export const useArchiveData = (selectedIds, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: () => handleUpdateStatus(selectedIds), // Original API call (assuming it updates status)
    mutationFn: async () => {
      console.log('Mock Archiving tasks:', selectedIds);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      // Simulate updating status to 'archived' or similar
      return { success: true, count: selectedIds.length }; // Simulate API response
    },
    onSuccess: (data, variables) => { // Add variables if needed
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Invalidate specific tasks
      selectedIds.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ['task', id] })
      );
      toast.success(`${data.count} tasks archived`); // Added feedback
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      options.onSuccess && options.onSuccess();
    },
  });
};

// Get assignees hook (Supabase implementation)
export const useAssignees = (options = {}) => {
  return useQuery({
    queryKey: ['assignees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching assignees:', error);
        throw new Error('Failed to fetch assignees');
      }

      return { data };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Get taskable patients hook (Supabase implementation)
export const useTaskablePatients = (options = {}) => {
  return useQuery({
    queryKey: ['taskablePatients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching taskable patients:', error);
        throw new Error('Failed to fetch taskable patients');
      }

      return { data };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};
