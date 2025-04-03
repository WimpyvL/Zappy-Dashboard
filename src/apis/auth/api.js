// services/authService.js
import { request } from '../utils/apiClient';
import { clearAuthState } from '../utils/apiClient';

export const login = async (email, password) => {
  try {
    const response = await request({
      url: '/admin/sign_in',
      method: 'POST',
      data: { user: { email, password } },
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  const data = await request({
    url: '/auth/register',
    method: 'POST',
    data: userData,
  });
  return data;
};

export const forgotPassword = async (email) => {
  const data = await request({
    url: '/auth/forgot-password',
    method: 'POST',
    data: { email },
  });
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const data = await request({
    url: '/auth/reset-password',
    method: 'POST',
    data: { token, newPassword },
  });
  return data;
};

export const logout = async () => {
  const data = await request({
    url: '/auth/logout',
    method: 'POST',
  });
  clearAuthState();
  return data;
};
