import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
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
export const useTasks = (currentPage = 1, filters = {}, sortingDetails = {}, pageSize = 10) => {
  const rangeFrom = (currentPage - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  return useQuery({
    queryKey: queryKeys.lists({ currentPage, filters, sortingDetails, pageSize }),
    queryFn: async () => {
      let query = supabase
        .from('pb_tasks') // Assuming 'pb_tasks' is the correct table
        .select(`
          *,
          user ( id, first_name, last_name ),
          client_record ( id, first_name, last_name )
        `, { count: 'exact' })
        .range(rangeFrom, rangeTo);

      // Apply sorting (example)
      const sortColumn = sortingDetails?.column || 'created_at';
      const sortAsc = sortingDetails?.ascending ?? false;
      query = query.order(sortColumn, { ascending: sortAsc });

      // Apply filters
      if (filters.status) {
        // Adjust based on actual status values (e.g., completed boolean?)
        if (filters.status === 'Completed') {
           query = query.eq('completed', true);
        } else if (filters.status === 'Pending') {
           query = query.eq('completed', false); // Or is.('completed', null) ?
        }
      }
      if (filters.assigneeId) {
        query = query.eq('user_id', filters.assigneeId);
      }
       if (filters.patientId) {
        query = query.eq('client_record_id', filters.patientId);
      }
      // Add search filter if needed
      if (filters.search) {
         query = query.or(`title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }


      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(error.message);
      }

       // Map data if needed
       const mappedData = data?.map(task => ({
           ...task,
           assigneeName: task.user ? `${task.user.first_name || ''} ${task.user.last_name || ''}`.trim() : 'N/A',
           patientName: task.client_record ? `${task.client_record.first_name || ''} ${task.client_record.last_name || ''}`.trim() : 'N/A',
           status: task.completed ? 'Completed' : 'Pending', // Map boolean to status string if needed
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

// Get task by ID hook using Supabase
export const useTaskById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('pb_tasks')
        .select(`
          *,
          user ( id, first_name, last_name ),
          client_record ( id, first_name, last_name )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching task ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data ? {
           ...data,
           assigneeName: data.user ? `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() : 'N/A',
           patientName: data.client_record ? `${data.client_record.first_name || ''} ${data.client_record.last_name || ''}`.trim() : 'N/A',
           status: data.completed ? 'Completed' : 'Pending',
       } : null;
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
         client_record_id: taskData.patientId,
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
      if (!id) throw new Error("Task ID is required for update.");

      const dataToUpdate = {
         ...taskData,
         user_id: taskData.assigneeId,
         client_record_id: taskData.patientId,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
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
       if (!id) throw new Error("Task ID is required for deletion.");

      const { error } = await supabase
        .from('pb_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting task ${id}:`, error);
        throw new Error(error.message);
      }
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => { // variables is the id
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
       if (!id) throw new Error("Task ID is required.");

       const { data, error } = await supabase
         .from('pb_tasks')
         .update({ completed: true, updated_at: new Date().toISOString(), date_modified: new Date().toISOString() })
         .eq('id', id)
         .select()
         .single();

       if (error) {
         console.error(`Error marking task ${id} complete:`, error);
         throw new Error(error.message);
       }
       return data;
     },
    onSuccess: (data, variables, context) => { // variables is the id
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Task marked as completed');
      options.onSuccess?.(data, variables, context);
    },
     onError: (error, variables, context) => {
       toast.error(`Error marking task complete: ${error.message || 'Unknown error'}`);
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
      // Fetch users who can be assignees (adjust filter as needed, e.g., by role)
      const { data, error } = await supabase
        .from('user') // Target the 'user' table
        .select('id, first_name, last_name') // Select relevant fields
        // .eq('role', 'practitioner') // Example filter by role
        .order('last_name', { ascending: true });

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
      const { data, error } = await supabase
        .from('client_record')
        .select('id, first_name, last_name') // Select relevant fields
        .eq('is_active', true) // Example: only active patients
        .order('last_name', { ascending: true });

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
