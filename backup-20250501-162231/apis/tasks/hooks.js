import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

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
        if (filters.status === 'Completed') {
          query = query.eq('completed', true);
        } else if (filters.status === 'Pending') {
          query = query.eq('completed', false);
        }
      } else {
        if (filters.completed !== undefined) {
          query = query.eq('completed', filters.completed);
        }
      }
      
      if (filters.assigneeId) {
        query = query.eq('user_id', filters.assigneeId);
      }
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(error.message);
      }

      // Get related user and patient data in separate queries if needed
      const uniqueUserIds = [...new Set(data?.map(task => task.user_id).filter(Boolean))];
      const uniquePatientIds = [...new Set(data?.map(task => task.patient_id).filter(Boolean))];
      
      // Additional data fetching (optional)
      let users = [];
      let patients = [];
      
      // Only fetch if we have IDs
      if (uniqueUserIds.length > 0) {
        const { data: userData } = await supabase
          .from('profiles') // Assuming profiles table exists
          .select('id, first_name, last_name, email')
          .in('id', uniqueUserIds);
        users = userData || [];
      }
      
      if (uniquePatientIds.length > 0) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .in('id', uniquePatientIds);
        patients = patientData || [];
      }

      // Map tasks with related data
      const mappedData = data?.map((task) => {
        // Find related user and patient
        const user = users.find(u => u.id === task.user_id);
        const patient = patients.find(p => p.id === task.patient_id);
        
        return {
          ...task,
          assignee: user || null,
          patient: patient || null,
          assigneeName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unassigned',
          patientName: patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'N/A',
          status: task.completed ? 'completed' : 'pending',
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

      // If we have user_id and patient_id, get related data
      let user = null;
      let patient = null;

      if (data.user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', data.user_id)
          .single();
        user = userData || null;
      }

      if (data.patient_id) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .eq('id', data.patient_id)
          .single();
        patient = patientData || null;
      }
      
      // Map data with proper assignee and patient info
      const mappedData = {
        ...data,
        assignee: user,
        patient: patient,
        assigneeName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unassigned',
        patientName: patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'N/A',
        status: data.completed ? 'completed' : 'pending',
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
      const dataToInsert = {
        title: taskData.title,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        reminder_date: taskData.reminder_date || null,
        message: taskData.message || '',
        duration: taskData.duration || 30,
        notify_assignee: taskData.notify_assignee || false,
        user_id: taskData.assignable_id || null, // Use user_id instead of assignable_id
        patient_id: taskData.taskable_id || null, // Use patient_id instead of taskable_id
        completed: taskData.status === 'completed',
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
        title: taskData.title,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        reminder_date: taskData.reminder_date || null,
        message: taskData.message || '',
        duration: taskData.duration || 30,
        notify_assignee: taskData.notify_assignee || false,
        user_id: taskData.assignable_id || null, // Use user_id instead of assignable_id
        patient_id: taskData.taskable_id || null, // Use patient_id instead of taskable_id
        completed: taskData.status === 'completed',
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

      const { error } = await supabase.from('pb_tasks').delete().eq('id', id);

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

      const { data, error } = await supabase
        .from('pb_tasks')
        .update({
          completed: true,
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

// Get taskable patients hook using Supabase (queries the 'patients' table)
export const useTaskablePatients = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.taskablePatients,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching taskable patients:', error);
        throw new Error(error.message);
      }
      
      // Format the data to include full_name
      const formattedData = (data || []).map(patient => ({
        ...patient,
        full_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `Patient #${patient.id}`,
      }));
      
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};
