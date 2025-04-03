import { request } from '../../utils2/api';

// Get all discounts
export const getDiscounts = async (params) => {
  const data = await request({
    url: '/api/v1/admin/discounts',
    method: 'GET',
    params,
  });
  return data;
};

// Get a specific discount by ID
export const getDiscountById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/discounts/${id}`,
    method: 'GET',
  });
  return data;
};

// Create a new discount
export const createDiscount = async (discountData) => {
  const data = await request({
    url: '/api/v1/admin/discounts',
    method: 'POST',
    data: { discount: discountData },
  });
  return data;
};

// Update an existing discount
export const updateDiscount = async (id, discountData) => {
  const data = await request({
    url: `/api/v1/admin/discounts/${id}`,
    method: 'PUT',
    data: { discount: discountData },
  });
  return data;
};

// Delete a discount
export const deleteDiscount = async (id) => {
  const data = await request({
    url: `/api/v1/admin/discounts/${id}`,
    method: 'DELETE',
  });
  return data;
};

// Toggle discount active status
export const toggleDiscountActive = async (id, active) => {
  const data = await request({
    url: `/api/v1/admin/discounts/${id}/toggle_active`,
    method: 'PUT',
    data: { active },
  });
  return data;
};
