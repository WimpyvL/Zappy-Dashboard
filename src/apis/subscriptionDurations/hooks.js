import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['subscriptionDurations'],
  lists: () => [...queryKeys.all, 'list'],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Fetch all subscription durations
export const useSubscriptionDurations = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_duration')
        .select('*')
        .order('duration_months', { ascending: true });

      if (error) {
        console.error('Error fetching subscription durations:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour as this data rarely changes
    ...options,
  });
};

// Create a new subscription duration
export const useCreateSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (durationData) => {
      try {
        console.log('Creating subscription duration with data:', durationData);
        
        // Validate supabase is initialized
        if (!supabase) {
          console.error('Supabase client not initialized');
          throw new Error('Database connection error');
        }
        
        const dataToInsert = {
          name: durationData.name, // e.g., "Monthly", "Quarterly", etc.
          duration_months: durationData.duration_months,
          discount_percent: durationData.discount_percent || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        console.log('Sending data to database:', dataToInsert);
        
        const { data, error } = await supabase
          .from('subscription_duration')
          .insert(dataToInsert)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error creating subscription duration:', error);
          throw new Error(error.message || 'Database error');
        }
        
        if (!data) {
          console.error('No data returned from insert operation');
          throw new Error('Failed to create record');
        }
        
        console.log('Successfully created subscription duration:', data);
        return data;
      } catch (err) {
        console.error('Exception in createSubscriptionDuration:', err);
        throw err;
      }
    },
    onSuccess: (data, variables, context) => {
      toast.success('Subscription duration created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = error.message || 'Unknown error';
      console.error('Error creating subscription duration:', error);
      toast.error(`Error creating subscription duration: ${errorMessage}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update an existing subscription duration
export const useUpdateSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, durationData }) => {
      if (!id) throw new Error('Duration ID is required for update');
      
      const dataToUpdate = {
        name: durationData.name,
        duration_months: durationData.duration_months,
        discount_percent: durationData.discount_percent,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('subscription_duration')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating subscription duration ${id}:`, error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success('Subscription duration updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating subscription duration: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Get a subscription duration by ID
export const useSubscriptionDurationById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('subscription_duration')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching subscription duration ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    ...options,
  });
};

// Delete a subscription duration
export const useDeleteSubscriptionDuration = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('Duration ID is required for deletion');
      
      // Check if duration is used in any subscriptions
      const { data: subscriptions, error: checkError } = await supabase
        .from('patient_subscription')
        .select('id')
        .eq('duration_id', id)
        .limit(1);
        
      if (checkError) {
        console.error(`Error checking subscriptions for duration ${id}:`, checkError);
        throw new Error(checkError.message);
      }
      
      if (subscriptions?.length > 0) {
        throw new Error('Cannot delete duration: It is currently used in active subscriptions');
      }
      
      // Delete the duration
      const { error } = await supabase
        .from('subscription_duration')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting subscription duration ${id}:`, error);
        throw new Error(error.message);
      }
      
      return { success: true, id };
    },
    onSuccess: (data, variables, context) => {
      toast.success('Subscription duration deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting subscription duration: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Initialize subscription durations (can be called during app setup)
export const initializeSubscriptionDurations = async () => {
  // Check if durations already exist
  const { data, error } = await supabase
    .from('subscription_duration')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Error checking subscription durations:', error);
    return false;
  }
  
  // If durations already exist, no need to initialize
  if (data?.length > 0) return true;
  
  // Create the standard durations
  const standardDurations = [
    { name: 'Monthly', duration_months: 1, discount_percent: 0 },
    { name: 'Quarterly', duration_months: 3, discount_percent: 5 },
    { name: 'Semi-Annual', duration_months: 6, discount_percent: 10 },
    { name: 'Annual', duration_months: 12, discount_percent: 15 }
  ];
  
  const { error: insertError } = await supabase
    .from('subscription_duration')
    .insert(standardDurations.map(d => ({
      ...d,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })));
    
  if (insertError) {
    console.error('Error initializing subscription durations:', insertError);
    return false;
  }
  
  return true;
};