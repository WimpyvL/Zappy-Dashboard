import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['subscriptionPlans'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  myInvoices: (patientId) => ['myInvoices', patientId], // Key for patient-specific invoices
  mySubscription: (patientId) => ['mySubscription', patientId], // Key for patient's subscription
};

// --- Admin Hooks ---

// Hook for fetching ALL subscription plans (admin view)
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
        toast.error(`Error fetching plans: ${error.message}`);
        throw new Error(error.message);
      }
      return data || [];
    },
    ...options,
    });
  };

// Hook to pause a subscription by calling an Edge Function
export const usePauseSubscription = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId }) => { // Assuming we pass the Stripe Subscription ID
      if (!subscriptionId) throw new Error("Subscription ID is required to pause.");
      
      const { data, error } = await supabase.functions.invoke('pause-stripe-subscription', {
        body: { subscriptionId },
      });

      if (error) {
        console.error("Error invoking 'pause-stripe-subscription' function:", error);
        throw new Error(error.message || 'Failed to pause subscription.');
      }
      return data; // Function might return updated subscription status
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries, e.g., the user's subscription details
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscription(variables.patientId) }); // Assuming patientId is available or passed
      toast.success('Subscription paused successfully.');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error pausing subscription: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to cancel a subscription by calling an Edge Function
