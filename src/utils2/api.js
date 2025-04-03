// apiClient.js
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': true,
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    // Check for meta message in the response and show success toast
    if (response.data.meta && response.data.meta.message) {
      toast.success(response.data.meta.message);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip token handling for login/register requests to prevent redirect loops
    const isAuthRequest =
      originalRequest.url.includes('/sign_in') ||
      originalRequest.url.includes('/register');

    // Handle token expiration/401 errors, but not for auth requests
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      // If a refresh token exists, try to get a new access token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await apiClient.post('/auth/refresh-token', {
            refreshToken,
          });
          const { token } = res.data;

          localStorage.setItem('token', token);
          apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear auth state
          clearAuthState();

          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear auth state
        clearAuthState();

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Handle errors and show error messages using React Toastify
    if (error.response) {
      const errorMessage =
        error.response.data.error || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } else {
      toast.error(
        'An error occurred. Please check your network connection and try again.'
      );
    }

    return Promise.reject(error);
  }
);

// Helper function to clear auth state
export const clearAuthState = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
};

// Request function for API methods
export const request = async ({ url, method, data, params, headers }) => {
  try {
    const response = await apiClient({
      url,
      method,
      data,
      params,
      headers,
    });
    return response.data;
  } catch (error) {
    // Let the interceptor handle the error
    throw error;
  }
};

export default apiClient;
