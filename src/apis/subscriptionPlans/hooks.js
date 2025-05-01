import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['subscriptionPlans'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  myInvoices: (patientId) => ['myInvoices', patientId], // Key for patient-specific invoices
  mySubscription: (patientId) => ['mySubscription', patientId], // Key for patient's subscription
};

// Hook for fetching all subscription plans
export const useSubscriptionPlans = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        toast.error(`Error fetching subscription plans: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    ...options,
  });
};

// Hook for fetching a single subscription plan by ID
export const useSubscriptionPlanById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching subscription plan ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        toast.error(`Error fetching subscription plan details: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Hook for creating a subscription plan
export const useCreateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(planData)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription plan:', error);
        toast.error(`Error creating subscription plan: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Subscription plan created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating subscription plan: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook for updating a subscription plan
export const useUpdateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, planData }) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating subscription plan ${id}:`, error);
        toast.error(`Error updating subscription plan: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Subscription plan updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating subscription plan: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook for deleting a subscription plan
export const useDeleteSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting subscription plan ${id}:`, error);
        toast.error(`Error deleting subscription plan: ${error.message}`);
        throw new Error(error.message);
      }
      
      return { id };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
      toast.success('Subscription plan deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting subscription plan: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Helper function to calculate subscription end date based on duration
const calculateEndDate = async (durationId) => {
  if (!durationId) return null;
  
  // Get duration information
  const { data: duration, error } = await supabase
    .from('subscription_duration')
    .select('*')
    .eq('id', durationId)
    .single();
    
  if (error) {
    console.error('Error fetching duration:', error);
    throw new Error(error.message);
  }
  
  const now = new Date();
  const endDate = new Date(now);
  
  // Use days if available, otherwise use months
  if (duration.duration_days) {
    endDate.setDate(now.getDate() + duration.duration_days);
  } else {
    endDate.setMonth(now.getMonth() + duration.duration_months);
  }
  
  return endDate;
};

// Hook to pause a subscription
export const usePauseSubscription = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, patientId }) => {
      if (!subscriptionId) throw new Error("Subscription ID is required to pause.");
      
      // Mock implementation - in a real app, this would call a Supabase function
      console.log(`Pausing subscription ${subscriptionId} for patient ${patientId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, subscriptionId, status: 'paused' };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscription(variables.patientId) });
      toast.success('Subscription paused successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error pausing subscription: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook to cancel a subscription
export const useCancelSubscription = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, patientId }) => {
      if (!subscriptionId) throw new Error("Subscription ID is required to cancel.");

      // Mock implementation - in a real app, this would call a Supabase function
      console.log(`Cancelling subscription ${subscriptionId} for patient ${patientId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, subscriptionId, status: 'cancelled' };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscription(variables.patientId) });
      toast.success('Subscription cancelled successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error cancelling subscription: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook to fetch a customer portal session URL
export const useCreateCustomerPortalSession = (options = {}) => {
  return useMutation({
    mutationFn: async () => {
      // Mock implementation - in a real app, this would call a Supabase function
      console.log('Creating customer portal session');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { url: 'https://example.com/customer-portal' };
    },
    onSuccess: (data, variables, context) => {
      if (data?.url) {
        // In a real app, this would redirect to the portal URL
        console.log(`Redirecting to ${data.url}`);
      } else {
        toast.error('Could not retrieve subscription management link.');
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error accessing subscription management: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Hook for fetching the current user's/patient's subscription details
export const useMySubscription = (patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.mySubscription(patientId),
    queryFn: async () => {
      if (!patientId) return null;
      
      // Mock implementation - in a real app, this would query the subscriptions table
      console.log(`Fetching subscription for patient ${patientId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return {
        id: 'sub_123456',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_plans: {
          name: 'Premium Plan',
          price: 39.99,
          billing_cycle: 'monthly'
        },
        planName: 'Premium Plan',
        amount: 39.99
      };
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};

// Hook for fetching the current user's/patient's invoices
export const useMyInvoices = (patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.myInvoices(patientId),
    queryFn: async () => {
      if (!patientId) return [];

      // Mock implementation - in a real app, this would query the invoices table
      console.log(`Fetching invoices for patient ${patientId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return [
        {
          id: 'inv_001',
          invoiceId: 'INV-001',
          invoiceAmount: 39.99,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'paid'
        },
        {
          id: 'inv_002',
          invoiceId: 'INV-002',
          invoiceAmount: 39.99,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ];
    },
    enabled: !!patientId,
    ...options,
  });
};
