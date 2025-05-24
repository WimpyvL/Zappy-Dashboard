import { useState, useCallback } from 'react';
import { stripeService } from '../lib/stripe/stripeService';
import { useAuth } from '../contexts/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface UseStripeServiceOptions {
  onError?: (error: Error) => void;
}

interface CheckoutOptions {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export function useStripeService(options: UseStripeServiceOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser: user } = useAuth();

  /**
   * Handle errors from Stripe operations
   */
  const handleError = useCallback((error: Error) => {
    console.error('Stripe operation failed:', error);
    toast.error(error.message || 'Payment operation failed');
    options.onError?.(error);
  }, [options]);

  /**
   * Create a checkout session and redirect to Stripe Checkout
   */
  const redirectToCheckout = useCallback(async (checkoutOptions: CheckoutOptions) => {
    if (!user?.email) {
      throw new Error('User email is required for checkout');
    }

    setIsLoading(true);
    try {
      // Get or create Stripe customer
      const customerId = await stripeService.getOrCreateCustomer(
        user.id,
        user.email
      );

      // Create checkout session
      const checkoutUrl = await stripeService.createCheckoutSession({
        customerId,
        priceId: checkoutOptions.priceId,
        successUrl: checkoutOptions.successUrl,
        cancelUrl: checkoutOptions.cancelUrl
      });

      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  /**
   * Redirect to Stripe Customer Portal
   */
  const redirectToCustomerPortal = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User ID is required for customer portal');
    }

    setIsLoading(true);
    try {
      // Get Stripe customer ID
      const { data: subscription } = await supabase
        .from('patient_subscriptions')
        .select('stripe_customer_id')
        .eq('patient_id', user.id)
        .single();

      if (!subscription?.stripe_customer_id) {
        throw new Error('No active subscription found');
      }

      // Create portal session
      const portalUrl = await stripeService.createCustomerPortalSession(
        subscription.stripe_customer_id
      );

      // Redirect to portal
      window.location.href = portalUrl;
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  /**
   * Check the status of a checkout session
   */
  const checkSessionStatus = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation will depend on how we want to verify the session
      // This could involve checking our database or calling Stripe's API
      const response = await fetch(`/api/checkout/verify/${sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify checkout session');
      }

      return data;
    } catch (error) {
      handleError(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    isLoading,
    redirectToCheckout,
    redirectToCustomerPortal,
    checkSessionStatus
  };
}

// Export types
export type { UseStripeServiceOptions, CheckoutOptions };