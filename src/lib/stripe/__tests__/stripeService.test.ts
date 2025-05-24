import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stripeService } from '../stripeService';
import { supabase } from '../../supabase';
import Stripe from 'stripe';

// Mock Stripe
vi.mock('stripe', () => {
  const mockStripe = {
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };

  return {
    default: vi.fn(() => mockStripe),
  };
});

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('StripeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrCreateCustomer', () => {
    it('should return existing customer ID if found', async () => {
      const mockCustomerId = 'cus_123';
      const mockResponse = {
        data: { stripe_customer_id: mockCustomerId },
        error: null,
      };

      vi.mocked(supabase.from().single).mockResolvedValueOnce(mockResponse);

      const result = await stripeService.getOrCreateCustomer('123', 'test@example.com');
      
      expect(result).toBe(mockCustomerId);
      expect(supabase.from).toHaveBeenCalledWith('patient_subscriptions');
    });

    it('should create new customer if not found', async () => {
      const mockCustomerId = 'cus_new123';
      const mockStripeResponse = { id: mockCustomerId } as Stripe.Customer;
      const mockSupabaseResponse = { data: null, error: null };

      vi.mocked(supabase.from().single).mockResolvedValueOnce(mockSupabaseResponse);
      vi.mocked(stripeService['stripe'].customers.create).mockResolvedValueOnce(mockStripeResponse);

      const result = await stripeService.getOrCreateCustomer('123', 'test@example.com');
      
      expect(result).toBe(mockCustomerId);
      expect(stripeService['stripe'].customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { patientId: '123' },
      });
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session with correct parameters', async () => {
      const mockSessionUrl = 'https://checkout.stripe.com/session';
      const mockSession = { url: mockSessionUrl } as Stripe.Checkout.Session;
      
      vi.mocked(stripeService['stripe'].checkout.sessions.create).mockResolvedValueOnce(mockSession);

      const result = await stripeService.createCheckoutSession({
        customerId: 'cus_123',
        priceId: 'price_123',
      });

      expect(result).toBe(mockSessionUrl);
      expect(stripeService['stripe'].checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price: 'price_123',
          quantity: 1,
        }],
        success_url: expect.any(String),
        cancel_url: expect.any(String),
      });
    });

    it('should handle missing URL in response', async () => {
      const mockSession = {} as Stripe.Checkout.Session;
      vi.mocked(stripeService['stripe'].checkout.sessions.create).mockResolvedValueOnce(mockSession);

      await expect(stripeService.createCheckoutSession({
        customerId: 'cus_123',
        priceId: 'price_123',
      })).rejects.toThrow('Failed to create checkout session');
    });
  });

  describe('createCustomerPortalSession', () => {
    it('should create a customer portal session', async () => {
      const mockPortalUrl = 'https://billing.stripe.com/session';
      const mockSession = { url: mockPortalUrl } as Stripe.BillingPortal.Session;
      
      vi.mocked(stripeService['stripe'].billingPortal.sessions.create).mockResolvedValueOnce(mockSession);

      const result = await stripeService.createCustomerPortalSession('cus_123');

      expect(result).toBe(mockPortalUrl);
      expect(stripeService['stripe'].billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: expect.any(String),
        configuration: {
          features: expect.any(Object),
        },
      });
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature correctly', () => {
      const mockPayload = 'test_payload';
      const mockSignature = 'test_signature';
      const mockEvent = {} as Stripe.Event;

      vi.mocked(stripeService['stripe'].webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const result = stripeService.verifyWebhookSignature(mockPayload, mockSignature);
      
      expect(result).toBe(true);
      expect(stripeService['stripe'].webhooks.constructEvent).toHaveBeenCalledWith(
        mockPayload,
        mockSignature,
        expect.any(String)
      );
    });

    it('should return false for invalid signatures', () => {
      vi.mocked(stripeService['stripe'].webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const result = stripeService.verifyWebhookSignature('payload', 'invalid_sig');
      
      expect(result).toBe(false);
    });
  });
});