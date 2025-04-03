// services/productService.js
import { request } from '../utils/apiClient';

export const getProducts = async (params) => {
  const data = await request({
    url: '/api/v1/admin/products',
    method: 'GET',
    params
  });
  return data;
};

export const getProductById = async (id) => {
  const data = await request({
    url: `/api/v1/admin/products/${id}`,
    method: 'GET'
  });
  return data;
};

export const createProduct = async (productData) => {
  const data = await request({
    url: '/api/v1/admin/products',
    method: 'POST',
    data: productData
  });
  return data;
};

export const updateProduct = async (id, productData) => {
  const data = await request({
    url: `/api/v1/admin/products/${id}`,
    method: 'PUT',
    data: productData
  });
  return data;
};

export const deleteProduct = async (id) => {
  const data = await request({
    url: `/api/v1/admin/products/${id}`,
    method: 'DELETE'
  });
  return data;
};