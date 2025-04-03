import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  getDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountActive
} from './api';
import { toast } from 'react-toastify';

// Hook to fetch all discounts
export const useDiscounts = (params = {}) => {
  return useQuery({
    queryKey: ['discounts', params],
    queryFn: () => getDiscounts(params)
  });
};

// Hook to fetch a specific discount by ID
export const useDiscountById = (id, options = {}) => {
  return useQuery({
    queryKey: ['discount', id],
    queryFn: () => getDiscountById(id),
    enabled: !!id,
    ...options
  });
};

// Hook to create a new discount
export const useCreateDiscount = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountData) => createDiscount(discountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount created successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while creating the discount.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to update an existing discount
export const useUpdateDiscount = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, discountData }) => updateDiscount(id, discountData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
      toast.success('Discount updated successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while updating the discount.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to delete a discount
export const useDeleteDiscount = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount deleted successfully');
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while deleting the discount.');
      options.onError && options.onError(error);
    }
  });
};

// Hook to toggle discount active status
export const useToggleDiscountActive = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => toggleDiscountActive(id, active),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
      toast.success(`Discount ${variables.active ? 'activated' : 'deactivated'} successfully`);
      options.onSuccess && options.onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while updating the discount status.');
      options.onError && options.onError(error);
    }
  });
};