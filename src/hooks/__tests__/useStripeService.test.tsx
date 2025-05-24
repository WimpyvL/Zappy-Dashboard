import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useStripeService } from '../useStripeService';
import { stripeService } from '../../lib/stripe/stripeService';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('../../lib/stripe/stripeService', () => ({
  stripeService: {
    getOrCreateCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
    createCustomerPortalSession: vi.fn(),
  },
}));

vi.mock('../../contexts/auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useStripeService', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    created_at: '2025-05-23T22:00:00Z',
    updated_at: '2025-05-23T22:00:00Z',
  };

  const mockAuthContext = {
    currentUser: mockUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn() as any,
    logout: vi.fn() as any,
    register: vi.fn() as any,
    forgotPassword: vi.fn() as any,
    updatePassword: vi.fn() as any,
    signIn: vi.fn() as any,
    signOut: vi.fn() as any,
    signUp: vi.fn() as any,
    resetPassword: vi.fn() as any,
    updateProfile: vi.fn() as any,
    resendVerificationEmail: vi.fn() as any,
    clearError: vi.fn() as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthContext);
  });

  describe('redirectToCheckout', () => {
    it('should handle successful checkout redirection', async () => {
      const mockCustomerId = 'cus_123';
      const mockCheckoutUrl = 'https://checkout.stripe.com/123';
      
      vi.mocked(stripeService.getOrCreateCustomer).mockResolvedValueOnce(mockCustomerId);
      vi.mocked(stripeService.createCheckoutSession).mockResolvedValueOnce(mockCheckoutUrl);

      // Mock window.location
      const mockAssign = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { assign: mockAssign },
        writable: true,
      });

      const { result } = renderHook(() => useStripeService());

      await act(async () => {
        await result.current.redirectToCheckout({
          priceId: 'price_123',
        });
      });

      expect(stripeService.getOrCreateCustomer).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email
      );
      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith({
        customerId: mockCustomerId,
        priceId: 'price_123',
        successUrl: expect.any(String),
        cancelUrl: expect.any(String),
      });
      expect(window.location.href).toBe(mockCheckoutUrl);
    });

    it('should handle checkout errors', async () => {
      const error = new Error('Checkout failed');
      vi.mocked(stripeService.getOrCreateCustomer).mockRejectedValueOnce(error);

      const onError = vi.fn();
      const { result } = renderHook(() => useStripeService({ onError }));

      await act(async () => {
        await result.current.redirectToCheckout({
          priceId: 'price_123',
        });
      });

      expect(toast.error).toHaveBeenCalledWith(error.message);
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('redirectToCustomerPortal', () => {
    it('should handle successful portal redirection', async () => {
      const mockCustomerId = 'cus_123';
      const mockPortalUrl = 'https://billing.stripe.com/123';

      vi.mocked(supabase.from().single).mockResolvedValueOnce({
        data: { stripe_customer_id: mockCustomerId },
        error: null,
      });
      vi.mocked(stripeService.createCustomerPortalSession).mockResolvedValueOnce(mockPortalUrl);

      const { result } = renderHook(() => useStripeService());

      await act(async () => {
        await result.current.redirectToCustomerPortal();
      });

      expect(stripeService.createCustomerPortalSession).toHaveBeenCalledWith(mockCustomerId);
      expect(window.location.href).toBe(mockPortalUrl);
    });

    it('should handle missing subscription', async () => {
      vi.mocked(supabase.from().single).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useStripeService());

      await act(async () => {
        await expect(result.current.redirectToCustomerPortal()).rejects.toThrow(
          'No active subscription found'
        );
      });
    });

    it('should handle portal errors', async () => {
      const error = new Error('Portal access failed');
      vi.mocked(supabase.from().single).mockRejectedValueOnce(error);

      const onError = vi.fn();
      const { result } = renderHook(() => useStripeService({ onError }));

      await act(async () => {
        await result.current.redirectToCustomerPortal();
      });

      expect(toast.error).toHaveBeenCalledWith(error.message);
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('checkSessionStatus', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should handle successful session verification', async () => {
      const mockResponse = { success: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useStripeService());

      const response = await act(async () => {
        return await result.current.checkSessionStatus('cs_123');
      });

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/checkout/verify/cs_123');
    });

    it('should handle session verification errors', async () => {
      const error = { message: 'Session verification failed' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(error),
      } as Response);

      const onError = vi.fn();
      const { result } = renderHook(() => useStripeService({ onError }));

      const response = await act(async () => {
        return await result.current.checkSessionStatus('cs_123');
      });

      expect(response).toBeNull();
      expect(toast.error).toHaveBeenCalledWith(error.message);
      expect(onError).toHaveBeenCalled();
    });
  });
});