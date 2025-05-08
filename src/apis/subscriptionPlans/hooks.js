import React from 'react';
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
      
      // Update the subscription status in the database
      const { data, error } = await supabase
        .from('patient_subscriptions')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', subscriptionId)
        .eq('patient_id', patientId)
        .select()
        .single();
      
      if (error) {
        console.error(`Error pausing subscription ${subscriptionId}:`, error);
        throw new Error(error.message);
      }
      
      // If this is connected to Stripe, we would also call a Supabase function to pause the Stripe subscription
      // const { data: stripeData, error: stripeError } = await supabase.functions.invoke('pause-subscription', {
      //   body: { subscriptionId: data.stripe_subscription_id }
      // });
      
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

      // Update the subscription status in the database
      const { data, error } = await supabase
        .from('patient_subscriptions')
        .update({ 
          status: 'cancelled', 
          updated_at: new Date().toISOString(),
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('patient_id', patientId)
        .select()
        .single();
      
      if (error) {
        console.error(`Error cancelling subscription ${subscriptionId}:`, error);
        throw new Error(error.message);
      }
      
      // If this is connected to Stripe, we would also call a Supabase function to cancel the Stripe subscription
      // const { data: stripeData, error: stripeError } = await supabase.functions.invoke('cancel-subscription', {
      //   body: { subscriptionId: data.stripe_subscription_id }
      // });
      
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
    mutationFn: async ({ customerId, returnUrl }) => {
      if (!customerId) throw new Error("Customer ID is required to create a portal session.");
      
      // Call the Supabase Edge Function to create a Stripe customer portal session
      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: { 
          customerId,
          returnUrl: returnUrl || window.location.origin + '/subscription-details'
        }
      });
      
      if (error) {
        console.error('Error creating customer portal session:', error);
        throw new Error(error.message || 'Failed to create customer portal session');
      }
      
      if (!data?.url) {
        throw new Error('No portal URL returned from the server');
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      if (data?.url) {
        // Redirect to the Stripe Customer Portal
        window.location.href = data.url;
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
      
      // Fetch the patient's active subscription from the database
      const { data, error } = await supabase
        .from('patient_subscriptions')
        .select(`
          id,
          status,
          current_period_end,
          current_period_start,
          stripe_subscription_id,
          discount_percent,
          amount,
          subscription_plan_id,
          subscription_plans:subscription_plan_id (
            id,
            name,
            price,
            category,
            billing_cycle
          )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No subscription found
        console.error('Error fetching subscription:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};

// Hook for fetching patient subscription details formatted for the PatientSubscriptionDetails component
// This hook replaces usePatientSubscription from treatmentPackages/hooks.js
export const useMySubscriptionDetails = (patientId, options = {}) => {
  const subscriptionQuery = useMySubscription(patientId, options);
  
  // Transform the data to match the format expected by PatientSubscriptionDetails
  const transformedData = React.useMemo(() => {
    const subscription = subscriptionQuery.data;
    if (!subscription) return null;
    
    return {
      id: subscription.id,
      status: subscription.status,
      stripeSubscriptionId: subscription.stripe_subscription_id,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      packageName: subscription.subscription_plans?.name || 'Premium Plan',
      packageCondition: subscription.subscription_plans?.category || 'General Health',
      basePrice: subscription.amount || 39.99,
      durationName: subscription.subscription_plans?.billing_cycle === 'monthly' ? 'Monthly' : 'Annual',
      durationMonths: subscription.subscription_plans?.billing_cycle === 'monthly' ? 1 : 12,
      discountPercent: subscription.discount_percent || 0,
      price: subscription.amount,
      totalPrice: subscription.amount,
      nextBillingDate: subscription.current_period_end
    };
  }, [subscriptionQuery.data]);
  
  return {
    ...subscriptionQuery,
    data: transformedData
  };
};

// Hook for fetching the current user's/patient's invoices
export const useMyInvoices = (patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.myInvoices(patientId),
    queryFn: async () => {
      if (!patientId) return [];

      // Fetch invoices from the database
      const { data, error } = await supabase
        .from('patient_invoices')
        .select(`
          id,
          invoice_id,
          amount,
          created_at,
          status,
          stripe_invoice_id,
          subscription_id,
          patient_id
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching patient invoices:', error);
        throw new Error(error.message);
      }
      
      // Transform the data to match the expected format
      return (data || []).map(invoice => ({
        id: invoice.id,
        invoiceId: invoice.invoice_id,
        invoiceAmount: invoice.amount,
        createdAt: invoice.created_at,
        status: invoice.status,
        stripeInvoiceId: invoice.stripe_invoice_id,
        subscriptionId: invoice.subscription_id
      }));
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};