export const useCancelSubscription = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId }) => { // Assuming we pass the Stripe Subscription ID
      if (!subscriptionId) throw new Error("Subscription ID is required to cancel.");

      const { data, error } = await supabase.functions.invoke('cancel-stripe-subscription', {
        body: { subscriptionId }, 
      });

      if (error) {
        console.error("Error invoking 'cancel-stripe-subscription' function:", error);
        throw new Error(error.message || 'Failed to cancel subscription.');
      }
      return data; // Function might return updated subscription status
    },
     onSuccess: (data, variables, context) => {
       // Invalidate relevant queries
       queryClient.invalidateQueries({ queryKey: queryKeys.mySubscription(variables.patientId) }); // Assuming patientId is available or passed
       toast.success('Subscription cancelled successfully.');
       options.onSuccess?.(data, variables, context);
     },
     onError: (error, variables, context) => {
       toast.error(`Error cancelling subscription: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};

// Hook for fetching a single subscription plan by ID (admin view)
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
          toast.error(`Error fetching plan details: ${error.message}`);
          throw new Error(error.message);
        }
        return data;
      },
      enabled: !!id,
      ...options,
    });
  };

// Hook for creating a subscription plan (admin view)
export const useCreateSubscriptionPlan = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planData) => {
      // Map frontend fields to DB columns if necessary
      const dataToInsert = {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        billing_cycle: planData.billing_cycle, // e.g., 'monthly', 'yearly'
        features: planData.features || {}, // Assuming JSONB
        is_active: planData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription plan:', error);
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
       toast.error(`Error creating plan: ${error.message || 'Unknown error'}`);
       options.onError?.(error, variables, context);
     },
     onSettled: options.onSettled,
  });
};

// Hook for updating a subscription plan (admin view)
export const useUpdateSubscriptionPlan = (options = {}) => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: async ({ id, planData }) => {
       if (!id) throw new Error("Plan ID is required for update.");
       const dataToUpdate = {
         name: planData.name,
         description: planData.description,
         price: planData.price,
         billing_cycle: planData.billing_cycle,
         features: planData.features,
         is_active: planData.is_active,
         updated_at: new Date().toISOString(),
       };
       // Remove fields that shouldn't be updated
       delete dataToUpdate.id;
       delete dataToUpdate.created_at;

       const { data, error } = await supabase
         .from('subscription_plans')
         .update(dataToUpdate)
         .eq('id', id)
         .select()
         .single();

       if (error) {
         console.error(`Error updating subscription plan ${id}:`, error);
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
        toast.error(`Error updating plan: ${error.message || 'Unknown error'}`);
        options.onError?.(error, variables, context);
      },
      onSettled: options.onSettled,
   });
};

// Hook for deleting a subscription plan (admin view)
export const useDeleteSubscriptionPlan = (options = {}) => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: async (id) => {
       if (!id) throw new Error("Plan ID is required for deletion.");
       // TODO: Check if plan is linked to active subscriptions before deleting?
       const { error } = await supabase
         .from('subscription_plans')
         .delete()
         .eq('id', id);

       if (error) {
         console.error(`Error deleting subscription plan ${id}:`, error);
         if (error.code === '23503') { // Foreign key violation
            throw new Error(`Cannot delete plan: It might be linked to active subscriptions.`);
         }
         throw new Error(error.message);
       }
       return { success: true, id };
     },
      onSuccess: (data, variables, context) => { // variables is the id
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        queryClient.removeQueries({ queryKey: queryKeys.details(variables) });
        toast.success('Subscription plan deleted successfully');
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        toast.error(`Error deleting plan: ${error.message || 'Unknown error'}`);
        options.onError?.(error, variables, context);
      },
      onSettled: options.onSettled,
   });
};


// --- Patient/User Facing Hooks ---

// Hook to fetch a customer portal session URL
// TODO: This requires a backend endpoint (e.g., Supabase Edge Function)
// that interacts with the Stripe API to create a portal session.
// Hook to fetch a customer portal session URL by calling an Edge Function
export const useCreateCustomerPortalSession = (options = {}) => {
  return useMutation({
    mutationFn: async () => {
      // Invoke the Supabase Edge Function responsible for creating a Stripe Billing Portal session
      const { data, error } = await supabase.functions.invoke('create-stripe-portal-session');
      
      if (error) {
        console.error("Error invoking 'create-stripe-portal-session' function:", error);
        throw new Error(error.message || 'Failed to create customer portal session.');
      }
      
      if (!data?.url) {
         console.error("Edge function 'create-stripe-portal-session' did not return a URL.");
         throw new Error('Could not retrieve subscription management link.');
      }

      return data; // Should contain { url: '...' }
    },
    onSuccess: (data, variables, context) => {
      if (data?.url) {
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
    onSettled: options.onSettled,
  });
};

// Hook for fetching the current user's/patient's subscription details
export const useMySubscription = (patientId, options = {}) => {
   return useQuery({
     queryKey: queryKeys.mySubscription(patientId),
     queryFn: async () => {
       if (!patientId) return null;
       
       // Query the 'subscriptions' table, joining with 'subscription_plans'
       const { data, error } = await supabase
         .from('subscriptions') 
         .select(`
           *,
           subscription_plans ( name, price, billing_cycle )
         `)
         .eq('patient_id', patientId) // Filter by the patient ID
         // Fetch the most relevant subscription (e.g., active or trialing)
         // Adjust status filter as needed based on business logic
         .in('status', ['active', 'trialing', 'past_due', 'paused']) 
         .order('created_at', { ascending: false }) // Get the latest if multiple match
         .limit(1) 
         .maybeSingle(); // Expect one or zero matching subscriptions

       if (error) {
         console.error(`Error fetching subscription for patient ${patientId}:`, error);
         toast.error(`Error fetching subscription: ${error.message}`);
         // Don't throw, return null to indicate no active sub found or error
         return null; 
       }
       
       // Map data to a more usable format for the frontend if needed
       if (data) {
         return {
           ...data,
           planName: data.subscription_plans?.name || 'Unknown Plan',
           amount: data.subscription_plans?.price || 0,
           // Add other relevant fields from subscription_plans if needed
         };
       }
       return null; // No active/relevant subscription found
     },
     enabled: !!patientId, // Only run if patientId is available
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

        const { data, error } = await supabase
          .from('pb_invoices')
          .select('*')
          .eq('client_record_id', patientId) // Filter by patient
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching invoices for patient ${patientId}:`, error);
          toast.error(`Error fetching invoices: ${error.message}`);
          throw new Error(error.message);
        }

        // Map data if needed (e.g., extract total from metadata)
        const mappedData = data?.map(inv => ({
            ...inv,
            invoiceId: inv.pb_invoice_id || `INV-${inv.id.substring(0, 6)}`, // Use external ID or generate one
            invoiceAmount: inv.pb_invoice_metadata?.total || 0,
            createdAt: inv.created_at,
        })) || [];

        return mappedData;
      },
      enabled: !!patientId,
      ...options,
    });
};
