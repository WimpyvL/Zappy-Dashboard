// services/orderService.js
import { request } from '../utils/apiClient';

export const getOrders = async (currentPage, params) => {
  const data = await request({
    url: '/api/v1/admin/orders',
    method: 'GET',
    params: {
      page: currentPage,
      ...params
    }
  });
  return data;
};

export const getOrderById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/orders/${id}`,
    method: 'GET'
  });
  return data;
};

export const createOrder = async (orderData) => {
  const data = await request({
    url: '/api/v1/admin/orders',
    method: 'POST',
    data: orderData
  });
  return data;
};

export const updateOrder = async (id, orderData) => {
  const data = await request({
    url: `/api/v1/admin/orders/${id}`,
    method: 'PUT',
    data: orderData
  });
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const data = await request({
    url: `/api/v1/admin/orders/${id}/status`,
    method: 'PUT',
    data: { status }
  });
  return data;
};

export const deleteOrder = async (id) => {
  const data = await request({
    url: `/api/v1/admin/orders/${id}`,
    method: 'DELETE'
  });
  return data;
};